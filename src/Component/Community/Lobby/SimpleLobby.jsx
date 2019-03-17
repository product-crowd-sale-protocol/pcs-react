// コミュニティのロビーのコンポーネント
import React, { Component } from "react";
import { connect } from "react-redux";
import { Col } from "reactstrap";
import OfferForm from "./OfferForm";
import OfferList from "./OfferList";
import History from "../../History";
import "./Lobby.css";


class SimpleLobby extends Component {

    render() {
        const symbol = this.props.symbol;
        return (
            <React.Fragment>
                {/* チャットを見ているアカウント一覧 */}
                <Col xs="12" className="py-3 my-3 border-special">
                    <History symbol={symbol} action="CHAT" seconds={10} descripton="今ロビーにいる人" />
                    <History symbol={symbol} action="CHAT" seconds={3600} descripton="1時間以内にロビーにいた人" />
                </Col>

                <OfferForm />

                <Col xs="12" className="py-3 my-3 border-special">
                    <h4>現在のOfferの一覧</h4>
                    <OfferList />
                </Col>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        symbol: state.community.symbol
    };
};

export default connect(mapStateToProps)(SimpleLobby);
