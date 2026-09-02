import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";

let _subsetsList;
let _cachedSubsetsList;
export async function initSubsets() {
    const parseSubsets = (subsetsData) => {
        const subsets = {};
        subsetsData?.forEach(gameSets => {
            Object.values(gameSets).forEach(setID => {
                subsets[setID] = gameSets;
            })
        });
        return subsets;
    }

    const cachedSubsets = await config.cache.getData({ dataType: CACHE_TYPES.SUBSETS_LIST });
    const fileSubsets = await fetch(`./json/games/all-subsets.json`).then(resp => resp.json()).catch(() => []);

    _subsetsList = parseSubsets(fileSubsets);
    _cachedSubsetsList = parseSubsets(cachedSubsets);


    return _subsetsList;
}

export async function getSubsets(gameID) {
    if (!_subsetsList) {
        await initSubsets();
    }

    return _cachedSubsetsList[gameID] || _subsetsList[gameID] || { Main: gameID };
}