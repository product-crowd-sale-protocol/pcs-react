'use strict'

import ecc from 'eosjs-ecc';
import Base58 from "bs58";
import BigInteger from "bigi";
import { Scatter } from "./scatter";
import PcsSignature from "./checkSig";
import PCSServer from "./util/server";
import { CONTRACT_ACCOUNT } from "./util/config";

export default class PcsClient extends Scatter {

    /**
     * Create PCS Token. Only contract-deployer or 'issuer' execute this.
     * @param {string} issuer - token issuer except this contract
     * @param {string} symbol - the symbol name of token
     */
    async create(issuer, symbol) {
        await this.login();
        const actObj = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "create",
            "params": [this.account.name, issuer, symbol]
        };
        await this.action(actObj);
    }

    /**
     * Issue a PCS token. This method fails if the token has not been created.
     * @param {string} to - Account to receive issued token
     * @param {string} quantity - How much and what kind of token symbol.
     *     e.g. if you want to issue two PCS tokens, quantity is "2 PCS"
     * @param {string} memo - Data that can be written as the user likes.
     */
    async issue(to, quantity, memo) {
        await this.login();
        const actObj = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "issue",
            "params": [to, quantity, memo]
        };
        const res = await this.action(actObj);
        return res;
    }

    /**
     * transfer PCS Token to recipient.
     * @param {*} recipient token recipient
     * @param {*} symbol token symbol
     * @param {*} nftId nft id
     * @param {*} agent If this argument is true, use Agent to sign and broadcast Transaction.
     */
    async transferById(recipient, symbol, nftId, agent=false) {
        try {
            if (agent) {
                // use Agent to sign action data
                let sig = new PcsSignature(this.network, symbol);
                const { privateKey } = sig.getLocalAuth();
                await this.transferByIdToAgent(privateKey, recipient, symbol, nftId)
            } else {
                // Scatterを使う
                await this.login();
                const actObj = {
                    "contractName": CONTRACT_ACCOUNT,
                    "actionName": "transferbyid",
                    "params": [this.account.name, recipient, symbol, nftId, "return token"]
                };
                await this.action(actObj);
            }
        } catch (error) {
            console.error(error);
            return false;
        }

        return true;
    }

    /**
     * This function is only triggerd internally when transferById's agent argument is true.
     * @param {*} wif subsig private key
     * @param {*} to recipient
     * @param {*} sym token symbol
     * @param {*} token_id nft id
     */
    async transferByIdToAgent(wif, to, sym, token_id) {
        // check wif is valid
        if (!ecc.isValidPrivate(wif)) {
            throw new RangeError("invalid private_key format");
        }

        // generate message for signature
        const act_bin = bin(this.encodeName("transferid2"));
        const to_bin = bin(this.encodeName(to));
        const sym_bin = bin(getSymbolCodeRaw(sym));
        const id_bin = bin(new BigInteger(String(token_id)));
        const ts_bin = bin(getTimestamp());
        const message_bin = [...act_bin, ...to_bin, ...sym_bin, ...id_bin, ...ts_bin];
        const message = Buffer(message_bin);

        // generate signature for action data
        const sig = ecc.sign(message, wif);

        // generate query for PCS server
        const query = {
            AgentEvent: "TRANSFER",
            newAddress: to,
            symbolCode: sym,
            tokenId: String(token_id),
            signature: sig
        };

        // request that the agent signs Transaction.
        const signedTx = await PCSServer.requestSignTx(query);
        // broadcast signed transaction
        try {
            const response = await this.eosJS.pushTransaction(signedTx);
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Refresh token subsig public key in EOS table and set new subsig private key into local storage.
     * @param {string} password new password to generate subsig key pair
     * @param {string} symbol community symbol
     * @param {string} nftId nft id
     * @param {bool} agent If this argument is true, use Agent to sign and broadcast Transaction. 
     */
    async refreshKey(password, symbol, nftId, agent=false) {
        try {
            const subsig = new PcsSignature(this.network, symbol);
            const oldLocalAuth = await subsig.getLocalAuth();
            const { subkey } = await subsig.getEOSAuth(nftId);
            const { privateKey, publicKey } = await subsig.genKeyPair(nftId, password);
            if (publicKey === subkey) {
                subsig.setLocalAuth(nftId, privateKey);
                return true;
            }

            if (agent) {
                await this.refreshKeyToAgent(oldLocalAuth.privateKey, symbol, nftId, publicKey);
            } else {
                await this.login();
                const actObj = {
                    "contractName": CONTRACT_ACCOUNT,
                    "actionName": "refreshkey",
                    "params": [symbol, nftId, publicKey]
                };
                await this.action(actObj);
            }
            subsig.setLocalAuth(nftId, privateKey);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    /**
     * This function is only triggerd internally when transferById's agent argument is true.
     * @param {*} wif subsig private key
     * @param {*} sym token symbol
     * @param {*} token_id nft id
     * @param {*} new_subkey new subkey made by password
     */
    async refreshKeyToAgent(wif, sym, token_id, new_subkey) {
        // check wif is valid
        if (!ecc.isValidPrivate(wif)) {
            throw new RangeError("invalid private_key format");
        }

        // generate message for signature
        const act_bin = bin(this.encodeName("refreshkey2"));
        const sym_bin = bin(getSymbolCodeRaw(sym));
        const id_bin = bin(new BigInteger(String(token_id)));
        const sk_bin = publicKeyToBuffer(new_subkey);
        const ts_bin = bin(getTimestamp());
        const message_bin = [...act_bin, ...sym_bin, ...id_bin, ...sk_bin, ...ts_bin];
        const message = Buffer(message_bin);

        // generate signature for query data
        const sig = ecc.sign(message, wif);

        // generate query for PCS server
        const query = {
            AgentEvent: "REFRESH",
            symbolCode: sym,
            tokenId: token_id,
            signature: sig,
            newSubKey: new_subkey
        };

        // request that the agent signs Transaction.
        const signedTx = await PCSServer.requestSignTx(query);
        // broadcast signed transaction
        try {
            await this.eosJS.pushTransaction(signedTx);
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     *  Check the token ownership of the specified Symbol using the PCS server.
     *     Return ture, if the possession of the token is confirmed.
     * @param {string} symbol community symbol
     */
    async checkSecurity(symbol) {
        let subsig = new PcsSignature(this.network, symbol);
        let { id, privateKey } = subsig.getLocalAuth();
        try {
            const verified = await subsig.verifyAuth(id, privateKey);
            return verified;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // encode name type into raw by big endian
    encodeName(name) {
        return this.eosJS.modules.format.encodeName(name, false);
    }
};

// get timestamp for action data
function getTimestamp() {
    const duration = 15 * 1000;
    const now = Number(new Date());
    const timestamp = Math.floor(now / duration) * duration;
    const timestamp_bn = new BigInteger(timestamp.toString());
    const timstamp_micro = timestamp_bn.multiply(new BigInteger("1000"));
    console.log("timestamp:", timstamp_micro.toString());
    return timstamp_micro;
}

// convert publicKey to a format suitable for use as an action argument
function publicKeyToBuffer(public_key) {
    const pk_prefix = "EOS";
    const pk_body = public_key.slice(pk_prefix.length);
    const raw_pk = Base58.decode(pk_body);
    return Buffer([0, ...Array.from(raw_pk).slice(0, -4).map(v => +v)]);
}

// convert uint64 value to a format suitable for use as an action argument
function uint64ToBuffer(num) {
    const bn = BigInteger.isBigInteger(num) ? num : new BigInteger(num);
    const two = new BigInteger("2");
    const a_byte = two.pow(8);
    const bytearray = Array.from({ length: 8 }, (v, i) => Number(bn.divide(two.pow(8 * i)).remainder(a_byte)));
    console.log("bytearray:", bytearray);
    return Buffer(bytearray);
}

// convert symbol_code value to a format suitable for use as an action argument
function getSymbolCodeRaw(symbol_code) {
    if (typeof (symbol_code) !== "string") {
        throw new Error("the first argument should be string type");
    }

    if (symbol_code.length > 7) {
        throw new Error("string is too long to be a valid symbol_code");
    }

    let raw = new BigInteger("0");
    const a_byte = new BigInteger("256");
    for (let i = symbol_code.length - 1; i >= 0; i--) {
        const c = symbol_code[i];
        if (c < 'A' || 'Z' < c) {
            throw new Error("only uppercase letters allowed in symbol_code string");
        }

        raw = raw.multiply(a_byte);
        raw = raw.add(new BigInteger(c.charCodeAt().toString()));
    }

    return raw;
}

/// uint64 -> bytearray
const bin = (num) => Array.from(uint64ToBuffer(num));
