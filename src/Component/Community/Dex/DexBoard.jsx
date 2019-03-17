import React, { Component } from "react";
import { Col, Row, Table } from 'reactstrap';
import "./DexBoard.css";
import Aws from "../../../scripts/Aws";
import { asyncMap } from "../../../scripts/Util";
import { getTable } from "../../../scripts/EosHttpApi";

// redux
import { connect } from "react-redux";

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

        // 5秒間隔で板を更新する
        this.timer = setInterval(() => {
            this.updateBoard()
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.timer); // 板更新処理を終了
    }

    // EOSから板情報を取得してStateに反映させる関数
    async updateBoard() {
        const symbol = this.props.community.symbol;
        let buyTable = [];
        let sellTable = [];

        // 買い板と売り板両方取得する
        await asyncMap(["buyorder", "sellorder"], async (buysell) => {
            const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
            const query = {
                "code": code,
                "scope": symbol,
                "table": buysell,
                "limit": 100
            };
            const response = await getTable(query);
            const rows = response.rows;
            if (buysell === "buyorder") {
                buyTable = rows
            } else {
                sellTable = rows
            }
        });

        // EOSJPYレートを取得する
        let eosJpy = await Aws.EOSPrice();

        this.setState({
            buyTable,
            sellTable,
            eosJpy
        })
    }

    render() {
        return (
            <Row>
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

const mapStateToProps = (state) => {
    return {
        community: state.community
    };
};

export default connect(mapStateToProps)(Board);