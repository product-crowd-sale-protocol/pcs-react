import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from "eosjs";

export class Scatter {

    /**
     * constructor
     * @param {string} node_url EOS-node url 
     * @param {*} port EOS-node port number
     * @param {*} chain EOS-chain name. Please choose one from ["mainnet", "kylin", "jungle"].
     */
    constructor(node_url = "https://nodes.get-scatter.com", port = "443", chain = "mainnet") {
        const chainID = {
            "mainnet": "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
            "kylin": "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
            "jungle": "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca"
        }
        const re = new RegExp("(http(s)?://)?([\\w-]+\\.)+[\\w-]+(/[\\w- ./?%&=]*)?", "gi");
        if (node_url.match(re)) {
            const [protocol, host] = node_url.split("://");
            this.network = {
                blockchain: "eos",
                protocol: protocol,
                host: host,
                port: port,
                chainId: chainID[chain]
            }

            this.eosOptions = { expireInSeconds: 60 };
            this.requiredFields = { accounts: [this.network] };

            // ScatterJS setup
            ScatterJS.plugins(new ScatterEOS());
            this.scatter = ScatterJS.scatter;
            this.eosJS = this.scatter.eos(this.network, Eos, this.eosOptions); // eosjs@16.0.9 instance
            this.connected = false; // Scatter exists and is unlocked.

        } else {
            throw new Error("this network is invalid. Please try again.");
        }
    }

    /**
     * connect this instance to Scatter-client.
     * this method is scatter unique and needs to be executed.
     * @param {string} appName the name of the application. It can be set freely.
     */
    async connect(appName) {
        this.connected = await ScatterJS.scatter.connect(appName); // if Scatter is unlocked , this become true.

        if (!this.connected) {
            return setTimeout(this.connect(appName), 2000);
        }
    }

    /**
     * set Account to this instance
     * To make a action, you need to execute this method to store the appropriate account in the account property.
     */
    async login() {
        if (!this.scatter || !this.scatter.identity) {
            // login
            try {
                await this.scatter.login(this.requiredFields);
            }
            catch (error) {
                throw new Error(error);
            }
        }

        if (!this.account) {
            // When logged in but no account is set
            try {
                this.account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos');
            }
            catch {
                throw new Error("Account is not found. Please try again.");
            }
        }
    }

    /**
     * logout from app 
     */
    async logout() {
        const res = this.scatter.logout();
        return res;
    }

    /**
     * set requireFields
     * this method is scatter unique
     * @param {string} key requireFields key name
     * @param {any} content requireFields value
     */
    setRequiredFields(key, content) {
        this.requiredFields = Object.assign({}, this.requiredFields, {
            [key]: content
        });
    }

    /**
     * set transaction option 
     * @param {string} key option key name
     * @param {any} content option value
     */
    setTxOptions(key, content) {
        this.eosOptions = Object.assign({}, this.eosOptions, {
            [key]: content
        });
    }

    /**
     * send a action
     * @param  {Object} action
     *     action = {
     *         contractName : "CONTRACT_NAME",
     *         actionName: "ACTION_NAME",
     *         params: [params]
     *     }
     */
    async action({ contractName, actionName, params }) {
        try {
            const txOptions = { authorization: [`${this.account.name}@${this.account.authority}`] };
            const contract = await this.eosJS.contract(contractName, { "requiredFields": this.requiredFields });
            const res = await contract[actionName](...params, txOptions);
            return res;
        }
        catch (error) {
            if (typeof(error) == "object") {
                this._scatterError(error);
            } else {
                throw new Error(error);
            }
        }
    }

    /**
     * send a transaction
     * @param  {Object} action
     *     action = {
     *         contractName : "CONTRACT_NAME",
     *         actionName: "ACTION_NAME",
     *         params: [params]
     *     }
     */
    async transaction(...actionList) {
        try {
            const txOptions = { authorization: [`${this.account.name}@${this.account.authority}`] };
            const contractList = actionList.map((act) => { return act.contractName });
            const res = await this.eosJS.transaction(contractList, (tx) => {
                actionList.forEach((act) => {
                    const contractName = act.contractName.replace(".", "_"); // dots cannot be used in method name
                    tx[contractName][act.actionName](...act.params, txOptions);
                })
            });
            return res;
        }
        catch (error) {
            if (typeof (error) == "object") {
                this._scatterError(error);
            } else {
                throw new Error(error);
            }
        }
    }

    /**
     * send EOS to recipient
     * @param {string} recipient recipient account name
     * @param {number} amount eos amount
     * @param {string} memo text message
     */
    async send(recipient, amount, memo) {
        try {
            const eosAmount = Scatter.numToAsset(amount);
            const actObj = {
                contractName : "eosio.token",
                actionName: "transfer",
                params: [this.account.name, recipient, eosAmount, memo]
            }
            const res = await this.action(actObj);
            return res
        }
        catch (error) {
            if (typeof (error) == "object") {
                this._scatterError(error);
            } else {
                throw new Error(error);
            }
        }
    }

    /**
     * convert a number data to eos asset data 
     * If you enter 1 for this function, a value of "1.0000 EOS" is output.
     * @param {number} amount token amount
     * @param {number} decimal token decimal
     * @param {string} symbol token symbol
     */
    static numToAsset(amount, decimal=4 ,symbol="EOS") {
        const re = new RegExp("^([1-9]\\d*|0)(\\.\\d+)?$", "gi"); // check if the type is unsigned float.

        if (String(amount).match(re)) {
            const eos_amount = String(amount.toFixed(decimal)) + ` ${symbol}`;
            return eos_amount
        } else {
            throw new Error("amount can only be an unsigned decimal.")
        }
    }

    /**
     * process scatter error object
     * @param {object} errorObj scatter error object
     */
    _scatterError(errorObj) {
        throw new Error(`${errorObj.type}  ${errorObj.message}`);
    }
}

let scatter = new Scatter(process.env.REACT_APP_HOST_DOMAIN, 443, "kylin");

(async () => {
    await scatter.connect("Ryodan");
})()

export default scatter;