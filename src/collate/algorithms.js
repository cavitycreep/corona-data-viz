export const casesPer100K = (cases, pop) => (cases * 100000 / pop).toFixed(0);

export const testsPer100K = (tests, pop) => (tests * 100000 / pop).toFixed(0);

const casesPerTestPerPerson = (tests, cases, pop) => (tests * cases) / Math.pow(pop, 2);

const testCaseDifferencePerPerson = (tests, cases, pop) => ((tests - cases) / pop);

export const testCaseDifferencePer100K = (tests, cases, pop) => (testCaseDifferencePerPerson(tests, cases, pop) * 100000).toFixed(0);

export const winsorizedTests = (tests, cases) => cases > tests ? cases : tests;
