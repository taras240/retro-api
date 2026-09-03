import { sortBy } from "../sortFilter.js";

const normalizeTimeStamp = (time) => {
    if (typeof time === "string") {
        time = new Date(time);
    }
    if (time instanceof Date) {
        return Math.floor(time.getTime() / 1000);
    }

    if (typeof time === "number" && Number.isFinite(time)) {
        return time > 1e12
            ? Math.floor(time / 1000)
            : Math.floor(time);
    }
    throw new TypeError(`Invalid timestamp: ${time}`);
};

const getUniqueUnlocks = (items) => {
    return Array.from(
        new Map(
            items.map(item => [
                `${item.AchievementID}_${item.Date}_${item.HardcoreMode}`,
                item
            ])
        ).values()
    )?.sort((a, b) => new Date(a.Date) - new Date(b.Date));
};
const filterUnlocksByDateRange = (
    unlocks,
    fromDate,
    toDate
) => {
    return unlocks.filter(item => {
        const date = normalizeTimeStamp(item.Date);

        return date >= fromDate && date < toDate;
    });
};



export {
    normalizeTimeStamp,
    getUniqueUnlocks,
    filterUnlocksByDateRange,
}