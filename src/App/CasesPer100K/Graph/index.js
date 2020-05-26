import React, { useState, useCallback, useMemo } from "react";
import { scaleQuantile, scaleQuantize } from "d3-scale";

import { quantileRange, quantizeRange } from "./ranges";
import Title from "./Title";
import Legend from "./Legend";
import Choropleth from "./Choropleth";

import styles from "./index.module.scss";

const UPPER_LIMIT = 1000;
const limit = (s) => {
    let value = parseInt(s, 10);

    if(value > UPPER_LIMIT) {
        value = UPPER_LIMIT;
    }

    return value;
};

const Graph = ({
    displayKey,
    slider,
    data,
    setTooltip,
}) => {
    const quantileScale = useCallback(
        scaleQuantile()
            .domain(data.map((d) => limit(d[displayKey])))
            .range(quantileRange),
        [data, displayKey]
    );

    return (
        <>
            <Title>Cases Per 100K Residents</Title>
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
            </div>
        </>
    );
};

export default Graph;
