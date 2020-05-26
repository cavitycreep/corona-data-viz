import React, { useCallback, useMemo } from "react";
import { scaleQuantize } from "d3-scale";
import { extent, max } from "d3";
import chroma from "chroma-js";

import { RdYlGnDivering } from "../../../utils/colors";

import Title from "./Title";
import Legend from "./Legend";
import Choropleth from "./Choropleth";
import Sources from "./Sources";

import styles from "./index.module.scss";

export const quantizeRange = chroma.scale(RdYlGnDivering).colors(11);

const Graph = ({
    displayKey,
    slider,
    data,
    setTooltip,
}) => {
    const quantileScale = useCallback(
        scaleQuantize()
            .domain([0, 11000])
            .range(quantizeRange),
        []
    );

    return (
        <>
            <Title>US Coronavirus Tests Per 100,000 County Residents</Title>
            <div className={styles.Graph}>
                <Choropleth
                    data={data}
                    colorScale={quantileScale}
                    displayKey={displayKey}
                    setTooltip={setTooltip}
                />
                <Legend
                    data={data}
                    colorScale={quantileScale}
                />
                <Sources>
                    <span>https://www.census.gov/</span>
                    <span>https://coronadatascraper.com/</span>
                    <span>https://github.com/yahoo/covid-19-data/</span>
                </Sources>
            </div>
        </>
    );
};

export default Graph;
