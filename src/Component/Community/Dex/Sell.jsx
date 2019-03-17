import React, { Component } from "react";
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import scatter, { Scatter } from "../../../scripts/Scatter";
import SubSig from "../../../scripts/EosSubSig";
import { checkUint, checkUnsigned } from "../../../scripts/Util";

// redux
import { connect } from "react-redux";

// 新規売り注文と買い板から買う機能
class Sell extends Component {

    constructor(props) {
        super(props);

        this.state = {
            format: "new",
            sellTargetId: 0,
            buyOrderId: 0,
            price: 0

        };

        this.handleChange = this.handleChange.bind(this);
        this.createSellOrder = this.createSellOrder.bind(this);
        this.sellToBuyOrder = this.sellToBuyOrder.bind(this);
        this.renderForm = this.renderForm.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // 売り注文を発行する
    async createSellOrder(sellTargetId, price) {
        if (!checkUnsigned(price) || (!checkUint(sellTargetId))) {
            return window.alert("invalid price or tokenId.");
        }

        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol;  // DEXのあるシンボル 売りは、DEX===UserのSymbolが成り立っている
        const subsig = new SubSig(symbol);

        // ユーザーの認証情報からScatterのアカウント と 売ろうとしているアカウントの名前が等しいことを確認する
        const { account } = await subsig.getEOSAuth(sellTargetId);
        try {
            await scatter.login();
        }
        catch (e) {
            return window.alert(e);
        }
        const authority = account === scatter.account.name; // トークン所有権の確認

        if (authority) {
            try {
                const actObj = {
                    "contractName": code,
                    "actionName": "addsellobyid",
                    "params": [symbol, sellTargetId, Scatter.numToAsset(Number(price)), "add sell order"]
                };
                await scatter.action(actObj);
            }
            catch (error) {
                console.error(error);
                return window.alert("トークンの売り注文を中断しました");
            }

        } else {
            return window.alert(`トークンの所有者であることが確認できません。\nこのトークンの現在の所有者は ${account} です。`);
        }

        this.setState({
            price: 0,
            nftId: ""
        })
        return window.alert("トークンの売り注文が出されました。");
    }

    // 買い注文に売る
    async sellToBuyOrder(buyOrderId, sellTargetId) {
        if (!checkUint(buyOrderId) || !checkUint(sellTargetId)) {
            return window.alert("uint type only");
        }

        // コントラクトとコミュニティの情報
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol; // DEXのあるコントラクト 売りは、DEX===UserのSymbolが成り立っている

        // ユーザーの認証情報からScatterのアカウント と 売ろうとしているアカウントの名前が等しいことを確認する
        const subsig = new SubSig(symbol);
        const { account } = await subsig.getEOSAuth(sellTargetId);
        try {
            await scatter.login();
        }
        catch (e) {
            return window.alert(e);
        }
        const authority = account === scatter.account.name; // トークン所有権の確認

        if (authority) {
            try {
                const actObj = {
                    "contractName": code,
                    "actionName": "selltoorder",
                    "params": [symbol, sellTargetId, buyOrderId, "sell token"]
                };
                await scatter.action(actObj);
            }
            catch (error) {
                console.error(error);
                return window.alert("トークンの売りを中断しました");
            }

        } else {
            return window.alert(`トークンの所有者であることが確認できません。\nこのトークンの現在の所有者は ${account} です。`);
        }
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
                    <Button color="success" size="sm" onClick={(() => { this.createSellOrder(this.state.sellTargetId, this.state.price) })}>売り注文を発行</Button>
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
                    <Button color="success" size="sm" onClick={(() => { this.sellToBuyOrder(this.state.buyOrderId, this.state.sellTargetId) })}>買い板に売却</Button>
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


const mapStateToProps = (state) => {
    return {
        community: state.community
    };
};

export default connect(mapStateToProps)(Sell);