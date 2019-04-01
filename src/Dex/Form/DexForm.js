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
import "../../style/bootstrap.min.css";
import { THEME } from "../../scripts/Theme";
import { PcsDex, ScatterError } from "pcs-js-eos";

// LobbyのDexページの売買フォームを担う
class DexForm extends Component {

    constructor(props) {
        super(props);

        this.network = this.props.network;
        console.log(this.props.appName);
        this.dex = new PcsDex(this.network, this.props.appName);
        this.state = {
            activeTab: "buy",
            account: ""
        };

        this.toggle = this.toggle.bind(this);
    }

    async toggle(tab) {
        if (this.state.activeTab !== tab) {
            if (tab === "order") {
                try {
                    await this.dex.login();
                    this.setState({
                        activeTab: tab,
                        account: this.dex.account.name
                    });
                } catch (error) {
                    if (error instanceof ScatterError) {
                        if (error.errorType === "connection_fail") {
                            return window.alert("注文一覧を取得するにはScatterが必要です。アンロックされているか確認してください。");
                        } else if ((error.errorType === "identity_not_found") || (error.errorType === "account_not_found")) {
                            return window.alert("注文一覧を取得するにはScatterにアカウントをセットしてください。");
                        }
                        console.error(error);
                        return window.alert("注文一覧を取得するにはScatterが必要です。");
                    }
                    console.error(error);
                    return window.alert("注文一覧を取得するにはScatterが必要です。");
                }
            } else {
                this.setState({
                    activeTab: tab
                });
            }
        }
    }

    render() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;
        const network = this.props.network;
        const appName = this.props.appName;
        const account = this.state.account;
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
                                <Buy symbol={symbol} network={network} appName={appName} />
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tabId="sell">
                        <Row className="p-2">
                            <Col xs="12">
                                <Sell symbol={symbol} network={network} appName={appName} />
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tabId="order">
                        <Row className="p-2">
                            <Col xs="12">
                                <Order symbol={symbol} network={network} appName={appName} accountName={account} />
                            </Col>
                        </Row>
                    </TabPane>

                </TabContent>
            </div>
        );
    }
}

export default DexForm;