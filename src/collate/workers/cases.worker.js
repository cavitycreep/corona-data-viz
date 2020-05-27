"use strict"

import { csv } from "d3-fetch";

const {
    CASES_WORKER_NAME
} = require("../../utils/constants");

const { decodeUTF16String } = require("../../utils/utf16");
const { getCaseData } = require("../files/cases");

const message = require("../../utils/message").default;
const batchMap = require("../../utils/batch/map").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === CASES_WORKER_NAME && event.data.command === "start") {
        console.log("CasesWorker is parsing");
        const caseRows = await csv("/nyt.csv");

        console.log("CasesWorker is decoding");
        const populationRowsView = new Uint16Array(event.data.payload);
        const populationRowsString = decodeUTF16String(populationRowsView);
        const populationRows = JSON.parse(populationRowsString);

        console.log("CasesWorker is merging");
        const mergedRows = batchMap(populationRows, (populationRow) => ({
            ...populationRow,
            ...getCaseData(caseRows, populationRow)
        }));

        console.log("CasesWorker is done");
        self.postMessage(message( // eslint-disable-line no-restricted-globals
            event.data.subject,
            CASES_WORKER_NAME,
            "done",
            mergedRows.filter(Boolean),
        ));
    }
});
