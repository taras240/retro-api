import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { filterBy, sortBy } from "./sortFilter.js";



const isBeaten = (gameData, isHardMode = true) => {
    return isHardMode ?
        gameData.progressionAward === GAME_AWARD_TYPES.BEATEN :
        gameData.progressionAward === GAME_AWARD_TYPES.BEATEN_SOFTCORE;
}

const getCheevos = (gameData) => {
    const cheevos = Object.values(gameData.AllAchievements ?? {});
    const progressionCheevos = cheevos
        .filter(c => filterBy.progression(c))
        .sort((a, b) => sortBy.unlockRate(a, b))
        .sort((a, b) => sortBy.latest(a, b, -1, true));

    return progressionCheevos;
}
const getTTB = (gameData, isHardMode) => {
    return isHardMode ? gameData.timeToBeat || gameData.timeToBeatSoftcore : gameData.timeToBeatSoftcore;
}
const getLastUnlocked = (cheevos, isHardMode) => {
    return [...cheevos].reverse().find(c => isHardMode ? c.isEarnedHardcore : c.isEarned);
}
const getFocusCheevo = (cheevos, isHardMode) => {
    return cheevos.find(c => isHardMode ? !c.isEarnedHardcore : !c.isEarned);
}
const getCheevoTTU = (cheevo, isHardMode) => {
    return isHardMode ? cheevo.timeToUnlock || cheevo.timeToUnlockSoftcore : cheevo.timeToUnlockSoftcore;
}
export const calcEtaTimeToBeat = (gameData, isHardMode = true) => {
    let mult = 1;
    if (isBeaten(gameData, isHardMode)) return 0;
    const cheevos = getCheevos(gameData);
    if (cheevos.length === 0) return null;

    const timeToBeat = getTTB(gameData, isHardMode);
    if (!timeToBeat) return null;

    const timeElapsed = gameData.TimePlayed || 0;

    const focusCheevo = getFocusCheevo(cheevos, isHardMode);
    const focusTTU = getCheevoTTU(focusCheevo, isHardMode);
    const focusMult = focusTTU ? (timeElapsed + 60) / focusTTU : 1;

    const lastUnlocked = getLastUnlocked(cheevos, isHardMode);
    if (!lastUnlocked) {
        mult = Math.max(focusMult, 1);
    }
    else {
        const lastUnlockedTTU = getCheevoTTU(lastUnlocked, isHardMode);
        const lastRTTU = lastUnlocked.unlockTime || (timeElapsed - 60);
        const lastUnlockedMult = lastUnlockedTTU ? lastRTTU / lastUnlockedTTU : 1;

        mult = Math.max(lastUnlockedMult, focusMult);
    }
    const realTTB = timeToBeat * mult;
    const eta = realTTB - timeElapsed;
    return eta < 0 ? Math.max(Number(timeToBeat * 0.05), 5 * 60) : eta;

}