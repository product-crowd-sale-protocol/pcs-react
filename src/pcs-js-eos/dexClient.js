'use strict'

import { Scatter } from "./scatter";
import { CONTRACT_ACCOUNT } from "./util/config";
import { getTable } from "./util/eosUtil";

export default class PcsDex extends Scatter {
    /**
     * create sell order
     * @param {string} symbol - Token symbol 
     * @param {number} tokenId - Token ID
     * @param {number} price - Token Price by EOS
     */
    async addSellOrderByid(symbol, tokenId, price) {
        const quantity = PcsDex.numToAsset(Number(price)); // e.g. "1.1000 EOS"
        await this.login();
        const actObj = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "addsellobyid",
            "params": [symbol, tokenId, quantity, "add sell order"]
        };
        await this.action(actObj);
    }

    /**
     * Buy Token from sell order
     * @param {string} symbol - Token symbol
     * @param {number} tokenId - Token ID in sell order table
     */
    async buyFromOrder(symbol, tokenId) {
        // get sell order infomation from EOS
        const { seller, price } = await this.getSellInfo(symbol, tokenId);

        await this.login();
        const actObj1 = {
            "contractName": "eosio.token",
            "actionName": "transfer",
            "params": [this.account.name, CONTRACT_ACCOUNT, price, "deposit EOS to buy token from order"]
        };
        const actObj2 = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "buyfromorder",
            "params": [this.account.name, symbol, tokenId, `buy token from ${seller}`]
        }
        await this.transaction(actObj1, actObj2);
    }

    /**
     * Cancel your sell order
     * @param {string} symbol - Token Symbol
     * @param {number} tokenId - Token ID in sell order table
     */
    async cancelSellOrderById(symbol, tokenId) {
        await this.login();
        const actObj = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "cancelsobyid",
            "params": [symbol, tokenId]
        };
        await this.action(actObj);
    }

    /**
     * create buy order
     * @param {string} symbol - Token Symbol
     * @param {number} price - Token Order Price by EOS
     */
    async addBuyOrder(symbol, price) {
        const quantity = PcsDex.numToAsset(Number(price));
        await this.login();
        const actObj1 = {
            "contractName": "eosio.token",
            "actionName": "transfer",
            "params": [this.account.name, CONTRACT_ACCOUNT, quantity, "deposit EOS to order token"]
        };
        const actObj2 = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "addbuyorder",
            "params": [this.account.name, symbol, quantity, ""]
        };
        await this.transaction(actObj1, actObj2);
    }

    /**
     * Sell token to other's buy order
     * @param {string} symbol - Token symbol
     * @param {number} tokenId - your Token ID to sell
     * @param {number} orderId - Order ID in buy table
     */
    async sellToBuyOrder(symbol, tokenId, orderId) {
        await this.login();
        const actObj = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "selltoorder",
            "params": [symbol, tokenId, orderId, "sell token"]
        };
        await this.action(actObj);
    }

    /**
     * cancel your buy order
     * @param {string} symbol - Token symbol
     * @param {number} orderId - Order ID in buy table
     */
    async cancelBuyOrderById(symbol, orderId) {
        await this.login();
        const actObj = {
            "contractName": CONTRACT_ACCOUNT,
            "actionName": "cancelbobyid",
            "params": [symbol, orderId]
        };
        await this.action(actObj);
    }

    async fetchBuyTable(symbol) {
        const query = {
            "code": CONTRACT_ACCOUNT,
            "scope": symbol,
            "table": "buyorder",
            "limit": 100
        };
        let response = await getTable(this.network, query);
        let rows = response.rows;
        return rows;
    }

    async fetchSellTable(symbol) {
        const query = {
            "code": CONTRACT_ACCOUNT,
            "scope": symbol,
            "table": "sellorder",
            "limit": 100
        };
        let response = await getTable(this.network, query);
        let rows = response.rows;
        return rows;
    }

    // get information of a sell order from EOS table.
    async getSellInfo(symbol, nftId) {
        const query = {
            "code": CONTRACT_ACCOUNT,
            "scope": symbol,
            "table": "sellorder",
            "lower_bound": nftId,
            "upper_bound": nftId,
            "limit": 1
        };
        let response = await getTable(this.network, query);
        let rows = response.rows;
        if (!rows.length) {
            throw new Error("sell order is not found.");
        }
        let seller = rows[0].user;
        let price = rows[0].price; // e.g. "1.1000 EOS"
        return { seller, price };
    }
}
