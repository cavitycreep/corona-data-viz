"use strict"

import { csv, tsv } from "d3-fetch";

const RowWorker = require("worker-loader!./row.worker.js") ; // eslint-disable-line import/no-webpack-loader-syntax
const { encodeUTF16String, decodeUTF16String } = require("../src/utils/utf16.js");

const parseFiles = async () => {
    const largeRows = await csv("/timeseries.csv");
    const testRows = await tsv("/total_tests_per_county.tsv");
    const caseRows = await csv("/total_covid_cases_per_county.csv");
    const populationRows = await csv("/us_counties.csv");

    return {
        largeRows,
        testRows,
        caseRows,
        populationRows,
    };
};

const getWorkerPool = () => {
    const workerPool = new Array(10);
    for(let i = 0; i < workerPool.length; i++) {
        workerPool[i] = new RowWorker();
    }
    return workerPool;
}

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    try {
        if(event.data.start) {
            console.log("Parsing files");
            const populationRows = await csv("/us_counties.csv");

            console.log("Encoding data");
            const populationRowsString = JSON.stringify(populationRows);
            const populationRowsView = encodeUTF16String(populationRowsString);

            console.log("Spinning up workers");
            const mergedRows = [];
            const workerPool = getWorkerPool();

            console.log("Processing data");
            for(let i = 0; i < populationRows.length; i++) {
                const populationRow = populationRows[i];

                // Wait until there's a worker available
                while(!workerPool.length) {
                    await new Promise(r => setTimeout(r, 1000));
                }

                // Get a worker from the pool
                const worker = workerPool.pop();

                // Received message from row worker
                worker.onerror = (event) => console.log("Worker error", event);
                worker.onmessage = (event) => {
                    switch(event.data.status) {
                        case "update": {
                            console.log(event.data.value);
                            break;
                        }
                        case "done":
                        default: {
                            // Save the completed row
                            mergedRows.push(event.data.value);
                            console.log(`${mergedRows.length} / ${populationRows.length}`)

                            // Return the worker to the pool
                            workerPool.push(worker);
                        }
                    }
                }

                // Start the worker
                const buffers = [
                    largeRowsView.buffer,
                    testRowsView.buffer,
                    caseRowsView.buffer,
                ];
                const message = {
                    populationRow,
                    buffers,
                };

                worker.postMessage(message);
            }

            // Wait for the workers to finish
            console.log("Waiting for workers");
            while(mergedRows.length !== populationRows.length) {
                await new Promise(r => setTimeout(r, 3000));
            }

            // Terminate the worker pool
            console.log("Terminating pool");
            workerPool.forEach((worker) => worker.terminate());

            // Send data back
            console.log("Done!");
            self.postMessage({ // eslint-disable-line no-restricted-globals
                status: "done",
                value: mergedRows,
            });
        }
    } catch(e) {
        console.error("Error in CollateWorker", e);
    }
});
