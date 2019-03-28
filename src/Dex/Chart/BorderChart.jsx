'use strict'

import React, { Component } from "react";
import { Col, Row, Form, FormGroup, Label, Input } from 'reactstrap';
import LineChart from './LineChart';
import { PcsSignature, EOS_NETWORK } from "pcs-js-eos";
import Aws from "../../scripts/Aws";
import { THEME } from "../../scripts/Theme";

// ボーダー
class BorderChart extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.network = EOS_NETWORK.kylin.asia;
        this.state = {
            timeScale: 180,
            borderData: null,
            borderTimeBegin: null,
            borderTimeEnd: null
        }

        this.handleChange = this.handleChange.bind(this);
        // ボーダー価格
        this.getBorderChart = this.getBorderChart.bind(this);
        this.updateBorderChart = this.updateBorderChart.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: Number(e.target.value)
        });

        if (e.target.name === "timeScale") {
            this.getBorderChart();
        }
    }

    async componentDidMount() {
        await this.getBorderChart();

        this.timer = setInterval(() => {
            let now = new Date();
            let minute = now.getMinutes();
            let second = now.getSeconds();

            if ((minute % 5 === 1) && (second === 0)) {
                this.updateBorderChart();
            }
        }, 1000);
    }

    async getBorderChart() {
        // チャートにデータベースから受け取った点を描画する
        const symbol = this.props.symbol;
        const subsig = new PcsSignature(this.network, symbol);

        const { signature, subkey } = await subsig.getSigAndSubkey();

        const end = (new Date()).getTime();
        const begin = end - this.state.timeScale * 60 * 1000;
        const rows = this.state.timeScale / Number((process.env.REACT_APP_CHART_INTERVAL));
        const data = await Aws.getBorderChart(symbol, signature, subkey, rows); // AWS上にあるPVなどで補正したボーダー価格
        this.setState({
            borderData: data,
            borderTimeBegin: begin,
            borderTimeEnd: end,
        });
    }

    // 最新のデータをチャートに反映させチャートを動かす
    async updateBorderChart() {
        // 最新のデータを取得
        const symbol = this.props.symbol;
        const subsig = new PcsSignature(this.network, symbol); // 必要なインスタンスの生成

        const { signature, subkey } = await subsig.getSigAndSubkey();

        const latestData = await Aws.getBorderPrice(symbol, signature, subkey);

        // 現在のチャートデータを取得
        let data = this.state.borderData;

        try {
            // 最新のデータを追加する
            latestData.concat(data);

            const end = (new Date()).getTime();
            const begin = end - this.state.timeScale * 60 * 1000;

            // 更新したデータをチャートに反映させる
            this.setState({
                borderData: data,
                borderTimeEnd: end,
                borderTimeBegin: begin
            })
        } catch (error) {
            console.error(error);
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const borderData = this.state.borderData;
        const borderTimeRange = [this.state.borderTimeBegin, this.state.borderTimeEnd];
        const borderConfig = {
            data: borderData,
            position: "left",
            orient: "inward",
            lineColor: "#e96553",
            lineWidth: 2.5,
            curveCompletion: "curveMonotoneX",
        };

        const tick_color = (this.props.theme === THEME.DARK) ? "white" : "black";

        return (
            <Col xs="12" md="6" className="my-2">
                <Row>

                    <Col xs="12">
                        <h5>{"📈 ボーダー価格"}</h5>
                        <Form>
                            <FormGroup>
                                <Label for="timeScale">チャートの範囲</Label>
                                <Input type="select" name="timeScale" onChange={this.handleChange} value={this.state.timeScale}>
                                    <option value={180}>3時間</option>
                                    <option value={360}>6時間</option>
                                    <option value={720}>12時間</option>
                                    <option value={1440}>24時間</option>
                                </Input>
                            </FormGroup>
                        </Form>
                    </Col>

                    {/* ボーダー価格 */}
                    <Col xs="12" className="line-red">
                        <LineChart config={[borderConfig]} timeRange={borderTimeRange} tickColor={tick_color} />
                    </Col>
                </Row>
            </Col>
        );
    }
}

export default BorderChart;