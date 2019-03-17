// map関数のコールバックが非同期処理の場合、すべての要素のmapコールバックが終了するまで待つようにする関数
export function asyncMap (array, operation) {
    return Promise.all(array.map(async item => await operation(item)))
}

// 複数の非同期処理がすべて終わるまで待機し、終わったら返り値をリストで返す
export async function asyncAll (...asyncFunc) {
    const result = await Promise.all(asyncFunc)
    return result;
}

// 0以上の小数であることの確認
export function checkUnsigned(num) {
    const re = new RegExp("^([1-9]\\d*|0)(\\.\\d+)?$", "gi");

    return re.test(num);
}

// 符号なし整数であることの確認
export function checkUint(num) {
    const re = new RegExp("^(\\d+)$", "gi");

    return re.test(num);
}

// 整数単位のタイムスタンプから時間表記に変更
export function unix2time(unixInt) {
    let dt = new Date(unixInt * 1000);
    return dt.toLocaleString();
}

// タイムスタンプわかりやすくを表示する
export function timestampLog(label) {
    return console.log(`${label}: `, Math.floor((new Date()).getTime() / 1000));
}

// 代理人のトークンか判定して、そうであるならSymbol@IDという文字列を返す
export function isAgent(symbol, accountName, id) {
    if ((accountName === process.env.REACT_APP_EOS_ACCOUNT) && (Number(id) !== 0)) {
        return `${symbol}@${id}`
    } else {
        return accountName
    }
}

export function prefixRedirect(url) {
    const urlWithHttp = "http://" + (url).replace(/^http(s)?:\/\/|\/$/g, "");
    return "http://www.toycash.io/proxy.html?redirect=" + urlWithHttp;
}
