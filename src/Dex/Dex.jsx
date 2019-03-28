import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import Charts from "./Chart/Charts";
import Board from "./Board/DexBoard";
import DexForm from "./Form/DexForm";
import Price from "./Price/Price";

// LobbyのDexとPV部分を担うコンポーネント
class Dex extends Component {
    render() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;

        return (
            <div>
                <h2>{"メンバーシップ取引所"}</h2>

                <Col xs="12" id="dex" className="py-3 mt-1 border-special normal-shadow">
                    {/* 価格 */}
                    <Row className="mx-1 py-2">
                        <Price />
                    </Row>

                    {/* 取引フォーム&板 */}
                    <Row className="mx-1 pt-3 pb-2 border-top">

                        <Col xs="12" md="6">
                            <DexForm />
                        </Col>

                        <Col xs="12" md="6">
                            <Board symbol={symbol} />
                        </Col>

                    </Row>

                    {/* チャート */}
                    <Row className="mb-2 mx-1 pt-3 border-top">
                        <Charts symbol={symbol} />
                    </Row>
                    
                </Col>
            </div>);
    }
}

export default Dex;
