// EosのHttpAPIに関する関数をまとめたもの

// EOSテーブルから情報を取得する
export async function getTable(query) {
    const url = process.env.REACT_APP_HOST_DOMAIN + "/v1/chain/get_table_rows";
    const req = {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ "json": true, ...query })
    };

    // EOSのAPIをたたく
    let response = await fetch(url, req);
    let result = await response.json();
    return result;
}

// トークン情報を取得する
export async function getTokenInfo(symbol, nftId) {
    const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
    const query = {
        "code": code,
        "scope": symbol,
        "table": "token",
        "lower_bound": nftId,
        "upper_bound": nftId,
        "limit": 1
    };
    const response = await getTable(query);
    
    if (response.rows.length === 1) {
        return response.rows[0];  // e.g: {id: 0, subkey: "EOS11...", owner: "toycashio123", active: 1}
    } else {
        console.error("対応するトークンが存在しません。");
        return null;
    }
}

// コンテンツ一覧を取得する
export async function getContents(symbol) {
    const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
    const query = {
        "code": code,
        "scope": symbol,
        "table": "contents"
    };
    let result = await getTable(query); // Web Apiを使ってTableの内容を取得
    let response = result.rows;
    return response;
}

// 運営のトークンID一覧を取得する
export async function getManager(symbol) {
    const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
    const query = {
        "code": code,
        "scope": symbol,
        "table": "manager"
    };
    let result = await getTable(query); // Web Apiを使ってTableの内容を取得
    let response = result.rows;
    return response;
}