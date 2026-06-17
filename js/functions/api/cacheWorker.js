import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";

export function cacheWorker(cacheFileName) {
    let cachedData = {
        [CACHE_TYPES.GAME_TIMES]: {},
        [CACHE_TYPES.CHEEVO]: {}
    };

    const initialize = () => {
        const rawCache = localStorage.getItem(cacheFileName);
        if (!rawCache) {
            cachedData = {
                [CACHE_TYPES.GAME_TIMES]: {},
                [CACHE_TYPES.CHEEVO]: {}
            };
            return;
        }

        try {
            const cache = JSON.parse(rawCache) || {};
            cachedData = {
                [CACHE_TYPES.GAME_TIMES]: {},
                [CACHE_TYPES.CHEEVO]: {},
                ...cache
            };
            optimizeCache();
            console.warn(`Cache size: ~${JSON.stringify(cachedData).length * 2 / 1e6}Mb`);
        } catch (error) {
            console.warn(`Unable to parse cache for ${cacheFileName}:`, error);
            cachedData = {
                [CACHE_TYPES.GAME_TIMES]: {},
                [CACHE_TYPES.CHEEVO]: {}
            };
            saveCache();
        }
    };

    const optimizeCache = () => {
        const gameTimesCache = cachedData[CACHE_TYPES.GAME_TIMES];
        if (!gameTimesCache || typeof gameTimesCache !== "object") {
            return;
        }

        Object.entries(gameTimesCache).forEach(([ID, gameTimes]) => {
            if (!gameTimes?.cachedDate || Date.now() - gameTimes.cachedDate > 2 * 24 * 3600 * 1e3) {
                delete gameTimesCache[ID];
            }
        });

        saveCache();
    };

    const clear = () => {
        cachedData = {
            [CACHE_TYPES.GAME_TIMES]: {},
            [CACHE_TYPES.CHEEVO]: {}
        };
        saveCache();
    };

    const getData = ({ dataType, ID }) => {
        if ([CACHE_TYPES.GAME_TIMES, CACHE_TYPES.CHEEVO].includes(dataType)) {
            return cachedData[dataType]?.[ID];
        }
        return cachedData[dataType];
    };

    const clearProperty = ({ dataType }) => {
        if ([CACHE_TYPES.GAME_TIMES, CACHE_TYPES.CHEEVO].includes(dataType)) {
            cachedData[dataType] = {};
        } else {
            delete cachedData[dataType];
        }
        saveCache();
    };

    const push = ({ dataType, data }) => {
        if ([CACHE_TYPES.GAME_TIMES, CACHE_TYPES.CHEEVO].includes(dataType)) {
            if (!data || typeof data.ID === "undefined" || data.ID === null) {
                console.warn(`Cache push skipped for ${dataType}: missing data.ID`, data);
                return;
            }

            cachedData[dataType] ??= {};
            cachedData[dataType][data.ID] = {
                ...data,
                cachedDate: Date.now()
            };
        } else {
            cachedData[dataType] = data;
        }
        saveCache();
    };

    const saveCache = () => localStorage.setItem(cacheFileName, JSON.stringify(cachedData));

    initialize();
    return { initialize, clear, clearProperty, getData, push, optimizeCache };
}
