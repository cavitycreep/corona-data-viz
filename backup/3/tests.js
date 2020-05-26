import { maxBy } from "lodash";

import {
    DATA_KEY_TESTS,
    DATA_KEY_LARGE,
    PIPED_COUNTY_EXTRAS,
} from "../../../constants";

const getData = (row, key) => {
    const data = {};

    if(row) {
        const {
            [key]: tests,
        } = row;

        if(tests) {
            data.tests = parseInt(tests, 10);
        }
    }

    return data;
};

const getCountyWithoutExtras = (county) => {
    const countyRegex = new RegExp(`\\s(${PIPED_COUNTY_EXTRAS})`, "gi");
    return county.replace(countyRegex, "").trim();
};

const epoch = (date) => Math.round(new Date(date).getTime() / 1000);

export const getLargeData = (largeRows, {county, state, fips}) => {
    const countyWithoutExtras = getCountyWithoutExtras(county);
    const rowExpr = `${fips}|(${countyWithoutExtras}(\\s(${PIPED_COUNTY_EXTRAS}))?)`
    const rowRegex = new RegExp(rowExpr, "i");
    let latestRowByDate = null;
    let latestDate = 0;
    largeRows.forEach((row) => {
        if(row.state.toLowerCase() === state.toLowerCase() && row.county.match(rowRegex)) {
            const rowDate = epoch(row.date);
            if(rowDate > latestDate) {
                latestDate = rowDate;
                latestRowByDate = row;
            }
        }
    });
    return getData(latestRowByDate, DATA_KEY_LARGE);
};

export const getLargeDataByDate = (largeRows, populationRow) => {
    const result = [];

    if(populationRow
    && populationRow.county
    && populationRow.state
    && populationRow.fips) {
        const countyWithoutExtras = getCountyWithoutExtras(county);
        const rowExpr = `${fips}|(${countyWithoutExtras}(\\s(${PIPED_COUNTY_EXTRAS}))?)`
        const rowRegex = new RegExp(rowExpr, "i");
        result.push(...largeRows.filter((row) =>
            (
                row.state
                    && row.county
                    && row.state.toLowerCase() === state.toLowerCase()
                    && row.county.match(rowRegex)
            )
        ));
    }

    return result;
}

export const getTestData = (testRows, {county, state, fips}) => {
    const countyWithoutExtras = getCountyWithoutExtras(county);
    const testsRow = testRows.find(({label}) => {
        const labelRegex = new RegExp(/([A-Z][\w]+)([A-Z][\w]+)/, "g");
        const labelFixed = label.replace(labelRegex, "$1 $2");

        const rowExpr = `${fips}|(${countyWithoutExtras}(\\s(${PIPED_COUNTY_EXTRAS}))?,\\s?${state})`
        const rowRegex = new RegExp(rowExpr, "i");
        const rowMatches = labelFixed.match(rowRegex) || label.match(rowRegex);

        return rowMatches;
    });

    return getData(testsRow, DATA_KEY_TESTS);
};
