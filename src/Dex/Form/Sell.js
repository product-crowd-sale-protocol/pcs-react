'use strict'

import React, { Component } from "react";
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { PcsDex, EOS_NETWORK, ScatterError } from "pcs-js-eos";
import { checkUint, checkUnsigned } from "../../scripts/Util";

// 新規売り注文と買い板から買う機能
class Sell extends Component {

    constructor(props) {
        super(props);

        this.state = {
            format: "new",
            sellTargetId: 0,
            buyOrderId: 0,
            price: 0,
            locked: false,
            loading: "none"
        };

        this.handleChange = this.handleChange.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.createSellOrder = this.createSellOrder.bind(this);
        this.sellToBuyOrder = this.sellToBuyOrder.bind(this);
        this.renderForm = this.renderForm.bind(this);
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

    // 売り注文を発行する
    async createSellOrder(sellTargetId, price) {
        if (!checkUnsigned(price) || (!checkUint(sellTargetId))) {
            return window.alert("invalid price or tokenId.");
        }

        const symbol = this.props.symbol;
        let network = EOS_NETWORK.kylin.asia;
        let dex = new PcsDex(network, this.props.appName);

        // ユーザーの認証情報からScatterのアカウント と 売ろうとしているアカウントの名前が等しいことを確認する
        this.lockBtn();

        try {
            await dex.addSellOrderByid(symbol, sellTargetId, price);
        }
        catch (error) {
            this.unlockBtn();
            if (error instanceof ScatterError) {
                if (error.errorType === "connection_fail") {
                    return window.alert("Scatterが見つかりません。アンロックされていることを確認してください。");
                } else if ((error.errorType === "identity_not_found") || (error.errorType === "account_not_found")) {
                    return window.alert("アカウントの秘密鍵がセットされていません。");
                }
                console.error(error);
                return window.alert("ログインに失敗しました。");
            }
        }
            
        this.setState({
            price: 0,
            nftId: "",
            locked: false,
            loading: "none"
        })
        return window.alert("トークンの売り注文が出されました。");
    }

    // 買い注文に売る
    async sellToBuyOrder(buyOrderId, sellTargetId) {
        if (!checkUint(buyOrderId) || !checkUint(sellTargetId)) {
            return window.alert("uint type only");
        }
        const symbol = this.props.symbol;
        let network = EOS_NETWORK.kylin.asia;
        let dex = new PcsDex(network, this.props.appName);

        this.lockBtn();

        try {
            await dex.sellToBuyOrder(symbol, sellTargetId, buyOrderId);
        }
        catch (error) {
            this.unlockBtn();
            if (error instanceof ScatterError) {
                if (error.errorType === "connection_fail") {
                    return window.alert("Scatterが見つかりません。アンロックされていることを確認してください。");
                } else if ((error.errorType === "identity_not_found") || (error.errorType === "account_not_found")) {
                    return window.alert("アカウントの秘密鍵がセットされていません。");
                }
            }
            console.error(error);
            return window.alert("トークンの売りを中断しました");
        }
        this.unlockBtn();
        return window.alert("トークンが売りが完了しました。");
    }

    renderForm() {
        if (this.state.format === "new") {
            return (
                <Form>
                    <Row form>
                        <Col xs={6}>
                            <FormGroup>
                                <Label for="sellTargetId">トークンID</Label>
                                <Input type="number" name="sellTargetId" placeholder="トークンID" onChange={this.handleChange} value={this.state.sellTargetId} />
                            </FormGroup>
                        </Col>
                        <Col xs={6}>
                            <FormGroup>
                                <Label for="price">売却希望価格</Label>
                                <Input type="number" name="price" placeholder="注文価格" onChange={this.handleChange} value={this.state.price} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button color="success" size="sm" onClick={(() => { this.createSellOrder(this.state.sellTargetId, this.state.price) })} disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        売り注文を発行
                    </Button>
                </Form>
            );
        } else {
            return (
                <Form>
                    <Row form>
                        <Col xs={6}>
                            <FormGroup>
                                <Label for="buyOrderId">買い注文ID</Label>
                                <Input type="number" name="buyOrderId" placeholder="買い注文Id" onChange={this.handleChange} value={this.state.buyOrderId} />
                            </FormGroup>
                        </Col>
                        <Col xs={6}>
                            <FormGroup>
                                <Label for="sellTargetId">トークンID</Label>
                                <Input type="number" name="sellTargetId" placeholder="売るトークンのID" onChange={this.handleChange} value={this.state.sellTargetId} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button color="success" size="sm" onClick={(() => { this.sellToBuyOrder(this.state.buyOrderId, this.state.sellTargetId) })} disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        買い板に売却
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
                            <option value="new">新規に売り注文を出す</option>
                            <option value="order">既存の買い注文に対して売る</option>
                        </Input>
                    </FormGroup>
                </Form>

                {this.renderForm()}
            </React.Fragment>
        );
    }
}

export default Sell;
