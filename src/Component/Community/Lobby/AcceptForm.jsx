import React, { Component } from "react";
import { connect } from "react-redux";
import { Form, FormGroup, Label, Input } from "reactstrap";
import scatter from "../../../scripts/Scatter";
import EosSubSig from "../../../scripts/EosSubSig";
import Aws from "../../../scripts/Aws";

// Offerの受け入れを担う
class AcceptForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            offerId: ""
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.accept = this.accept.bind(this);
        this.reject = this.reject.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // オファーを受け入れる
    async accept() {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol;
        const nftId = this.props.nftId;
        const accountName = this.props.accountName;
        const offerId = this.state.offerId;
        const subsig = new EosSubSig(symbol);

        try {
            await scatter.login();

            // ローカルからユーザーの認証情報(IDとSubsig秘密鍵)を取得
            const { id } = subsig.getLocalAuth();

            const actObj = {
                "contractName": code,
                "actionName": "acceptoffer",
                "params": [symbol, id, offerId]
            };
            await scatter.action(actObj);
        }
        catch (error) {
            console.error(error);
            return window.alert("オファーの受け入れに失敗しました。");
        }

        try {
            await Aws.submitChat(symbol, nftId, accountName, "新しいトピックを追加しました [$ contents PCS " + offerId + "]");
        } catch (error) {
            console.error(error);
            return window.alert("オファー受理メッセージの送信に失敗しました。");
        }

        window.alert("オファーの受け入れに成功しました。");
        this.setState({
            collapse: false,
            offerId: ""
        });
    }

    // オファーを却下する
    async reject() {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol;
        const offerId = this.state.offerId;
        const subsig = new EosSubSig(symbol);

        try {
            await scatter.login();

            // ローカルからユーザーの認証情報(IDとSubsig秘密鍵)を取得
            const { id } = subsig.getLocalAuth();

            const actObj = {
                "contractName": code,
                "actionName": "rejectoffer",
                "params": [symbol, id, offerId, ""]
            };
            await scatter.action(actObj);

            window.alert("オファーの却下に成功しました。");
            this.setState({
                collapse: false,
                offerId: ""
            });
        }
        catch (error) {
            console.error(error);
            return window.alert("オファーの却下に失敗しました。");
        }
    }

    handleKeyPress(e) {
        const ENTER = 13;
        switch (e.which) {
            case ENTER:
                e.preventDefault();
                break;
            default:
                break;
        }
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="offerId">オファーID</Label>
                    <Input type="number" name="offerId" onChange={this.handleChange} value={this.state.offerId} placeholder="offerId" onKeyPress={this.handleKeyPress} />
                </FormGroup>

                <button type="button" onClick={this.accept} className="btn-special mx-1">
                    Accept
                </button>

                <button type="button" onClick={this.reject} className="btn-special mx-1">
                    Reject
                </button>
            </Form>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        community: state.community,
        accountName: state.authority.accountName,
        nftId: state.authority.nftId
    };
};

export default connect(mapStateToProps)(AcceptForm);