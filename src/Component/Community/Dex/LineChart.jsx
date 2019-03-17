import React, { Component } from 'react'
import TweetEmbed from 'react-tweet-embed';
import * as d3 from 'd3';
import Axis from './Axis';
import Graph from './Graph';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

// チャート描画およびチャートクリック時の処理を管理するコンポーネント
class LineChart extends Component {
    constructor(props) {
        super(props)

        // モーダルの状態およびモーダル内に表示するツイートのID
        this.state = {
            modal: false,
            tweets: []
        }

        this.showTwitterModal = this.showTwitterModal.bind(this);
        this.tickTimes = this.tickTimes.bind(this);
        // this.showTweetWidget = this.showTweetWidget.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    // モーダルの表示非表示を切り替える関数
    toggle() {
        this.setState({ modal: !this.state.modal });
    }

    // PVグラフの点をクリックすると始まる関数
    // クリックして受けとったツイートのIDリストをStateに反映
    // モーダル内でウィジェットを表示する際に使う
    showTwitterModal(tweet_list) {
        if (tweet_list) {
            this.setState({ tweets: tweet_list });
            this.toggle();
        }
    }

    /// minite が 0 か 30 のときに目盛りを表示するために
    /// minite が 0 から 5 までの間であるデータを見つける
    /// 5 minitus で割った商が 6 で割り切れることを確かめる
    tickTimes(time_range) {
        const time_interval = Math.round((time_range[1] - time_range[0]) / 3600000) * 600000;
        // console.log(time_interval);

        const tickValuesMin = Math.ceil((time_range[0] + 54000000) / time_interval);
        const tickValuesMax = Math.floor((time_range[1] + 54000000) / time_interval);
        // console.log(tickValuesMin, tickValuesMax);

        const tickValues = Array.from(
            {length: tickValuesMax - tickValuesMin + 1},
            (v, i) => (i + tickValuesMin) * time_interval - 54000000
        );
        // console.log(tickValues);

        return tickValues;
    }

    // ツイートウィジェットを実際に表示する関数
    // showTweetWidget(tweet_id) {
    //     (tweet_id) ? tweet_id : "何もないよ";
    // }

    render() {
        const width = 600;
        const height = width * 0.5;

        const x_start = width * 0.02;
        const x_end = width * (1 - 0.02);
        const y_start = height * (1 - 0.08);
        const y_end = height * 0.02;

        const verticies = {x_start, x_end, y_start, y_end};

        const time_range = this.props.timeRange;

        const ticks = this.tickTimes(time_range);
        const tick_color = this.props.tickColor;

        const x = d3.scaleTime()
            .domain(time_range)
            .range([x_start, x_end]);
        
        const config_axis_x = {
            tick_format: d3.timeFormat("%H:%M"),
            tick_values: ticks,
            scale_func: x,
            tick_color: tick_color
        };

        function draw(config, i) {
            const data = (config.data || []).filter((v) => {
                return time_range[0] <= v.x && v.x <= time_range[1];
            });

            if (data.length === 0) {
                return (
                    <React.Fragment key={i}>
                        <Axis position={config.position} orient={config.orient} verticies={verticies} config={{}} />
                    </React.Fragment>
                );
            }

            const y_max = d3.max(data.map((d) => d.y));
            const y_min = d3.min(data.map((d) => d.y));
            const y = d3.scaleLinear()
                .domain([y_min * 0.99, y_max * 1.01])
                .range([y_start, y_end]);
            
            function tickFormat(v) {
                const split_into_dot = String(Math.floor(v * 10000) / 10000).split(".");
                return split_into_dot[0] + "." + (split_into_dot[1] || "").padEnd(4, "0");
            };

            const config_axis_y = {
                tick_format: tickFormat, // d3.format(".3s"),
                tick_values: [y_min, y_max],
                scale_func: y,
                tick_color: tick_color
            };
    
            const config_graph = {
                line_color: config.lineColor,
                line_width: config.lineWidth,
                scale_func_x: x,
                scale_func_y: y,
                curve_completion: config.curveCompletion,
            };

            return (
                <React.Fragment key={i}>
                    <Graph data={data} config={config_graph} />
                    <Axis position={config.position} orient={config.orient} verticies={verticies} config={config_axis_y} />
                </React.Fragment>
            );
        };

        return (
            <React.Fragment>
                <div style={{maxWidth: "600px", margin: "0 auto"}}>
                    <svg viewBox="0 0 600 300">
                        <g className="chart-wrapper">
                            {this.props.config.map(draw)}
                            {/*data.filter(v => v.z).map((v, i) => {
                                return (<circle
                                    key={i}
                                    className="circle"
                                    cx={x(v.x)}
                                    cy={y(v.y)}
                                    r={10}
                                    fill="steelblue"
                                    onClick={this.showTwitterModal(v.z)}>
                                </circle>);
                            })*/}
                            <Axis position="bottom" orient="outward" verticies={verticies} config={config_axis_x} />
                        </g>
                    </svg>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>宣伝効果の高かったツイート</ModalHeader>
                    <ModalBody id="tweet-container">
                        {this.state.tweets.map((tweet_id) => {
                            return (<TweetEmbed key={tweet_id} id={tweet_id} />);
                        })}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </React.Fragment>
        )
    }
}

export default LineChart;

// function yValuesList(min_value, max_value, signif_digit=3) {
//     const log_min = Math.floor(Math.log10(min_value));
//     const log_max = Math.floor(Math.log10(max_value));
//     const round_min = Math.pow(10, log_min - signif_digit + 1);
//     const round_max = Math.pow(10, log_max - signif_digit + 1);
//     const signif_min = Math.floor(min_value / round_min);
//     const signif_max = Math.floor(max_value / round_max);
//     console.log(log_min, log_max, round_min, round_max, signif_min, signif_max);
//
//     let values = [];
//     for (let d = log_min; d <= log_max; d++) {
//         for (let s = Math.pow(10, signif_digit - 1); s < Math.pow(10, signif_digit); s++) {
//             if (
//                 !(d === log_min && s < signif_min) &&
//                 !(d === log_max && s > signif_max)
//             ) {
//                 values.push(s * Math.pow(10, d - signif_digit + 1));
//             }
//         }
//     }
//     return values;
// }
