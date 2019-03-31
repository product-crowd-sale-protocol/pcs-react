import React, { Component } from "react";
import { Container, Col, Row } from "reactstrap";
import Password from "./Password";
import Transfer from "./Transfer";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import "../style/bootstrap.min.css";
import { THEME } from "../scripts/Theme";

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
        const theme = this.props.theme;
        const appName = this.props.appName;
        const symbol = this.props.symbol;
        const network = this.props.network;
        const title = this.props.title;
        return (
            <div className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " setting p-2"}>
                <Container>
                    <Row>
                        <div>
                            {this.renderTitle(title)}
                        </div>

                        <Password theme={theme} appName={appName} symbol={symbol} network={network} />

                        <Col xs="12" className="my-2"></Col>

                        <Transfer theme={theme} appName={appName} symbol={symbol} network={network} />
                    </Row>
                </Container>
            </div>
        );
    }
}

Setting.defaultProps = {
    theme: THEME.DARK,
    appName: "PCS_APP",
    symbol: "",
    title: "🔧 Setting 🔨"
};

export default Setting;