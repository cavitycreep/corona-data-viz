import {
    casesPer100K as getCasesPer100K,
} from "../algorithms"
import {
    DATA_KEY_CASES,
    DATA_KEY_P_CASES,
} from "../../utils/constants";

export const getCaseData = (caseRows, {fips, population}) => {
    const caseData = {};
    const casesRow = caseRows.find((row) => row.fips === fips);

    if(casesRow) {
        const {
            [DATA_KEY_P_CASES]: probableCases,
            [DATA_KEY_CASES]: cases,
        } = casesRow;

        caseData.cases = parseInt(cases || 0, 10) + parseInt(probableCases || 0, 10);
        caseData.casesPer100K = getCasesPer100K(caseData.cases, population);
    }

    return caseData;
};
