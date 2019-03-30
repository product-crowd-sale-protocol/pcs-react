import React, { Component } from "react";
import { Collapse, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { PcsClient, PcsSignature } from "../pcs-js-eos/main";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import "../style/bootstrap.min.css";
import { THEME } from "../scripts/Theme";
import { AGENT_NAME } from "../scripts/Config";

class Password extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            collapse: false,
            locked: false,
            symbol: "",
            nftId: "",
            passWord: "",
            loading: "none"
        };

        this.toggle = this.toggle.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refreshKey = this.refreshKey.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
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

    // パスワードを変更する
    async refreshKey() {
        const network = this.props.network;
        this.lockBtn();
        let pcs = new PcsClient(network, this.props.appName);

        const symbol = this.state.symbol;
        const subsig = new PcsSignature(network, symbol); // 必要なインスタンスの生成

        const password = this.state.passWord;

        // トークンIDを用いてEOSからトークンの所有者及び、subsig公開鍵を取得する
        const nftId = this.state.nftId;
        const { account, subkey } = await subsig.getEOSAuth(nftId);

        let res = false;
        if (account === AGENT_NAME) {
            // 代理人
            res = await pcs.refreshKey(password, symbol, nftId, true);
        } else {
            // Scatter
            res = await pcs.refreshKey(password, symbol, nftId);
        }
        this.unlockBtn();
        if (res) {
            return window.alert("パスワードの変更に成功しました。");
        } else {
            return window.alert("パスワードの変更に失敗しました。");
        }
    }


    render() {
        const theme = this.props.theme;
        return (
            <Col xs="12" className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " p-3 mb-3 normal-shadow border-special"}>
                <h5>{"🔑 パスワード変更・再設定・復元"}</h5>
                パスワード変更・再設定・復元します。
                <br/>

                <Button size="sm" onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">変更・再設定</Button>

                <Collapse isOpen={this.state.collapse}>
                    <Form>
                        <FormGroup>
                            <Label for="symbol">コミュニティ名</Label>
                            <Input type="text" name="symbol" onChange={this.handleChange} value={this.state.symbol} placeholder="コミュニティ名" />
                        </FormGroup>

                        <FormGroup>
                            <Label for="nftId">トークンID</Label>
                            <Input type="number" name="nftId" onChange={this.handleChange} value={this.state.nftId} placeholder="トークンID" />
                        </FormGroup>

                        <FormGroup>
                            <Label for="passWord">新しいパスワード</Label>
                            <Input type="password" name="passWord" onChange={this.handleChange} value={this.state.passWord} placeholder="新しいパスワード" />
                        </FormGroup>

                        <Button size="sm" onClick={this.refreshKey} disabled={this.state.locked}>
                            <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                            変更
                        </Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

export default Password;
