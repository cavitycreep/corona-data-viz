"use strict"

import { csv } from "d3-fetch";

import { getLargeDataByDate } from "../files/tests";
const { getLargeData } = require("../files/tests");
const { decodeUTF16String } = require("../../utf16.js");
const batchFind = require("../../batch/find").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === "worker.large" && event.data.command === "start") {
        console.log("Parsing large data from file");
        const largeRows = await csv("/timeseries.csv");
        const refinedLargeRows = largeRows.filter((row) => row.country === "United States" && row.level === "county")

        console.log("Decoding population rows for large rows");
        const populationRowsView = new Uint16Array(event.data.buffer);
        const populationRowsString = decodeUTF16String(populationRowsView);
        const populationRows = JSON.parse(populationRowsString);

        console.log("Merging population rows with large rows");
        const mergedRows = [];
        for(let i = 0; i < populationRows.length; i++) {
            const populationRow = populationRows[i];
            const largeRowsByDate = await batchFind("largeRowsByDate", refinedLargeRows, populationRows[i], getLargeDataByDate);
            console.log("Filtered large rows by date", largeRowsByDate, populationRows[i]);
            if(largeRowsByDate.length > 0) {
                const largeRow = getLargeData(largeRowsByDate, populationRow);
                if(i % 10 && i > 0) {
                    console.log("Ten large rows merged", i / populationRows.length * 100);
                }
                mergedRows[i] = {
                    ...populationRow,
                    ...largeRow,
                };
            }
        }

        // This could be very costly; looping through 100 at a time,
        // spinning up 10 workers for each map()... Archiving for now
        // const batchMap = require("../../batch/map").default;
        // const mergedRows = batchMap(populationRows, (populationRow) => {
        //     const largeRow = getLargeData(refinedLargeRows, populationRow);
        //     return {
        //         ...populationRow,
        //         ...largeRow,
        //     };
        // });

        console.log("Completed large data");
        self.postMessage({ // eslint-disable-line no-restricted-globals
            target: "base",
            command: "done.large",
            view: mergedRows.filter(Boolean),
        });
    }
});
