import React, { Component } from "react";
import { Collapse, Col, Button, Form, FormGroup, Label, Input, FormText } from "reactstrap";
import SubSig from "../../scripts/EosSubSig";
import Aws from "../../scripts/Aws";

// プロフィール変更処理
class UpdateProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            locked: false,
            symbol: this.props.symbol,
            nftId: this.props.id,
            iconUrl: "",
            biography: ""
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // アイコン更新する
    async updateProfile() {
        // 連打されないようにロックする
        this.setState({
            locked: true
        });

        const symbol = this.state.symbol;
        const nftId = this.state.nftId; // 変更を要求するトークン
        const iconUrl = this.state.iconUrl;
        const biography = this.state.biography;

        const subsig = new SubSig(symbol); // 必要なインスタンスの生成
        const { privateKey } = subsig.getLocalAuth();
        const signature = SubSig.genSig(privateKey);

        const res = await Aws.uploadProfile(symbol, nftId, signature, iconUrl, biography);

        if (res["ok"] === true) {
            alert("プロフィールを変更しました");
            this.setState({
                collapse: false,
                locked: false,
                symbol: "",
                nftId: 0,
                iconUrl: "",
                biography: ""
            });
        } else {
            this.setState({
                locked: false
            });
            alert("プロフィール変更に失敗しました");
        }
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <h5>プロフィール変更</h5>
                コミュニティのトークン単位でアイコンや自己紹介文などのプロフィールを変更します。
                <br />

                <Button onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">プロフィールを変更する</Button>

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
                            <Label for="iconUrl">アイコンのURL</Label>
                            <Input type="url" name="iconUrl" onChange={this.handleChange} value={this.state.iconUrl} placeholder="URL" />
                            <FormText>
                                プロフィール文のみ変更したい場合はここには何も入れないでください。
                            </FormText>
                        </FormGroup>

                        <FormGroup>
                            <Label for="biography">新しいプロフィール文</Label>
                            <Input type="text" name="biography" onChange={this.handleChange} value={this.state.biography} placeholder="biography" />
                        </FormGroup>

                        <Button onClick={this.updateProfile} disabled={this.state.locked}>更新</Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

export default UpdateProfile;
