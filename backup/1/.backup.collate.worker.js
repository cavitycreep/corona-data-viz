"use strict"

import { csv, tsv } from "d3-fetch";

const { getCountyData } = require("../src/utils/collate/files/county");
const { getTestData, getLargeData } = require("../src/utils/collate/files/tests");
const { getCaseData } = require("../src/utils/collate/files/cases");
const { getMergedData } = require("../src/utils/collate/files/merged");

const batchMap = require("../src/utils/batchMap").default;

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

self.addEventListener("message", async (event) => { // eslint-disable-line no-restricted-globals
    if(event.data.start) {
        console.log("Parsing files");

        const {
            populationRows,
            largeRows,
            testRows,
            caseRows,
        } = await parseFiles();

        console.log("Merging counties");

        const mergedCounties = batchMap(populationRows, (populationRow) => {
            const countyData = getCountyData(populationRow);

            if(countyData) {
                const largeData = getLargeData(largeRows, countyData);
                const caseData = getCaseData(caseRows, countyData);
                const testData = getTestData(testRows, countyData);
                const mergedData = getMergedData(countyData, testData, caseData);

                return {
                    ...countyData,
                    ...largeData,
                    ...caseData,
                    ...testData,
                    ...mergedData,
                };
            }
        });

        console.log("Done");

        self.postMessage({ // eslint-disable-line no-restricted-globals
            status: "done",
            value: mergedCounties.filter(Boolean),
        });
    }
});
