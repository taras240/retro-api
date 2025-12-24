import { difficultyNames } from "../enums/difficulty.js";
import { config, configData, ui, watcher } from "../script.js";
import { secondsToBadgeString } from "./time.js";

export function generateMagicLineText(gameData, sessionData, userData) {
    console.log(userData)
    const space = `&nbsp;&nbsp;&middot;&nbsp;&nbsp;`;
    if (!gameData) return `no game data${space}`
    const stats = {
        ...gameData?.unlockData,
        user: configData.targetUser || config.USER_NAME,
        ...Object.fromEntries(
            Object.entries(gameData)?.filter(([key, value]) =>
                value === null || typeof value !== 'object'
            )
        ),
    }

    const cheevosURL = `retrocheevos.vercel.app${space}`;
    const gameTitle = `
        ${stats.user} is playing ${stats.Title}${space}`;

    const gameInfo = gameData ? [
        stats.ConsoleName && `Console: ${stats.ConsoleName}`,
        stats.Released && `Released: ${stats.Released}`,
        stats.Developer && `Developer: ${stats.Developer}`,
        stats.Publisher && `Publisher: ${stats.Publisher}`,
        stats.Genre && `Genre: ${stats.Genre}`,
        stats.NumDistinctPlayersCasual && `Total RA Players: ${stats.NumDistinctPlayersCasual}`,
        stats.beatenRate && `Beaten Rate: ${stats.beatenRate}% (${stats.beatenRateSoftcore}%)`,
        stats.masteryRate && `Mastery Rate: ${stats.masteryRate}% (${stats.completedRate}%)`,
        stats.retroRatio && `Retro Ratio: ${stats.retroRatio}`,
        stats.timeToBeat && `Time to beat: ${secondsToBadgeString(stats.timeToBeat)}`,
        stats.timeToMaster && `Time to master: ${secondsToBadgeString(stats.timeToMaster)}`,
        stats.gameDifficulty && `Game Difficulty: ${difficultyNames[stats.gameDifficulty]} (${difficultyNames[stats.masteryDifficulty]})`
    ].filter(Boolean).join(",&nbsp;") + space : "Game ERROR";

    const generateGameStat = (hardValue, softValue, totalValue, text) => {
        softValue -= hardValue;
        const value = (hardValue && softValue) ? `${hardValue}/${softValue}` :
            hardValue || softValue;
        return text.replace("{1}", value + `/${totalValue}`)
    }
    const hasGameProgress = stats.softcore.count || stats.hardcore.count;
    const gameStatsInfo = "Completion Progress: " + [
        generateGameStat(stats.hardcore.count, stats.softcore.count, stats.NumAchievements, `{1} achievements`),

        generateGameStat(stats.hardcore.points, stats.softcore.points, stats.totalPoints, "{1} points"),

        generateGameStat(stats.hardcore.retropoints, stats.hardcore.retropoints, stats.totalPoints, "{1} retropoints"),

    ].join(",&nbsp;") + space;

    // const isHard = !!ui.statusPanel?.deltaStats?.deltaPoints;
    const hasSessionData = sessionData.cheevos || sessionData.cheevosSoftcore

    const sessionInfo = hasSessionData ? `Session statistics: ` + [
        sessionData.cheevos && `+${sessionData.cheevos} cheevos`,
        sessionData.cheevosSoftcore && `+${sessionData.cheevosSoftcore} softcore cheevos`,
        sessionData.points && `+${sessionData.points} points`,
        sessionData.retropoints && `+${sessionData.retropoints} retropoints`,
        sessionData.softpoints && `+${sessionData.softpoints} softpoints`,
    ].filter(Boolean).join(",&nbsp;") + space : "";

    const userInfo = (userData?.points || userData?.softpoints) ? `User statistics: ` + [
        userData?.rank && `position ${userData.rank} in RA rank system (TOP${userData?.percentile.toFixed(2)}%)`,
        userData?.points && `${userData?.points} total hardpoints`,
        userData?.retropoints && `${userData?.retropoints} total retropoints`,
        userData?.softpoints && `${userData?.softpoints} total softpoints`].filter(Boolean).join(",&nbsp;") + space :
        "";
    const line = gameTitle + gameInfo + gameStatsInfo + sessionInfo + userInfo + cheevosURL;

    return line;
}