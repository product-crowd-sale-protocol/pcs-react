'use strict'

import ecc from 'eosjs-ecc';
import { CONTRACT_ACCOUNT } from "./util/config";
import { getTable } from "./util/eosUtil";
import PCSServer from "./util/server";

export default class PcsSignature {
    constructor({ protocol, host, port, chainId }, symbol) {
        this.network = {
            blockchain: "eos",
            protocol: protocol,
            host: host,
            port: port,
            chainId: chainId
        };

        this.symbol = symbol;
    }

    /**
     * Generate Subsig key pair from nftId & password
     * @param {number} nftId nft id
     * @param {string} passWord password
     */
    async genKeyPair(nftId, passWord) {
        const symbol = this.symbol;
        const salt = await PCSServer.genSalt(passWord, symbol, nftId); // generate secure salt using our server
        const privateKey = ecc.seedPrivate(passWord+salt); // e.g. 5K2YUVmWfxbmvsNxCsfvArXdGXm7d5DC9pn4yD75k2UaSYgkXTh
        const publicKey = ecc.privateToPublic(privateKey); // e.g. EOS5cYvx6NBYNdcJUym9WydRRs6329UTzJgzKii8dESmw2ZaA4fEH
        const response = {
            "privateKey": privateKey,
            "publicKey": publicKey
        };
        return response;
    }

    /**
     * Load ID and Subsig Private Key in Local Storage
     */
    getLocalAuth() {
        let subSig = JSON.parse(localStorage.getItem(this.symbol));
        try {
            let id = subSig.id;
            let privateKey = subSig.privateKey;
            return { id, privateKey };
        }
        catch (error) {
            console.error(error);
            throw new ReferenceError("Failed to read local Subsig key.");
        }
    }

    /**
     * store ID and Subsig Private Key in Local Storage
     * @param {number} id 
     * @param {string} privateKey 
     */
    setLocalAuth(id, privateKey) {
        const authority = {
            id: Number(id),
            privateKey: privateKey
        };
        localStorage.setItem(this.symbol, JSON.stringify(authority));
    }

    /**
     * fetch token's subsig public key and owner account name from EOS contract table
     * @param {number} nftId nft id
     */
    async getEOSAuth(nftId) {
        const query = {
            "code": CONTRACT_ACCOUNT,
            "scope": this.symbol,
            "table": "token",
            "lower_bound": nftId,
            "limit": 1
        };

        let response = await getTable(this.network, query);
        let rows = response.rows;
        if (!rows.length) {
            throw new ReferenceError("token with id not found");
        }

        let owner = rows[0].owner;
        let subkey = rows[0].subkey;
        let result = { "account": owner, "subkey": subkey };
        return result;
    }

    /**
     * get subsig public key and signature made by subsig private key and message from getSubSigMessage
     */
    async getSigAndSubkey() {
        try {
            const { id, privateKey } = this.getLocalAuth();
            const signature = PcsSignature.genSig(privateKey);
            const { subkey } = await this.getEOSAuth(id);
            return { signature, subkey };
        } catch (error) {
            console.error(error);
            return {
                signature: "",
                subkey: ""
            }
        }
    }

    /**
     * check privatekey is valid by our server
     * @param {number} tokenId nft id
     * @param {string} privateKey  subsig private key
     */
    async verifyAuth(tokenId, privateKey) {
        const message = PcsSignature.getSubSigMessage();
        const signature = ecc.sign(message, privateKey);
        // verify signature by our server
        const verified = await PCSServer.checkByPCSSecurity(this.symbol, tokenId, signature, message);
        return verified["verify"];
    }

    /**
     * generate signature with private key and message from getSubSigMessage()
     * @param {string} privateKey private key e.g. 5JVCJaKMoarMBYWXZFamajznjfkDSARGAx1fSWbPmBDGTM82z6A
     */
    static genSig(privateKey) {
        const message = PcsSignature.getSubSigMessage();
        const signature = ecc.sign(message, privateKey);
        return signature;
    }

    /**
     * generate plain text to sign by subsig private key
     */
    static getSubSigMessage() {
        const a_day = 24 * 60 * 60 * 1000;
        const message = String(Math.floor(Number(new Date()) / a_day) * a_day);
        return message;
    }
}
