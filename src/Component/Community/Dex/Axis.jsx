import React, { Component } from 'react'

/**
 *  O-----------------------X
 *  | svg                   |
 *  |       P       Q       |
 *  |       |       |       |
 *  |   W---A-------B---R   |
 *  |       | line  |       |
 *  |       | chart |       |
 *  |   V---D-------C---S   |
 *  |       |       |       |
 *  |       U       T       |
 *  |                       |
 *  Y-----------------------Z
 * 
 *  A = (x_start, y_end  )
 *  B = (x_end,   y_end  )
 *  C = (x_end,   y_start)
 *  D = (x_start, y_start)
 *  
 *  width = |OX|
 *  height = |OY|
 *  tick_size = |DU| = |DV|
 *  
 *  top    = AB
 *  right  = CB
 *  bottom = DC
 *  left   = DA
 * 
 *  domain_top    = PABQ
 *  domain_right  = SCBR
 *  domain_bottom = UDCT
 *  domain_left   = VDAW
 */

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
            scale_func=null,
            tick_values=[],
            tick_format=null,
            tick_size=6,
            tick_color="white",
            font_size=16,
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

export default Axis