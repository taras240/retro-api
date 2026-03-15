import { ALERT_TYPES } from "../../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";

export function getAwardAlerts({ gameData }) {
    let awardsArray = [];
    const subsetsData = Object.values(gameData.subsetsData ?? {});
    const gameSets = [gameData, ...subsetsData];
    const { TimePlayed } = gameData;
    gameSets.forEach(gameSet => {

        if (gameSet.award !== GAME_AWARD_TYPES.MASTERED
            && gameSet.unlockData.hardcore.count === gameSet.NumAchievements) {
            gameSet.award = GAME_AWARD_TYPES.MASTERED;
            awardsArray.push({
                type: ALERT_TYPES.AWARD,
                award: GAME_AWARD_TYPES.MASTERED,
                value: { ...structuredClone(gameSet), TimePlayed }
            });
        }
        else if (!gameSet.award && gameSet.unlockData.softcore.count === gameSet.NumAchievements) {
            gameSet.award = GAME_AWARD_TYPES.COMPLETED;
            awardsArray.push({
                type: ALERT_TYPES.AWARD,
                award: GAME_AWARD_TYPES.COMPLETED,
                value: structuredClone(gameSet)
            })
        }
        if (gameSet.progressionSteps > 0 &&
            gameSet.progressionAward !== GAME_AWARD_TYPES.BEATEN &&
            gameSet.unlockData.hardcore.progressionCount >= gameSet.progressionSteps) {
            gameSet.progressionAward = GAME_AWARD_TYPES.BEATEN;
            awardsArray.push({
                type: ALERT_TYPES.AWARD,
                award: GAME_AWARD_TYPES.BEATEN,
                value: structuredClone(gameSet)
            })
        }
        else if (gameSet.progressionSteps > 0 &&
            !gameSet.progressionAward &&
            gameSet.unlockData.softcore.progressionCount >= gameSet.progressionSteps) {
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