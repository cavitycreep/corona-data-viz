import React, { memo } from "react";

import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";

import County from "./County";

import styles from "./index.module.scss";

const countiesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const statesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const Choropleth = ({
    displayKey,
    setTooltip,
    colorScale,
    data,
}) => {
    return (
        <div className={styles.Choropleth}>
            <ComposableMap data-tip="" projection="geoAlbersUsa" width={800} height={500}>
                <ZoomableGroup minZoom={1} maxZoom={2} className={styles.Zoom} translateExtent={[[0,500], [800,500],]}>
                    <Geographies geography={countiesUrl}>
                        {({ geographies }) => geographies.map((geo) => (
                            <County
                                key={geo.rsmKey}
                                geo={geo}
                                data={data}
                                displayKey={displayKey}
                                setTooltip={setTooltip}
                                colorScale={colorScale}
                            />
                        ))}
                    </Geographies>
                    <Geographies geography={statesUrl}>
                        {({ geographies }) => geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="transparent"
                                stroke="#fff"
                                strokeWidth={1}
                                pointerEvents="none"
                            />
                        ))}
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
};

export default memo(Choropleth);
