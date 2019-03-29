import React, { Component } from "react";
import { Container, Row } from "reactstrap";
import Password from "./Password";
import Transfer from "./Transfer";
import Scatter from "./Scatter";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import { THEME } from "../scripts/Theme";

class Setting extends Component {
    render() {
        const theme = this.props.theme;
        const appName = this.props.appName;
        return (
            <div className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " setting"}>
                <Container className="py-4">
                    <Row>
                        <div>
                            <h2>{"🔧 Setting 🔨"}</h2>
                        </div>

                        <Scatter theme={theme} appName={appName} />

                        <Password theme={theme} appName={appName} />

                        <Transfer theme={theme} appName={appName} />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Setting;