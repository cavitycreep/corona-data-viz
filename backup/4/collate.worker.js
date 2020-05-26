"use strict"

import { csv } from "d3-fetch";

const CasesWorker = require("worker-loader!./workers/cases.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax
const TestsWorker = require("worker-loader!./workers/tests.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax
const LargeWorker = require("worker-loader!./workers/large.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax

const { getCountyData } = require("./files/county");
const { encodeUTF16String } = require("../utf16.js");
const { getMergedData } = require("./files/merged");
const batchMap = require("../batch/map").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    try {
        if(event.data.target === "worker.collate" && event.data.command === "start") {
            console.log("Parsing files");
            const populationRows = await csv("/us_counties.csv");
            const refinedPopulationRows = batchMap(populationRows, (populationRow) => getCountyData(populationRow)).filter(Boolean);

            console.log("Encoding data");
            const populationRowsString = JSON.stringify(refinedPopulationRows);
            const populationRowsView = encodeUTF16String(populationRowsString);

            const caseData = [];
            const testData = [];
            const largeData = [];

            const casesWorker = new CasesWorker();
            const testsWorker = new TestsWorker();
            const largeWorker = new LargeWorker();

            casesWorker.onmessage = (event) => {
                if(event.data.target === "base" && event.data.command === "done.cases") {
                    console.log("Cases done");
                    caseData.push(...event.data.view);
                    casesWorker.terminate();
                }
            };
            testsWorker.onmessage = (event) => {
                if(event.data.target === "base" && event.data.command === "done.tests") {
                    console.log("Tests done");
                    testData.push(...event.data.view);
                    testsWorker.terminate();
                }
            };
            largeWorker.onmessage = (event) => {
                if(event.data.target === "base" && event.data.command === "done.large") {
                    console.log("Large done");
                    largeData.push(...event.data.view);
                    largeWorker.terminate();
                }
            };

            console.log("Starting case worker");
            casesWorker.postMessage({
                target: "worker.cases",
                command: "start",
                buffer: populationRowsView.buffer
            });

            console.log("Starting test worker");
            testsWorker.postMessage({
                target: "worker.tests",
                command: "start",
                buffer: populationRowsView.buffer
            });

            console.log("Starting large worker");
            largeWorker.postMessage({
                target: "worker.large",
                command: "start",
                buffer: populationRowsView.buffer
            });

            while(true) {
                if(caseData.length === refinedPopulationRows.length
                && testData.length === refinedPopulationRows.length
                && largeData.length === refinedPopulationRows.length) {
                    break;
                } else {
                    // console.log("Waiting for workers");
                    await new Promise(r => setTimeout(r, 3000));
                }
            }

            console.log("Building final array");
            const mergedCounties = refinedPopulationRows.map((populationRow) => {
                const caseRow = caseData.find((row) => row.fips === populationRow.fips);
                const testRow = testData.find((row) => row.fips === populationRow.fips);
                const largeRow = largeData.find((row) => row.fips === populationRow.fips);
                const mergedCounty = {
                    ...populationRow,
                    ...caseRow,
                    ...testRow,
                    ...largeRow,
                };
                return {
                    ...mergedCounty,
                    ...getMergedData(mergedCounty)
                };
            });

            console.log("Done");
            self.postMessage({ // eslint-disable-line no-restricted-globals
                status: "done",
                value: mergedCounties,
            });
        }
    } catch(e) {
        console.error(e);
    }
});
