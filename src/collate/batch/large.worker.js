"use strict"

const {
    BATCH_WORKER_NAME
} = require("../../utils/constants");

const { getLargeData } = require("../files/large");
const { decodeUTF16String, decodeUTF16Array } = require("../../utils/utf16");

const message = require("../../utils/message").default;
const batchMap = require("../../utils/batch/map").default;

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === BATCH_WORKER_NAME
    && event.data.command === "start") {
        // console.log("BatchWorker decodes the batch")
        const batch = decodeUTF16Array(event.data.payload.batch);

        // console.log("BatchWorker decodes the population rows")
        const baseView = new Uint16Array(event.data.payload.base);
        const baseString = decodeUTF16String(baseView);
        const base = JSON.parse(baseString);

        // console.log("BatchWorker merges the rows")
        const merged = batchMap(base, (populationRow) => {
            const largeData = getLargeData(batch, populationRow);
            if(largeData) {
                return {
                    ...populationRow,
                    ...largeData,
                };
            }
        });

        // console.log("BatchWorker returns the rows")
        self.postMessage(message( // eslint-disable-line no-restricted-globals
            event.data.subject,
            BATCH_WORKER_NAME,
            "done",
            merged.filter(Boolean),
        ));
    }
});
