const AWS_API_URL = "https://2u1ebl117d.execute-api.ap-northeast-1.amazonaws.com/pcs_api_beta";

// Awsサーバーからデータを取ってくる処理をまとめたもの
export default class Aws {

    // チャートの描画のために、約定価格のデータをサーバーから取ってくる
    static async getContractedOrder(symbol, sig, token_id, action_place, from, to, network) {
        const eos_api_node = `${network.protocol}://${network.host}:${network.port}`;

        console.log(from, to);
        if (from && to && from > to) {
            return [];
        }

        const url = AWS_API_URL + "/get-contracted-order";
        const rows = "100";
        const payload = { symbol, sig, token_id, action_place, from, to, rows, eos_api_node };
        const req = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        };
        const response = await fetch(url, req);
        const data = await response.json();

        let data_list = [];

        for (let i = 0; i < data.length; i++) {
            const x = Number(data[i].timestamp);
            const y = Number(data[i].price.split(" ")[0]);
            data_list.push({ x, y });
        }

        return data_list;
    }

    // EOS-JPYを取得する
    static async EOSPrice() {
        const url = AWS_API_URL + "/eos-price";
        const response = await fetch(url, { method: "GET", mode: "cors" });
        const eosPrice = await response.json();
        return eosPrice;
    }
}
