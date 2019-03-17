import React, { Component } from "react";
import { Col, Button } from "reactstrap";

// コントラクトの確認
class Contract extends Component {

    constructor(props) {
        super(props);

        this.visitExplorer = this.visitExplorer.bind(this);
    }

    visitExplorer() {
        const url = "https://kylin.eosx.io/account/" + process.env.REACT_APP_CONTRACT_ACCOUNT;
        window.open(url, "_blank");
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <h5>コントラクトの確認</h5>
                ブロックチェーンエクスプローラーを用いたコントラクトの確認を行います。
                <br/>
                <Button onClick={this.visitExplorer} className="my-2">確認する</Button>
            </Col>
        );
    }
}

export default Contract;