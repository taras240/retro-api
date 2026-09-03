import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";

export function cacheWorker(cacheFileName) {
    let cachedData = {
        [CACHE_TYPES.GAME_TIMES]: {},
        [CACHE_TYPES.CHEEVO]: {},
        [CACHE_TYPES.UNLOCKS]: []
    };

    const initialize = () => {
        const rawCache = localStorage.getItem(cacheFileName);
        if (!rawCache) {
            cachedData = {
                [CACHE_TYPES.GAME_TIMES]: {},
                [CACHE_TYPES.CHEEVO]: {},
                [CACHE_TYPES.UNLOCKS]: [],
            };
            return;
        }

        try {
            const cache = JSON.parse(rawCache) || {};
            cachedData = {
                [CACHE_TYPES.GAME_TIMES]: {},
                [CACHE_TYPES.CHEEVO]: {},
                [CACHE_TYPES.UNLOCKS]: [],
                ...cache
            };
            if (cachedData[CACHE_TYPES.UNLOCKS]?.unlocks) {
                cachedData[CACHE_TYPES.UNLOCKS] = Object.values(cachedData[CACHE_TYPES.UNLOCKS].unlocks);
            }
            optimizeCache();
            console.warn(`Cache size: ~${JSON.stringify(cachedData).length * 2 / 1e6}Mb`);
        } catch (error) {
            console.warn(`Unable to parse cache for ${cacheFileName}:`, error);
            cachedData = {
                [CACHE_TYPES.GAME_TIMES]: {},
                [CACHE_TYPES.CHEEVO]: {},
                [CACHE_TYPES.UNLOCKS]: [],
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
            [CACHE_TYPES.CHEEVO]: {},
            [CACHE_TYPES.UNLOCKS]: [],
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
        } else if (dataType === CACHE_TYPES.UNLOCKS) {
            cachedData[dataType] = [];
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
export function dbCacheWorker() {
    let db;
    let initPromise;

    const DB_NAME = "retrocheevos";
    const DB_VERSION = 2;
    const collectionTypes = [CACHE_TYPES.GAME_TIMES, CACHE_TYPES.CHEEVO];
    const singleTypes = [CACHE_TYPES.AOTW, CACHE_TYPES.COMPLETION_PROGRESS, CACHE_TYPES.SUBSETS_LIST, CACHE_TYPES.UNLOCKS];

    const _migrateFromLocalStorage = (db, transaction) => {
        const rawCache = localStorage.getItem("raApiCache");
        if (!rawCache) return;

        try {
            const cache = JSON.parse(rawCache) || {};
            for (const dataType of [CACHE_TYPES.GAME_TIMES, CACHE_TYPES.CHEEVO]) {
                for (const data of Object.values(cache[dataType] || {})) {
                    if (data?.ID !== undefined && data?.ID !== null) {
                        transaction.objectStore(dataType).put(data);
                    }
                }
            }

            // for (const data of Object.values(cache[CACHE_TYPES.UNLOCKS]?.unlocks || {})) {
            //     if (data?.ID !== undefined && data?.ID !== null) {
            //         transaction.objectStore(CACHE_TYPES.UNLOCKS).put(data);
            //     }
            // }

            for (const dataType of singleTypes) {
                if (cache[dataType] !== undefined) {
                    const value = dataType === CACHE_TYPES.UNLOCKS && cache[dataType]?.unlocks
                        ? Object.values(cache[dataType].unlocks)
                        : cache[dataType];
                    transaction.objectStore(dataType).put(value, "main");
                }
            }

            transaction.oncomplete = () => localStorage.removeItem("raApiCache");
            console.log('Migrated cache "raApiCache" from localStorage');
        } catch (error) {
            console.warn('Unable to migrate cache "raApiCache":', error);
        }
    };

    const _request = (request) => new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    const initialize = () => {
        if (db) {
            return Promise.resolve(db);
        }

        if (initPromise) {
            return initPromise;
        }

        initPromise = new Promise((resolve, reject) => {

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("meta")) {
                    db.createObjectStore("meta", {
                        keyPath: "dataType"
                    });
                }
                if (!db.objectStoreNames.contains(CACHE_TYPES.GAME_TIMES)) {
                    db.createObjectStore(CACHE_TYPES.GAME_TIMES, {
                        keyPath: "ID"
                    });
                }

                if (!db.objectStoreNames.contains(CACHE_TYPES.CHEEVO)) {
                    db.createObjectStore(CACHE_TYPES.CHEEVO, {
                        keyPath: "ID"
                    });
                }

                if (!db.objectStoreNames.contains(CACHE_TYPES.UNLOCKS)) {
                    db.createObjectStore(CACHE_TYPES.UNLOCKS);
                }
                if (db.objectStoreNames.contains(CACHE_TYPES.SUBSETS_LIST)) {
                    const subsetsStore = event.target.transaction.objectStore(CACHE_TYPES.SUBSETS_LIST);
                    if (subsetsStore.keyPath !== null) {
                        db.deleteObjectStore(CACHE_TYPES.SUBSETS_LIST);
                    }
                }
                if (!db.objectStoreNames.contains(CACHE_TYPES.SUBSETS_LIST)) {
                    db.createObjectStore(CACHE_TYPES.SUBSETS_LIST, {
                    });
                }

                if (!db.objectStoreNames.contains(CACHE_TYPES.AOTW)) {
                    db.createObjectStore(CACHE_TYPES.AOTW);
                }

                if (!db.objectStoreNames.contains(CACHE_TYPES.COMPLETION_PROGRESS)) {
                    db.createObjectStore(CACHE_TYPES.COMPLETION_PROGRESS);
                }

                _migrateFromLocalStorage(db, event.target.transaction);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
        return initPromise;
    };

    const get = async (dataType, key) => {
        await initialize();
        const transaction = db.transaction(dataType, "readonly");
        const store = transaction.objectStore(dataType);
        if (collectionTypes.includes(dataType) && key === undefined) {
            return _request(store.getAll());
        }
        return _request(store.get(key ?? "main"));
    };

    const getData = async ({ dataType, ID } = {}) => {
        if (collectionTypes.includes(dataType) && ID !== undefined && ID !== null) {
            return get(dataType, ID);
        }
        if (dataType === CACHE_TYPES.UNLOCKS) {
            const data = await get(dataType);
            if (data?.unlocks && !Array.isArray(data)) {
                const unlocks = Object.values(data.unlocks);
                await put(dataType, unlocks);
                return unlocks;
            }
            return data;
        }
        return get(dataType);
    };

    const put = async (dataType, value, key = "main") => {
        await initialize();
        const transaction = db.transaction(dataType, "readwrite");
        const store = transaction.objectStore(dataType);
        const request = store.keyPath === null ? store.put(value, key) : store.put(value);
        return _request(request);
    };

    const push = async ({ dataType, data } = {}) => {
        if (collectionTypes.includes(dataType)) {
            if (dataType !== CACHE_TYPES.UNLOCKS && (data?.ID === undefined || data?.ID === null)) {
                console.warn(`Cache push skipped for ${dataType}: missing data.ID`, data);
                return;
            }
            if (dataType === CACHE_TYPES.UNLOCKS && data?.unlocks) {
                await clearProperty({ dataType });
                await Promise.all(Object.values(data.unlocks).map(item => put(dataType, item)));
                return;
            }
            if (dataType === CACHE_TYPES.UNLOCKS && (data?.ID === undefined || data?.ID === null)) {
                console.warn(`Cache push skipped for ${dataType}: missing data.ID`, data);
                return;
            }
        }
        return put(dataType, data);
    };

    const clearProperty = async ({ dataType } = {}) => {
        await initialize();
        const transaction = db.transaction(dataType, "readwrite");
        return _request(transaction.objectStore(dataType).clear());
    };

    const clear = async () => {
        await initialize();
        await Promise.all([...collectionTypes, ...singleTypes].map(dataType => clearProperty({ dataType })));
    };

    const optimizeCache = async () => {
        const records = await get(CACHE_TYPES.GAME_TIMES, undefined);
        await Promise.all(records
            .filter(data => !data?.cachedDate || Date.now() - data.cachedDate > 2 * 24 * 3600 * 1e3)
            .map(data => deleteData(CACHE_TYPES.GAME_TIMES, data.ID)));
    };

    const deleteData = async (dataType, key) => {
        await initialize();
        const transaction = db.transaction(dataType, "readwrite");
        return _request(transaction.objectStore(dataType).delete(key));
    };

    return { initialize, get, getData, push, put, clear, clearProperty, optimizeCache };
}
