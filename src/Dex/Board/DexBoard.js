'use strict'

import React, { Component } from "react";
import { Col, Row, Table } from 'reactstrap';
import { asyncMap } from "../../scripts/Util";
import { getTable, EOS_NETWORK } from "../../pcs-js-eos/main";
import "./DexBoard.css";
import "../../style/App.css";
import "../../style/Dark.css";
import "../../style/White.css";
import "../../style/bootstrap.min.css";
import { THEME } from "../../scripts/Theme";
import Aws from "../../scripts/Aws";
import { CONTRACT_NAME } from "../../scripts/Config";

// Dexの板部分
class Board extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.state = {
            buyTable : [],
            sellTable : [],
            eosJpy: 0
        }

        this.updateBoard = this.updateBoard.bind(this);
    }

    async componentDidMount() {
        await this.updateBoard();

        // 3秒間隔で板を更新する
        this.timer = setInterval(() => {
            this.updateBoard()
        }, 3000);
    }

    componentWillUnmount() {
        clearInterval(this.timer); // 板更新処理を終了
    }

    // EOSから板情報を取得してStateに反映させる関数
    async updateBoard() {
        const symbol = this.props.symbol;
        let buyTable = [];
        let sellTable = [];

        // 買い板と売り板両方取得する
        await asyncMap(["buyorder", "sellorder"], async (buysell) => {
            const code = CONTRACT_NAME;
            const query = {
                "code": code,
                "scope": symbol,
                "table": buysell,
                "limit": 100
            };
            const response = await getTable(EOS_NETWORK.kylin.asia, query);
            const rows = response.rows;
            if (buysell === "buyorder") {
                buyTable = rows
            } else {
                sellTable = rows
            }
        });
        let eosJpy = Number(await Aws.EOSPrice());

        this.setState({
            buyTable,
            sellTable,
            eosJpy
        })
    }

    render() {
        const theme = this.props.theme;
        return (
            <Row className={(theme === THEME.DARK) ? "dark-mode" : "white-mode"}>
                <Col xs="6">
                    <strong className="dex-board-title text-danger">Buy</strong>
                    <Table size="sm" className="dex-board-header">
                        <thead>
                            <tr>
                                <th>注文ID</th>
                                <th>価格(JPY)</th>
                                <th>価格(EOS)</th>
                            </tr>
                        </thead>
                    </Table>
                    <div className="dex-board-contents">
                        <Table size="sm">
                            <tbody>
                                {
                                    this.state.buyTable.map((order) => {
                                        const eosPrice = Number(order.price.replace(/EOS/g, "")); // EOS換算
                                        const jpyPrice = Math.ceil(eosPrice * this.state.eosJpy); // JPY換算
                                        return (
                                            <tr key={order.id}>
                                                <th scope="row">{order.id}</th>
                                                <td>{jpyPrice.toLocaleString()}</td>
                                                <td>{eosPrice.toLocaleString()}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </div>
                </Col>

                <Col xs="6">
                    <strong className="dex-board-title text-success">Sell</strong>
                    <Table size="sm" className="dex-board-header">
                        <thead>
                            <tr>
                                <th>トークンID</th>
                                <th>価格(JPY)</th>
                                <th>価格(EOS)</th>
                            </tr>
                        </thead>
                    </Table>
                    <div className="dex-board-contents">
                        <Table size="sm">
                            <tbody>
                                {
                                    this.state.sellTable.map((order) => {
                                        const eosPrice = Number(order.price.replace(/EOS/g, ""));
                                        const jpyPrice = Math.ceil(eosPrice * this.state.eosJpy);
                                        return (
                                            <tr key={order.id}>
                                                <th scope="row">{order.id}</th>
                                                <td>{jpyPrice.toLocaleString()}</td>
                                                <td>{eosPrice.toLocaleString()}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default Board;