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

            const noDataGroup = svg.select("g.legendCells")
                .append("g")
                .attr("class", "cell")
                .attr("transform", "translate(0, 188)");

            const noDataRect = noDataGroup.append("rect")
                .attr("height", "15")
                .attr("width", "15")
                .style("fill", "#cfcfcf");

            const noDataText = noDataGroup.append("text")
                .attr("class", "label")
                .attr("transform", "translate(25, 12.5)")
                .text(d => "No data");

            const noDataNote = noDataGroup.append("text")
                .attr("width", "15")
                .attr("class", "label")
                .attr("x", "0")
                .attr("y", "0")
                .attr("transform", "translate(110, 30)")
                .attr("style", "font-size: 10px");


            const spanSplit = (content) => forLegend(content).map(
                (text) => noDataNote
                    .append("tspan")
                    .text(text.trim())
                    .attr("x", "0")
                    .attr("dy", "1.2em")
                    .attr("text-anchor", "end")
            );

            const noDataTSpans = spanSplit("No organization has publicly \
            distributed this data, if any are even collecting it.");
            // noDataNote
            //     .append("tspan")
            //     .text("")
            //     .attr("x", "0")
            //     .attr("dy", "1.2em")
            //     .attr("text-anchor", "end")
            // noDataNote
            //     .append("tspan")
            //     .text("")
            //     .attr("x", "0")
            //     .attr("dy", "1.2em")
            //     .attr("text-anchor", "end");
            // noDataNote
            //     .append("tspan")
            //     .text("")
            //     .attr("x", "0")
            //     .attr("dy", "1.2em")
            //     .attr("text-anchor", "end");
            // noDataNote
            //     .append("tspan")
            //     .text("")
            //     .attr("x", "0")
            //     .attr("dy", "1.2em")
            //     .attr("text-anchor", "end");
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
