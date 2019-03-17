import React, { Component } from "react";
import { connect } from "react-redux";
import { switchCommunity, setAuthority } from "../../redux/actions";
import { Row } from "reactstrap";
import EosSubSig from "../../scripts/EosSubSig";
import { asyncAll } from "../../scripts/Util";
import scatter from "../../scripts/Scatter";
import Lobby from "./Lobby/Lobby";
import SimpleLobby from "./Lobby/SimpleLobby";
import Dex from "./Dex/Dex.jsx";
import SimpleDex from "./Dex/SimpleDex.jsx";

// トークンによる認証を行い、結果によって表示内容を変える
class Auth extends Component {

    constructor(props) {
        super(props);

        this.state = {
            verified: "pending"
        }

        this.checkToken = this.checkToken.bind(this);
        this.switchContent = this.switchContent.bind(this);
    }

    // トークン所有を確認する
    async checkToken(symbol) {
        let subsig = new EosSubSig(symbol);

        try {
            // ローカルからユーザーの認証情報(IDとSubsig秘密鍵)を取得
            let { id, privateKey } = subsig.getLocalAuth();

            // EOSからNFT所有者のアカウント名とSubsig公開鍵の取得
            let { account, subkey } = await subsig.getEOSAuth(id);

            // トークンの所有と運営であるかを確認する
            let verified = false;
            let isManager = false;
            [verified, isManager] = await asyncAll(subsig.verifyAuth(id, privateKey), subsig.checkManager(id));

            if (verified) {
                // 認証クリア
                this.props.dispatch(setAuthority({
                    "symbol": symbol,
                    "nftId": id,
                    "accountName": account,
                    "isManager": isManager
                }));
                // Stateを更新してコンテンツを表示する
                this.setState({
                    verified: "success"
                })
            } else {
                this.setState({
                    verified: "fail"
                })
            }
        } catch (e) {
            this.setState({
                verified: "fail"
            })
        }
    }

    // Reduxの値によって表示するコンテンツを切り替える関数
    switchContent(communityContents) {

        if (this.state.verified === "success") {
            // 認証成功したとき
            if (communityContents.lobby) {
                return (
                    <Lobby />
                );
            } else {
                return (
                    <Dex />
                );
            }
        } else if (this.state.verified === "pending") {
            // 認証が終わっていないとき
            return (
                <div className={this.props.darkMode ? "spinner-border text-light" : "spinner-border text-warning"} role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            );
        } else {
            // 認証失敗したとき
            if (communityContents.lobby) {
                // 今のところOfferはScatter前提なのでSimpleLobbyのみ
                return (
                    <SimpleLobby />
                );
            } else {
                if (scatter.connected) {
                    // Scatterアリ
                    return (
                        <Dex />
                    )
                } else {
                    // Scatter無し
                    return (
                        <SimpleDex />
                    )
                }
            }
        }
    }

    componentWillMount() {
        const symbol = this.props.match.params.symbol;
        this.props.dispatch(switchCommunity(symbol));
        this.checkToken(symbol);
    }

    render() {
        return (
            <React.Fragment>
                {/* ここにコンテンツが表示される */}
                <Row>
                    {this.switchContent(this.props.communityContents)}
                </Row>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        communityContents: state.communityContents,
        authority: state.authority,
        darkMode: state.darkMode.darkMode
    };
};

export default connect(mapStateToProps)(Auth);
