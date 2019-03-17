import React, { Component } from "react";
import { Col, Button } from "reactstrap";

import { connect } from "react-redux";
import { switchTheme } from "../../redux/actions";

class Theme extends Component {

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <h5>テーマ変更</h5>
                サイトテーマのライトモードとダークモードを切り替えます
                <br />
                <Button onClick={(() => { this.props.dispatch(switchTheme()); })} className="my-2">テーマを変更</Button>
            </Col>
        );
    }
}

export default connect()(Theme);