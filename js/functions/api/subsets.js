import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";

let _subsetsList;

export async function initSubsets() {
    if (_subsetsList) {
        return _subsetsList;
    }

    const cachedSubsets = [];
    const fileSubsets = await fetch(`./json/games/all-subsets.json`).then(resp => resp.json());

    const subsets = cachedSubsets.length >= fileSubsets.length ? cachedSubsets : fileSubsets;
    _subsetsList = {};
    subsets.forEach(gameSets => {
        Object.values(gameSets).forEach(setID => {
            _subsetsList[setID] = gameSets;
        })
    });

    return _subsetsList;
}

export async function getSubsets(gameID) {
    if (!_subsetsList) {
        await initSubsets();
    }

    return _subsetsList[gameID] ?? { Main: gameID };
}