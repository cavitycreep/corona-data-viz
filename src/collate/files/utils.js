export const getKeyFromRow = (key, row) => {
    const result = {
        [key]: undefined
    };

    if(row && row[key]) {
        result[key] = row[key];
    }

    return result;
};

export const getKeysFromRow = (keys, row) => {
    return keys.map((key) => getKeyFromRow(key, row));
};
