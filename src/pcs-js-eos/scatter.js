'use strict'

import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from "eosjs";
import { EOS_NETWORK } from "./util/network";
import { ScatterError, ErrorCodes } from "./util/error";

export class Scatter {

    /**
     * constructor
     * @param {string} protocol transmission protocol e.g. https, http
     * @param {string} host EOS-node host  e.g. eos.greymass.com
     * @param {string} port EOS-node port number e.g. 443, 80
     * @param {string} chain EOS-chain ID. e.g. aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906
     */
    constructor({ protocol, host, port, chainId }, appName = "default") {

        try {
            this.network = {
                blockchain: "eos",
                protocol: protocol,
                host: host,
                port: port,
                chainId: chainId
            };

            this.requiredFields = { accounts: [this.network] };
            this.appName = appName;

            // ScatterJS setup
            ScatterJS.plugins(new ScatterEOS());
            let eosJSOptions = { expireInSeconds: 60 };
            this.eosJS = ScatterJS.eos(this.network, Eos, eosJSOptions); // eosjs@16.0.9 instance
            this.connected = false; // Scatter exists and is unlocked.

        } catch (error) {
            throw new ScatterError(ErrorCodes.INVALID_VALUE, "invalid_network", "invalid network. Please check the entered value.");
        }
    }

    /**
     * connect with Scatter client server using websocket.
     * this method is scatter unique and needs to be executed.
     * @param {string} appName the name of the application. It can be set freely.
     */
    async connect(appName) {
        this.connected = await ScatterJS.connect(appName); // if Scatter is unlocked , this become true.
        if (!this.connected) {
            throw new ScatterError(ErrorCodes.LOCKED, "connection_fail", "Scatter Client is not found. Make sure that the Scatter is unlocked.");
        }
    }

    /**
     * connection with scatter and set user account into that
     * To make a action, user needs to run this method at least once.
     * @param {string} appName the name of the application. It can be set freely.
     */
    async login() {
        if (!this.connected) {
            await this.connect(this.appName);
        }

        if (!ScatterJS.identity) {
            // login
            try {
                await ScatterJS.login(this.requiredFields);
                this.account = await ScatterJS.identity.accounts.find(x => x.blockchain === 'eos');
            }
            catch (error) {
                throw new ScatterError(ErrorCodes.OTHERS, "identity_not_found", "User Identity is not found.");
            }
        }

        if (!this.account) {
            // When logged in but no account is set
            try {
                this.account = await ScatterJS.identity.accounts.find(x => x.blockchain === 'eos');
            }
            catch {
                throw new ScatterError(ErrorCodes.OTHERS, "account_not_found", "Account is not found. Please try again.");
            }
        }
    }

    /**
     * logout from app 
     */
    async logout() {
        if (!this.connected) {
            await this.connect(this.appName);
            if (!this.connected) {
                throw new ScatterError(ErrorCodes.LOCKED, "connection_fail", "Scatter Client is not found.");
            }
        }
        const res = await ScatterJS.logout();
        return res; // if logout are completed, true
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
            if (typeof (error) == "object") {
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
                contractName: "eosio.token",
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
    static numToAsset(amount, decimal = 4, symbol = "EOS") {
        const re = new RegExp("^([1-9]\\d*|0)(\\.\\d+)?$", "gi"); // check if the type is unsigned float.

        if (String(amount).match(re)) {
            const eos_amount = String(amount.toFixed(decimal)) + ` ${symbol}`;
            return eos_amount
        } else {
            throw new ScatterError(ErrorCodes.INVALID_VALUE, "invalid_amount", "invalid amount. amount can only be an unsigned decimal.");
        }
    }

    /**
     * process scatter error object
     * @param {object} errorObj scatter error object
     */
    _scatterError(errorObj) {
        let errorCode = ("code" in errorObj) ? errorObj.code : ErrorCodes.OTHERS; // if errorCode is null or undefined
        let errorType = ("type" in errorObj) ? errorObj.type : "no_type";
        throw new ScatterError(errorCode, errorType, `${errorObj.type}. ${errorObj.message}`);
    }

    /**
     * A getter for network information
     */
    static get networkList() {
        return EOS_NETWORK;
    }
}
