'use strict'

import React, { Component } from "react";
import ContracedChart from "./ContractedChart";
import "../../style/App.css";
import "../../style/bootstrap.min.css";

// Chart Component
class Chart extends Component {

    render() {
        const symbol = this.props.symbol;
        const network = this.props.network;

        return (
            <React.Fragment>
                <ContracedChart symbol={symbol} network={network} />
            </React.Fragment >
        );
    }
}

export default Chart;