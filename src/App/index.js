import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";

import {
  COLLATE_WORKER_NAME
} from "../utils/constants";

import CollateWorker from "worker-loader!../collate/workers/collate.worker.js"; // eslint-disable-line import/no-webpack-loader-syntax
import download from "../utils/download";
import message from "../utils/message";
import TestsPer100K from "./StateTestsPer100K";

import styles from "./index.module.scss";

const App = ({
  shouldDownload = false,
}) => {
  const [content, setTooltip] = useState("");

  useEffect(() => {
    const worker = new CollateWorker();

    if(shouldDownload) {
      worker.onmessage = (event) => {
        if(event.data.target === "base"
        && event.data.subject === COLLATE_WORKER_NAME
        && event.data.command === "done") {
          download(event.data.payload.mergedCounties, "merged_counties");
          download(event.data.payload.mergedStates, "merged_states");
        }
      }

      worker.postMessage(message(
        COLLATE_WORKER_NAME,
        "base",
        "start",
      ));
    }

    return () => worker.terminate();
  }, [
    shouldDownload,
  ]);

  return (
    <div className={styles.App}>
        <TestsPer100K setTooltip={setTooltip} />
        <ReactTooltip>{content}</ReactTooltip>
    </div>
  );
};

export default App;
