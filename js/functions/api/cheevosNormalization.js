import { cheevoImageUrl } from "../raLinks.js";
import { filterBy, sortBy } from "../sortFilter.js";
import { getCheevoDifficulty } from "./cheevoDifficulty.js";
import { generateCheevosDisplayOrder } from "./displayOrder.js";
import { parseCheevosGenres } from "./genreParser.js";
import { parseCheevoLevels } from "./levelParser.js";

const normalizeAchievement = (achievement, gameData, savedGameData) => {
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
        prevSrc: cheevoImageUrl(achievement),
        rateEarned,
        rateEarnedHardcore,
        trend,
        retroRatio,
        difficulty: getCheevoDifficulty(trend, TrueRatio, NumAwardedHardcore),
        customOrder: cheevosCustomOrder[ID] ?? DisplayOrder
        // ...cheevosDB[ID], // Load edited props
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
    const progressionCheevos = cheevos.filter(c => filterBy.progression(c));
    progressionCheevos.forEach((cheevo, index) => {
        let focusTime = 0;
        if (index === 0 || !cheevo.timeToUnlock) {
            focusTime = cheevo.timeToUnlockSoftcore ?? 0;
        }
        else {
            const prevCheevo = progressionCheevos[index - 1];
            focusTime = cheevo.timeToUnlockSoftcore - prevCheevo.timeToUnlockSoftcore;
        }
        cheevo.progressionFocusTime = focusTime;
    });
    cheevos.forEach((cheevo, index) => {
        let focusTime = 0;
        if (index === 0 || !cheevo.timeToUnlock) {
            focusTime = cheevo.timeToUnlockSoftcore ?? 0;
        }
        else {
            const prevCheevo = cheevos[index - 1];
            focusTime = cheevo.timeToUnlockSoftcore - prevCheevo.timeToUnlockSoftcore;
        }
        cheevo.focusTime = focusTime;
    })
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

export const getNormalizedAotW = ({ AotwData, userName }) => {
    console.log(AotwData);
    // debugger;
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
