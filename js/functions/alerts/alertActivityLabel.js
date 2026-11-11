import { ALERT_TYPES } from "../../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";

export const getAlertActivityLabel = (data, lang) => {
    if (data.type === ALERT_TYPES.CHEEVO) return lang.alertAchievementUnlocked;
    if (data.type === ALERT_TYPES.GAME) return lang.alertGameLaunched;

    if (data.type === ALERT_TYPES.AWARD) {
        switch (data.award) {
            case GAME_AWARD_TYPES.MASTERED:
                return lang.alertGameMastered;
            case GAME_AWARD_TYPES.COMPLETED:
                return lang.alertGameCompleted;
            case GAME_AWARD_TYPES.BEATEN:
                return lang.alertGameBeaten;
            case GAME_AWARD_TYPES.BEATEN_SOFTCORE:
                return lang.alertGameBeatenSoftcore;
            default:
                console.warn("Unknown game award type for Xbox toast:", data.award);
                return lang.alertGameActivity;
        }
    }

    console.warn("Unknown alert type for Xbox toast:", data.type);
    return lang.alertGameActivity;
};