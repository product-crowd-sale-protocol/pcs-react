import { asyncAll } from "./Util";
import { getTokenInfo } from "./EosHttpApi";
import ecc from "eosjs-ecc"; 

const AWS_API_URL = process.env.REACT_APP_AWS_API_URL;

// Awsサーバーからデータを取ってくる処理をまとめたもの
export default class Aws {

    // チャートの描画のために、ボーダー価格のデータをサーバーから取ってくる
    static async getBorderChart(symbol, sig, subkey, rows) {
        const url = AWS_API_URL + "/border";
        const payload = {
            token_symbol: symbol,
            sig: sig,
            subkey: subkey,
            action_place: symbol,
            rows: String(rows)
        };
        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        };
        const response = await fetch(url, req);
        const border_data = await response.json();

        let border_data_list = [];

        for (let i = 0; i < border_data.length; i++) {
            const time = Number(border_data[i]["timestamp"]) + 1000;
            border_data_list.push({ "x": time, "y": Number(border_data[i]["price"]) });
        }

        return border_data_list;
    }

    // サーバーから最新の時点のデータ(EOS建て)だけを取得する
    static async getBorderPrice(symbol, sig, subkey) {
        // 上のチャート取得用関数で取得する行を1にすることで最新の価格のみ取得する
        let response = await Aws.getBorderChart(symbol, sig, subkey, 1);
        let data = response[0];

        // timestampを時刻表記にして返す
        if (data) {
            let time = Number(data.x) + 1000;
            let result = { "x": time, "y": Number(data.y) };
            return result;
        }
    }

    // チャートの描画のために、約定価格のデータをサーバーから取ってくる
    static async getContractedOrder(token_symbol, sig, subkey, action_place, from, to) {
        console.log(from, to);
        if (from && to && from > to) {
            return [];
        }

        const url = AWS_API_URL + "/get-contracted-order";
        const rows = "100";
        const payload = {token_symbol, sig, subkey, action_place, from, to, rows};
        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        };
        const response = await fetch(url, req);
        const data = await response.json();
        console.log(data);

        let data_list = [];

        for (let i = 0; i < data.length; i++) {
            const x = Number(data[i].timestamp);
            const y = Number(data[i].price.split(" ")[0]);
            data_list.push({x, y});
        }

        return data_list;
    }

    // コンテンツについてコントリビューションが一番高いアカウントを取得する
    static async getContribution(symbol, url) {

        const req = {
            method: "GET",
            mode: "cors"
        };
        const response = await fetch(AWS_API_URL + "/get-pv-contribution?symbol=" + symbol + "&url=" + url, req);
        const data = await response.json();

        if (!data.errorMessage) {
            const [profile, tokenInfo] = await asyncAll(Aws.getProfile(data.symbol, data.token_id), (await getTokenInfo(data.symbol, data.token_id)));
            profile["accountName"] = tokenInfo.owner;
            return profile;
        } else {
            console.log(data.errorMessage);
            return null;
        }
    }

    static async submitChat(sig, subkey, symbol, nftId, accountName, text) {
        // 送信する
        const chat_api_url = AWS_API_URL + "/submit-chat";
        const payload = {
            "sig": sig,
            "subkey": subkey,
            "symbol": symbol,
            "tokenId": nftId,
            "owner": accountName,
            "text": text
        };
        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        };
        const response = await fetch(chat_api_url, req);
        const result = await response.json();
        return result;
    }

    // サーバーから最新のチャットを取得する
    static async getChat(symbol, sig, subkey, from, to, rows) {
        const url = AWS_API_URL + "/chat";
        const payload = {
            token_symbol: symbol,
            sig: sig,
            subkey: subkey,
            from: from,
            to: to,
            rows: String(rows)
        };
        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        };
        const response = await fetch(url, req);
        const chatData = await response.json();
        return chatData;
    }

    // 現在のPVレートを取得する
    static async getPVRate() {
        const url = AWS_API_URL + "/pv-rate";
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const pvRate = await response.json();
        return pvRate;
    }

    // 一定期間内に特定の場所の中にいたアカウントのリストを取得する
    static async getAccountIn(symbol, action, seconds) {
        const url = AWS_API_URL + `/get-account-in?action_place=${symbol}&action_type=${action}&seconds=${seconds}`;
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const accounts = await response.json();
        return accounts;
    }

    // コミュニティデータを取得する
    static async getCmntyList() {
        const url = AWS_API_URL + "/community";
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const community = await response.json();
        return community;
    }

    // EOS-JPYを取得する
    static async EOSPrice() {
        const url = AWS_API_URL + "/eos-price";
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const eosPrice = await response.json();
        return eosPrice;
    }

    // URLページのタイトルを取得する
    static async title(pageUrl) {
        const url = AWS_API_URL + `/title?url=${pageUrl}`;
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const title = await response.json();
        return title;
    }

    // プロフィールを取得する
    static async getProfile(symbol, token_id) {
        const api_url = AWS_API_URL + `/profile?symbol=${symbol}&token_id=${token_id}`;
        const response = await fetch(api_url, { method: "GET", mode: "cors" });
        const profile = (await response.json());
        return profile;
    }

    // プロフィールを更新する
    static async uploadProfile(symbol, nftId, signature, iconUrl="", biography="") {
        // 送信する
        const api_url = AWS_API_URL + "/profile";
        const payload = {
            "name": "uploadProfile",
            "symbol": symbol,
            "id": nftId,
            "signature": signature,
            "icon_url": iconUrl,
            "biography": biography
        };

        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        };
        
        const response = await fetch(api_url, req);
        return response;
    }

    // 勢いのあるコンテンツを取得する
    static async getHotTopic(symbol) {
        const url = AWS_API_URL + `/add-pv?symbol=${symbol}`;
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const target = await response.json();
        return target;
    }

    // コミュニティのセキュリティチェック
    static async checkRyodanSecurity(symbol, tokenId, sig, message) {
        const apiUrl = AWS_API_URL + "/ryodansecurity";

        const payload = {
            "name": "checkSig",
            "symbol": symbol,
            "tokenId": tokenId,
            "contract": "toycashio123",
            "sig": sig,
            "message": message
        };

        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        };

        const res = await (await fetch(apiUrl, req)).json();
        return res;
    }

    // 代理人の秘密鍵でトランザクションに署名してもらう
    static async sendAgentTransaction(apiObj) {
        const apiUrl = AWS_API_URL + "/reflesh-token-by-agent"
        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(apiObj)
        };

        const res = await (await fetch(apiUrl, req)).json();
        return res;
    }

    // パスワードから生成したhashとsymbol,nftIdを使ってSaltを作る
    static async genSalt(password, symbol, nftId) {
        if (password.length < 3) {
            throw new Error("パスワードが短すぎます。");
        }
        const tail3 = password.slice(-3); // 末尾3文字
        const seedHash = ecc.sha256(tail3);

        const apiUrl = "";
        const apiObj = {
            "hash": seedHash,
            "symbol": symbol,
            "nftId": nftId
        };
        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(apiObj)
        };

        const salt = await (await fetch(apiUrl, req)).json();
        return salt;
    }
}
