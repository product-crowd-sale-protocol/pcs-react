import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import "./Chat.css";
import ChatModal from "./ChatModal";
import SubSig from "../../../scripts/EosSubSig";
import Aws from "../../../scripts/Aws";
import ChatTextParse from "../../../scripts/ChatTextParse";
import { unix2time, isAgent } from "../../../scripts/Util";

// redux
import { connect } from "react-redux";
import { setChatThread, openProfile } from "../../../redux/actions";

// Lobbyのチャットページを担うコンポーネント
class Chat extends Component {
    constructor(props){
        super(props);

        this.timer = null;
        this.state = {
            begin: Infinity,
            end: 0,
        };
    
        this.get_new_chat = this.get_new_chat.bind(this);
        this.get_old_chat = this.get_old_chat.bind(this);
    }
    
    async get_new_chat() {
        const symbol = this.props.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成
        const { signature, subkey } = await subsig.getSigAndSubkey();
        
        const end = this.state.end === 0 ? null : this.state.end;
        const response = await Aws.getChat(this.props.symbol, signature, subkey, end, null, 10);
        
        if (Array.isArray(response)) {
            if (response.length > 0) {
                console.log("get_new_chat", response);
            }

            if (this.state.begin === Infinity) {
                this.setState({...this.state, begin: Math.min(...response.map(v => v.timestamp)), end: Math.max(this.state.end, ...response.map(v => v.timestamp))});
            } else {
                this.setState({...this.state, end: Math.max(this.state.end, ...response.map(v => v.timestamp))});
            }

            const thread = this.props.chat[this.props.symbol] || {0: {text: "↓"}, "Infinity": {text: "↑"}};
            response.forEach(v => {
                thread[v.timestamp] = v
            });

            this.props.dispatch(setChatThread({
                symbol: this.props.symbol,
                thread: thread
            }));
        }
    }

    async get_old_chat() {
        const symbol = this.props.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成
        const { signature, subkey } = await subsig.getSigAndSubkey();

        const begin = this.state.begin === Infinity ? null : this.state.begin;
        console.log(this.state.begin);
        const response = await Aws.getChat(this.props.symbol, signature, subkey, null, begin, 10);
        console.log("get_old_chat", response);

        if (Array.isArray(response)) {
            if (this.state.end === 0) {
                this.setState({...this.state, begin: Math.min(this.state.begin, ...response.map(v => v.timestamp)), end: Math.max(...response.map(v => v.timestamp))});
            } else {
                this.setState({...this.state, begin: Math.min(this.state.begin, ...response.map(v => v.timestamp))});
            }

            const thread = this.props.chat[this.props.symbol] || {0: {text: "↓"}, "Infinity": {text: "↑"}};
            response.forEach(v => {
                thread[v.timestamp] = v
            });

            this.props.dispatch(setChatThread({
                symbol: this.props.symbol,
                thread: thread
            }));
        }
    }


    componentDidMount() {
        this.get_new_chat();
        this.timer = setInterval(() => {
            this.get_new_chat();
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    openProfile(symbol, accountName, nftId, iconUrl, biography) {
        const profile = {
            symbol,
            accountName,
            nftId,
            iconUrl,
            biography
        };
        this.props.dispatch(openProfile(profile));
    }

    render() {
        // reduxから読み込み
        const chat = this.props.chat[this.props.symbol];
        const contents_list = (this.props.contents) ? this.props.contents[this.props.symbol] : [];

        // 描画
        return (
            <Col xs="12" className="py-3 my-2 border-special normal-shadow">
                <Row>
                    {/* 投稿ボタンとモーダル */}
                    <Col xs="12" className="clearfix">

                        <div className="float-left">
                            {/*<h2>{"Chat"}</h2>*/}
                        </div>
                        
                        <div className="float-right">
                            <ChatModal onUpdate={this.get_new_chat} symbol={this.props.symbol} />
                        </div>
                    </Col>

                    {/* チャットボックス */}
                    <Col xs="12" className="chat-box">

                        {(!chat || chat.errorMessage) ? "" :
                            Object.keys(chat).reverse().map((key) => {
                                if (key === "0") {
                                    return (
                                        <Row className="border-bottom" key={key}>
                                            <Col xs="12" sm="12" className="update-chat-button">
                                                <div title="さらに過去のチャットを読み込む" onClick={() => this.get_old_chat()}>{"↓"}</div>
                                            </Col>
                                        </Row>
                                    );
                                } else if (key === "Infinity") {
                                    return "";
                                } else {
                                    const res = chat[key];
                                    const text = ChatTextParse(contents_list, res.text);
                                    const userName = isAgent(this.props.symbol, res.account_name, res.nft_id);
                                    return (
                                        <Row className="border-bottom" key={key}>
                                            <Col xs="1">
                                                <img className="chat-icon" src={res.icon_url} alt="account" onClick={this.openProfile.bind(this, this.props.symbol, res.account_name, res.nft_id, res.icon_url, res.biography)} />
                                            </Col>
                                            <Col xs="11" className="chat-content">
                                                <Row>
                                                    <Col xs="6" className="user-name">{userName}</Col>
                                                    <Col xs="6" className="submit-time">{unix2time(res.timestamp)}</Col>
                                                    <Col xs="12">{text}</Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    );
                                }
                            })
                        }
                    </Col>

                </Row>
            </Col>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        symbol: state.community.symbol,
        darkMode: state.darkMode.darkMode,
        chat: state.chat,
        contents: state.contents,
        accountName: state.authority.accountName
    };
};

export default connect(mapStateToProps)(Chat);
