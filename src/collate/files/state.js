import states from "us-state-codes";

import {
    DATA_KEY_POPULATION,
} from "../../utils/constants";

export const getStateData = (populationRow) => {
    const {
        STNAME: state,
        [DATA_KEY_POPULATION]: populationString,
    } = populationRow;

    const population = parseInt(populationString, 10);
    const stateCode = states.getStateCodeByStateName(state);

    return {
        state,
        stateCode,
        population,
    };
};

export const getStateTestData = (testRows, {stateCode}) => {
    const result = {};
    const testsRow = testRows.find(({state}) => state === stateCode);

    if(testsRow) {
        result.tests = parseInt(testsRow.totalTestResults, 10);
    }

    return result;
};
