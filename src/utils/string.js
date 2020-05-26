import {
    LEGEND_CONTENT_LENGTH,
} from "./constants";

export const forLegend = (content, n) => {
    const trimmed = content.replace(/(\s{2,}|\t|\n)/g, " ");
    const words = trimmed.split(" ");
    const split = [];
    while(words.length) {
        let line = "";

        while(line.length < LEGEND_CONTENT_LENGTH) {
            const word = words.shift();

            if(word) {
                line += `${word} `;
            } else {
                break;
            }
        }

        split.push(line);
    }

    return split;
}
