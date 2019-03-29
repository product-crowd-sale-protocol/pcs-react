import React, { Component } from "react";
import { Collapse, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { PcsClient, PcsSignature, EOS_NETWORK } from "../pcs-js-eos/main";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import { THEME } from "../scripts/Theme";
import { AGENT_NAME } from "../scripts/Config";

class Transfer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            locked: false,
            symbol: "",
            nftId: "",
            recipient: "",
            loading: "none"
        };

        this.toggle = this.toggle.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.transfer = this.transfer.bind(this);
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

        let network = EOS_NETWORK.kylin.asia;
        let pcs = new PcsClient(network, this.props.appName);

        const symbol = this.state.symbol;
        const subsig = new PcsSignature(network, symbol); // 必要なインスタンスの生成

        // トークンIDを用いてEOSからトークンの所有者及び、subsig公開鍵を取得する
        const nftId = this.state.nftId;
        const { account } = await subsig.getEOSAuth(nftId);

        try {
            const recipient = this.state.recipient;
            if (account === AGENT_NAME) {
                await pcs.transferById(recipient, symbol, nftId, true);
            } else {
                await pcs.transferById(recipient, symbol, nftId);
            }
            window.alert("トークンの送信に成功しました。");
        }
        catch (error) {
            console.error(error);
            this.unlockBtn();
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

    render() {
        const theme = this.props.theme;
        return (
            <Col xs="12" className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " p-3 mb-3 normal-shadow border-special"}>
                <h5>{"💸 トークン送信"}</h5>
                トークンを送信します。
                <br />

                <Button size="sm" onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">トークンを送信する</Button>

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

export default Transfer;
