import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import Chart from "./Chart/Chart";
import Board from "./Board/DexBoard";
import DexForm from "./Form/DexForm";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import { THEME } from "../scripts/Theme";

// LobbyのDexとPV部分を担うコンポーネント
class Dex extends Component {
    render() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;

        return (
            <div className={((theme === THEME.DARK) ? "dark-mode" : "white-mode")}>
                <h2>{"メンバーシップ取引所"}</h2>

                <Col xs="12" id="dex" className="py-3 mt-1 border-special normal-shadow">

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
                        <Chart symbol={symbol} />
                    </Row>
                    
                </Col>
            </div>
        );
    }
}

export default Dex;
