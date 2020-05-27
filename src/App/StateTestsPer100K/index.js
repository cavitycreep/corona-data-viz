import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import counties from "./merged_counties.csv";
import states from "./merged_states.csv";

import Graph from "./Graph";

const TestsPer100K = ({
  slider = false,
  setTooltip,
}) => {
  const [countyData, setCountyData] = useState([]);
  const [stateData, setStateData] = useState([]);

  useEffect(() => {
    const fn = async () => {
      const countyCsv = await csv(counties);
      const stateCsv = await csv(states);
      setCountyData(countyCsv.filter((county) => county.winsorizedTestsPer100K));
      setStateData(stateCsv);
    };

    fn();
  }, []);

  return (
    <Graph
      countyData={countyData}
      stateData={stateData}
      countyDisplayKey="winsorizedTestsPer100K"
      stateDisplayKey="testsPer100K"
      slider={slider}
      setTooltip={setTooltip}
    />
  );
};

export default TestsPer100K;
