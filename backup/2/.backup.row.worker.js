"use strict"

const { getCountyData } = require("../src/utils/collate/files/county");
const { getTestData, getLargeData } = require("../src/utils/collate/files/tests");
const { getCaseData } = require("../src/utils/collate/files/cases");
const { getMergedData } = require("../src/utils/collate/files/merged");
const { decodeUTF16String } = require("../src/utils/utf16.js");

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    try {
        if(event.data.populationRow) {
            const {
                data: {
                    populationRow,
                    buffers: [
                        largeRowsBuffer,
                        testRowsBuffer,
                        caseRowsBuffer,
                    ]
                }
            } = event;

            const countyData = getCountyData(populationRow);

            if(countyData) {
                const largeRowsView = new Uint16Array(largeRowsBuffer);
                const testRowsView = new Uint16Array(testRowsBuffer);
                const caseRowsView = new Uint16Array(caseRowsBuffer);

                const largeRowsString = decodeUTF16String(largeRowsView);
                const testRowsString = decodeUTF16String(testRowsView);
                const caseRowsString = decodeUTF16String(caseRowsView);

                const largeRows = JSON.parse(largeRowsString);
                const testRows = JSON.parse(testRowsString);
                const caseRows = JSON.parse(caseRowsString);

                const largeData = getLargeData(largeRows, countyData);
                const caseData = getCaseData(caseRows, countyData);
                const testData = getTestData(testRows, countyData);
                const mergedData = getMergedData(countyData, testData, caseData);

                self.postMessage({ // eslint-disable-line no-restricted-globals
                    status: "done",
                    value: {
                        ...countyData,
                        ...largeData,
                        ...caseData,
                        ...testData,
                        ...mergedData,
                    },
                });
            }
        }
    } catch(e) {
        console.error("Error in RowWorker", e);
    }
});
