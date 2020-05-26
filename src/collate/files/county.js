import {
    DATA_KEY_POPULATION,
} from "../../utils/constants";

export const getCountyData = (populationRow) => {
    const {
        STATE: stateFips,
        COUNTY: countyFips,
        CTYNAME: county,
        STNAME: state,
        [DATA_KEY_POPULATION]: populationString,
    } = populationRow;

    if(state === county) {
        return;
    }

    const fips = `${stateFips}${countyFips}`;
    const population = parseInt(populationString, 10);

    return {
        state,
        county,
        fips,
        population,
    };
};
