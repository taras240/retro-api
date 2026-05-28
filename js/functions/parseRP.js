import { RPLevelNames } from "../enums/levelNames.js";
import { replaceNumberWords } from "./numbersParser.js";

const parseNumber = (levelString) => {
    if (!levelString || !/\d/.test(levelString)) return;
    const str = String(levelString);
    const normalized = str.replace(/-/, ".").replace(/[^\d.]|\.$/g, "");
    return parseFloat(normalized);
};
const findPreferredLevel = (matchesArray) => {
    if (!matchesArray || !matchesArray.length) return;
    const onLevelMatch = [...matchesArray].reverse().find(match => /\b(?:on|in)\b/i.test(match));
    if (onLevelMatch) return onLevelMatch;
    return matchesArray?.find(l => /-/.test(l)) ?? matchesArray[0];
};

export const parseCurrentGameLevel = (richPresence, gameData) => {
    if (!gameData || !richPresence) return;
    const levelNamesString = RPLevelNames.join("|");

    const checkLevel = (inputStr, zoneNames) => {
        const regexLevel = new RegExp(
            `\\b(?:on|in)?\\s*(?:the\\s+)?(?:` +
            `(${levelNamesString})\\s*[-:]?\\s*(\\d+(?:-\\d+)?\\w?)` + // stage 2
            `|` +
            `(\\d+(?:-\\d+)?\\w?)\\s*(${levelNamesString})` + // 2nd stage
            `)`,
            'gi'
        );
        const levelMatches = inputStr.match(regexLevel);
        let level = findPreferredLevel(levelMatches);

        if (zoneNames?.length) {
            const regexZoneName = new RegExp(`\\b${zoneNames?.join("\\b|\\b")}\\b`, 'gi');
            const match = inputStr.match(regexZoneName);
            const zoneIndex = match ? gameData.zones?.indexOf(match[0]) : -1;

            if (zoneIndex >= 0) {
                level = `${zoneIndex + 1}.${level ? parseNumber(level) : ""}`;
            }
        }
        return parseNumber(level);
    };

    const inputStr = replaceNumberWords(richPresence);

    const levelNumber = checkLevel(inputStr, gameData.zones);
    return Number.isFinite(levelNumber) ? levelNumber : false;

}
