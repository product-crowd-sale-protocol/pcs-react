import React, { Component } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import "./Share.css";
// redux
import { connect } from "react-redux";
import { closeShare } from "../../../redux/actions";
// ClipBoard
import { CopyToClipboard } from 'react-copy-to-clipboard';

class Share extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.props.dispatch(closeShare());
    }

    copyAlert() {
        window.alert("クリップボードにコピーしました");
    }

    openTweetWindow(url, title) {
        const intro = encodeURIComponent(url + "&community=" + this.props.symbol + "&tokenId=" + this.props.nftId);
        const tweet = "https://twitter.com/intent/tweet?text="+ title + " \n" + intro;
        return window.open(tweet, "_blank");
    }

    render() {
        return (
            <div>
                <Modal isOpen={this.props.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Share</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs="12">
                                <CopyToClipboard text={this.props.url + "&community=" + this.props.symbol + "&tokenId=" + this.props.nftId} onCopy={this.copyAlert}>
                                    <button className="btn-special my-2">Copy</button>
                                </CopyToClipboard>
                            </Col>
                            <Col xs="12">
                                <button className="my-2" onClick={this.openTweetWindow.bind(this, this.props.url, this.props.title)}>
                                    Twitterで共有
                                </button>
                            </Col>
                        </Row>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        modal: state.share.modal,
        url: state.share.url,
        title: state.share.title,
        symbol: state.authority.symbol,
        nftId: state.authority.nftId
    };
};

export default connect(mapStateToProps)(Share);