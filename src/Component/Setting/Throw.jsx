import React, { Component } from "react";
import { Collapse, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";

// トークンをlocalstorageから捨てる
class Throw extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            symbol: this.props.symbol,
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.throw = this.throw.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    throw() {
        try {
            localStorage.removeItem(this.state.symbol);
            window.alert("トークンを端末から捨てました。")
        } catch (error) {
            console.error(error);
            window.alert("トークンを端末から捨てました。")
        }
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">

                <h5>トークンを捨てる</h5>
                端末上からトークンを捨てます。ブロックチェーンからはトークンが削除されることはありません。
                <br />

                <Button onClick={this.toggle} style={{ marginBottom: '1rem' }} className="my-2">捨てる</Button>

                <Collapse isOpen={this.state.collapse}>
                    <Form>
                        <FormGroup>
                            <Label for="symbol">コミュニティ名</Label>
                            <Input type="text" name="symbol" onChange={this.handleChange} value={this.state.symbol} placeholder="コミュニティ名" />
                        </FormGroup>

                        <Button onClick={this.throw}>捨てる</Button>
                    </Form>
                </Collapse>
            </Col>
        );
    }
}

export default Throw;
