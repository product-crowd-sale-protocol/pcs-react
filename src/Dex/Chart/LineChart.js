'use strict'

import React, { Component } from 'react'
import TweetEmbed from 'react-tweet-embed';
import * as d3 from 'd3';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import "../../style/App.css";
import "../../style/Dark.css";
import "../../style/White.css";

// チャート描画用のコンポーネント
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

        const x_start_margin = width * 0.02;
        const x_end_margin = width * 0.02;
        const y_start_margin = height * 0.08;
        const y_end_margin = height * 0.02;
        const x_start_padding = width * 0.06;
        const x_end_padding = width * 0.06;
        const y_start_padding = height * 0.02;
        const y_end_padding = height * 0.02;

        const verticies = {
            x_start: x_start_margin,
            x_end: width - x_end_margin,
            y_start: height - y_start_margin,
            y_end: y_end_margin
        };

        const time_range = this.props.timeRange;

        const ticks = this.tickTimes(time_range);
        const tick_color = this.props.tickColor;

        const x = d3.scaleTime()
            .domain(time_range)
            .range([x_start_margin + x_start_padding, width - x_end_margin - x_end_padding]);
        
        const config_axis_x = {
            tick_format: d3.timeFormat("%H:%M"),
            tick_values: ticks,
            scale_func: x,
            tick_color: tick_color
        };

        function draw(config, i) {
            let data = (config.data || []).filter((v) => {
                return time_range[0] <= v.x && v.x <= time_range[1];
            });
            
            if (data.length === 0) {
                return (
                    <React.Fragment key={i}>
                        <Axis position={config.position} orient={config.orient} verticies={verticies} config={{}} />
                    </React.Fragment>
                );
            }
            
            data.unshift({x: time_range[1], y: data[0].y});

            const y_max = d3.max(data.map((d) => d.y));
            const y_min = d3.min(data.map((d) => d.y));
            const y = d3.scaleLinear()
                .domain([y_min * 0.99, y_max * 1.01])
                .range([height - y_start_margin - y_start_padding, y_end_margin + y_end_padding]);
            
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

class Graph extends Component {
    render() {
        const chart_data = this.props.data;
        const {line_color, line_width, scale_func_x, scale_func_y, curve_completion} = this.props.config;

        const line = d3.line()
            .x((d) => scale_func_x(d.x))
            .y((d) => scale_func_y(d.y))
            .curve(d3[curve_completion]);

        return (
            <g className="graph">
                {(!chart_data || chart_data.length === 0)
                    ? "" 
                    : (chart_data.length === 1)
                    ? <circle
                        className="circle"
                        cx={scale_func_x(chart_data[0].x)}
                        cy={scale_func_y(chart_data[0].y)}
                        r={line_width * 2}
                        stroke="none"
                        fill={line_color}></circle>
                    : <path
                        className="line"
                        stroke={line_color}
                        strokeWidth={line_width}
                        fill="none"
                        d={line(chart_data)}></path>
                }
            </g>
        );
    }
}

class Axis extends Component {
    render() {
        const { position, orient, verticies, config } = this.props;

        const {
            x_start,
            x_end,
            y_start,
            y_end,
        } = verticies;

        const {
            scale_func = null,
            tick_values = [],
            tick_format = null,
            tick_size = 6,
            tick_color = "white",
            font_size = 16,
        } = config;

        const m = (position === "top" || position === "left") ? -1 : 1;
        const j = (orient === "inward") ? -1 : 1;
        const k = m * j;
        const trans_x = (position === "right")
            ? x_end : x_start;
        const trans_y = (position === "bottom")
            ? y_start : y_end;
        // const domain_d = (position === "top" || position === "bottom")
        //     ? `M0,${k * tick_size}V0H${x_end - x_start}V${k * tick_size}`
        //     : `M${k * tick_size},${y_start - y_end}H0V0H${k * tick_size}`;
        const domain_d = (position === "top" || position === "bottom")
            ? `M0,0H${x_end - x_start}`
            : `M0,${y_start - y_end}H0V0`;

        const tick = (v, i) => {
            if (scale_func === null || tick_format === null) {
                return "";
            } else if (position === "top" || position === "bottom") {
                // const dy = (position === "bottom") ? "0.71em" : "0";
                const dy = (k === 1) ? "0.71em" : "0";
                return (
                    <g key={i} className="tick" opacity="1" transform={`translate(${scale_func(v) - x_start},0)`}>
                        <line stroke={tick_color} y2={k * tick_size}></line>
                        <text fill={tick_color} y={k * tick_size * 1.5} dy={dy} fontSize={font_size} textAnchor="middle">
                            {tick_format(v)}
                        </text>
                    </g>
                );
            } else {
                // const textAnchor = (position === "left") ? "end" : "begin";
                const textAnchor = (k === -1) ? "end" : "begin";
                return (
                    <g key={i} className="tick" opacity="1" transform={`translate(0,${scale_func(v) - y_end})`}>
                        <line stroke={tick_color} x2={k * tick_size}></line>
                        <text fill={tick_color} x={k * tick_size * 1.5} dy="0.35em" fontSize={font_size} textAnchor={textAnchor}>
                            {tick_format(v)}
                        </text>
                    </g>
                );
            }
        }

        return (
            <g className="axis" transform={`translate(${trans_x},${trans_y})`}>
                <path className="domain" stroke={tick_color} fill="none" d={domain_d}></path>
                {tick_values.map(tick)}
            </g>
        );
    }
}
