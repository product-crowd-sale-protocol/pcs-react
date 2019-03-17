import React, { Component } from "react";
import { connect } from "react-redux";
import SubSig from "../../../scripts/EosSubSig";
import Aws from "../../../scripts/Aws";
import { getTable } from "../../../scripts/EosHttpApi";
import LineChart from './LineChart';
import Board from "./DexBoard";
import DexForm from "./DexForm";
import History from "../../History";
import Price from "./Price";

import { Col, Row, Form, FormGroup, Label, Input } from "reactstrap";

// LobbyのDexとPV部分を担うコンポーネント
class Dex extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.state = {
            timeScale: 180,
            borderData: null,
            borderTimeBegin: null,
            borderTimeEnd: null,
            contractedOrderTimeScale: 1440,
            contractedOrderData: null,
            contractedOrderTimeBegin: null,
            contractedOrderTimeEnd: null,
            agreedTimeScale: 1440,
            agreedData: null,
            agreedTimeBegin: null,
            agreedTimeEnd: null,
        }

        this.handleChange = this.handleChange.bind(this);
        // ボーダー価格
        this.getBorderChart = this.getBorderChart.bind(this);
        this.updateBorderChart = this.updateBorderChart.bind(this);
        // 約定価格
        this.getContractedOrderChart = this.getContractedOrderChart.bind(this);
        this.updateContractedOrderChart = this.updateContractedOrderChart.bind(this);
        // offer 取引価格
        this.getAgreedChart = this.getAgreedChart.bind(this);
        this.updateAgreedChart = this.updateAgreedChart.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: Number(e.target.value)
        });

        if (e.target.name === "timeScale") {
            this.getBorderChart();
        } else if (e.target.name === "contractedOrderTimeScale") {
            this.getContractedOrderChart();
        }
    }

    async componentDidMount() {
        await this.getBorderChart();
        await this.getContractedOrderChart();

        this.timer = setInterval(() => {
            let now = new Date();
            let minute = now.getMinutes();
            let second = now.getSeconds();

            if ((minute % 5 === 1) && (second === 0)) {
                this.updateBorderChart();
                this.updateContractedOrderChart();
            }
        }, 1000);
    }

    async getBorderChart() {
        // チャートにデータベースから受け取った点を描画する
        const symbol = this.props.community.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成

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
        const symbol = this.props.community.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成

        const { signature, subkey } = await subsig.getSigAndSubkey();

        const latestData = await Aws.getBorderPrice(symbol, signature, subkey);

        // 現在のチャートデータを取得
        let data = this.state.borderData;

        try {
            // 一番古いデータを削除する
            // data.pop();

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

    async getContractedOrderChart() {
        // チャートにデータベースから受け取った点を描画する
        const symbol = this.props.community.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成

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
        const symbol = this.props.community.symbol;
        const subsig = new SubSig(symbol);

        const { signature, subkey } = await subsig.getSigAndSubkey();

        const latestData = await Aws.getContractedOrder(symbol, signature, subkey, symbol, this.state.contractedOrderTimeEnd, null);
        console.log(latestData);

        // 現在のチャートデータを取得
        let data = this.state.contractedOrderData;

        try {
            // 一番古いデータを削除する
            // data.pop();

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

    async getAgreedChart() {
        // 今の時間からチャートの時間スケール分の時間を引いたタイムスタンプ
        const symbol = this.props.community.symbol;
        const end = (new Date()).getTime();
        const begin = end - this.state.agreedTimeScale * 60 * 1000;

        // そのタイムスタンプ以後のコンテンツを取得
        const query = {
            "scope": symbol,
            "code": process.env.REACT_APP_CONTRACT_ACCOUNT,
            "table": "contents",
            "index_position": 5,
            "key_type": "i64",
            "lower_bound": begin * 1000
        }
        const contents = (await getTable(query)).rows.reverse();
        
        const data = contents.map((content) => { return ({ "x": new Date(Number(content.accepted) / 1000), "y": Number(content.price.replace(/EOS/g, ""))}) });

        this.setState({
            agreedData: data,
            agreedTimeBegin: begin,
            agreedTimeEnd: end,
        });
    }

    async updateAgreedChart() {
        // 今の時間からチャート更新間隔を抜いた時間
        const symbol = this.props.community.symbol;
        const end = (new Date()).getTime();
        const begin = end - this.state.agreedTimeScale * 60 * 1000;
        const timestamp = (end - Number(process.env.REACT_APP_CHART_INTERVAL) * 60 * 1000) * 1000;
        
        // そのタイムスタンプ以後のコンテンツを取得
        const query = {
            "scope": symbol,
            "code": process.env.REACT_APP_CONTRACT_ACCOUNT,
            "table": "contents",
            "index_position": 5,
            "key_type": "i64",
            "lower_bound": timestamp
        };
        const contents = (await getTable(query)).rows.reverse();

        const agreedData = contents.map((content) => { return ({ "x": new Date(Number(content.accepted) / 1000), "y": Number(content.price.replace(/EOS/g, "")) }) });
        this.setState({
            agreedData: [this.state.agreedData.concat(agreedData)],
            agreedTimeBegin: begin,
            agreedTimeEnd: end,
        });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const symbol = this.props.community.symbol;
        const borderData = this.state.borderData;
        const borderTimeRange = [this.state.borderTimeBegin, this.state.borderTimeEnd];
        const contractedOrderData = this.state.contractedOrderData;
        const contractedOrderTimeRange = [this.state.contractedOrderTimeBegin, this.state.contractedOrderTimeEnd];
        const borderConfig = {
            data: borderData,
            position: "left",
            orient: "inward",
            lineColor: "#e96553",
            lineWidth: 2.5,
            curveCompletion: "curveMonotoneX",
        };
        const contractedOrderConfig = {
            data: contractedOrderData,
            position: "right",
            orient: "inward",
            lineColor: "#12bde7",
            lineWidth: 2.5,
            curveCompletion: "curveStepBefore",
        };

        const tick_color = (this.props.darkMode) ? "white" : "black";

        return (
            <React.Fragment>
                <h2>{"メンバーシップ取引所"}</h2>

                <Col xs="12" className="py-3 my-2 border-special">
                    <History symbol={symbol} action="DEX" seconds={3600} descripton={"♢"+symbol+"のチャートを見ていた人"}  />
                </Col>

                <Col xs="12" id="dex" className="py-3 mt-1 border-special normal-shadow">
                    {/* 価格 */}
                    <Row className="mx-1 py-2">
                        <Price />
                    </Row>

                    {/* 取引フォーム&板 */}
                    <Row className="mx-1 pt-3 pb-2 border-top">

                        <Col xs="12" md="6">
                            <DexForm />
                        </Col>

                        <Col xs="12" md="6">
                            <Board />
                        </Col>

                    </Row>

                    {/* チャート */}
                    <Row className="mb-2 mx-1 pt-3 border-top">
                        <Col xs="12" md="6" className="my-2">
                            <Row>

                                <Col xs="12">
                                    <h5>ボーダー価格</h5>
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

                        <Col xs="12" md="6" className="my-2">
                            <Row>

                                <Col xs="12">
                                    <h5>約定価格</h5>
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
                    </Row>
                    
                </Col>
            </React.Fragment>);
    }
}

const mapStateToProps = (state) => {
    return {
        community: state.community,
        darkMode: state.darkMode.darkMode
    };
};

export default connect(mapStateToProps)(Dex);
