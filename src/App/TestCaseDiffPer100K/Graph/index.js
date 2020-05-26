import React, { useCallback, useMemo } from "react";
import { scaleDiverging } from "d3-scale";
import chroma from "chroma-js";

import Title from "./Title";
import Legend from "./Legend";
import Choropleth from "./Choropleth";

import styles from "./index.module.scss";
import { extent, interpolateRdYlGn } from "d3";

export const range = chroma.scale([
    "#ff0000",
    "#ffffff",
    "#00ff00",
]).colors(11);

const Graph = ({
    displayKey,
    slider,
    data,
    setTooltip,
}) => {
    const scaleExtent = useMemo(() => extent(data, (d) => parseInt(d[displayKey], 10)), [data]);
    const scale = useCallback(
        scaleDiverging()
            .domain([scaleExtent[0], 0, scaleExtent[1]])
            .interpolator(interpolateRdYlGn),
        [scaleExtent]
    );

    return (
        <>
            <Title>Failed Tests Per 100K Residents</Title>
            <div className={styles.Graph}>
                <Choropleth
                    data={data}
                    colorScale={scale}
                    displayKey={displayKey}
                    setTooltip={setTooltip}
                />
                <Legend
                    data={data}
                    colorScale={scale}
                />
            </div>
        </>
    );
};

export default Graph;
