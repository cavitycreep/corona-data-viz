import React, { useState, useEffect, useRef } from "react";
import { select } from "d3";
import { legendColor } from "d3-svg-legend";

import styles from "./index.module.scss";
import "./index.scss";

const Legend = ({
    data,
    colorScale,
}) => {
    const [legendCreated, createdLegend] = useState(false);
    const svgRef = useRef(null);

    useEffect(() => {
        if(data.length > 0 && !legendCreated && svgRef.current) {
            const svg = select(svgRef.current);
            const colorLegend = legendColor()
                .title("Quantiles")
                .titleWidth(100)
                .labelFormat(".2d")
                .scale(colorScale);

            colorLegend(svg);
            createdLegend(true);
        }
    }, [
        data,
        colorScale,
        legendCreated,
        svgRef,
    ]);

    return (
        <div className={styles.Legend}>
            <svg className={styles.Svg} ref={svgRef}></svg>
        </div>
    );
};

export default Legend;
