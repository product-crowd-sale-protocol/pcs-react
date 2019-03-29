import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import Aws from "../../../../scripts/Aws";
import { PcsSignature, EOS_NETWORK } from "pcs-js-eos";
import "../../style/App.css";
import "../../style/Dark.css";
import "../../style/White.css";
import { THEME } from "../../scripts/Theme";

class Price extends Component {

    constructor(props) {
        super(props);

        this.network = EOS_NETWORK.kylin.asia;

        this.state = {
            eosjpy: 0,
            nfteos: 0,
            nftjpy: 0
        };
    }

    async componentDidMount() {
        const symbol = this.props.symbol;
        const subsig = new PcsSignature(this.network, symbol);
        const { signature, subkey } = await subsig.getSigAndSubkey();

        try {
            const eosjpy = Number(await Aws.EOSPrice());
            let nfteos = (await Aws.getBorderPrice(symbol, signature, subkey)).y; // トークン価格(EOS建て)のデータを取得
            let nftjpy = nfteos * eosjpy * 1.15;
            nfteos = Math.round(nfteos * 10000) / 10000;
            nftjpy = Math.ceil(nftjpy);

            this.setState({
                eosjpy,
                nfteos,
                nftjpy
            });
        } catch (error) {
            console.error(error);
            window.alert("トークン価格の取得に失敗しました。");
        }
    }

    render() {
        const theme = this.props.theme;
        return (
            <Col xs="12" className={(theme === THEME.DARK) ? "dark-mode" : "white-mode"}>
                <Row>

                    <Col xs="12">
                        <h4>{"💰"} {"♢"+this.props.symbol}のメンバーシップ価格</h4>
                    </Col>
                    
                    <Col xs="6" className="text-center">
                        <h4>{this.state.nftjpy} JPY</h4>
                    </Col>
                    
                    <Col xs="6" className="text-center">
                        <h4>{this.state.nfteos} EOS</h4>
                    </Col>

                </Row>
            </Col>
        );
    }
}

export default Price;
