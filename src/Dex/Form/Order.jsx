'use strict'

import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { PcsDex, EOS_NETWORK, getTable } from "pcs-js-eos";
import { asyncAll, checkUint } from "../../scripts/Util";
import { CONTRACT_NAME } from "../../scripts/Config";

// 新規買い注文と売り板から買う機能
class Order extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.network = EOS_NETWORK.kylin.asia;
        this.dex = new PcsDex(this.network, this.props.appName);
        this.state = {
            format: "buyOrder",
            buyOrder: [],
            sellOrder: [],
            buyOrderId: "",
            sellTargetId: "",
            locked: false,
            loading: "none"
        };

        this.handleChange = this.handleChange.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        // 自分の注文リストを取得
        this.setOwnOrder = this.setOwnOrder.bind(this);
        this.getOwnBuyOrder = this.getOwnBuyOrder.bind(this);
        this.getOwnSellOrder = this.getOwnSellOrder.bind(this);
        // 選択した注文をキャンセルする
        this.cancelBuyOrder = this.cancelBuyOrder.bind(this);
        this.cancelSellOrder = this.cancelSellOrder.bind(this);
        // 選択内容によってフォームを切り替える
        this.renderForm = this.renderForm.bind(this);
    }

    // 売買注文を定期的に取得する
    async componentDidMount() {
        await this.setOwnOrder();

        // 10秒間隔で板を更新する
        this.timer = setInterval(() => {
            this.setOwnOrder();
        }, 10000);
    }

    componentWillUnmount() {
        clearInterval(this.timer); // 板更新処理を終了
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    lockBtn() {
        // 連打されないようにロックする
        this.setState({
            locked: true,
            loading: "inline-block"
        });
    }

    unlockBtn() {
        this.setState({
            locked: false,
            loading: "none"
        });
    }

    // 自分の注文一覧をstateにセットする
    async setOwnOrder() {
        let scatterName = null;
        if ((this.dex.account) && ("name" in this.dex.account)) {
            scatterName = this.dex.account.name; // Scatterのアカウント名
        }

        if (scatterName) {
            // トークンを所持している
            const [buyOrder, sellOrder] = await asyncAll(this.getOwnBuyOrder(scatterName), this.getOwnSellOrder(scatterName));
            this.setState({
                buyOrder, sellOrder
            })
        }
    }

    // 自分の買い注文のIDの配列を取得する
    async getOwnBuyOrder(accountName) {
        const code = CONTRACT_NAME;
        const symbol = this.props.symbol;  // DEXのsymbol

        // 自分の買い注文一覧を取得する
        const query = {
            "code": code,
            "scope": symbol,
            "table": "buyorder",
            "index_position": 3,
            "key_type": "i64",
            "lower_bound": accountName,
            "limit": 100
        };
        const response = await getTable(this.network, query);
        return response.rows.map((order) => { return order.id });
    }

    // 自分の売り注文のIDの配列を取得する
    async getOwnSellOrder(accountName) {
        const code = CONTRACT_NAME;
        const symbol = this.props.symbol;  // DEXのsymbol

        // 自分の買い注文一覧を取得する
        const query = {
            "code": code,
            "scope": symbol,
            "table": "sellorder",
            "index_position": 3,
            "key_type": "i64",
            "lower_bound": accountName,
            "limit": 100
        };
        const response = await getTable(this.network, query);
        return response.rows.map((order) => { return order.id });
    }

    // 買い注文をキャンセルする
    async cancelBuyOrder(buyOrderId) {
        if ((!checkUint(buyOrderId))) {
            return window.alert("注文IDを選択してください。");
        }

        const code = CONTRACT_NAME;
        const symbol = this.props.symbol;  // DEXのsymbol

        this.lockBtn();
        // 指定した買い注文があることを確認しuserを取得する
        const query = {
            "code": code,
            "scope": symbol,
            "table": "buyorder",
            "lower_bound": buyOrderId,
            "upper_bound": buyOrderId,
            "limit": 1
        };
        const result = await getTable(this.network, query);

        if (result.rows.length === 0) {
            return window.alert("買い注文が確認できませんでした");
        }

        try {
            await this.dex.cancelBuyOrderById(symbol, buyOrderId);
        }
        catch (error) {
            this.unlockBtn();
            if (e instanceof ScatterError) {
                if (e.errorType === "connection_fail") {
                    return window.alert("Scatterが見つかりません。アンロックされていることを確認してください。");
                } else if ((e.errorType === "identity_not_found") || (e.errorType === "account_not_found")) {
                    return window.alert("アカウントの秘密鍵がセットされていません。");
                }
            }
            console.error(error);
            return window.alert("買い注文のキャンセルに失敗しました");
        }

        this.setState({
            price: 0,
            nftId: "",
            locked: false,
            loading: "none"
        })
        return window.alert("トークンの買い注文をキャンセルしました");
    }

    // 売り注文をキャンセルする
    async cancelSellOrder(sellTargetId) {
        const code = CONTRACT_NAME;
        const symbol = this.props.symbol;

        if ((!checkUint(sellTargetId))) {
            return window.alert("注文IDを選択してください。");
        }

        // 指定した売り注文があることを確認しuserを取得する
        this.lockBtn();
        const query = {
            "code": code,
            "scope": symbol,
            "table": "sellorder",
            "lower_bound": sellTargetId,
            "upper_bound": sellTargetId,
            "limit": 1
        };
        const result = await getTable(this.network, query);

        if (result.rows.length === 0) {
            return window.alert("売り注文が確認できませんでした");
        }

        try {
            await this.dex.cancelSellOrderById(symbol, sellTargetId);
        }
        catch (error) {
            this.unlockBtn();
            if (e instanceof ScatterError) {
                if (e.errorType === "connection_fail") {
                    return window.alert("Scatterが見つかりません。アンロックされていることを確認してください。");
                } else if ((e.errorType === "identity_not_found") || (e.errorType === "account_not_found")) {
                    return window.alert("アカウントの秘密鍵がセットされていません。");
                }
            }
            console.error(error);
            return window.alert("売り注文のキャンセルに失敗しました。");
        }

        this.setState({
            price: 0,
            nftId: "",
            locked: false,
            loading: "none"
        })
        return window.alert("売り注文をキャンセルしました。");
    }

    renderForm() {
        if (this.state.format === "buyOrder") {
            return (
                <Form>
                    <FormGroup>
                        <Label for="buyOrderId">買い注文一覧</Label>
                        <Input type="select" name="buyOrderId" onChange={this.handleChange} value={this.state.buyOrderId}>
                            <option value=""></option>
                            {
                                this.state.buyOrder.map((orderId) => {
                                    return (
                                        <option value={orderId} key={orderId}>{orderId}</option>
                                    )
                                })
                            }
                        </Input>
                    </FormGroup>
                    <Button size="sm" outline color="danger" onClick={(() => { this.cancelBuyOrder(this.state.buyOrderId) })} disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        キャンセル
                    </Button>
                </Form>
            );
        } else {
            return (
                <Form>
                    <FormGroup>
                        <Label for="sellTargetId">売り注文一覧</Label>
                        <Input type="select" name="sellTargetId" onChange={this.handleChange} value={this.state.sellTargetId}>
                            <option value=""></option>
                            {
                                this.state.sellOrder.map((orderId) => {
                                    return (
                                        <option value={orderId} key={orderId}>{orderId}</option>
                                    )
                                })
                            }
                        </Input>
                    </FormGroup>
                    <Button size="sm" outline color="success" onClick={(() => { this.cancelSellOrder(this.state.sellTargetId) })} disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        キャンセル
                    </Button>
                </Form>
            );
        }
    }

    render() {
        return (
            <React.Fragment>
                <Form>
                    <FormGroup>
                        <Input type="select" name="format" value={this.state.format} onChange={this.handleChange} bsSize="sm">
                            <option value="buyOrder">買い注文一覧</option>
                            <option value="sellOrder" className="text-success">売り注文一覧</option>
                        </Input>
                    </FormGroup>
                </Form>

                {this.renderForm()}
            </React.Fragment>
        );
    }
}

export default Order;
