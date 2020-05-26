"use strict"

import { tsv } from "d3-fetch";

const { getTestData } = require("../files/tests");
const { decodeUTF16String } = require("../../utf16.js");
const batchMap = require("../../batch/map").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === "worker.tests" && event.data.command === "start") {
        console.log("Parsing tests data");
        const testRows = await tsv("/total_tests_per_county.tsv");

        console.log("Decoding tests data");
        const populationRowsView = new Uint16Array(event.data.buffer);
        const populationRowsString = decodeUTF16String(populationRowsView);
        const populationRows = JSON.parse(populationRowsString);

        console.log("Merging tests data");
        const mergedRows = batchMap(populationRows, (populationRow) => ({
            ...populationRow,
            ...getTestData(testRows, populationRow)
        }));

        console.log("Completed tests data");
        self.postMessage({ // eslint-disable-line no-restricted-globals
            target: "base",
            command: "done.tests",
            view: mergedRows.filter(Boolean),
        });
    }
});
