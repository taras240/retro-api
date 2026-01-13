import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";

export function cacheWorker(cacheFileName) {
    let cachedData = { gameTimes: {} };
    const initialize = () => {
        let cache = JSON.parse(localStorage.getItem(cacheFileName)) || {
            [CACHE_TYPES.GAME_TIMES]: {}
        };
        cachedData = cache;
    }
    const clear = () => {
        cachedData = {
            [CACHE_TYPES.GAME_TIMES]: {}
        }
        localStorage.setItem(cacheFileName, JSON.stringify(cachedData));
    }
    const getData = ({ dataType, ID }) => {
        if (dataType === CACHE_TYPES.GAME_TIMES) {
            return cachedData[dataType]?.[ID];
        }
        return cachedData[dataType];

    }
    const push = ({ dataType, data }) => {
        if (dataType === CACHE_TYPES.GAME_TIMES) {
            cachedData[dataType] ??= {};
            cachedData[dataType][data.ID] = data;
        } else {
            cachedData[dataType] = data;
        }
        localStorage.setItem(cacheFileName, JSON.stringify(cachedData));
    }
    initialize();
    return { initialize, clear, getData, push };
}
