import {
    testCaseDifferencePer100K as getTestCaseDifferencePer100K,
    winsorizedTests as getWinsorizedTests,
    testsPer100K as getTestsPer100K,
} from "../algorithms"

export const getMergedData = (rowData) => {
    const mergedData = {};

    if(rowData.tests && rowData.cases) {
        mergedData.testCaseDifferencePer100K = getTestCaseDifferencePer100K(rowData.tests, rowData.cases, rowData.population);
        mergedData.winsorizedTests = getWinsorizedTests(rowData.tests, rowData.cases);
        mergedData.winsorizedTestsPer100K = getTestsPer100K(mergedData.winsorizedTests, rowData.population);
    }

    return mergedData;
};
