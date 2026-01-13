import { CHEEVO_TYPES } from "../../enums/cheevoTypes.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";
import { addReleaseBadges } from "../releaseTypeParser.js";
import { sortBy, sortMethods } from "../sortFilter.js";
import { normalizeCheevos } from "./cheevosNormalization.js";



let cheevosArray = [];
const addPointsData = (gameData) => {
    const pointsData = cheevosArray.reduce((data, cheevo) => {
        data.totalRetropoints += cheevo.TrueRatio;
        data.totalPoints += cheevo.Points;

        const update = (d) => {
            d.count++;
            d.points += cheevo.Points;
            d.retropoints += cheevo.TrueRatio;
            [CHEEVO_TYPES.PROGRESSION, CHEEVO_TYPES.WIN].includes(cheevo.Type) && d.progressionCount++;
        };

        if (cheevo.DateEarnedHardcore) update(data.unlockData.hardcore);
        if (cheevo.DateEarned) update(data.unlockData.softcore);

        return data;
    }, {
        totalRetropoints: 0,
        totalPoints: 0,
        unlockData: {
            hardcore: { count: 0, points: 0, retropoints: 0, progressionCount: 0 },
            softcore: { count: 0, points: 0, retropoints: 0, progressionCount: 0 },
        }
    });

    const retroRatio = ~~(pointsData.totalRetropoints / pointsData.totalPoints * 100) / 100;
    Object.assign(gameData, pointsData, { retroRatio });
}

const addCompletionData = (gameData) => {
    const progressionArray = cheevosArray.filter(c => c.Type === CHEEVO_TYPES.PROGRESSION);
    const hasProgression = progressionArray.length > 0;
    const hasWinCondition = !!cheevosArray.find(c => c.Type === CHEEVO_TYPES.WIN);
    const winConditionArray = hasWinCondition ? cheevosArray.filter(c => c.Type === CHEEVO_TYPES.WIN) : [];

    const totalRealPlayers = Math.max(...cheevosArray.map(c => c.NumAwarded));
    const hasZeroPoints = cheevosArray.filter(c => !c.DateEarnedHardcore && c.Points === 0).length > 0;
    const progressionSteps = progressionArray.length + (hasWinCondition && 1);
    const masteryDifficulty = Math.max(...cheevosArray.map(c => c.difficulty));

    const gameDifficulty = !hasWinCondition ?
        Math.max(...progressionArray.map(c => c.difficulty)) :
        Math.min(...winConditionArray.map(c => c.difficulty));


    const beatenCountData = () => {
        let beatenCount, beatenCountSoftcore;
        if (hasWinCondition) {
            beatenCount = Math.max(...winConditionArray
                .map(c => c.NumAwardedHardcore));
            beatenCountSoftcore = Math.max(...winConditionArray
                .map(c => c.NumAwarded))
        } else {
            beatenCount = Math.min(...progressionArray
                .map(c => c.NumAwardedHardcore));
            beatenCountSoftcore = Math.min(...progressionArray
                .map(c => c.NumAwarded))
        }
        const beatenRate = ~~(10000 * beatenCount / totalRealPlayers) / 100;
        const beatenRateSoftcore = ~~(10000 * beatenCountSoftcore / totalRealPlayers) / 100;

        return { beatenCount, beatenCountSoftcore, beatenRateSoftcore, beatenRate }
    }
    const masteredCountData = () => {
        const masteredCount = Math.min(...cheevosArray.map(c => c.NumAwardedHardcore));
        const completedCount = Math.min(...cheevosArray.map(c => c.NumAwarded));
        const masteryRate = ~~(10000 * masteredCount / totalRealPlayers) / 100
        const completedRate = ~~(10000 * completedCount / totalRealPlayers) / 100;
        return { masteredCount, completedCount, masteryRate, completedRate }
    }
    const userAward = () => {
        const isMastered = cheevosArray.length > 0 && cheevosArray.filter(cheevo => !cheevo.DateEarnedHardcore).length === 0;
        const isCompleted = cheevosArray.length > 0 && cheevosArray.filter(cheevo => !cheevo.DateEarned).length === 0;
        const award = isMastered ? GAME_AWARD_TYPES.MASTERED :
            isCompleted ? GAME_AWARD_TYPES.COMPLETED : null;
        return { award }
    }
    const userProgressionAward = () => {
        let progressionAward = null;

        if (!hasProgression && !hasWinCondition) return { progressionAward };

        const checkForBeatenAward = (isSoftcore = false) => {
            const unlockProperty = isSoftcore ? "DateEarned" : "DateEarnedHardcore";

            const isProgressionUnlocked = progressionArray.filter(c => !c[unlockProperty]).length === 0;
            const isWinConditionUnlocked = winConditionArray.length === 0 || winConditionArray.filter(c => c[unlockProperty]).length > 0;

            return isProgressionUnlocked && isWinConditionUnlocked
        }

        progressionAward = checkForBeatenAward(false) ? GAME_AWARD_TYPES.BEATEN :
            checkForBeatenAward(true) ? GAME_AWARD_TYPES.BEATEN_SOFTCORE : null

        return { progressionAward }
    }
    Object.assign(
        gameData,
        {
            totalRealPlayers,
            hasZeroPoints,
            masteryDifficulty,
            gameDifficulty,
            progressionSteps,
        },
        userProgressionAward(),
        userAward(),
        masteredCountData(),
        beatenCountData(),
    )
}
const addSessions = (gameData) => {
    const sessions = cheevosArray
        .filter(c => c.DateEarned)
        .sort((a, b) => sortBy.latest(a, b, -1))
        .reduce((groups, cheevo) => {
            const findGroup = (date, groups) => {
                const group = groups.find(g => {
                    return date - g.date < 12 * 60 * 60 * 1000
                }); //*12 hours
                return group;
            }
            const unlockDate = new Date(cheevo.DateEarnedHardcore || cheevo.DateEarned);
            let group = findGroup(unlockDate, groups);
            if (group) {
                group.date = unlockDate;
                group.cheevos.push(cheevo);
            }
            else {
                group = {
                    date: unlockDate,
                    cheevos: [cheevo],
                    startDate: unlockDate
                }
                groups.push(group);
            }
            return groups;
        }, [])//{date,cheevos,startDate}
        .map(({ startDate, cheevos, date }) => {
            return {
                unixTime: startDate.getTime(),
                startDate: startDate.toLocaleDateString(),
                endDate: date.toLocaleDateString(),
                cheevos: cheevos.map(({ ID }) => ID),
                cheevosCount: cheevos.length,
                cheevosCountHardcore: cheevos.filter(c => c.DateEarnedHardcore).length
            }
        })

    Object.assign(gameData, { sessions })
}
const addSavedData = (gameData, savedData = {}) => {
    Object.assign(
        gameData,
        { TimePlayed: 0 },
        savedData
    )
}
export const normalizeGameData = (gameData, gamesDB = {}, cheevosDB = {}) => {
    if (!gameData) return;
    normalizeCheevos(gameData, cheevosDB);

    cheevosArray = Object.values(gameData?.Achievements ?? []);

    gameData.ParentGameID ??= gameData.ID;
    addReleaseBadges(gameData);
    addPointsData(gameData);
    addCompletionData(gameData);
    addSessions(gameData);
    addSavedData(gameData, gamesDB[gameData.ID]);
    gameData.UserTotalPlaytime && (gameData.TimePlayed = gameData.UserTotalPlaytime);
}
export const mergeWithTimesData = (gameData, timesData) => {
    const mergeCheevoData = (gameData, cheevoData, cheevoTimes) => {
        if (!cheevoTimes) return;
        gameData.Achievements[cheevoData.ID] = ({
            ...cheevoData,
            timeToUnlock: cheevoTimes.MedianTimeToUnlockHardcore,
            timeToUnlockSoftcore: cheevoTimes.MedianTimeToUnlock,
        })
    }
    const mergeGameData = (gameData, timesData) => {
        if (!timesData || !timesData.ID) {
            return gameData;
        }
        gameData = {
            ...gameData,
            timeToBeat: timesData.MedianTimeToBeatHardcore,
            timeToMaster: timesData.MedianTimeToMaster,
        }
        Object.values(gameData.Achievements)
            .map(cheevo =>
                mergeCheevoData(gameData, cheevo, timesData?.Achievements[cheevo.ID]));
        return gameData;
    }
    if (!timesData) return gameData;
    return mergeGameData(gameData, timesData);
}