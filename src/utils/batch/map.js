const { BATCH_SIZE } = require("../constants");

export default (rows, map) => {
    const data = [];

    for(let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = [];

        // console.log((i / rows.length * 100).toFixed(0));

        if(i > rows.length - BATCH_SIZE - 1) {
            batch.push(...rows.slice(i));
        } else {
            batch.push(...rows.slice(i, i + BATCH_SIZE));
        }

        data.push(...batch.map(map));
    }

    return data;
};
