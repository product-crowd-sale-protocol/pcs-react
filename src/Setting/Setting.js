import React, { Component } from "react";
import { Container, Col, Row } from "reactstrap";
import Password from "./Password";
import Transfer from "./Transfer";
import "../style/App.css";
import "../style/bootstrap.min.css";

class Setting extends Component {

    constructor(props) {
        super(props);

        this.renderTitle = this.renderTitle.bind(this);
    }

    renderTitle(title) {
        if (title === "NO_TITLE") {
            return (<React.Fragment></React.Fragment>)
        } else {
            return (<h5>{this.props.title}</h5>)
        }
    }

    render() {
        const appName = this.props.appName;
        const network = this.props.network;
        const title = this.props.title;
        return (
            <div className="setting p-2">
                <Container>
                    <Row>
                        <div>
                            {this.renderTitle(title)}
                        </div>

                        <Password appName={appName} network={network} />

                        <Col xs="12" className="my-2"></Col>

                        <Transfer appName={appName} network={network} />
                    </Row>
                </Container>
            </div>
        );
    }
}

Setting.defaultProps = {
    appName: "PCS_APP",
    symbol: "",
    title: "🔧 Setting 🔨"
};

export default Setting;