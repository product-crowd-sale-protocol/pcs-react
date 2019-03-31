'use strict'

import { CONTRACT_ACCOUNT } from "./config";

/**
 * fetch information from EOS contract table
 * @param {Object} query - Request to fetch information from EOS table
 * @param {string} query.code - Target contract name
 * @param {string} query.scope - Target scope name
 * @param {string} query.table - Target table name
 * @param {string} query.lower_bound - Sort key min limit --optional
 * @param {string} query.upper_bound - Sort key max limit --optional
 * @param {string} query.limit - Query limit [0, 100] --optional
 * There are many other parameters. Read the official EOS documentation.
 */
export async function getTable({ protocol, host }, query) {
    const apiUrl = protocol + "://" + host;
    const url = apiUrl + "/v1/chain/get_table_rows";
    const req = {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ "json": true, ...query })
    };

    let response = await fetch(url, req);
    let result = await response.json();
    return result;
}

/**
 * fetch token information from EOS table
 * @param {string} symbol community symbol
 * @param {number} nftId nft id
 */
export async function getTokenInfo(symbol, nftId) {
    const code = CONTRACT_ACCOUNT;
    const query = {
        "code": code,
        "scope": symbol,
        "table": "token",
        "lower_bound": nftId,
        "upper_bound": nftId,
        "limit": 1
    };
    const response = await getTable(this.network, query);

    if (response.rows.length === 1) {
        return response.rows[0];  // e.g: {id: 0, subkey: "EOS11...", owner: "toycashio123", active: 1}
    } else {
        console.error("Token with Symbol and Id is not found.");
        return null;
    }
}
