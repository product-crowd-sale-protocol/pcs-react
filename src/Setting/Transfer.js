import React, { PureComponent } from "react";
import { Col, Button, Form, FormGroup, Label, Input, Row } from "reactstrap";
import { PcsClient, PcsSignature } from "pcs-js-eos";
import { handleError } from "../scripts/errorHandle";
import { AGENT_NAME } from "../scripts/Config";
import PasswordModal from "./PasswordModal";

class Transfer extends PureComponent {
    constructor(props) {
        super(props);

        this.pcs = new PcsClient(this.props.network, this.props.appName);

        this.state = {
            locked: false,
            symbol: "",
            nftId: "",
            recipient: "",
            loading: "none",
            owner: "",
            agentFlug: false,
            modal: false
        };

        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleModal = this.handleModal.bind(this);
        this.fetchOwner = this.fetchOwner.bind(this);
        this.renderOwner = this.renderOwner.bind(this);
        this.renderBtn = this.renderBtn.bind(this);
        this.transfer = this.transfer.bind(this);
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

    handleModal(action, password) {
        this.setState({
            modal: !this.state.modal
        });
        if (action === "submit") {
            this.transfer(password, null);
        }
    }

    async fetchOwner() {
        if ((this.state.symbol !== "") && (this.state.nftId !== "")) {
            try {
                const res = await this.pcs.fetchTokenInfo(this.state.symbol, this.state.nftId);
                const locked = (this.state.loading === "inline-block") ? true : false;
                const owner = res.owner;
                const agentFlug = (owner === AGENT_NAME);
                this.setState({ locked, owner, agentFlug });
            } catch (error) {
                if (error instanceof ReferenceError) {
                    const locked = true;
                    const owner = "入力されたシンボル・IDに対応するトークンが見つかりません。";
                    const agentFlug = false;
                    this.setState({ locked, owner, agentFlug });
                }
            }
        } else {
            const locked = true;
            const owner = "";
            const agentFlug = false;
            this.setState({ locked, owner, agentFlug });
        }
    }

    // トークンの持ち主が存在するかしないか、代理人であるかによって処理が変わる
    renderOwner() {
        if (this.state.owner === AGENT_NAME) {
            return (
                <React.Fragment>
                    トークンの所有者: 代理人
                </React.Fragment>
            )
        } else if (this.state.owner !== "") {
            return (
                <React.Fragment>
                    トークンの所有者: {this.state.owner}
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment></React.Fragment>
            )
        }
    }

    // トークンの持ち主によってレンダリングするボタンを変えるメソッド
    renderBtn() {
        if (this.state.agentFlug) {
            return (
                <Button size="sm" onClick={(() => {
                    let session = sessionStorage.getItem(this.state.symbol)
                    if (session) {
                        let privateKey = (JSON.parse(session)).privateKey;
                        this.transfer(null, privateKey);
                    } else {
                        this.setState({ modal: true });
                    }
                })} disabled={this.state.locked}>
                    <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                    代理人を用いて送信
                </Button>
            )
        } else {
            return (
                <Button size="sm" onClick={(() => { this.transfer() })} disabled={this.state.locked}>
                    <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                    送信
                </Button>
            )
        }
    }

    // トークン送信する
    async transfer(password = null, privateKey = null) {
        this.lockBtn();

        const symbol = this.state.symbol;
        const nftId = this.state.nftId;
        const recipient = this.state.recipient;

        try {
            if (privateKey) {
                // sessionストレージにprivateキーが残っていた場合
                window.alert("パスワードを変更します。10秒ほど時間がかかります。これを閉じるとスタートしますので、問題がある場合はリロードして下さい。");
                await this.pcs.transferByIdByAgent(privateKey, recipient, symbol, nftId); // 代理人
            } else if (password) {
                const subsig = new PcsSignature(this.props.network, symbol);
                const keyPair = await subsig.genKeyPair(nftId, password);
                window.alert(recipient + "に送信を開始します。10秒ほど時間がかかります。これを閉じるとスタートしますので、問題がある場合はリロードして下さい。");
                await this.pcs.transferByIdByAgent(keyPair.privateKey, recipient, symbol, nftId); // 代理人
            } else {
                await this.pcs.transferById(recipient, symbol, nftId); // Scatter
            }
        } catch (error) {
            this.unlockBtn();
            const msg = handleError(error);
            if (msg) {
                return window.alert(msg);
            } else {
                console.error(error);
                return window.alert("ScatterもしくはEOSの内部エラーにより、トークンの送信に失敗しました。トークンの所有権には問題はありません。");
            }
        }

        this.setState({
            collapse: false,
            locked: false,
            symbol: "",
            nftId: "",
            recipient: "",
            loading: "none",
            owner: "",
            agentFlug: false
        });
        return window.alert("トークンの送信に成功しました。");
    }

    componentDidUpdate() {
        this.fetchOwner();
    }

    render() {
        return (
            <React.Fragment>
                <Form>
                    <Row form className="mb-2">
                        <Col md={6}>
                            <FormGroup>
                                <Label for="symbol">コミュニティ名</Label>
                                <Input type="text" name="symbol" onChange={this.handleChange} value={this.state.symbol} placeholder="コミュニティ名" />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="nftId">トークンID</Label>
                                <Input type="number" name="nftId" onChange={this.handleChange} value={this.state.nftId} placeholder="トークンID" />
                            </FormGroup>
                        </Col>
                        <Col md={12}>
                            {this.renderOwner()}
                        </Col>
                    </Row>

                    <FormGroup>
                        <Label for="recipient">送り先</Label>
                        <Input type="text" name="recipient" onChange={this.handleChange} value={this.state.recipient} placeholder="送信先" />
                    </FormGroup>

                    {this.renderBtn()}
                </Form>

                <PasswordModal modal={this.state.modal} onUpdate={this.handleModal} />
            </React.Fragment>
        );
    }
}

export default Transfer;
