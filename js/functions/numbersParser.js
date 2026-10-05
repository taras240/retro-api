import { numberMapping } from "../enums/numberMapping.js";

export function replaceNumberWords(text) {

    text = text.replaceAll(/(\d)(st|nd|rd|th)/gi, (_, p1) => p1);
    const regex = new RegExp(
        Object
            .keys(numberMapping)
            .map(num => `\\b${num}\\b`)
            .join("|"), 'gi');

    text = text.replace(regex, match => numberMapping[match.toLowerCase().trim()]);
    return text;
}