import { combineReducers } from "redux";

// ダークモードにするか否かを担うreducer
// ローカルに設定が保存されているならそれを読み込む
export function darkMode(state={
    darkMode: (localStorage.getItem("theme") ? JSON.parse(localStorage.getItem("theme")) : false)
}, action) {
    switch(action.type) {
        case "SWITCH_THEME":
            const theme = !state.darkMode;
            localStorage.setItem("theme", theme); // ローカルに設定を保存
            return Object.assign({}, state, {
                darkMode: theme
            });
            
        default:
            return state;
    }
}

// どのコミュニティにいるかを管理する
// エントランスは""とする
export function community(state={
    symbol: ""
}, action) {
    switch (action.type) {
        case "SWITCH_COMMUNITY":
            return Object.assign({}, state, {
                symbol: action.symbol
            });

        default:
            return state;
    }
}

// 各部屋内にいるときのヘッダーでチャット、DEXを押したときにコンテンツを切り替えるreducer
export function communityContents(state = {
    lobby: true,
    dex: false
}, action) {
    switch (action.type) {
        case "SWITCH_COMMUNITY_CONTENTS":
            if (action.newState === "lobby") {
                return Object.assign({}, state, {
                    lobby: true,
                    dex: false
                });
            } else if (action.newState === "dex") {
                return Object.assign({}, state, {
                    lobby: false,
                    dex: true
                });
            } else {
                return state;
            }

        default:
            return state;
    }
}

// ログイン情報を管理するreducer
export function authority(state = {
    symbol: null,
    nftId: null,
    accountName: null,
    isManager: false
}, action) {
    switch (action.type) {
        case "SET_ACCOUNT_INFO":
            return Object.assign({}, state, {
                symbol: action.newState.symbol,
                nftId: action.newState.nftId,
                accountName: action.newState.accountName,
                isManager: action.newState.isManager
            });

        default:
            return state;
    }
}

// チャット情報を管理するreducer
export function chat(state = {
}, action) {
    switch (action.type) {
        case "SET_CHAT_THREAD":
            return Object.assign({}, state, {
                [action.newState.symbol]: action.newState.thread
            });

        default:
            return state;
    }
}

// チャット情報を管理するreducer
export function contents(state = {
}, action) {
    switch (action.type) {
        case "SET_CONTENTS":
            return Object.assign({}, state, {
                [action.newState.symbol]: action.newState.contents
            });

        default:
            return state;
    }
}

// 設定画面
export function setting(state={
    setting : false
}, action) {
    switch (action.type) {
        case "SWITCH_SETTING":
            return Object.assign({}, state, {
                setting: !state.setting
            });
        default:
            return state;
    }
}

// プロフィール
export function profile(state={
    modal: false,
    symbol: "",
    accountName : "",
    nftId : "",
    iconUrl : "",
    biography: ""
}, action) {
    switch (action.type) {
        case "OPEN_PROFILE":
            return Object.assign({}, state, {
                modal : true,
                symbol : action.profile.symbol,
                accountName : action.profile.accountName,
                nftId : action.profile.nftId,
                iconUrl : action.profile.iconUrl,
                biography : action.profile.biography
            });
        case "CLOSE_PROFILE":
            return Object.assign({}, state, {
                modal : false
            });
        default:
            return state;
    }
}

// 価格に関するもの
export function price(state = {
    eosjpy : "",
    nfteos : "",
    nftjpy : ""
}, action) {
    switch (action.type) {
        case "SET_PRICE":
            return Object.assign({}, state, {
                [action.key] : action.value 
            });
        default:
            return state;
    }
}

// 共有モーダル
export function share(state = {
    modal: false,
    url: "",
    title: ""
}, action) {
    switch (action.type) {
        case "OPEN_SHARE":
            return Object.assign({}, state, {
                modal: true,
                url: action.url,
                title: action.title
            });
        case "CLOSE_SHARE":
            return Object.assign({}, state, {
                modal: false
            });
        default:
            return state;
    }
}

export default combineReducers({
    darkMode,
    community,
    communityContents,
    authority,
    chat,
    contents,
    setting,
    profile,
    price,
    share
});