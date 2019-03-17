import React, { Component } from "react";
import { connect } from "react-redux";
import SubSig from "../../../scripts/EosSubSig";
import Aws from "../../../scripts/Aws";
import LineChart from './LineChart';
import Price from "./Price";
import SimpleBuy from "./SimpleBuy";
import { Col, Row, Form, FormGroup, Label, Input } from "reactstrap";

// Scatterを持っていない人向けの簡易的なDEX
class SimpleDex extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.state = {
            timeScale: 180,
            borderData: null
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
            this.getBorderChart(Number(e.target.value));
        }
    }

    async componentDidMount() {
        await this.getBorderChart(this.state.timeScale);

        this.timer = setInterval(() => {
            let now = new Date();
            let minute = now.getMinutes();
            let second = now.getSeconds();

            if ((minute % 5 === 1) && (second === 0)) {
                this.updateBorderChart();
            }
        }, 1000);
    }

    async getBorderChart(timeScale) {
        // チャートにデータベースから受け取った点を描画する
        const symbol = this.props.community.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成

        const { signature, subkey } = await subsig.getSigAndSubkey();

        const rows = timeScale / Number((process.env.REACT_APP_CHART_INTERVAL));
        const borderData = await Aws.getBorderChart(symbol, signature, subkey, rows); // AWS上にあるPVなどで補正したボーダー価格
        this.setState({
            borderData
        })
    }

    // 最新のデータをチャートに反映させチャートを動かす
    async updateBorderChart() {
        // 最新のデータを取得
        const symbol = this.props.community.symbol;
        const subsig = new SubSig(symbol); // 必要なインスタンスの生成
        const { signature, subkey } = await subsig.getSigAndSubkey();

        const latestBorderData = await Aws.getBorderPrice(symbol, signature, subkey);

        // 現在のチャートデータを取得
        let borderData = this.state.borderData;

        try {
            // 一番古いデータを削除する
            borderData[0].pop();

            // 最新のデータを追加する
            borderData[0].unshift(latestBorderData);

            // 更新したデータをチャートに反映させる
            this.setState({
                borderData
            })
        } catch (error) {
            console.error(error);
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        // const symbol = this.props.community.symbol;
        const borderData = this.state.borderData;
        return (
            <React.Fragment>

                <Col xs="12" id="dex" className="py-3 mt-1 border-special normal-shadow">
                    {/* 価格 */}
                    <Row className="mx-1 py-2">
                        <Price />
                    </Row>

                    {/* チャート */}
                    <Row className="mb-2 mx-1 pt-3 border-top">
                        <Col xs="12" md="12" className="my-2">
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
                                    <LineChart data={borderData} />
                                </Col>
                            </Row>
                        </Col>

                    </Row>

                    {/* 購入ボタン */}
                    <Row className="mx-1 py-2">
                        <SimpleBuy />
                    </Row>

                </Col>
            </React.Fragment>);
    }
}

const mapStateToProps = (state) => {
    return {
        community: state.community
    };
};

export default connect(mapStateToProps)(SimpleDex);
