"use strict"

import { csv } from "d3-fetch";

const { getCaseData } = require("../files/cases");
const { decodeUTF16String } = require("../../utf16.js");
const batchMap = require("../../batch/map").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === "worker.cases" && event.data.command === "start") {
        console.log("Parsing cases data");
        const caseRows = await csv("/total_covid_cases_per_county.csv");

        console.log("Decoding cases data");
        const populationRowsView = new Uint16Array(event.data.buffer);
        const populationRowsString = decodeUTF16String(populationRowsView);
        const populationRows = JSON.parse(populationRowsString);

        console.log("Merging cases data");
        const mergedRows = batchMap(populationRows, (populationRow) => ({
            ...populationRow,
            ...getCaseData(caseRows, populationRow)
        }));

        console.log("Completed cases data");
        self.postMessage({ // eslint-disable-line no-restricted-globals
            target: "base",
            command: "done.cases",
            view: mergedRows.filter(Boolean),
        });
    }
});
