import { ALERT_TYPES } from "../../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";
import { cheevoImageUrl, cheevoUrl, gameImageUrl, gameUrl } from "../../functions/raLinks.js";

const awardBadges = {
    [ALERT_TYPES.GAME]: { title: "launched", color: "lime" },
    [ALERT_TYPES.CHEEVO]: { title: "unlocked", color: "gold" },
    [GAME_AWARD_TYPES.BEATEN]: { title: "beaten", color: "orange" },
    [GAME_AWARD_TYPES.BEATEN_SOFTCORE]: { title: "beaten*", color: "darkorange" },
    [GAME_AWARD_TYPES.MASTERED]: { title: "mastered", color: "violet" },
    [GAME_AWARD_TYPES.COMPLETED]: { title: "completed", color: "yellow" },
};

const awardCountProperties = {
    [GAME_AWARD_TYPES.MASTERED]: "masteredCount",
    [GAME_AWARD_TYPES.COMPLETED]: "completedCount",
    [GAME_AWARD_TYPES.BEATEN]: "beatenCount",
    [GAME_AWARD_TYPES.BEATEN_SOFTCORE]: "beatenCountSoftcore",
};

export function createAlertData(alert, currentGame) {
    const { type, award, value } = alert;
    const isCheevo = type === ALERT_TYPES.CHEEVO;
    const isAward = type === ALERT_TYPES.AWARD;
    const game = value.ImageIngame || value.ImageBoxArt ? value : currentGame;
    const badgeType = type === ALERT_TYPES.AWARD ? award : type;
    const badge = awardBadges[badgeType];
    let details = {};
    let meta = value.ConsoleName;

    if (isCheevo) {
        meta = value.Description;
        details = {
            unlockRate: value.rateEarnedHardcore,
            points: value.Points,
        };
    }
    else if (isAward) {
        const isSoftcore = [GAME_AWARD_TYPES.COMPLETED, GAME_AWARD_TYPES.BEATEN_SOFTCORE].includes(award);
        const pointsMode = isSoftcore ? "softcore" : "hardcore";
        const pointsEarned = value.unlockData?.[pointsMode]?.points ??
            (award === GAME_AWARD_TYPES.MASTERED ? value.totalPoints : null);

        details = {
            unlockedCount: value[awardCountProperties[award]],
            playerCount: value.totalRealPlayers ?? value.NumDistinctPlayers,
            pointsEarned,
        };
    }
    else if (type === ALERT_TYPES.GAME) {
        details = {
            released: value.Released,
            developer: value.Developer,
            publisher: value.Publisher,
        };
    }

    const data = {
        imageUrl: isCheevo ? cheevoImageUrl(value) : gameImageUrl(value.ImageIcon),
        titleUrl: isCheevo ? cheevoUrl(value) : gameUrl(value.ID ?? value.GameID),
        title: value.Title,
        meta,
        backgroundImageUrl: game?.ImageIngame
            ? gameImageUrl(game.ImageIngame)
            : game?.ImageBoxArt
                ? gameImageUrl(game.ImageBoxArt)
                : null,
    };

    return {
        ...data,
        type,
        award,
        badge: badge ?? { title: "", color: "var(--accent-color)" },
        details,
    };
}
