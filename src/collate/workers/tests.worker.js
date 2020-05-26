"use strict"

import { tsv } from "d3-fetch";

const {
    TESTS_WORKER_NAME
} = require("../../utils/constants");

const message = require("../../utils/message").default;

const { encodeUTF16Array } = require("../../utils/utf16");
const { createTests } = require("../batch/pool");

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.target === TESTS_WORKER_NAME && event.data.command === "start") {
        console.log("TestsWorker parses and encodes test rows");
        const testRows = await tsv("/total_tests_per_county.tsv");
        const testRowsArray = encodeUTF16Array(testRows);
        const results = await createTests(TESTS_WORKER_NAME, "TestsWorker", event.data.payload, testRowsArray);

        console.log("TestsWorker is done");
        self.postMessage(message( // eslint-disable-line no-restricted-globals
            event.data.subject,
            TESTS_WORKER_NAME,
            "done",
            results,
        ));
    }
});
