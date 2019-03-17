import React, { Component } from "react";
import { connect } from "react-redux";
import { Col, Collapse, Form, FormGroup, Label, Input, FormText } from "reactstrap";
import scatter, { Scatter } from "../../../scripts/Scatter";

// icon
import darkModeOfferIcon from "../../../img/offer32white.png";
import whiteModeOfferIcon from "../../../img/offer32blue.png";



class OfferForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            collapsePayment: false,
            url: "",
            title: "",
            method: "",
            amount: 0
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.paymentBtn = this.paymentBtn.bind(this);
        this.offerInEOS = this.offerInEOS.bind(this);
    }

    // offerフォームの開閉
    toggle() {
        this.setState({ 
            collapse: !this.state.collapse,
            method: "",
            collapsePayment: false
        });
    }

    // フォーム入力の反映 + クレカ入力モーダルのtoggleボタンの表示
    handleChange(e) {
        if (e.target.name === "method") {
            if (this.state.method !== e.target.value) {
                this.setState({
                    method: e.target.value,
                    collapsePayment: true
                });
            }
        }
        else {
            this.setState({
                [e.target.name]: e.target.value
            });
        }
    }

    // 支払い方法に応じてレンダリングするボタンを変える
    paymentBtn() {
        if (this.state.method === "credit") {
            return (
                <React.Fragment>現在対応していません。</React.Fragment>
                // <OmiseCards symbol={this.props.symbol} jpy={this.state.amount} msg={"Offer"} />
            )
        } else if (this.state.method === "eos") {
            return (
                <button type="button" onClick={this.offerInEOS} className="btn-special">
                    決済
                </button>
            )
        } else {
            return (
                <div>支払い方法を選択してください。</div>
            )
        }
    }

    // EOSでオファーの申請の決済
    async offerInEOS() {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol;
        const url_without_protocol = (this.state.url).replace(/^http(s)?:\/\/|\/$/g, "");
        const short_title = this.state.title;

        if (code === "") {
            window.alert("コントラクトアカウントが指定されていません。この問題は Ryodanship 運営チームに報告してください。");
            return false;
        }

        if (url_without_protocol === "") {
            window.alert("オファーしたい URL が書かれていないか、正しく書かれていません。");
            return false;
        }

        if (short_title === "") {
            window.alert("表示タイトルが書かれていません。ここに書かれたものは、トピック一覧に表示するとき使われます。");
            return false;
        }

        if (short_title.length > 32) {
            window.alert("表示タイトルが長過ぎます。短いタイトルをつけてください。");
            return false;
        }

        if (this.state.amount === "") {
            window.alert("オファー額が書かれていません");
            return false;
        }

        if (Number.isNaN(Number(this.state.amount))) {
            window.alert("オファー額に数字以外の文字が含まれている可能性があります。");
            return false;
        }

        const offer_amount = Math.floor(Number(this.state.amount) * 10000) / 10000;

        if (offer_amount === 0) {
            window.alert("オファー額が 0 EOS になっています。オファー額を EOS で指定する場合、小数点以下第5位以下は切り捨てられることに注意してください。");
            return false;
        }

        try {
            await scatter.login();
        } catch (error) {
            window.alert("Scatter との連携に失敗しました。Scatter により署名を行うので、EOS アカウントのキーペアが登録されていない場合、この機能は利用することができません。");
            return false;
        }

        try {
            const provider = scatter.account.name;
            const offer_price = Scatter.numToAsset(offer_amount);
            // this transaction include 2 actions and has linearizability.
            const transferEOSActionObj = {
                contractName : "eosio.token",
                actionName : "transfer",
                params: [provider, code, offer_price, "transfer EOS to set new offer"]
            };
        
            const setOfferActionObj = {
                contractName: code,
                actionName: "setoffer",
                params: [provider, symbol, url_without_protocol, short_title, offer_price, "set new offer"]
            };
        
            // send transaction
            // If any action fails, all other actions also fail.
            await scatter.transaction(transferEOSActionObj, setOfferActionObj);
        } catch (error) {
            console.error(error);
            window.alert("offer 申請を中断しました。");
            return false;
        }


        window.alert("offer申請が完了しました。");

        this.setState({
            collapse: false,
            collapsePayment: false,
            url: "",
            title: "",
            method: "",
            amount: 0
        });

        return true;
    }

    render() {
        // const payment_step = (this.state.method === "eos") ? "0.0001" : "1";
        // const payment_amount = (this.state.method === "eos")
        //     ? Math.floor(this.state.amount * 10000) / 10000
        //     : Math.floor(this.state.amount);
        const payment_step = 1;
        const payment_amount = this.state.amount;
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <div className="clearfix">
                    <h3 className="float-left"><img src={this.props.darkMode ? darkModeOfferIcon : whiteModeOfferIcon} alt="offer" className="menu-icon" /> ロビーにポスト</h3>

                    <button type="button" onClick={this.toggle} className="float-right btn-special">
                        彡POST
                    </button>
                </div>

                <Collapse isOpen={this.state.collapse}>
                    <Form>
                        <FormGroup>
                            <Label for="url">紹介記事URL</Label>
                            <Input type="url" name="url" onChange={this.handleChange} value={this.state.url} placeholder="URL" />
                        </FormGroup>

                        <FormGroup>
                            <Label for="title">表示タイトル（他のタイトルと被ってはいけません）</Label>
                            <Input type="title" name="title" onChange={this.handleChange} value={this.state.title} placeholder="タイトル" />
                        </FormGroup>

                        <FormGroup tag="fieldset">
                            支払い方法
                            {/* {<FormGroup check>
                                <Label check>
                                    <Input type="radio" name="method" value="credit" onChange={this.handleChange} />{' '}
                                    クレジットカード
                                </Label>
                            </FormGroup>} */}
                            <FormGroup check>
                                <Label check>
                                    <Input type="radio" name="method" value="eos" onChange={this.handleChange} />{' '}
                                    EOS
                                </Label>
                            </FormGroup>
                        </FormGroup>

                        <FormGroup>
                            <Label for="amount">オファー額</Label>
                            <Input type="number" name="amount" onChange={this.handleChange} value={payment_amount} step={payment_step} placeholder="オファー額" />
                            <FormText color="muted">
                                {/*"クレジットカードを選択した場合は日本円単位に、EOSを選択した場合はEOS単位になります。"*/}
                                {"EOS 単位で指定してください。"}
                            </FormText>
                        </FormGroup>

                        <Collapse isOpen={this.state.collapsePayment}>
                            {this.paymentBtn()}
                        </Collapse>

                    </Form>
                </Collapse>
            </Col>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        darkMode: state.darkMode.darkMode,
        community: state.community
    };
};

export default connect(mapStateToProps)(OfferForm);
