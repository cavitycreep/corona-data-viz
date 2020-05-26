const {
    LEGEND_CONTENT_LENGTH,
} = require("./constants");

export const forLegend = (content) => {
    const trimmed = content.replace(/(\s{2,}|\t|\n)/g, " ");
    const words = trimmed.split(" ");
    const split = [];
    while(words.length) {
        let line = "";

        while(true) {
            const word = words.shift();

            if(word && line.length + word.length <= LEGEND_CONTENT_LENGTH) {
                line += `${word} `;
            } else if(word) {
                words.unshift(word);
                break;
            } else {
                break;
            }
        }

        split.push(line);
    }

    return split;
}
