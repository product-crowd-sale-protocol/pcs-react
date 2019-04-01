import React, { Component } from "react";
import { Collapse, Col, Row, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { PcsClient, PcsSignature } from "pcs-js-eos";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import "../style/bootstrap.min.css";
import { THEME } from "../scripts/Theme";
import { AGENT_NAME } from "../scripts/Config";

class Transfer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            locked: false,
            symbol: this.props.symbol,
            nftId: "",
            recipient: "",
            loading: "none"
        };

        this.toggle = this.toggle.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.transfer = this.transfer.bind(this);
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

    // トークン送信する
    async transfer() {
        this.lockBtn();
        const network = this.props.network;
        let pcs = new PcsClient(network, this.props.appName);
        const symbol = this.state.symbol;
        const subsig = new PcsSignature(network, symbol);
        const nftId = this.state.nftId;
        const { account } = await subsig.getEOSAuth(nftId);

        let res = false;
        const recipient = this.state.recipient;
        if (account === AGENT_NAME) {
            res = await pcs.transferById(recipient, symbol, nftId, true);
        } else {
            res = await pcs.transferById(recipient, symbol, nftId);
        }
        this.unlockBtn();
        if (res) {
            window.alert("トークンの送信に成功しました。");
        } else {
            return window.alert("ScatterもしくはEOSもしくは代理人サーバーの内部エラーにより、トークンの送信に失敗しました。トークンの所有権には問題はありません。");
        }

        this.setState({
            collapse: false,
            locked: false,
            symbol: "",
            nftId: "",
            recipient: "",
            loading: "none"
        });
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

    render() {
        const theme = this.props.theme;
        return (
            <Col xs="12" className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " p-3 normal-shadow border-special"}>
                <Row>
                    <Col xs="12">{this.props.title}</Col>
                </Row>

                <Button size="sm" onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">トークンを送信する</Button>

                <Collapse isOpen={this.state.collapse}>
                    <Form>
                        {this.renderForm()}

                        <FormGroup>
                            <Label for="nftId">トークンID</Label>
                            <Input type="text" name="nftId" onChange={this.handleChange} value={this.state.nftId} placeholder="トークンID" />
                        </FormGroup>

                        <FormGroup>
                            <Label for="recipient">送り先</Label>
                            <Input type="text" name="recipient" onChange={this.handleChange} value={this.state.recipient} placeholder="送信先" />
                        </FormGroup>

                        <Button size="sm" onClick={this.transfer} disabled={this.state.locked}>
                            <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                            送信
                        </Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

Transfer.defaultProps = {
    theme: THEME.DARK,
    appName: "PCS_APP",
    symbol: "",
    title: "💸 トークン送信"
};

export default Transfer;
