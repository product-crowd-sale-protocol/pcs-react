import React, { Component } from "react";
import { Collapse, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import SubSig from "../../scripts/EosSubSig";
import scatter from "../../scripts/Scatter";

class Burn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            symbol: this.props.symbol,
            nftId: this.props.id,
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.burn = this.burn.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    async burn() {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.state.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成

        // トークンIDを用いてEOSからトークンの所有者及び、subsig公開鍵を取得する
        const nftId = this.state.nftId;
        const { owner } = await subsig.getEOSAuth(nftId);

        try {
            await scatter.login();
        }
        catch (e) {
            return window.alert(e);
        }

        const authority = owner === scatter.account.name; // トークン所有権の確認
        console.log(scatter.account);

        if (authority) {
            try {
                const actObj = {
                    "contractName": code,
                    "actionName": "burnbyid",
                    "params": [scatter.account.name, symbol, nftId]
                };
                const response = await scatter.action(actObj);
                console.log("response: ", response);
            }
            catch(error){
                console.error(error);
                return window.alert("トークンの削除に失敗しました");
            }
            
        } else {
            return window.alert(`トークンの所有者であることが確認できません。\nこのトークンの現在の所有者は ${owner} です。`);
        }

        this.setState({
            collapse: false,
            symbol: "",
            nftId: ""
        })
        return window.alert("トークンは削除されました。");
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <p>トークン削除</p>

                <Button onClick={this.toggle} style={{ marginBottom: '1rem' }}>トークンを削除する</Button>

                <Collapse isOpen={this.state.collapse}>
                    <Form>
                        <FormGroup>
                            <Label for="symbol">コミュニティ名</Label>
                            <Input type="text" name="symbol" onChange={this.handleChange} value={this.state.symbol} placeholder="コミュニティ名" />
                        </FormGroup>

                        <FormGroup>
                            <Label for="nftId">トークンID</Label>
                            <Input type="text" name="nftId" onChange={this.handleChange} value={this.state.nftId} placeholder="トークンID" />
                        </FormGroup>

                        <Button onClick={this.burn}>削除</Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

export default Burn;