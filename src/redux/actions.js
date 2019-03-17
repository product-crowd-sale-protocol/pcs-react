export function switchTheme() {
    return ({
        type: "SWITCH_THEME"
    });
}

export function switchCommunity(symbol) {
    return ({
        type: "SWITCH_COMMUNITY",
        symbol
    });
}

export function switchCommunityContents(newState) {
    return ({
        type: "SWITCH_COMMUNITY_CONTENTS",
        newState
    });
}

export function setAuthority(newState) {
    return ({
        type: "SET_ACCOUNT_INFO",
        newState
    });
}

export function setChatThread(newState) {
    return ({
        type: "SET_CHAT_THREAD",
        newState
    });
}

export function setContents(newState) {
    return ({
        type: "SET_CONTENTS",
        newState
    });
}

export function switchSetting() {
    return ({
        type: "SWITCH_SETTING"
    });
}

export function openProfile(profile) {
    return ({
        type: "OPEN_PROFILE",
        profile
    });
}

export function closeProfile() {
    return ({
        type: "CLOSE_PROFILE"
    });
}

export function setPrice(key, value) {
    return ({
        type: "SET_PRICE",
        key, value
    });
}

export function openShare(url, title) {
    return ({
        type: "OPEN_SHARE",
        url,
        title
    });
}

export function closeShare() {
    return ({
        type: "CLOSE_SHARE"
    });
}