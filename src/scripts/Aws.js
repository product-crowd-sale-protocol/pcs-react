const AWS_API_URL = "https://2u1ebl117d.execute-api.ap-northeast-1.amazonaws.com/pcs_api_beta";

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

    // 現在のPVレートを取得する
    static async getPVRate() {
        const url = AWS_API_URL + "/pv-rate";
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const pvRate = await response.json();
        return pvRate;
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
}
