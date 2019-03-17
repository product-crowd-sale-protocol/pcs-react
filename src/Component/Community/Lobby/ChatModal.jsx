import React, { Component } from 'react';
import { Form, Input, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Button } from 'reactstrap';
import { connect } from "react-redux";
import Aws from "../../../scripts/Aws";
import SubSig from "../../../scripts/EosSubSig";

// ユーザー検索用のフォーム
class ChatModal extends Component{

    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            text: ""
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    //stateのmodalのtrue,falseを切り替える
    toggle() {
        this.setState({
            modal: !this.state.modal,
            text: ""
        });
    }

    handleChange(e) {
        this.setState({
            text: e.target.value
        });
    }

    // サーバーにチャットを投稿する
    async submit() {
        // 送信するデータ
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.symbol;
        const subsig = new SubSig(symbol);
        const { id, privateKey } = subsig.getLocalAuth();
        const signature = SubSig.genSig(privateKey);
        const { subkey } = await subsig.getEOSAuth(id);
        const accountName = (this.props.accountName !== code) ? this.props.accountName : (await subsig.getSeller(id));
        const text = this.state.text;

        await Aws.submitChat(signature, subkey, symbol, id, accountName, text);
        this.props.onUpdate();
        this.toggle();
    }

    render() {
        return (
            <React.Fragment>

                <button type="button" onClick={this.toggle} className="btn-special">
                    投稿
                </button>

                {/* メモ: ReactのModalはDOMツリーの階層構造に当てはまらない(参考: https://qiita.com/ayatas/items/05f75cb50dd9f0ffd065)
                    のでclassNameでテーマを再び反映しCSSを用意する必要がある
                 */}
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle} className={(this.props.darkMode ? "bg-dark" : "bg-primary") + " text-white"}>チャットに投稿する</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Input type="textarea" id="text" onChange={this.handleChange} value={this.state.text} placeholder="投稿内容" />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.submit} >投稿</Button>
                        <Button color="secondary" onClick={this.toggle}>キャンセル</Button>
                    </ModalFooter>
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        darkMode: state.darkMode.darkMode,
        symbol: state.authority.symbol,
        nftId: state.authority.nftId,
        accountName: state.authority.accountName
    };
};

export default connect(mapStateToProps)(ChatModal);