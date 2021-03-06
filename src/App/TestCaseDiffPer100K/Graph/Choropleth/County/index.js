import React, { useMemo, useCallback, useEffect } from "react";
import { Geography } from "react-simple-maps";

const County = ({
    geo,
    data,
    displayKey,
    setTooltip,
    colorScale,
}) => {
    const county = useMemo(
        () => data.find((c) => c.fips === geo.id),
        [
            data,
            geo,
        ]
    );

    const fillColor = useMemo(
        () => county && county[displayKey]
            ? colorScale(county[displayKey])
            : "#efefef",
        [
            county,
            colorScale,
            displayKey,
        ]
    );

    const geoStyle = useMemo(() => ({
        hover: {
            cursor: "pointer",
            stroke: "#F53",
            strokeWidth: 1,
        }
    }), []);

    const handleMouseLeave = useCallback(() => setTooltip(""), [setTooltip]);
    const handleMouseEnter = useCallback(() => {
        let tooltip = `${geo.properties.name}`;

        if(county && county[displayKey]) {
            const {
                state
            } = county;
            const capitalizedState = state.charAt(0).toUpperCase() + state.slice(1);
            tooltip += `, ${capitalizedState} (${county[displayKey]}/100K)`;
        }

        setTooltip(tooltip);
    }, [
        geo,
        county,
        setTooltip,
    ]);

    return (
        <Geography
            geography={geo}
            fill={fillColor}
            stroke="#efefef"
            strokeWidth={0.25}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={geoStyle}
        />
    );
};

export default County;
