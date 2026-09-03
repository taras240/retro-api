import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";
import { filterUnlocksByDateRange, getUniqueUnlocks, normalizeTimeStamp } from "../../functions/api/unlocksRange.js";
import { call } from "../api.js";

export async function unlocksByDateRange({ apiKey, username, fromDate, toDate, cache }) {
    fromDate = normalizeTimeStamp(fromDate);
    toDate = normalizeTimeStamp(toDate);

    if (fromDate >= toDate) {
        return [];
    }


    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------

    const getMeta = async () => {
        return await cache.get("meta", CACHE_TYPES.UNLOCKS) || {
            dataType: CACHE_TYPES.UNLOCKS,
        };
    };

    const getCachedUnlocks = async () => {
        return await cache.get(CACHE_TYPES.UNLOCKS) || [];
    };

    // ---------------------------------------------------------
    // API
    // ---------------------------------------------------------

    const getFromApi = async (apiFromDate, apiToDate) => {
        const cheevos = await call(
            "getUserAchievementsByDateRange",
            {
                apiKey,
                username,
                fromDate: apiFromDate,
                toDate: apiToDate,
            }
        );
        return cheevos;
    };

    // ---------------------------------------------------------
    // Cache
    // ---------------------------------------------------------

    let meta = await getMeta();
    let cachedUnlocks = await getCachedUnlocks();

    const cachedRange = meta;

    const hasCachedRange =
        cachedRange?.from != null &&
        cachedRange?.to != null;

    let cacheFrom;
    let cacheTo;

    if (hasCachedRange) {
        cacheFrom = normalizeTimeStamp(cachedRange.from);
        cacheTo = normalizeTimeStamp(cachedRange.to);
    }

    const result = [];

    // ---------------------------------------------------------
    // 1. Якщо весь запит вже є в кеші
    // ---------------------------------------------------------

    if (
        hasCachedRange &&
        fromDate >= cacheFrom &&
        toDate <= cacheTo
    ) {
        return getUniqueUnlocks(
            filterUnlocksByDateRange(cachedUnlocks, fromDate, toDate)
        );
    }

    // ---------------------------------------------------------
    // 2. Якщо кешу немає
    // ---------------------------------------------------------

    if (!hasCachedRange) {
        const apiUnlocks = await getFromApi(
            fromDate,
            toDate
        );

        // API успішно перевірив весь діапазон.
        if (apiUnlocks.length || fromDate < toDate) {
            cachedUnlocks = getUniqueUnlocks([
                ...cachedUnlocks,
                ...apiUnlocks
            ]);

            meta = {
                dataType: CACHE_TYPES.UNLOCKS,
                from: fromDate,
                to: toDate,
            };

            // Зберігаємо unlocks у кеш
            await cache.put(CACHE_TYPES.UNLOCKS, cachedUnlocks);

            // Оновлюємо meta
            await cache.put("meta", meta);
        }

        return getUniqueUnlocks(
            filterUnlocksByDateRange(apiUnlocks, fromDate, toDate)
        );
    }

    // ---------------------------------------------------------
    // 3. Додаємо існуючу кешовану частину
    // ---------------------------------------------------------

    result.push(
        ...cachedUnlocks.filter(item => {
            const date = normalizeTimeStamp(item.Date);

            return (
                date >= fromDate &&
                date < toDate &&
                date >= cacheFrom &&
                date < cacheTo
            );
        })
    );

    // ---------------------------------------------------------
    // 4. Запит частини ДО кешу
    // ---------------------------------------------------------

    if (fromDate < cacheFrom) {
        const apiToDate = Math.min(toDate, cacheFrom);

        if (fromDate < apiToDate) {
            const apiUnlocks = await getFromApi(
                fromDate,
                apiToDate
            );

            result.push(...apiUnlocks);

            cachedUnlocks = getUniqueUnlocks([
                ...cachedUnlocks,
                ...apiUnlocks
            ]);

            // Якщо API ділянка безпосередньо прилягає
            // до кешу — розширюємо кеш вліво.
            if (apiToDate === cacheFrom) {
                cacheFrom = fromDate;
            }
        }
    }

    // ---------------------------------------------------------
    // 5. Запит частини ПІСЛЯ кешу
    // ---------------------------------------------------------

    if (toDate > cacheTo) {
        const apiFromDate = Math.max(fromDate, cacheTo);

        if (apiFromDate < toDate) {
            const apiUnlocks = await getFromApi(
                apiFromDate,
                toDate
            );

            result.push(...apiUnlocks);
            cachedUnlocks = getUniqueUnlocks([
                ...cachedUnlocks,
                ...apiUnlocks
            ]);

            // Якщо API ділянка безпосередньо прилягає
            // до кешу — розширюємо кеш вправо.
            if (apiFromDate === cacheTo) {
                cacheTo = toDate;
            }
        }
    }

    // ---------------------------------------------------------
    // 6. Оновлюємо кеш
    // ---------------------------------------------------------

    if (
        cacheFrom !== cachedRange.from ||
        cacheTo !== cachedRange.to
    ) {
        meta = {
            dataType: CACHE_TYPES.UNLOCKS,
            from: cacheFrom,
            to: cacheTo,
        };

        await cache.put(CACHE_TYPES.UNLOCKS, cachedUnlocks);

        await cache.put("meta", meta);
    }

    // ---------------------------------------------------------
    // 7. Повертаємо тільки потрібний діапазон
    // ---------------------------------------------------------

    return getUniqueUnlocks(
        filterUnlocksByDateRange(result, fromDate, toDate)
    );
}