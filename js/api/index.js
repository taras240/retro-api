import { CACHE_TYPES } from "../enums/cacheDataTypes.js";
import { cachedCompletionProgress } from "../functions/api/completionProgress.js";
import { groupSubsets } from "../functions/api/groupSubsets.js";
import { getSubsets } from "../functions/api/subsets.js";
import { delay } from "../functions/delay.js";
import { calcEtaTimeToBeat } from "../functions/estimatedTime.js";
import { config, configData } from "../script.js";
import { call } from "./api.js";


const getUsername = (username) => username || configData.targetUser || config.USER_NAME;

export const raapi = {
    getUserProfile({ username }) {
        return call('getUserProfile', {
            username: getUsername(username),
            apiKey: config.API_KEY,
        });
    },
    getUserSummary({ username, games = 3, cheevos = 5 }) {
        return call('getUserSummary', {
            username: username || configData.targetUser || config.USER_NAME,
            games,
            cheevos,
            apiKey: config.API_KEY
        });
    },
    async getWantToPlayGamesList({ username, count = 50, offset = 0 }) {
        const wtpList = await call('getWantToPlayGamesList', {
            apiKey: config.API_KEY,
            username: config.USER_NAME,// getUsername(username),
            count,
            offset,
        });
        return wtpList || [];
    },

    getRecentlyPlayedGames({ username, count = 50 }) {
        return call('getRecentlyPlayedGames', {
            apiKey: config.API_KEY,
            username: getUsername(username),
            count,
        });
    },
    getComments({ id, offset = 0, count = 200, type = 2, sort = "-submitted" }) {
        return call("getComments", {
            apiKey: config.API_KEY,
            id: getUsername(id),
            type,
            offset,
            count,
            sort
        })
    },
    getCheevoComments({ cheevoID }) {
        return call("getCheevoComments", {
            apiKey: config.API_KEY,
            cheevoID,
        })
    },
    getGameComments({ gameID }) {
        return call("getGameComments", {
            apiKey: config.API_KEY,
            gameID,
        })
    },
    getUserComments({ username }) {
        return call("getUserComments", {
            apiKey: config.API_KEY,
            gameID: username,
        })
    },
    async getGameInfoAndUserProgress({ username, gameID, withTimesData = false }) {
        const subsets = await getSubsets(gameID);
        let timesData;
        if (withTimesData) {
            timesData = await raapi.getGameTimesInfo({ gameID });
        }
        const gameData = await call("getGameInfoAndUserProgress", {
            apiKey: config.API_KEY,
            username: getUsername(username),
            gameID,
            config: { gamesDB: config.gamesDB },
            subsets,
            timesData,
        });
        const estimatedTimeToBeat = calcEtaTimeToBeat(gameData);
        gameData.eta = estimatedTimeToBeat;
        return gameData;
    },
    async getGameTimesInfo({ gameID, preferHardcore = false }) {
        const cachedData = config.cache.getData({ dataType: CACHE_TYPES.GAME_TIMES, ID: gameID });
        if (!cachedData?.cachedDate || (Date.now() - cachedData.cachedDate > 3600e3 * 24 * 7)) {
            const timesData = await call("getGameTimesInfo", {
                apiKey: config.API_KEY,
                gameID,
                preferHardcore
            });
            config.cache.push({
                dataType: CACHE_TYPES.GAME_TIMES,
                data: timesData
            });
            return timesData;
        }
        return cachedData;
    },
    getUserRecentAchievements({ username, minutes = 60 }) {
        return call("getUserRecentAchievements", {
            apiKey: config.API_KEY,
            username: getUsername(username),
            minutes
        })
    },
    async getAotW({ username }) {
        const cachedData = config.cache.getData({ dataType: CACHE_TYPES.AOTW });
        if (cachedData?.endTime && cachedData.endTime - Date.now() > 0) {
            return cachedData;
        }
        const aotwData = await call("getAotW", {
            apiKey: config.API_KEY,
            username,
        });
        config.cache.push({
            dataType: CACHE_TYPES.AOTW,
            data: aotwData
        });
        return aotwData;

    },
    async getUserCompletionProgress({ username, count, offset = 0 } = {}) {
        if (!count) return cachedCompletionProgress(getUsername(username));
        return call('getUserCompletionProgress', {
            apiKey: config.API_KEY,
            username: getUsername(username),
            count: count || 500,
            offset,
            cachedData: config.cache.getData({ dataType: CACHE_TYPES.COMPLETION_PROGRESS }),
        })
    },
    getUserAwards({ username }) {
        return call("getUserAwards", {
            apiKey: config.API_KEY,
            username: getUsername(username),
        })
    },

    getConsolesList({ activeOnly = true }) {
        return call("getConsolesList", {
            apiKey: config.API_KEY,
            activeOnly,
        })
    },
    getConsoleGameList({ ID }) {
        return call("getConsoleGameList", {
            apiKey: config.API_KEY,
            ID,
        })
    },
    async getSubsetsList({ onProgressChange }) {
        const consoles = await raapi.getConsolesList({});
        const gamesList = [];
        for (const platform of consoles) {
            onProgressChange?.(platform);
            const games = await raapi.getConsoleGameList(platform);
            const consoleSubsets = groupSubsets(games);
            gamesList.push(...consoleSubsets);
        }
        config.cache.push({ dataType: CACHE_TYPES.SUBSETS_LIST, data: gamesList });
        return gamesList;
    }
};