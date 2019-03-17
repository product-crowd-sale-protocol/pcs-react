import React, { Component } from 'react';
import { Link } from "react-router-dom";
import "./Header.css";
import { connect } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import { switchCommunityContents } from "../../redux/actions"

import home from "../../img/home.png";
import lobby from "../../img/chat.png";
import graph from "../../img/graph.png";

class Header extends Component {

    constructor(props) {
        super(props);
        this.switchHeader = this.switchHeader.bind(this);
        this.switchLobby = this.switchLobby.bind(this);
        this.switchDex = this.switchDex.bind(this);
    }

    // Redux関数
    switchLobby() {
        this.props.dispatch(switchCommunityContents("lobby"));
    }
    // Redux関数
    switchDex() {
        this.props.dispatch(switchCommunityContents("dex"));
    }

    // ロビー内にいるときと、そうでないときでヘッダーで表示する内容を入れ替えるための関数
    switchHeader(bool) {
        if (bool) {
            // ロビー内にいるとき
            return (
                <Row className="justify-content-between">
                    <Col xs="4" tag={Link} to="/" style={{ textDecoration: 'none' }} className="special-color"><input id="home-icon" type="image" src={home} alt="home" /></Col>
                    <Col xs="4" className="special-color" onClick={this.switchLobby}><input id="chat-icon" type="image" src={lobby} alt="lobby" /></Col>
                    <Col xs="4" className="special-color" onClick={this.switchDex}><input id="graph-icon" type="image" src={graph} alt="graph" /></Col>
                </Row>
            );
        } else {
            // ロビー外つまりエントランスにするとき
            return (
                <Row>
                    <Col xs="12">
                        <Link to="/" style={{ textDecoration: 'none' }} className="special-color">Ryodan</Link>
                    </Col>
                </Row>
            );
        }
    }

    render() {
        const inCommunity = (this.props.symbol !== "") ? true : false;
        return (
            <div className="header">
                <Container>
                    {this.switchHeader((inCommunity))}
                </Container>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        symbol: state.community.symbol
    };
};

export default connect(mapStateToProps)(Header);
