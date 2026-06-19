import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { filterBy, sortBy } from "./sortFilter.js";

let isHardMode = true;

const isBeaten = (gameData) => {
    return isHardMode ?
        gameData.progressionAward === GAME_AWARD_TYPES.BEATEN :
        gameData.progressionAward === GAME_AWARD_TYPES.BEATEN_SOFTCORE;
}

const getCheevos = (gameData) => {
    const cheevos = Object.values(gameData.AllAchievements ?? {});
    const progressionCheevos = [...cheevos]
        .filter(c => filterBy.progression(c))
        .sort((a, b) => sortBy.unlockRate(a, b))
        .sort((a, b) => sortBy.latest(a, b, -1, true));

    return progressionCheevos;
}
const getTTB = (gameData) => {
    return isHardMode ? gameData.timeToBeat || gameData.timeToBeatSoftcore : gameData.timeToBeatSoftcore;
}
const getLastUnlocked = (cheevos) => {
    return [...cheevos].reverse().find(c => isHardMode ? c.isEarnedHardcore : c.isEarned);
}
const getFocusCheevo = (cheevos) => {
    return cheevos.find(c => isHardMode ? !c.isEarnedHardcore : !c.isEarned);
}
const getCheevoTTU = (cheevo) => {
    return isHardMode ? cheevo.timeToUnlock || cheevo.timeToUnlockSoftcore : cheevo.timeToUnlockSoftcore;
}
const hasEnoughData = (cheevos) => {
    if (cheevos.length < 3) return false;

    let unlockedCount = 0;
    for (const cheevo of cheevos) {
        if (!cheevo.unlockTime) continue;
        if (isHardMode ? cheevo.isEarnedHardcore : cheevo.isEarned) {
            unlockedCount += 1;
            if (unlockedCount >= 3) return true;
        }
    }

    return false;
}
const calculateWeightedMultiplier = (cheevos) => {
    let mult;
    const validCheevos = cheevos
        .filter(c => c.unlockTime && getCheevoTTU(c, isHardMode))
        .sort((a, b) => a.unlockTime - b.unlockTime);

    const dataArray = validCheevos.map((c, index) => {
        const ttu = getCheevoTTU(c, isHardMode);
        if (index === 0) {
            let mult = c.unlockTime / ttu;
            mult = Math.min(mult, 1.5);
            return { ttu, mult, weight: ttu };
        }
        const prevCheevo = validCheevos[index - 1];
        const deltaTTU = ttu - getCheevoTTU(prevCheevo, isHardMode);
        if (deltaTTU <= 0) return null;
        const deltaRTTU = c.unlockTime - prevCheevo.unlockTime;
        const mult = deltaRTTU / deltaTTU;
        return { ttu, mult, weight: deltaTTU };
    }).filter(Boolean).filter(({ mult }) => mult > 0);

    const totalWeight = dataArray.reduce((sum, { weight }) => sum + weight, 0);
    const weightedMult = dataArray.reduce((sum, { mult, weight }) => sum + (mult * weight / totalWeight), 0);
    if (validCheevos.length >= 5) {
        const last = validCheevos.at(-1);
        const prev = validCheevos.at(-2);
        const deltaTTU = getCheevoTTU(last, isHardMode) - getCheevoTTU(prev, isHardMode);

        const recentMult =
            deltaTTU > 0
                ? (last.unlockTime - prev.unlockTime) / deltaTTU
                : weightedMult;
        mult = weightedMult * 0.7 + recentMult * 0.3
    }
    else {
        mult = weightedMult;
    }
    return mult;
}
const calculateEta = (timeToBeat, timeElapsed, lastUnlocked, multiplier) => {
    const remainingExpected = timeToBeat - getCheevoTTU(lastUnlocked);
    const playedSinceCheckpoint = timeElapsed - lastUnlocked.unlockTime;

    if (playedSinceCheckpoint > remainingExpected) {
        multiplier *= playedSinceCheckpoint / remainingExpected;
    }

    return remainingExpected * multiplier - playedSinceCheckpoint;
}


export const calcEtaTimeToBeat = (gameData, hardMode = true) => {
    isHardMode = hardMode;
    let mult = 1;
    let eta;
    if (isBeaten(gameData, isHardMode)) return 0;
    const cheevos = getCheevos(gameData);
    if (cheevos.length === 0) return null;

    const timeToBeat = getTTB(gameData, isHardMode);
    if (!timeToBeat) return null;

    const timeElapsed = gameData.TimePlayed || 0;

    const lastUnlocked = getLastUnlocked(cheevos, isHardMode);
    if (hasEnoughData(cheevos, isHardMode)) {
        mult = calculateWeightedMultiplier(cheevos, isHardMode);
        eta = calculateEta(timeToBeat, timeElapsed, lastUnlocked, mult);
    }
    else {
        const focusCheevo = getFocusCheevo(cheevos, isHardMode);
        const focusTTU = getCheevoTTU(focusCheevo, isHardMode);
        const focusMult = focusTTU ? (timeElapsed + 5 * 60) / focusTTU : 1;

        if (!lastUnlocked || !lastUnlocked.unlockTime) {
            mult = Math.max(focusMult, 1);
            eta = (timeToBeat) * mult - timeElapsed;
        }
        else {
            const lastUnlockedTTU = getCheevoTTU(lastUnlocked, isHardMode);
            const lastRTTU = lastUnlocked.unlockTime || (timeElapsed - 60);
            const lastUnlockedMult = lastUnlockedTTU ? lastRTTU / lastUnlockedTTU : 1;

            mult = Math.max(lastUnlockedMult, focusMult);
            eta = calculateEta(timeToBeat, timeElapsed, lastUnlocked, mult);
        }

    }
    if (eta < 5 * 60) eta = Math.max(Number(timeToBeat * 0.05), 5 * 60);
    return eta;
}