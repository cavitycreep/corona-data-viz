export const DATA_KEY_POPULATION = "POPESTIMATE2018"
export const DATA_KEY_CASES = "cases";
export const DATA_KEY_P_CASES = "probable_cases";
export const DATA_KEY_TESTS = "totalTestedCases";
export const DATA_KEY_LARGE = "tested";

export const COUNTY_EXTRAS = [
    "Municipality",
    "Census Area",
    "Borough",
    "County",
    "Parish",
];
export const PIPED_COUNTY_EXTRAS = COUNTY_EXTRAS.join("|");

export const BATCH_SIZE = 1000;

export const WORKER_POOL_SIZE = 10;
export const WORKER_POOL_RETRY_TIMEOUT = 1000;
export const WORKER_POOL_WAIT_TIMEOUT = 3000;

export const BATCH_WORKER_NAME = "workers.batch";
export const CASES_WORKER_NAME = "workers.cases";
export const COLLATE_WORKER_NAME = "workers.collate";
export const LARGE_WORKER_NAME = "workers.large";
export const TESTS_WORKER_NAME = "workers.tests";

export const LEGEND_CONTENT_LENGTH = 24;
