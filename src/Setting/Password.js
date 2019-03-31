import React, { Component } from "react";
import { Collapse, Col, Row, Button, Form, FormGroup, Label, Input } from "reactstrap";
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
            symbol: this.props.symbol,
            nftId: "",
            passWord: "",
            loading: "none"
        };

        this.toggle = this.toggle.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refreshKey = this.refreshKey.bind(this);
        this.renderForm = this.renderForm.bind(this);
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

    renderForm() {
        if (this.props.symbol === "") {
            return (
                <FormGroup>
                    <Label for="symbol">コミュニティ名</Label>
                    <Input type="text" name="symbol" onChange={this.handleChange} value={this.state.symbol} placeholder="コミュニティ名" />
                </FormGroup>
            )
        } else {
            return (
                <React.Fragment></React.Fragment>
            )
        }
    }

    renderCollapse() {
        const formTitle1 = this.props.formTitle1;
        const formTitle2 = this.props.formTitle2;
        const btnText = this.props.btnText;
        if (this.props.useCollapse) {
            return (
                <React.Fragment>
                    <Button size="sm" onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">{this.props.collapseBtnText}</Button>
                    <Collapse isOpen={this.state.collapse}>
                        <Form>
                            {this.renderForm()}

                            <FormGroup>
                                <Label for="nftId">{formTitle1}</Label>
                                <Input type="number" name="nftId" onChange={this.handleChange} value={this.state.nftId} placeholder={formTitle1} />
                            </FormGroup>

                            <FormGroup>
                                <Label for="passWord">{formTitle2}</Label>
                                <Input type="password" name="passWord" onChange={this.handleChange} value={this.state.passWord} placeholder={formTitle2} />
                            </FormGroup>

                            <Button size="sm" onClick={this.refreshKey} disabled={this.state.locked}>
                                <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                                {btnText}
                        </Button>
                        </Form>
                    </Collapse>
                </React.Fragment>
            )
        } else {
            return (
                <Form>
                    {this.renderForm()}

                    <FormGroup>
                        <Label for="nftId">{formTitle1}</Label>
                        <Input type="number" name="nftId" onChange={this.handleChange} value={this.state.nftId} placeholder={formTitle1} />
                    </FormGroup>

                    <FormGroup>
                        <Label for="passWord">{formTitle2}</Label>
                        <Input type="password" name="passWord" onChange={this.handleChange} value={this.state.passWord} placeholder={formTitle2} />
                    </FormGroup>

                    <Button size="sm" onClick={this.refreshKey} disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        {btnText}
                        </Button>
                </Form>
            )
        }
    }


    render() {
        const theme = this.props.theme;
        return (
            <Col xs="12" className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " p-3 normal-shadow border-special"}>
                <Row>
                    <Col xs="12">{this.props.title}</Col>
                </Row>

                {this.renderCollapse()}
            </Col>
        );
    }
}

Password.defaultProps = {
    theme: THEME.DARK,
    appName: "PCS_APP",
    symbol: "",
    title: "🔑 パスワード変更・再設定・復元",
    formTitle1: "トークンID",
    formTitle2: "新しいパスワード",
    btnText: "変更",
    useCollapse: false,
    collapseBtnText: "変更・再設定"
};

export default Password;
