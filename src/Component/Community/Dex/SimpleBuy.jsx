// Scatterを持っていない人が代理人からNFTを購入するためのもの
import React, { Component } from "react";
import { connect } from "react-redux";
import { Col, Row, Button } from 'reactstrap';

class SimpleBuy extends Component {

    render() {
        return (
            <Col xs="12" className="my-2">
                <Row>
                    <Col xs="12"><h5>トークン購入</h5></Col>
                    <Col xs="12">
                        <p>トークンを購入します。現在の価格は {this.props.nftjpy} 円です。</p>
                        <Button color="success">購入</Button>
                    </Col>
                </Row>
            </Col>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        darkMode: state.darkMode.darkMode,
        community: state.community,
        nftjpy: state.price.nftjpy
    };
};

export default connect(mapStateToProps)(SimpleBuy);
