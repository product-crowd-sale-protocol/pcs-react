'use strict'

import React, { Component } from "react";
import { Col, Row, Form, FormGroup, Label, Input } from 'reactstrap';
import LineChart from './LineChart';
import { PcsSignature, EOS_NETWORK } from "pcs-js-eos"
import Aws from "../../../../scripts/Aws";
import { THEME } from "../../scripts/Theme";

// Contracted Chart Componet
class ContracedChart extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.network = EOS_NETWORK.kylin.asia;
        this.state = {
            contractedOrderTimeScale: 1440,
            contractedOrderData: null,
            contractedOrderTimeBegin: null,
            contractedOrderTimeEnd: null
        }

        this.handleChange = this.handleChange.bind(this);
        // 約定価格
        this.getContractedOrderChart = this.getContractedOrderChart.bind(this);
        this.updateContractedOrderChart = this.updateContractedOrderChart.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: Number(e.target.value)
        });

        if (e.target.name === "contractedOrderTimeScale") {
            this.getContractedOrderChart();
        }
    }

    async componentDidMount() {
        await this.getContractedOrderChart();

        this.timer = setInterval(() => {
            let now = new Date();
            let minute = now.getMinutes();
            let second = now.getSeconds();

            if ((minute % 5 === 1) && (second === 0)) {
                this.updateContractedOrderChart();
            }
        }, 1000);
    }

    async getContractedOrderChart() {
        // チャートにデータベースから受け取った点を描画する
        const symbol = this.props.symbol;
        const subsig = new PcsSignature(this.network, symbol); // 必要なインスタンスの生成

        const { signature, subkey } = await subsig.getSigAndSubkey();

        const now = (new Date()).getTime();
        const begin = now - this.state.contractedOrderTimeScale * 60 * 1000;
        const end = now;
        const latestData = await Aws.getContractedOrder(symbol, signature, subkey, symbol, null, end);

        this.setState({
            contractedOrderData: latestData,
            contractedOrderTimeBegin: begin,
            contractedOrderTimeEnd: end,
        });
    }

    // 最新のデータをチャートに反映させチャートを動かす
    async updateContractedOrderChart() {
        // 最新のデータを取得
        const symbol = this.props.symbol;
        const subsig = new PcsSignature(this.network, symbol);

        const { signature, subkey } = await subsig.getSigAndSubkey();

        const latestData = await Aws.getContractedOrder(symbol, signature, subkey, symbol, this.state.contractedOrderTimeEnd, null);

        // 現在のチャートデータを取得
        let data = this.state.contractedOrderData;

        try {
            // 最新のデータを追加する
            latestData.concat(data);

            const new_end = (new Date()).getTime();
            const new_begin = new_end - this.state.contractedOrderTimeScale * 60 * 1000;

            // 更新したデータをチャートに反映させる
            this.setState({
                contractedOrderData: data,
                contractedOrderTimeEnd: new_end,
                contractedOrderTimeBegin: new_begin,
            })
        } catch (error) {
            console.error(error);
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const contractedOrderData = this.state.contractedOrderData;
        const contractedOrderTimeRange = [this.state.contractedOrderTimeBegin, this.state.contractedOrderTimeEnd];
        const contractedOrderConfig = {
            data: contractedOrderData,
            position: "right",
            orient: "inward",
            lineColor: "#12bde7",
            lineWidth: 2.5,
            curveCompletion: "curveStepBefore",
        };

        const tick_color = (this.props.theme === THEME.DARK) ? "white" : "black";

        return (
            <Col xs="12" md="6" className="my-2">
                <Row>

                    <Col xs="12">
                        <h5>{"📈 約定価格"}</h5>
                        <Form>
                            <FormGroup>
                                <Label for="contractedOrderTimeScale">チャートの範囲</Label>
                                <Input type="select" name="contractedOrderTimeScale" onChange={this.handleChange} value={this.state.contractedOrderTimeScale}>
                                    <option value={1440}>1日以内</option>
                                    <option value={1440 * 3}>3日以内</option>
                                    <option value={1440 * 7}>1週間以内</option>
                                    <option value={1440 * 14}>2週間以内</option>
                                </Input>
                            </FormGroup>
                        </Form>
                    </Col>

                    {/* 約定価格 */}
                    <Col xs="12" className="line-blue">
                        <LineChart config={[contractedOrderConfig]} timeRange={contractedOrderTimeRange} tickColor={tick_color} />
                    </Col>

                </Row>
            </Col>
        );
    }
}

export default ContracedChart;