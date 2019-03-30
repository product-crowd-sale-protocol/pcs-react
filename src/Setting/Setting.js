import React, { Component } from "react";
import { Container, Col, Row } from "reactstrap";
import Password from "./Password";
import Transfer from "./Transfer";
import Scatter from "./Scatter";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import "../style/bootstrap.min.css";
import { THEME } from "../scripts/Theme";

class Setting extends Component {
    render() {
        const theme = this.props.theme;
        const appName = this.props.appName;
        const network = this.props.network;
        return (
            <div className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " setting"}>
                <Container className="py-4">
                    <Row>
                        <div>
                            <h2>{"🔧 Setting 🔨"}</h2>
                        </div>

                        <Scatter theme={theme} appName={appName} network={network} />

                        <Col xs="12" className="my-2"></Col>

                        <Password theme={theme} appName={appName} network={network} />

                        <Col xs="12" className="my-2"></Col>

                        <Transfer theme={theme} appName={appName} network={network} />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Setting;