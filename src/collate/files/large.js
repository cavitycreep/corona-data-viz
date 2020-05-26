const {
    DATA_KEY_LARGE,
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

const epoch = (date) => Math.round(new Date(date).getTime() / 1000);

export const getLargeData = (largeRows, {county, state, fips}) => {
    const countyWithoutExtras = getCountyWithoutExtras(county);
    const rowExpr = `(${fips}|(${countyWithoutExtras}(\\s(${PIPED_COUNTY_EXTRAS}))?))`
    const rowRegex = new RegExp(rowExpr, "i");
    let latestRowByDate = null;
    let latestDate = 0;
    largeRows.forEach((row, i) => {
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
