import React, { Component } from "react";
import { Container, Col, Row } from "reactstrap";
import Chart from "./Chart/Chart";
import Board from "./Board/DexBoard";
import DexForm from "./Form/DexForm";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import "../style/bootstrap.min.css";
import { THEME } from "../scripts/Theme";

// LobbyのDexとPV部分を担うコンポーネント
class Dex extends Component {

    constructor(props) {
        super(props);
        this.renderChart = this.renderChart.bind(this);
    }

    renderChart() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;
        const network = this.props.network;
        if (this.props.chartDisplay) {
            return (
                <Row className = "mb-2 mx-1 pt-3 border-top" >
                    <Chart symbol={symbol} theme={theme} network={network} />
                </Row>
            )
        } else {
            return (
                <React.Fragment></React.Fragment>
            )
        }
    }

    render() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;
        const network = this.props.network;
        const appName = this.props.appName;
        const title = (this.props.title !== "") ? this.props.title : symbol + "メンバーシップ取引所";

        return (
            <Container className={((theme === THEME.DARK) ? "dark-mode" : "white-mode my-1")}>
                <Row>

                    <Col xs="12" id="dex" className="py-3 border-special normal-shadow">
                        <Row>
                            <Col xs="12">{title}</Col>
                        </Row>

                        {/* 取引フォーム&板 */}
                        <Row className="mx-1 pt-3 pb-2">

                            <Col xs="12" md="6">
                                <DexForm symbol={symbol} theme={theme} appName={appName} network={network} />
                            </Col>

                            <Col xs="12" md="6">
                                <Board symbol={symbol} theme={theme} network={network}  />
                            </Col>

                        </Row>

                        {this.renderChart()}

                    </Col>
                </Row>
            </Container>
        );
    }
}

Dex.defaultProps = {
    theme: THEME.DARK,
    appName: "PCS_APP",
    symbol: "PCS",
    title: "",
    chartDisplay: false
};

export default Dex;
