"use strict"

import { csv } from "d3-fetch";

const {
    STATES_WORKER_NAME
} = require("../../utils/constants");

const { decodeUTF16String } = require("../../utils/utf16");
const { getStateTestData } = require("../files/state");

const message = require("../../utils/message").default;
const batchMap = require("../../utils/batch/map").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === STATES_WORKER_NAME && event.data.command === "start") {
        console.log("StatesWorker is parsing");
        const testRows = await csv("/covidtracking-5-26-2020.csv");

        console.log("StatesWorker is decoding");
        const stateRowsView = new Uint16Array(event.data.payload);
        const stateRowsString = decodeUTF16String(stateRowsView);
        const stateRows = JSON.parse(stateRowsString);

        console.log("StatesWorker is merging");
        const mergedRows = batchMap(stateRows, (populationRow) => ({
            ...populationRow,
            ...getStateTestData(testRows, populationRow)
        }));

        console.log("CasesWorker is done");
        self.postMessage(message( // eslint-disable-line no-restricted-globals
            event.data.subject,
            STATES_WORKER_NAME,
            "done",
            mergedRows.filter(Boolean),
        ));
    }
});
