import React from "react";

function contentsLink(contents_list, symbol, contents_id) {
    // console.log(contents_list);
    if (contents_list) {
        // console.log(contents_id);
        const contents_data = contents_list.filter(v => Number(v.contentsId) === Number(contents_id))[0];
        // console.log(contents_data);
        if (contents_data) {
            const { url, title } = contents_data;
            return (
                <a target="_blank" href={`http://www.toycash.io/proxy.html?redirect=http://${url}?symbol=${symbol}`} rel="noopener noreferrer">
                    {title}
                </a>
            );    
        }
    }
    return "（無効なリンクです）";
}

function newContents(contents_list, text) {
    const regexp = /\[\$\scontents\s([^\s]+)\s([^\s]+)\]/;
    const match = regexp.exec(text);
    if (match) {
        // console.log(match);
        const replace_text = contentsLink(contents_list, match[1], match[2]);
        // console.log(text.slice(0, match.index));
        // console.log(replace_text);
        // console.log(text.slice(match.index + match.input.length));
        return (
            <span>
                {text.slice(0, match.index)}
                {replace_text}
                {text.slice(match.index + match.input.length)}
            </span>
        );
        // return text.replace(regexp, replace_text);
    } else {
        return text;
    }
}

export default function ChatTextParse(contents_list, raw_text) {
    return newContents(contents_list, raw_text);
}