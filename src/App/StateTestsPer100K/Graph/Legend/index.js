import React, { useState, useEffect, useRef } from "react";
import { select } from "d3";
import { legendColor, legendHelpers } from "d3-svg-legend";

import { forLegend } from "../../../../utils/string";

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
                .title("Tests Per 100,000")
                .titleWidth(100)
                .labelFormat(".2d")
                .labels(legendHelpers.thresholdLabels)
                .scale(colorScale);

            colorLegend(svg);
            createdLegend(true);

            const legendGroup = svg.select("g.legendCells");
            const firstBucketGroup = legendGroup.selectAll("g.cell").filter((d, i) => i === 0);
            const firstBucketText = firstBucketGroup.select("text")
                .text("Fewer than 1000");

            const noDataGroup = legendGroup.append("g")
                .attr("class", "cell")
                .attr("transform", "translate(0, 158)");

            const noDataNote = noDataGroup.append("text")
                .attr("class", "label")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", "120px")
                .attr("transform", "translate(120, 30)")
                .attr("style", "font-size: 10px");

            const spanSplit = (content) => forLegend(content).map(
                (text) => noDataNote
                    .append("tspan")
                    .text(text.trim())
                    .attr("x", "0")
                    .attr("dy", "1.2em")
                    .attr("text-anchor", "end")
            );

            const noDataTSpans = spanSplit("County level testing data has not yet been distributed in a digitized format; \
            state and local governments physically print data, but that is an unusable format for data visualizations of \
            this scale. In those cases, we're using state-level testing data as a fallback.");
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
