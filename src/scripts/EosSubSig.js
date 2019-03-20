// EOSを使ったSubsig関連の処理をまとめたもの
import ecc from 'eosjs-ecc';
import Aws from "./Aws";
import { getTable } from "./EosHttpApi";

export default class EosSubSig {
    constructor(symbol) {
        this.symbol = symbol;
    }

    // パスワードとIDをもとに、公開鍵ペアを生成する
    async genKeyPair(nftId, passWord) {
        const symbol = this.symbol;
        const salt = await Aws.genSalt(passWord, symbol, Number(nftId)); // サーバーを使ってソルトを生成
        const privateKey = ecc.seedPrivate(`${passWord}+${salt}`); // e.g. 5K2YUVmWfxbmvsNxCsfvArXdGXm7d5DC9pn4yD75k2UaSYgkXTh
        const publicKey = ecc.privateToPublic(privateKey); // e.g. EOS5cYvx6NBYNdcJUym9WydRRs6329UTzJgzKii8dESmw2ZaA4fEH
        const response = {
            "privateKey": privateKey,
            "publicKey": publicKey
        };
        return response;
    }

    // ローカルストレージからIDとSubsig秘密鍵を読み込む
    getLocalAuth() {
        let subSig = JSON.parse(localStorage.getItem(this.symbol));
        try {
            let id = subSig.id;
            let privateKey = subSig.privateKey;
            return {id, privateKey};
        }
        catch {
            throw new Error("ローカルのSubsigキーの読み込みに失敗しました。");
        }
    }

    // ローカルストレージにIDとSubsig秘密鍵を保存する
    setLocalAuth(id, privateKey) {
        const authority = {
            id: Number(id),
            privateKey: privateKey
        };
        localStorage.setItem(this.symbol, JSON.stringify(authority));
    }

    // 指定したトークンのPublicKeyとownerアカウントを取得する
    async getEOSAuth(nftId) {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const query = {
            "code": code,
            "scope": this.symbol,
            "table": "token",
            "lower_bound": nftId,
            "limit": 1
        };

        let response = await getTable(query); // Web Apiを使ってTableの内容を取得
        let owner = response.rows[0].owner;

        let result = { "account": owner, "subkey": response.rows[0].subkey }; // 必要な情報を抜き出す
        return result;
    }

    // subkeyとsignatureを得る
    async getSigAndSubkey() {
        try {
            const { id, privateKey } = this.getLocalAuth();
            const signature = EosSubSig.genSig(privateKey);
            const { subkey } = await this.getEOSAuth(id);
            return { signature, subkey };
        } catch (error) {
            console.error(error);
            return {
                signature : "",
                subkey: ""
            }
        }
    }

    async verifyAuth(tokenId, privateKey) {
        // 署名用のメッセージを作成
        const message = EosSubSig.getSubSigMessage();
        // デジタル署名
        const signature = ecc.sign(message, privateKey);

        // 署名検証を行う
        const verified = await Aws.checkRyodanSecurity(this.symbol, tokenId, signature, message);
        return verified["verify"];
    }

    // コミュニティ運営権限を持つNFTのIDリストを取得し運営者であるかを返す
    async checkManager(nftId) {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const query = {
            "code": code,
            "scope": this.symbol,
            "table": "manager",
            "lower_bound": nftId,
            "upper_bound": nftId,
            "limit": 1
        };
        const community_table = await getTable(query);
        const isManager = (community_table.rows.length === 1);
        return isManager;
    }

    // 署名を生成して返す関数
    static genSig(privateKey) {
        const message = EosSubSig.getSubSigMessage();
        const signature = ecc.sign(message, privateKey);
        return signature;
    }

    // トークンの売り注文をしたアカウントを取得するための関数
    async getSeller(nftId) {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const query = {
            "code": code,
            "scope": this.symbol,
            "table": "sellorder",
            "lower_bound": nftId,
            "upper_bound": nftId,
            "limit": 1
        };
        let result = await getTable(query); // Web Apiを使ってTableの内容を取得
        let response = result.rows;

        if (response.length === 0) {
            return code;
        }

        let realOwner = response[0].user;
        return realOwner;
    }

    static getSubSigMessage() {
        const a_day = 24 * 60 * 60 * 1000;
        const message = String(Math.floor(Number(new Date()) / a_day) * a_day);
        return message;
    }
}

