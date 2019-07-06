'use strict'

import React, { Component } from "react";
import { Col, Row, Form, FormGroup, Input } from 'reactstrap';
import LineChart from './LineChart';
import { PcsSignature } from "pcs-js-eos"
import Aws from "../../scripts/Aws";

// Contracted Chart Componet
class ContracedChart extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
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
        const targetName = e.target.name;
        this.setState({
            [targetName]: Number(e.target.value)
        }, () => {
            if (targetName === "contractedOrderTimeScale") {
                this.getContractedOrderChart();
            }
        });
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
        const subsig = new PcsSignature(this.props.network, symbol); // 必要なインスタンスの生成
        const { id, signature } = subsig.getLocalAuth();

        const now = (new Date()).getTime();
        const begin = now - this.state.contractedOrderTimeScale * 60 * 1000;
        const end = now;
        const latestData = await Aws.getContractedOrder(symbol, signature, id, symbol, null, end, this.props.network);

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
        const subsig = new PcsSignature(this.props.network, symbol);

        const { id, signature } = subsig.getLocalAuth();
        const latestData = await Aws.getContractedOrder(symbol, signature, id, symbol, this.state.contractedOrderTimeEnd, null, this.props.network);

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

        return (
            <Col xs="12" className={"my-2"}>
                <Row>

                    <Col xs="12">{"📈 約定価格"}</Col>

                    <Col xs="12">
                        <Form>
                            <FormGroup>
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
                        <LineChart config={[contractedOrderConfig]} timeRange={contractedOrderTimeRange} />
                    </Col>

                </Row>
            </Col>
        );
    }
}

export default ContracedChart;