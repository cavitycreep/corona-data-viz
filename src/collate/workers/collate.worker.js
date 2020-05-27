"use strict"

import { csv } from "d3-fetch";

const {
    COLLATE_WORKER_NAME,
    CASES_WORKER_NAME,
    LARGE_WORKER_NAME,
    TESTS_WORKER_NAME,
    STATES_WORKER_NAME,
} = require("../../utils/constants");

const CasesWorker = require("worker-loader!./cases.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax
const TestsWorker = require("worker-loader!./tests.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax
const LargeWorker = require("worker-loader!./large.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax
const StatesWorker = require("worker-loader!./states.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax

const { getMergedCountyData, getMergedStateData } = require("../files/merged");
const { getCountyData } = require("../files/county");
const { getStateData } = require("../files/state");

const { encodeUTF16String } = require("../../utils/utf16");

const message = require("../../utils/message").default;
const batchMap = require("../../utils/batch/map").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    try {
        if(event.data.target === COLLATE_WORKER_NAME && event.data.command === "start") {
            console.log("CollateWorker is parsing");
            const populationRows = await csv("/census.csv");
            const countyPopulationRows = [];
            const statePopulationRows = [];

            batchMap(populationRows, (populationRow) => {
                if(populationRow.COUNTY === "000") {
                    statePopulationRows.push(getStateData(populationRow));
                } else {
                    countyPopulationRows.push(getCountyData(populationRow));
                }
            });

            console.log("CollateWorker is encoding");
            const stateRowsString = JSON.stringify(statePopulationRows);
            const stateRowsView = encodeUTF16String(stateRowsString);
            const countyRowsString = JSON.stringify(countyPopulationRows);
            const countyRowsView = encodeUTF16String(countyRowsString);

            const caseData = [];
            const testData = [];
            const largeData = [];
            const statesData = [];

            const casesWorker = new CasesWorker();
            const testsWorker = new TestsWorker();
            const largeWorker = new LargeWorker();
            const statesWorker = new StatesWorker();

            casesWorker.onmessage = (event) => {
                if(event.data.target === COLLATE_WORKER_NAME
                && event.data.subject === CASES_WORKER_NAME
                && event.data.command === "done") {
                    // console.log("CollateWorker received CasesWorker", event.data.payload);
                    caseData.push(...event.data.payload);
                    casesWorker.terminate();
                }
            };
            testsWorker.onmessage = (event) => {
                if(event.data.target === COLLATE_WORKER_NAME
                && event.data.subject === TESTS_WORKER_NAME
                && event.data.command === "done") {
                    // console.log("CollateWorker received TestsWorker", event.data.payload);
                    testData.push(...event.data.payload);
                    testsWorker.terminate();
                }
            };
            largeWorker.onmessage = (event) => {
                if(event.data.target === COLLATE_WORKER_NAME
                && event.data.subject === LARGE_WORKER_NAME
                && event.data.command === "done") {
                    // console.log("CollateWorker received LargeWorker", event.data.payload);
                    largeData.push(...event.data.payload);
                    largeWorker.terminate();
                }
            };
            statesWorker.onmessage = (event) => {
                if(event.data.target === COLLATE_WORKER_NAME
                && event.data.subject === STATES_WORKER_NAME
                && event.data.command === "done") {
                    // console.log("CollateWorker received StatesWorker", event.data.payload);
                    statesData.push(...event.data.payload);
                    statesWorker.terminate();
                }
            };

            console.log("CollateWorker is starting workers");
            casesWorker.postMessage(message(
                CASES_WORKER_NAME,
                COLLATE_WORKER_NAME,
                "start",
                countyRowsView.buffer
            ));
            testsWorker.postMessage(message(
                TESTS_WORKER_NAME,
                COLLATE_WORKER_NAME,
                "start",
                countyRowsView.buffer
            ));
            largeWorker.postMessage(message(
                LARGE_WORKER_NAME,
                COLLATE_WORKER_NAME,
                "start",
                countyRowsView.buffer
            ));
            statesWorker.postMessage(message(
                STATES_WORKER_NAME,
                COLLATE_WORKER_NAME,
                "start",
                stateRowsView.buffer
            ));

            while(true) {
                if(caseData.length && testData.length && largeData.length) {
                    break;
                } else {
                    console.log("CollateWorker is waiting");
                    await new Promise(r => setTimeout(r, 3000));
                }
            }

            console.log("CollateWorker merges county data");
            const mergedCounties = countyPopulationRows.map((populationRow, i) => {
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
                    ...getMergedCountyData(mergedCounty)
                };
            });

            console.log("CollateWorker merges state data");
            const mergedStates = statePopulationRows.map((populationRow, i) => {
                const testRow = statesData.find((row) => row.stateCode === populationRow.stateCode);
                const mergedState = {
                    ...populationRow,
                    ...testRow,
                };
                return {
                    ...mergedState,
                    ...getMergedStateData(mergedState)
                };
            });

            console.log("CollateWorker is done!");
            self.postMessage(message(
                "base",
                COLLATE_WORKER_NAME,
                "done",
                {
                    mergedCounties,
                    mergedStates,
                }
            ));
        }
    } catch(e) {
        console.error(e);
    }
});
