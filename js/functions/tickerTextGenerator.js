import { difficultyNames } from "../enums/difficulty.js";
import { config, configData, ui, watcher } from "../script.js";
import { secondsToBadgeString } from "./time.js";

export function generateMagicLineText() {
    const stats = {
        ...watcher.GAME_DATA?.unlockData,
        user: configData.targetUser || config.USER_NAME,
        ...Object.fromEntries(
            Object.entries(watcher.GAME_DATA).filter(([key, value]) =>
                value === null || typeof value !== 'object'
            )
        ),
    }
    const space = `&nbsp;&nbsp;&middot;&nbsp;&nbsp;
    `;
    const cheevosURL = `retrocheevos.vercel.app${space}`;
    const gameTitle = `
        ${stats.user} is playing ${stats.Title}${space}`;

    const gameInfo = watcher.GAME_DATA ? [
        stats.ConsoleName && `Console: ${stats.ConsoleName},`,
        stats.Released && `Released: ${stats.Released},`,
        stats.Developer && `Developer: ${stats.Developer},`,
        stats.Publisher && `Publisher: ${stats.Publisher},`,
        stats.Genre && `Genre: ${stats.Genre},`,
        stats.NumDistinctPlayersCasual && `Total RA Players: ${stats.NumDistinctPlayersCasual},`,
        stats.beatenRate && `Beaten Rate: ${stats.beatenRate}% (${stats.beatenRateSoftcore}%),`,
        stats.masteryRate && `Mastery Rate: ${stats.masteryRate}% (${stats.completedRate}%),`,
        stats.retroRatio && `Retro Ratio: ${stats.retroRatio},`,
        stats.timeToBeat && `Time to beat: ${secondsToBadgeString(stats.timeToBeat)}`,
        stats.timeToMaster && `Time to master: ${secondsToBadgeString(stats.timeToMaster)}`,
        stats.gameDifficulty && `Game Difficulty: ${difficultyNames[stats.gameDifficulty]} (${difficultyNames[stats.masteryDifficulty]})`,
        space
    ].join("&nbsp;") : "Game ERROR";
    const gameStatsInfo = [
        "Completion Progress: ",
        `${stats.hardcore.count > 0 ? stats.hardcore.count + "/" : ""}${stats.softcore.count > stats.hardcore.count ? (stats.softcore.count - stats.hardcore.count) + "/" : ""}${stats.NumAchievements} achievements, `,

        `${stats.hardcore.points > 0 ? stats.hardcore.points + "/" : ""}${stats.softcore.points > stats.hardcore.points ? (stats.softcore.points - stats.hardcore.points) + "/" : ""}${stats.totalPoints} points, `,

        `${stats.hardcore.retropoints ? stats.hardcore.retropoints + "/" : ""}${stats.totalRetropoints} retropoints${space}`
    ].join(" ");

    const isHard = !!ui.statusPanel?.deltaStats?.deltaPoints;
    const hasSessionData = !!ui.statusPanel?.deltaStats;
    const dPoints = isHard ?
        `${ui.statusPanel.deltaStats.deltaPoints} hardpoints and ${ui.statusPanel.deltaStats.deltaRetroPoints} retropoints` :
        `and ${ui.statusPanel?.deltaStats?.deltaSoftPoints} softpoints`

    const sessionInfo = hasSessionData ?
        `Session statistics: +${ui.statusPanel.initialStats.cheevosCount} achievements, ${dPoints}${space}` :
        "";

    const userData = ui.statusPanel?.currentStats || ui.statusPanel?.initialStats;
    const userInfo = userData ?
        `User statistics: position ${userData?.rank} in RA rank system (TOP${userData?.percentile.toFixed(2)}%), 
        ${userData?.points} total hardpoints, 
        ${userData?.retroPoints} total retropoints and
        ${userData?.softPoints} total softpoints
        ${space}` :
        "";
    return gameTitle + gameInfo + gameStatsInfo + sessionInfo + userInfo + cheevosURL;
}