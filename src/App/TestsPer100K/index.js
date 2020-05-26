import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import file from "./my_data.csv";

import Graph from "./Graph";

const TestsPer100K = ({
  slider = false,
  setTooltip,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fn = async () => {
      const weeklyCovidCounties = await csv(file);
      setData(weeklyCovidCounties.filter((county) => county.winsorizedTestsPer100K));
    };

    fn();
  }, []);

  return (
    <Graph
      data={data}
      displayKey="winsorizedTestsPer100K"
      slider={slider}
      setTooltip={setTooltip}
    />
  );
};

export default TestsPer100K;
