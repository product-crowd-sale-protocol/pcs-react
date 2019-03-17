import React, { Component } from "react";
import { connect } from "react-redux";
import { Col, Collapse } from "reactstrap";
import OfferList from "./OfferList";
import AcceptForm from "./AcceptForm";

// icon
import darkModeAcceptIcon from "../../../img/accept32white.png";
import whiteModeAcceptIcon from "../../../img/accept32blue.png";

class Accept extends Component {

    constructor(props) {
        super(props);

        this.state = {
            collapse: false
        }

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <div className="clearfix">
                    <h3 className="float-left"><img src={this.props.darkMode ? darkModeAcceptIcon : whiteModeAcceptIcon} alt="accept" className="menu-icon" />  待機中のポスト</h3>
                    <button type="button" onClick={this.toggle} className="float-right btn-special">
                        Accept
                    </button>
                </div>

                <Collapse isOpen={this.state.collapse}>
                    <div className="my-3">
                        <OfferList />
                    </div>

                    <div className="my-2">
                        <AcceptForm />
                    </div>
                </Collapse>
            </Col>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        darkMode: state.darkMode.darkMode
    };
};

export default connect(mapStateToProps)(Accept);
