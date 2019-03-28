'use strict'

import React, { Component } from "react";
import BorderChart from "./BorderChart";
import ContracedChart from "./ContractedChart";

// Chart Component
class Charts extends Component {

    render() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;

        return (
            <React.Fragment>
                <BorderChart symbol={symbol} theme={theme} />

                <ContracedChart symbol={symbol} theme={theme} />
            </React.Fragment >
        );
    }
}

export default Charts;