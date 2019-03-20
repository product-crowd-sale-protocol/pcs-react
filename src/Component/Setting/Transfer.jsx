import React, { Component } from "react";
import { Collapse, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import SubSig from "../../scripts/EosSubSig";
import scatter from "../../scripts/Scatter";
import Aws from "../../scripts/Aws";
import ecc from 'eosjs-ecc';

class Transfer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            locked: false,
            symbol: this.props.symbol,
            nftId: this.props.id,
            recipient: ""
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.transfer = this.transfer.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // トークン送信する
    async transfer() {
        // 連打されないようにロックする
        this.setState({
            locked: true
        });

        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.state.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成

        // トークンIDを用いてEOSからトークンの所有者及び、subsig公開鍵を取得する
        const nftId = this.state.nftId;
        const { account } = await subsig.getEOSAuth(nftId);

        let authority = false;
        try {
            await scatter.login();
            authority = account === scatter.account.name; // トークン所有権の確認
        }
        catch (e) {
            authority = false;
        }

        if (authority) {
            const recipient = this.state.recipient;
            
            try {
                const actObj = {
                    "contractName": code,
                    "actionName": "transferbyid",
                    "params": [scatter.account.name, recipient, symbol, nftId, "return token"]
                };
                await scatter.action(actObj);

                window.alert("トークンの送信に成功しました。");
            }
            catch (error) {
                console.error(error);
                this.setState({
                    locked: false
                });
                return window.alert("ScatterもしくはEOSの内部エラーにより、トークンの送信に失敗しました。トークンの所有権には問題はありません。");
            }
        } else if (account === process.env.REACT_APP_EOS_ACCOUNT) {
            // 代理人のトークンを所持しているとき
            const recipient = this.state.recipient;
            
            try {
                const { privateKey } = subsig.getLocalAuth();
                const message = Math.floor(Number(new Date()) / (24 * 60 * 60 * 1000)).toString();
                const signature = ecc.sign(message, privateKey);

                const apiObj = {
                    "AgentEvent":"TRANSFER",
                    "symbolCode":symbol, 
                    "signature":signature, 
                    "tokenId":nftId,
                    "newAddress":recipient,
                    "newSubKey":"null",
                    "newSig":"null"
                };
                // 代理人にTxに署名してもらう
                alert(recipient+"に送信を開始します。10秒ほど時間がかかります。これを閉じるとスタートしますので、問題がある場合はリロードして下さい。");
                const response = await Aws.sendAgentTransaction(apiObj);
                // 署名されたTxをネットワークにブロードキャストする
                await scatter.eosJS.pushTransaction(response.transaction);
                window.alert(`トークンの送信に成功しました`);
            }
            catch (error) {
                console.error(error);
                this.setState({
                    locked: false
                });
                alert("代理人サーバーからトークンの送信が拒絶されました。次に出てくる文字を記録して下さい。");
                return window.alert(error);
            } 

        } else {
            this.setState({
                locked: false
            });
            return window.alert(`トークンの所有者であることが確認できません。\nこのトークンの現在の所有者は ${account} です。`);
        }

        this.setState({
            collapse: false,
            locked: false,
            symbol: "",
            nftId: "",
            recipient: ""
        });
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <h5>トークン送信</h5>
                トークンを送信します。
                <br />

                <Button onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">トークンを送信する</Button>

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

                        <Button onClick={this.transfer} disabled={this.state.locked}>送信</Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

export default Transfer;
