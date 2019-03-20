import React, { Component } from "react";
import { Collapse, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import SubSig from "../../scripts/EosSubSig";
import scatter from "../../scripts/Scatter";
import Aws from "../../scripts/Aws";
import ecc from 'eosjs-ecc';
// redux
import { connect } from "react-redux";
import { setAuthority } from "../../redux/actions";

class Password extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            collapse: false,
            locked: false,
            symbol: this.props.symbol,
            nftId: this.props.id,
            passWord: ""
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refreshKey = this.refreshKey.bind(this);
        this.resetReduxAuthority = this.resetReduxAuthority.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // パスワードを変更する
    async refreshKey() {
        
        // 連打されないようにロックする
        this.setState({
            locked: true
        });

        const symbol = this.state.symbol;
        const subsig = new SubSig(symbol);
        const newPassWord = this.state.passWord;

        // トークンIDを用いてEOSからトークンの所有者及び、subsig公開鍵を取得する
        const nftId = this.state.nftId;
        const { account, subkey } = await subsig.getEOSAuth(nftId);
        // またパスワードとIDから新しいキーペアを作成
        const { privateKey, publicKey } = await subsig.genKeyPair(nftId, newPassWord);

        // パスワードから生成したsubkeyが一致した場合、つまり正しいパスワードの場合はパスワードを復元する
        if (publicKey === subkey) {
            subsig.setLocalAuth(nftId, privateKey); // ローカルストレージに保存

            this.setState({
                collapse: false,
                locked: false,
                symbol: "",
                nftId: "",
                passWord: ""
            });
            this.resetReduxAuthority();

            return window.alert("秘密鍵の復元に成功しました。");
        }

        // Scatterのアカウント名と、トークンのOwnerが一致するかを確認する
        let authority = false;
        try {
            await scatter.login();
            authority = account === scatter.account.name;
        } catch (e) {
            // Scatterのログインに失敗
            authority = false;
        }

        try {
            if (authority) {
                // ユーザーのScatterでrefreshKeyを起こす
                const actObj = {
                    "contractName": process.env.REACT_APP_CONTRACT_ACCOUNT,
                    "actionName": "refleshkey",
                    "params": [symbol, nftId, publicKey]
                };
                await scatter.action(actObj);

                // 成功
                subsig.setLocalAuth(nftId, privateKey);
                this.resetReduxAuthority();
                this.setState({
                    collapse: false,
                    locked: false,
                    symbol: "",
                    nftId: "",
                    passWord: ""
                });
                return window.alert("パスワードの変更に成功しました。");

            } else if (account === process.env.REACT_APP_EOS_ACCOUNT) {
                // 代理人を通してEOSのrefreshKeyを起こす
                const oldAuthority = subsig.getLocalAuth();
                const message = SubSig.getSubSigMessage();

                // デジタル署名
                const old_signature = ecc.sign(message, oldAuthority.privateKey);
                const new_signature = ecc.sign(message, privateKey);

                const apiObj = {
                    "AgentEvent": "REFRESH",
                    "symbolCode": symbol,
                    "signature": old_signature,
                    "tokenId": nftId,
                    "newAddress": "null",
                    "newSubKey": publicKey,
                    "newSig": new_signature
                };

                const response = await Aws.sendAgentTransaction(apiObj);
                await scatter.eosJS.pushTransaction(response.transaction);
                
                // 成功
                subsig.setLocalAuth(nftId, privateKey);
                this.resetReduxAuthority();
                this.setState({
                    collapse: false,
                    locked: false,
                    symbol: "",
                    nftId: "",
                    passWord: ""
                });
                return window.alert("パスワードの変更に成功しました。");

            } else {
                this.setState({
                    locked: false
                });
                return window.alert("トークンの所有権が確認できません。");
            }
        } catch (error) {
            console.error(error);
            this.setState({
                locked: false
            });
            return window.alert("パスワードの変更に失敗しました。");
        }
    }

    // 前の認証情報を消すためreduxの認証情報を初期化する
    resetReduxAuthority() {
        const authority = {
            symbol: null,
            nftId: null,
            accountName: null,
            isManager: false
        }
        this.props.dispatch(setAuthority(authority));
    }


    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <h5>パスワード変更・再設定・復元</h5>
                パスワード変更・再設定・復元します。
                <br/>

                <Button onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">変更・再設定</Button>

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

                        <Button onClick={this.refreshKey} disabled={this.state.locked}>変更</Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

export default connect()(Password);
