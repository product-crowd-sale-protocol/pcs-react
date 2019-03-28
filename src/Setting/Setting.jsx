import React, { Component } from "react";
import { Container, Row } from "reactstrap";
import Password from "./Password";
import Transfer from "./Transfer";
import Scatter from "./Scatter";
import "../App.css";
import "../Dark.css";
import "../White.css";

class Setting extends Component {
    render() {

        return (
            <div className="setting">
                <Container className="py-4">
                    <Row>
                        <div>
                            <h2>{"🔧 Setting 🔨"}</h2>
                        </div>

                        <Scatter />

                        <Password />

                        <Transfer />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Setting;