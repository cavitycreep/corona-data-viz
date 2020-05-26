"use strict"

import { csv } from "d3-fetch";

const {
    LARGE_WORKER_NAME,
} = require("../../utils/constants");

const message = require("../../utils/message").default;

const { encodeUTF16Array } = require("../../utils/utf16");
const { createLarge } = require("../batch/pool");

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === LARGE_WORKER_NAME && event.data.command === "start") {
        console.log("LargeWorker parses and encodes large rows");
        const largeRows = await csv("/timeseries.csv");
        const refinedLargeRows = largeRows.filter((row) => row.country === "United States" && row.level === "county")
        const largeRowsArray = encodeUTF16Array(refinedLargeRows);
        const results = await createLarge(LARGE_WORKER_NAME, "LargeWorker", event.data.payload, largeRowsArray);

        console.log("LargeWorker is done");
        self.postMessage(message( // eslint-disable-line no-restricted-globals
            event.data.subject,
            LARGE_WORKER_NAME,
            "done",
            results,
        ));
    }
});
