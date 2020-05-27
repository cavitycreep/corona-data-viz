import React, { useMemo } from "react";
import { Geography } from "react-simple-maps";

const State = ({
    geo,
    data,
    displayKey,
    colorScale,
}) => {
    const state = useMemo(
        () => data.find((s) => s.state === geo.properties.name),
        [
            data,
            geo,
        ]
    );

    const fillColor = useMemo(
        () => state
            ? colorScale(state[displayKey])
            : "#cfcfcf",
        [
            state,
            colorScale,
            displayKey,
        ]
    );

    return (
        <Geography
            geography={geo}
            fill={fillColor}
            stroke="#fff"
            strokeWidth={1}
            pointerEvents="none"
        />
    );
};

export default State;
