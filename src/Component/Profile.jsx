import React, { Component } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody, Media } from 'reactstrap';
import { isAgent } from "../scripts/Util";

// redux
import { connect } from "react-redux";
import { closeProfile } from "../redux/actions";

class Profile extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.props.dispatch(closeProfile());
    }

    render() {
        const symbol = this.props.profile.symbol;
        const id = this.props.profile.nftId
        const name = isAgent(symbol, this.props.profile.accountName, id);
        return (
            <div>
                <Modal isOpen={this.props.profile.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>{name} さんのプロフィール</ModalHeader>
                    <ModalBody>
                        <Media>
                            <Media left>
                                <Media object src={this.props.profile.iconUrl} alt="icon" className="border chat-icon" />
                            </Media>
                            <Media body>
                                <Row className="pl-3">
                                    <Col xs="12">
                                        所属: {symbol}@{id}
                                    </Col>
                                    <Col xs="12">
                                        {this.props.profile.biography}
                                    </Col>
                                </Row>
                            </Media>
                        </Media>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        profile: state.profile
    };
};

export default connect(mapStateToProps)(Profile);