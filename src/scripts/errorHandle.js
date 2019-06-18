import { ScatterError } from "pcs-js-eos";

// エラーオブジェクトを渡すと対応するエラー通知を返す
export function handleError(error) {

    // Scatterのログインエラー
    if (error instanceof ScatterError) {
        console.log("ScatterError type: ", error.type);
        if (error.type === "connection_fail") {
            return "Scatterが見つかりません。アンロックされていることを確認してください。";
        } else if ((error.type === "identity_not_found") || (error.errorType === "account_not_found")) {
            return "アカウントの秘密鍵がセットされていません。\nEOSアカウントのセットを行ってください。";
        } else if (error.type === "signature_rejected") {
            return "トランザクションへの署名が拒否されました。";
        }
    }

    if (error instanceof RangeError) {
        console.log(error);
        const message = error.message;
        if (message === "updateCmntyProfile payload is empty.") {
            return "プロフィール変更内容が空です。コミュニティ名、アイコン画像、コミュニティの説明のうち、変更したいものを最低一つは入力する必要があります。";
        } else if (message === "community description is less than 30 character.") {
            return "コミュニティの説明は60文字以内にする必要があります。";
        } else if (message === "updateProfile payload is empty.") {
            return "アイコン画像のURL、自己紹介文のうち、どちらか1つは入力する必要があります。";
        } else if (message === "accountName is too long.") {
            return "アカウント名は32文字以内に設定してください。";
        } else if (message === "biography is too long.") {
            return "自己紹介文は300文字以内に設定してください。";
        }
    }

    if (error instanceof ReferenceError) {
        console.log(error);
        const message = error.message;
        if (message === "token with id not found") {
            // ユーザーが指定したトークンが予定通りのところになかった場合
            return "指定したトークンが見つかりませんでした。";
        } else if (message.indexOf("authority is not found in localStorage.") !== -1) {
            return "端末内から認証情報を見つけられませんでした。";
        } else if (message === "submit chat, signature is invalid") {
            return "ログイン情報の有効期限が切れています。コミュニティの再ログインをお願いします。";
        }
    }

    if (error instanceof TypeError) {
        console.log(error);
        const message = error.message;
        if (message === "A name can be up to 12 characters long") {
            return "アカウント名は12文字固定です。";
        } else if (message.indexOf("Invalid character:") !== -1) {
            return "使用できない文字が含まれています。";
        }
    }

    if (typeof (error) === "object") {
        // eosチェーンのassertionエラー
        console.log(error);
        try {
            const errorObj = JSON.parse(error.message);
            return handleEosError(errorObj);
        } catch (e) {
            return handleEosError(error);
        }
    }

    return null;
}



// eos内部のAssertion文に引っかかったときのエラー処理をする
function handleEosError(errorObj) {
    console.log(errorObj);
    const assertPrefix = "assertion failure with message: ";
    if (("error" in errorObj) && ("details" in errorObj.error)) {
        let details = errorObj.error.details;

        if (details[0].message.indexOf("missing authority of") !== -1) {
            const owner = (details[0].message.split(" "))[3];
            return `トークンの所有を確認できません。\nこのトークンの所有者は${owner}です。`;
        } else {
            switch (details[0].message) {
                case assertPrefix + "price is lower than border price":
                    return "ボーダー価格より低い価格での買い注文はできません。";
                case assertPrefix + "must transfer positive quantity":
                    return "注文価格は0 EOSではできません。";
                case assertPrefix + "cannot transfer to self":
                    return "トークンを自分に送信することはできません。";
                case assertPrefix + "sig is invalid":
                    return "入力されたパスワードが間違っています。";
                case assertPrefix + "cannot send token to agent account":
                    return "代理人にトークンを送信することはできません。";
                case assertPrefix + "given token should be active":
                    return "このトークンは現在ロックされているため、送信できません。\nロックを解除するにはパスワードの変更を行ってください。";
                case assertPrefix + "currency with symbol does not exist":
                    return "入力されたシンボルに対するPCSトークンは存在しません。コミュニティの作成にはまずシンボルに対応するPCSトークンを発行する必要があります。";
                case assertPrefix + "contract account is not allowed":
                    return "このトークンはすでに売り注文が出されています。";
                case assertPrefix + "memo has more than 256 bytes":
                    return "memoが長すぎます。256Byte以内に設定してください。";
                case assertPrefix + "cannot send token to active agent account":
                    return "代理人にトークンを送信することはできません。"
                case assertPrefix + "overdrawn balance":
                    return "残高不足です。";
                default:
                    break;
            }
        }
    }
}