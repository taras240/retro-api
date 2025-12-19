import { cheevoImageUrl } from "../raLinks.js";
import { getCheevoDifficulty } from "./cheevoDifficulty.js";
import { generateCheevosDisplayOrder } from "./displayOrder.js";
import { parseCheevosGenres } from "./genreParser.js";
import { parseCheevoLevels } from "./levelParser.js";

const normalizeAchievement = (achievement, gameData, cheevosDB) => {
    const { BadgeName, DateEarned, DateEarnedHardcore, NumAwardedHardcore, NumAwarded, TrueRatio, ID, Points } = achievement;
    const { NumDistinctPlayers } = gameData;

    const trend = 100 * NumAwardedHardcore / NumDistinctPlayers;

    const rateEarnedHardExact = (100 * NumAwardedHardcore / NumDistinctPlayers);
    const rateEarnedHardcore = rateEarnedHardExact < 10 ? `${rateEarnedHardExact.toFixed(1)}%` : `${rateEarnedHardExact.toFixed(0)}%`;

    const rateEarned = ~~(100 * NumAwarded / NumDistinctPlayers) + "%";

    const retroRatio = (TrueRatio / Math.max(1, Points)).toFixed(2);

    gameData.Achievements[ID] = {
        ...achievement,
        totalPlayers: NumDistinctPlayers,
        isEarned: !!DateEarned,
        isHardcoreEarned: !!DateEarnedHardcore,
        prevSrc: cheevoImageUrl(achievement),
        rateEarned,
        rateEarnedHardcore,
        trend,
        retroRatio,
        difficulty: getCheevoDifficulty(trend, TrueRatio, NumAwardedHardcore),
        ...cheevosDB[ID], // Load edited props
    }
}
export const normalizeCheevos = (gameData, cheevosDB = {}) => {
    parseCheevosGenres(gameData);
    parseCheevoLevels(gameData);

    generateCheevosDisplayOrder(gameData);

    Object.values(gameData.Achievements)
        .map(cheevo =>
            normalizeAchievement(cheevo, gameData, cheevosDB));
}
export const getNormalizedAotW = ({ AotwData, userName }) => {
    console.log(AotwData);
    debugger;
    const userEarned = AotwData.Unlocks
        .find(user => user.User.toLowerCase() === userName?.toLowerCase()?.trim())
    return {
        ...AotwData.Achievement,
        ConsoleName: AotwData.Console.Title,
        ForumTopic: AotwData.ForumTopic.ID,
        GameID: AotwData.Game.ID,
        GameTitle: AotwData.Game.Title,
        StartAt: AotwData.StartAt,
        TotalPlayers: AotwData.TotalPlayers,
        UnlocksHardcoreCount: AotwData.UnlocksHardcoreCount,
        isEarned: !!userEarned,
        isEarnedHardcore: !!userEarned && !!userEarned.HardcoreMode
    }
}
