// コミュニティのロビーのコンポーネント
import React, { Component } from "react";
import { connect } from "react-redux";
import { Col } from "reactstrap";
import Chat from "./Chat";
import Contents from "./Contents";
import OfferForm from "./OfferForm";
import Accept from "./Accept";
import History from "../../History";
import "./Lobby.css";


class Lobby extends Component {

    render() {
        const symbol = this.props.symbol;
        return (
            <React.Fragment>
                <h2>{"♢"+symbol+"のロビー"}</h2>
                {/* チャットを見ているアカウント一覧 */}
                <Col xs="12" className="py-3 my-3 border-special">
                    <History symbol={symbol} action="CHAT" seconds={10} descripton="今ロビーにいる人" />
                    <History symbol={symbol} action="CHAT" seconds={3600} descripton="1時間以内にロビーにいた人" />
                </Col>

                <Chat />

                {/* サービス一覧 */}
                <Contents />

                <OfferForm />

                {(!this.props.isManager) ? "" :
                    <Accept />
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        symbol: state.community.symbol,
        isManager: state.authority.isManager
    };
};

export default connect(mapStateToProps)(Lobby);
