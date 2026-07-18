import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";
import { cheevoImageUrl } from "../raLinks.js";
import { filterBy, sortBy } from "../sortFilter.js";
import { getCheevoDifficulty } from "./cheevoDifficulty.js";
import { generateCheevosDisplayOrder } from "./displayOrder.js";
import { parseCheevosGenres } from "./genreParser.js";
import { parseCheevoLevels } from "./levelParser.js";

const normalizeAchievement = (achievement, gameData, savedGameData) => {
    const { config } = window;
    const gameID = gameData.ID;
    const { BadgeName, DateEarned, DateEarnedHardcore, NumAwardedHardcore, NumAwarded, TrueRatio, ID, Points, DisplayOrder } = achievement;
    const { NumDistinctPlayers } = gameData;

    const trend = 100 * NumAwardedHardcore / NumDistinctPlayers;

    const rateEarnedHardExact = (100 * NumAwardedHardcore / NumDistinctPlayers);
    const rateEarnedHardcore = rateEarnedHardExact < 10 ? `${rateEarnedHardExact.toFixed(1)}%` : `${rateEarnedHardExact.toFixed(0)}%`;

    const rateEarned = ~~(100 * NumAwarded / NumDistinctPlayers) + "%";

    const retroRatio = (TrueRatio / Math.max(1, Points)).toFixed(2);
    const cheevosCustomOrder = savedGameData.customOrder ?? {};
    gameData.Achievements[ID] = {
        ...achievement,
        gameID,
        totalPlayers: NumDistinctPlayers,
        isEarned: !!DateEarned,
        isEarnedHardcore: !!DateEarnedHardcore,
        rateEarned,
        rateEarnedHardcore,
        trend,
        retroRatio,
        difficulty: getCheevoDifficulty(trend, TrueRatio, NumAwardedHardcore),
        customOrder: cheevosCustomOrder[ID] ?? DisplayOrder,
        ...config.cheevosDB?.[ID] ?? {}, // Load edited props
    }
}
const parseCheevoGroups = (gameData) => {
    const cheevos = Object.values(gameData.Achievements);
    if (cheevos.length < 20) return;
    const groupRegex = /\[([^\]]+)\]/i;
    const groups = cheevos.reduce((groups, cheevo) => {
        const group = groupRegex.exec(cheevo.Title + cheevo.Description)?.[1];
        if (group && !/continue|difficult|password/i.test(group)) {
            cheevo.group = group;
            groups.add(group);
        }

        return groups;
    }, new Set());
    const groupsArray = [...groups].filter(group => cheevos.filter(c => c.group === group)?.length > 9);
    if (groupsArray.length > 1) {
        const etcGroup = "Other";
        groupsArray.push(etcGroup);
        cheevos.forEach(c => {
            if (!groupsArray.includes(c.group)) {
                const cheevoText = c.Title + c.Description;
                const groupTestRegex = (g) => new RegExp(`[\\(\\[]+${g}[\\]\\)]+`, "i")
                const matchGroup = groupsArray.find(g => groupTestRegex(g).test(cheevoText))
                c.group = matchGroup || etcGroup;
            }
        });
    }
    gameData.groups = [...groupsArray];
}
const addFocusTime = (gameData) => {
    const cheevos = Object.values(gameData?.Achievements ?? {}).sort((a, b) => sortBy.timeToUnlock(a, b, 1, true));
    cheevos.forEach((cheevo, index) => {
        let focusTime = 0;
        if (index === 0 || !cheevo.timeToUnlock) {
            focusTime = cheevo.timeToUnlock ?? 0;
        }
        else {
            const prevCheevo = cheevos[index - 1];
            focusTime = cheevo.timeToUnlock - prevCheevo.timeToUnlock;
        }
        cheevo.focusTime = focusTime;
    });

    const progressionCheevos = cheevos.filter(c => filterBy.progression(c));
    const hasAllSoftcoreTimes = !progressionCheevos.some(c => !c.timeToUnlockSoftcore);
    const hasAllHardcoreTimes = !progressionCheevos.some(c => !c.timeToUnlock);
    const timePropery = hasAllHardcoreTimes ? "timeToUnlock" : hasAllSoftcoreTimes ? "timeToUnlockSoftcore" : null;
    if (timePropery) {
        progressionCheevos.sort((a, b) => a[timePropery] - b[timePropery]).forEach((cheevo, index) => {
            let focusTime = 0;

            if (index === 0 || !cheevo[timePropery]) {
                focusTime = cheevo[timePropery] ?? 0;
            }
            else {
                const prevCheevo = progressionCheevos[index - 1];
                focusTime = cheevo[timePropery] - prevCheevo[timePropery];
            }
            cheevo.progressionFocusTime = focusTime;
        });
    }


}
export const normalizeCheevos = (gameData, savedGameData = {}) => {
    parseCheevosGenres(gameData);
    parseCheevoLevels(gameData);
    parseCheevoGroups(gameData)
    generateCheevosDisplayOrder(gameData);
    addFocusTime(gameData);
    Object.values(gameData.Achievements)
        .map(cheevo =>
            normalizeAchievement(cheevo, gameData, savedGameData));
}

export const getNormalizedAotW = ({ aotwData, username }) => {
    // debugger;
    const userEarned = aotwData.Unlocks
        .find(user => user.User.toLowerCase() === username?.toLowerCase()?.trim());
    const startDate = new Date(aotwData.StartAt);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    const endTime = endDate.getTime();
    return {
        ...aotwData.Achievement,
        ConsoleName: aotwData.Console.Title,
        ForumTopic: aotwData.ForumTopic.ID,
        GameID: aotwData.Game.ID,
        GameTitle: aotwData.Game.Title,
        StartAt: aotwData.StartAt,
        TotalPlayers: aotwData.TotalPlayers,
        UnlocksHardcoreCount: aotwData.UnlocksHardcoreCount,
        isEarned: !!userEarned,
        isEarnedHardcore: !!userEarned && !!userEarned.HardcoreMode,
        endTime
    }
}
