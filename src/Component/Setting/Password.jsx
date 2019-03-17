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
        const symbol = this.state.symbol;
        const subsig = new SubSig(symbol);

        // トークンIDを用いてEOSからトークンの所有者及び、subsig公開鍵を取得する
        const nftId = this.state.nftId;
        const { account, subkey } = await subsig.getEOSAuth(nftId);

        const newPassWord = this.state.passWord;
        const { privateKey, publicKey } = await subsig.genKeyPair(nftId, newPassWord);

        // パスワードから生成したsubkeyが一致した場合、つまり正しいパスワードの場合はパスワードを復元する
        if (publicKey === subkey) {
            const authority = {
                id: nftId,
                privateKey: privateKey
            };
            localStorage.setItem(symbol, JSON.stringify(authority));

            this.setState({
                collapse: false,
                symbol: "",
                nftId: "",
                passWord: ""
            });

            this.resetReduxAuthority();

            return window.alert("秘密鍵の復元に成功しました。");
        }

        // 以後はパスワードの再設定

        // Scatterのアカウント名と、トークンのOwnerが一致するかを確認する
        let authority = false;
        try {
            await scatter.login();
            authority = account === scatter.account.name;
        } catch (e) {
            authority = false;
        }

        // 一致するとき、つまりトークンのオーナーであることが確認できた
        if (authority) {
            const code = process.env.REACT_APP_CONTRACT_ACCOUNT;

            try {
                const actObj = {
                    "contractName": code,
                    "actionName": "refleshkey",
                    "params": [symbol, nftId, publicKey]
                };
                await scatter.action(actObj);
                const content = {
                    id: nftId,
                    privateKey: privateKey
                };
                localStorage.setItem(symbol, JSON.stringify(content));
                this.resetReduxAuthority();
                return window.alert("パスワードの変更に成功しました。");
            } catch (error) {
                console.error(error);
                return window.alert(error);
            }
        } else if (account === process.env.REACT_APP_EOS_ACCOUNT) {
            // アカウント名が代理人のアカウント名と等しい時
            try {
                const oldAuthority = subsig.getLocalAuth();
                const message = Math.floor(Number(new Date()) / (24 * 60 * 60 * 1000)).toString();

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

                const content = {
                    id: nftId,
                    privateKey: privateKey
                };
                localStorage.setItem(symbol, JSON.stringify(content));
                this.resetReduxAuthority();
                window.alert("パスワードの変更に成功しました。");
            } catch (error) {
                console.error(error);
                return window.alert("パスワードの変更に失敗しました。");
            }
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

                        <Button onClick={this.refreshKey}>変更</Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

export default connect()(Password);
