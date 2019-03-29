'use strict'

import React, { Component } from "react";
import ContracedChart from "./ContractedChart";
import "../../style/App.css";
import "../../style/Dark.css";
import "../../style/White.css";

// Chart Component
class Chart extends Component {

    render() {
        const symbol = this.props.symbol;
        const theme = this.props.theme;

        return (
            <React.Fragment>
                <ContracedChart symbol={symbol} theme={theme} />
            </React.Fragment >
        );
    }
}

export default Chart;