'use strict'

import React, { Component } from "react";
import { Col, Row, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import "./DexForm.css";
import Buy from "./Buy";
import Sell from "./Sell";
import Order from "./Order";
import "../../style/App.css";
import "../../style/Dark.css";
import "../../style/White.css";
import { THEME } from "../../scripts/Theme";

// LobbyのDexページの売買フォームを担う
class DexForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'buy'
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;
        const appName = this.props.appName;
        return (
            <div id="dex-form" className={(theme === THEME.DARK) ? "dark-mode" : "white-mode"}>
                <Nav tabs>

                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'buy' }) + " text-danger"}
                            onClick={() => { this.toggle('buy'); }}
                        >
                            Buy
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'sell' }) + " text-success"}
                            onClick={() => { this.toggle('sell'); }}
                        >
                            Sell
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'order' })}
                            onClick={() => { this.toggle('order'); }}
                        >
                            Order
                        </NavLink>
                    </NavItem>

                </Nav>

                <TabContent activeTab={this.state.activeTab}>

                    <TabPane tabId="buy">
                        <Row className="p-2">
                            <Col xs="12">
                                <Buy symbol={symbol} appName={appName} />
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tabId="sell">
                        <Row className="p-2">
                            <Col xs="12">
                                <Sell symbol={symbol} appName={appName} />
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tabId="order">
                        <Row className="p-2">
                            <Col xs="12">
                                <Order symbol={symbol} appName={appName} />
                            </Col>
                        </Row>
                    </TabPane>

                </TabContent>
            </div>
        );
    }
}

export default DexForm;