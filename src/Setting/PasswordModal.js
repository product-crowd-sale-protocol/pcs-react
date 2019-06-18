import React, { Component } from 'react';
import { Form, Input, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Button } from 'reactstrap';

// パスワード入力用のモーダル
class PasswordModal extends Component{

    constructor(props) {
        super(props);

        this.state = {
            password: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.toggle = this.toggle.bind(this);
        this.submit = this.submit.bind(this);
    }

    handleChange(e) {
        this.setState({
            password: e.target.value
        });
    }

    toggle() {
        this.props.onUpdate("toggle", "");
        this.setState({ password: "" });
    }

    // 親コンポーネントに入力されたパスワードを渡す
    submit() {
        const password = this.state.password;
        this.props.onUpdate("submit", password);
        this.setState({ password: "" });
    }

    render() {
        return (
            <Modal isOpen={this.props.modal} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle} className="bg-primary text-white">現在のパスワードを入力してください</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Input type="password" id="password" onChange={this.handleChange} value={this.state.password} placeholder="現在のパスワード" />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.submit}>OK</Button>
                    <Button color="secondary" onClick={this.toggle}>キャンセル</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default PasswordModal;