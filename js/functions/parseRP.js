import { RPLevelNames } from "../enums/levelNames.js";
import { watcher } from "../script.js";
import { replaceNumberWords } from "./numbersParser.js";

const parseNumber = (levelString) => {
    if (!levelString || !/\d/.test(levelString)) return;
    const str = String(levelString);
    const normalized = str.replace(/-/, ".").replace(/[^\d.]|\.$/g, "");
    return parseFloat(normalized);
};
const findPreferredLevel = (matchesArray) => {
    if (!matchesArray || !matchesArray.length) return;
    return matchesArray?.find(l => /-/.test(l)) ?? matchesArray[0];
};

export const parseCurrentGameLevel = (richPresence) => {

    const levelNamesString = RPLevelNames.join("|");

    const checkLevel = (inputStr, zoneNames) => {
        const regexLevel = new RegExp(`(${levelNamesString})([\\s-:]*)(\\d+[-\\d]*\\w{0,1})`, 'gi');

        const levelMatches = inputStr.match(regexLevel);
        let level = findPreferredLevel(levelMatches);

        if (zoneNames?.length) {
            const regexZoneName = new RegExp(`\\b${zoneNames?.join("\\b|\\b")}\\b`, 'gi');
            const match = inputStr.match(regexZoneName);
            const zoneIndex = match ? watcher.GAME_DATA.zones?.indexOf(match[0]) : -1;

            if (zoneIndex >= 0) {
                level = `${zoneIndex + 1}.${level ? parseNumber(level) : ""}`;
            }
        }
        return parseNumber(level);
    };

    const inputStr = replaceNumberWords(richPresence);

    const levelNumber = checkLevel(inputStr, watcher.GAME_DATA.zones);
    return Number.isFinite(levelNumber) ? levelNumber : false;

}
