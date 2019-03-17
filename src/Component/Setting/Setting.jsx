import React, { Component } from "react";
import { Container, Row } from "reactstrap";
import { connect } from "react-redux";
import Theme from "./Theme";
import Token from "./Token";
import UpdateProfile from "./UpdateProfile";
import Password from "./Password";
import Transfer from "./Transfer";
import Law from "./Law";
import Throw from "./Throw";
import Contract from "./Contract";

class Setting extends Component {
    render() {
        const symbol = this.props.symbol ? this.props.symbol : "";
        const nftId = this.props.nftId ? this.props.nftId : "";

        return (
            <div className="setting">
                <Container className="py-4">
                    <Row>
                        <div>
                            <h2>{"🔧 Setting 🔨"}</h2>
                        </div>

                        <Theme />

                        <Token />

                        <Contract />

                        <UpdateProfile symbol={symbol} id={nftId} />

                        <Password symbol={symbol} id={nftId} />

                        <Transfer symbol={symbol} id={nftId} />

                        {/* 開発用 */}
                        <Throw />

                        <Law />
                    </Row>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        symbol: state.authority.symbol,
        nftId: state.authority.nftId
    };
};

export default connect(mapStateToProps)(Setting);