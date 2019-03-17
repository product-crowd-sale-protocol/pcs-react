import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import scatter, { Scatter } from "../../../scripts/Scatter";
import { checkUint } from "../../../scripts/Util";
import { getTable } from "../../../scripts/EosHttpApi";
import { connect } from "react-redux";

// 新規買い注文と売り板から買う機能
class Buy extends Component {

    constructor(props) {
        super(props);

        this.state = {
            format: "new",
            price: 0,
            targetId: 0
        };

        this.handleChange = this.handleChange.bind(this);
        this.createBuyOrder = this.createBuyOrder.bind(this);
        this.buyFromSellOrder = this.buyFromSellOrder.bind(this);
        this.renderForm = this.renderForm.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // 買い注文を発行する
    // price 買いたい価格
    async createBuyOrder(price) {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol; // DEXのSymbol

        try {
            await scatter.login();
        }
        catch (e) {
            return window.alert(e);
        }

        try {
            const actObj = {
                "contractName": "eosio.token",
                "actionName": "transfer",
                "params": [scatter.account.name, code, Scatter.numToAsset(Number(price)), `${code} addbuyorder ${symbol}`]
            };
            await scatter.action(actObj);
            return window.alert("トークンの買い注文を発行しました。");
        }
        catch (error) {
            console.error(error);
            return window.alert("トークンの買い注文を中断しました。");
        }
    }

    // 売り注文から買う
    // targetId: 売り注文のトークンID
    async buyFromSellOrder(targetId) {
        if (!checkUint(targetId)) {
            throw new Error("invalid Id.");
        }

        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol; // DEXのSymbol

        const query = {
            "code": code,
            "scope": symbol,
            "table": "sellorder",
            "lower_bound": targetId,
            "upper_bound": targetId,
            "limit": 1
        };
        const result = await getTable(query);

        if (result.rows.length === 0) {
            return window.alert("売り注文が確認できませんでした");
        }

        // EOS単位のトークン価格
        const price = result.rows[0].price;

        try {
            await scatter.login();
        }
        catch (e) {
            return window.alert(e);
        }

        try {
            const actObj = {
                "contractName": "eosio.token",
                "actionName": "transfer",
                "params": [scatter.account.name, code, price, `${code} buyfromorder ${symbol} ${targetId}`]
            };
            await scatter.action(actObj);
            return window.alert("トークンを購入しました。");
        }
        catch (error) {
            console.error(error);
            console.log(error.message);
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
                    <Button color="danger" size="sm" onClick={(() => { this.createBuyOrder(this.state.price) })}>買い注文を発行</Button>
                </Form>
            );
        } else {
            return (
                <Form>
                    <FormGroup>
                        <Label for="targetId">トークンID</Label>
                        <Input type="number" name="targetId" placeholder="売り板のトークンId" onChange={this.handleChange} value={this.state.targetId} />
                    </FormGroup>
                    <Button color="danger" size="sm" onClick={(() => { this.buyFromSellOrder(this.state.targetId) })}>売り板から購入</Button>
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

const mapStateToProps = (state) => {
    return {
        community: state.community
    };
};

export default connect(mapStateToProps)(Buy);
