import { raEdpoints } from "../../enums/RAEndpoints.js";
import { request } from "../http.js";
import { mergeWithTimesData, normalizeGameData } from "../../functions/api/gameDataNormalization.js";
import { getNormalizedTimes } from "../../functions/api/gameTimesData.js";

/* params
    y	Yes	Your web API key.
    u	Yes	The target username or ULID.
    g	Yes	The target game ID.
    a	Set to "1" if user award metadata should b
*/
export async function getGameInfoAndUserProgress({ username, apiKey, gameID, timesData, config, subsets, isSubset = false }) {
    let gameData = await request(raEdpoints.gameInfoAndProgress, {
        y: apiKey,
        u: username,
        g: gameID,
    });
    if (timesData) {
        gameData = mergeWithTimesData(gameData, timesData);
    }
    // Normalize game data 
    normalizeGameData(gameData, config?.gamesDB);
    if (!isSubset) {
        gameData.availableSubsets = subsets;
        await addSubsetsData({ parentGameData: gameData, config, subsets, username, apiKey, });
    }
    return gameData;
}

async function addSubsetsData({ parentGameData, config, subsets, username, apiKey, }) {
    parentGameData.AllAchievements ??= { ...parentGameData.Achievements };
    parentGameData.subsetsData ??= {};

    if (!parentGameData.visibleSubsets?.length) return parentGameData;

    for (let subsetID of parentGameData.visibleSubsets) {
        const subsetData = await getGameInfoAndUserProgress({
            username,
            apiKey,
            gameID: subsetID,
            isSubset: true,
            withTimesData: false,
            config,
            subsets
        });
        parentGameData.subsetsData[subsetID] = subsetData;
        Object.assign(parentGameData.AllAchievements, subsetData.Achievements);
    }
}


// y	Yes	Your web API key.
// i	Yes	The target game ID.
// h   1 to prefer players with more hardcore unlocks than non-hardcore unlocks.
export async function getGameTimesInfo({ apiKey, gameID, preferHardcore }) {
    const timesData = await request(raEdpoints.gameTimesInfo, {
        y: apiKey,
        i: gameID,
        h: preferHardcore ? 1 : 0,
    });
    const normalizedData = getNormalizedTimes(timesData);
    return normalizedData;
}