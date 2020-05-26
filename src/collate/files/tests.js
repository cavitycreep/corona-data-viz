const {
    DATA_KEY_TESTS,
    PIPED_COUNTY_EXTRAS,
} = require("../../utils/constants");

const getData = (row, key) => {
    let data = null;

    if(row) {
        const {
            [key]: tests,
        } = row;

        if(tests) {
            data = {
                tests: parseInt(tests, 10)
            }
        }
    }

    return data;
};

const getCountyWithoutExtras = (county) => {
    const countyRegex = new RegExp(`\\s(${PIPED_COUNTY_EXTRAS})`, "gi");
    return county.replace(countyRegex, "").trim();
};

export const getTestData = (testRows, {county, state, fips}) => {
    const countyWithoutExtras = getCountyWithoutExtras(county);
    const testsRow = testRows.find(({label}) => {
        const labelRegex = new RegExp(/([A-Z][\w]+)([A-Z][\w]+)/, "g");
        const labelFixed = label.replace(labelRegex, "$1 $2");

        const rowExpr = `(${fips}|(${countyWithoutExtras}(\\s(${PIPED_COUNTY_EXTRAS}))?,\\s?${state}))`
        const rowRegex = new RegExp(rowExpr, "i");
        const rowMatches = labelFixed.match(rowRegex) || label.match(rowRegex);

        return rowMatches;
    });

    return getData(testsRow, DATA_KEY_TESTS);
};
