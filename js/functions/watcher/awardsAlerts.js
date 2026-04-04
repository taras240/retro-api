import { ALERT_TYPES } from "../../enums/alerts.js";
import { CHEEVO_TYPES } from "../../enums/cheevoTypes.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";

export function getAwardAlerts({ gameData }) {
    let awardsArray = [];
    const subsetsData = Object.values(gameData.subsetsData ?? {});
    const gameSets = [gameData, ...subsetsData];
    const { TimePlayed } = gameData;

    const hasMissedProgressionSoftcore = () => Object.values(gameData.AllAchievements)
        .filter(c => c.Type === CHEEVO_TYPES.PROGRESSION && !c.isEarned).length;
    const hasMissedProgression = () => Object.values(gameData.AllAchievements)
        .filter(c => c.Type === CHEEVO_TYPES.PROGRESSION && !c.isEarnedHardcore).length;
    gameSets.forEach(gameSet => {
        const hardcoreUnlocks = gameSet.unlockData.hardcore.count;
        const softcoreUnlocks = gameSet.unlockData.softcore.count;
        const cheevosCount = gameSet.NumAchievements;

        if (gameSet.award !== GAME_AWARD_TYPES.MASTERED
            && hardcoreUnlocks === cheevosCount) {
            gameSet.award = GAME_AWARD_TYPES.MASTERED;
            awardsArray.push({
                type: ALERT_TYPES.AWARD,
                award: GAME_AWARD_TYPES.MASTERED,
                value: { ...structuredClone(gameSet), TimePlayed }
            });
        }
        else if (!gameSet.award && softcoreUnlocks === cheevosCount) {
            gameSet.award = GAME_AWARD_TYPES.COMPLETED;
            awardsArray.push({
                type: ALERT_TYPES.AWARD,
                award: GAME_AWARD_TYPES.COMPLETED,
                value: structuredClone(gameSet)
            })
        }

        const progressionSteps = gameSet.progressionSteps;
        const unlockedStepsHardcore = gameSet.unlockData.hardcore.progressionCount;
        const unlockedStepsSoftcore = gameSet.unlockData.softcore.progressionCount;

        if (gameSet.progressionSteps > 0 &&
            gameSet.progressionAward !== GAME_AWARD_TYPES.BEATEN &&
            unlockedStepsHardcore >= progressionSteps &&
            !hasMissedProgression()) {
            gameSet.progressionAward = GAME_AWARD_TYPES.BEATEN;
            awardsArray.push({
                type: ALERT_TYPES.AWARD,
                award: GAME_AWARD_TYPES.BEATEN,
                value: structuredClone(gameSet)
            })
        }
        else if (gameSet.progressionSteps > 0 &&
            !gameSet.progressionAward &&
            unlockedStepsSoftcore >= progressionSteps &&
            !hasMissedProgressionSoftcore()) {
            gameSet.progressionAward = GAME_AWARD_TYPES.BEATEN_SOFTCORE;
            awardsArray.push({
                type: ALERT_TYPES.AWARD,
                award: GAME_AWARD_TYPES.BEATEN_SOFTCORE,
                value: structuredClone(gameSet)
            })
        }
    })
    const alerts = awardsArray.map(award => {
        award.value.TimePlayed = TimePlayed;
        return award;
    });
    return alerts;
}