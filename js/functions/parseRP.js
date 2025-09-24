import { RPLevelNames } from "../enums/levelNames.js";
import { watcher } from "../script.js";
import { replaceNumberWords } from "./numbersParser.js";

export const parseCurrentGameLevel = (richPresence) => {

    const levelNamesString = RPLevelNames.join("|");

    const checkLevel = (inputStr, zoneNames) => {
        const regexLevel = new RegExp(`(${levelNamesString})(\\s|-\\s*|:\\s*)((\\d+-\\d+)|(\\d+))`, 'gi');
        const regexZoneName = new RegExp(`\\b${zoneNames?.join("\\b|\\b")}\\b`, 'gi');
        const match = inputStr.match(regexZoneName);
        const zoneIndex = match ? watcher.GAME_DATA.zones?.indexOf(match[0]) : undefined;
        const levelMatches = inputStr.matchAll(regexLevel);

        let level;
        // console.log(levelMatches);
        // if (!levelMatches) return;
        for (const match of levelMatches) {
            level = match[3]?.replace('-', '.');
        }

        if (zoneIndex >= 0) {
            level = `${zoneIndex + 1}${level?.includes(".") ? "." + level : ""}`;
        }
        return Number(level);
    };

    const inputStr = replaceNumberWords(richPresence);

    const levelNumber = checkLevel(inputStr, watcher.GAME_DATA.zones);
    return Number.isFinite(levelNumber) ? levelNumber : false;

}
