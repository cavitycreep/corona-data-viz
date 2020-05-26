import React, { useState, useEffect, useCallback } from "react";
import { csv } from "d3-fetch";
import file from "./my_data.csv";

import Graph from "./Graph";

const CasesPer100K = ({
  slider = false,
  setTooltip,
}) => {
  const [data, setData] = useState([]);

  const getData = useCallback(async () => {
    const weeklyCovidCounties = await csv(file);
    setData(weeklyCovidCounties);
  }, [setData]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <Graph
      data={data}
      displayKey="casesPer100K"
      slider={slider}
      setTooltip={setTooltip}
    />
  );
};

export default CasesPer100K;
