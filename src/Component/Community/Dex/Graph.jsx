import React, { Component } from 'react'
import * as d3 from 'd3';

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

export default Graph