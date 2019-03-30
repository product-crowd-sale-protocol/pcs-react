'use strict'

import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { PcsDex, ScatterError } from "../../pcs-js-eos/main";
import { checkUint } from "../../scripts/Util";

// 新規買い注文と売り板から買う機能
class Buy extends Component {

    constructor(props) {
        super(props);

        this.network = this.props.network;
        this.state = {
            format: "new",
            price: 0,
            targetId: 0,
            locked: false,
            loading: "none"
        };

        this.handleChange = this.handleChange.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.createBuyOrder = this.createBuyOrder.bind(this);
        this.buyFromSellOrder = this.buyFromSellOrder.bind(this);
        this.renderForm = this.renderForm.bind(this);
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

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // 買い注文を発行する
    // price 買いたい価格
    async createBuyOrder(price) {
        const symbol = this.props.symbol;
        let dex = new PcsDex(this.network, this.props.appName);

        this.lockBtn();
        try {
            await dex.addBuyOrder(symbol, price);
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
                return window.alert("トークンの買い注文を中断しました。");
            }
            console.error(error);
            return window.alert("トークンの買い注文を中断しました。");
        }
        this.unlockBtn();
        return window.alert("トークンの買い注文が完了しました。");
    }

    // 売り注文から買う
    // targetId: 売り注文のトークンID
    async buyFromSellOrder(targetId) {
        if (!checkUint(targetId)) {
            throw new Error("invalid Id.");
        }

        const symbol = this.props.symbol;
        let dex = new PcsDex(this.network, this.props.appName);
        this.lockBtn();

        try {
            await dex.buyFromOrder(symbol, targetId);
            this.unlockBtn();
            return window.alert("トークンを購入しました。");
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
                return window.alert("トークンの購入を中断しました。");
            }
            console.error(error);
            return window.alert("トークンの購入を中断しました。");
        }
    }

    renderForm() {
        if (this.state.format === "new") {
            return (
                <Form>
                    <FormGroup>
                        <Label for="price">購入希望価格</Label>
                        <Input type="number" name="price" placeholder="買い注文の価格" onChange={this.handleChange} value={this.state.price} />
                    </FormGroup>
                    <Button color="danger" size="sm" onClick={(() => { this.createBuyOrder(this.state.price) })} disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        買い注文を発行
                    </Button>
                </Form>
            );
        } else {
            return (
                <Form>
                    <FormGroup>
                        <Label for="targetId">トークンID</Label>
                        <Input type="number" name="targetId" placeholder="売り板のトークンId" onChange={this.handleChange} value={this.state.targetId} />
                    </FormGroup>
                    <Button color="danger" size="sm" onClick={(() => { this.buyFromSellOrder(this.state.targetId) })} disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        売り板から購入
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
                            <option value="new">新規に買い注文を出す</option>
                            <option value="order">既存の売り注文から買う</option>
                        </Input>
                    </FormGroup> 
                </Form>

                {this.renderForm()}
            </React.Fragment>
        );
    }
}

export default Buy;
