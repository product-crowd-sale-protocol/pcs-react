import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import SubSig from "../../../scripts/EosSubSig";
import Aws from "../../../scripts/Aws";

// redux
import { connect } from "react-redux";
import { setPrice } from "../../../redux/actions";

// icon
import darkModeCoinIcon from "../../../img/coin32white.png";
import whiteModeCoinIcon from "../../../img/coin32blue.png";

class Price extends Component {

    async componentDidMount() {
        const symbol = this.props.community.symbol;
        const subsig = new SubSig(symbol);
        const { signature, subkey } = await subsig.getSigAndSubkey();

        try {
            const eosjpy = this.props.eosjpy;
            let borderEOS = (await Aws.getBorderPrice(symbol, signature, subkey)).y; // トークン価格(EOS建て)のデータを取得
            let borderJPY = borderEOS * eosjpy * 1.15;
            borderEOS = Math.round(borderEOS * 10000) / 10000;
            borderJPY = Math.ceil(borderJPY);

            this.props.dispatch(setPrice("nfteos", borderEOS));
            this.props.dispatch(setPrice("nftjpy", borderJPY));
        } catch (error) {
            console.error(error);
            window.alert("トークン価格の取得に失敗しました。");
        }
    }

    render() {
        return (
            <Col xs="12">
                <Row>

                    <Col xs="12">
                        <img src={this.props.darkMode ? darkModeCoinIcon : whiteModeCoinIcon} alt="coin" className="menu-icon" style={{ display: "inline-block"}} />
                        <h4 style={{ display: "inline-block"}}>{"♢"+this.props.community.symbol}のメンバーシップ価格</h4>
                    </Col>
                    
                    <Col xs="6" className="text-center">
                        <h4>{this.props.nftjpy} JPY</h4>
                    </Col>
                    
                    <Col xs="6" className="text-center">
                        <h4>{this.props.nfteos} EOS</h4>
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
        eosjpy: state.price.eosjpy,
        nfteos: state.price.nfteos,
        nftjpy: state.price.nftjpy
    };
};

export default connect(mapStateToProps)(Price);
