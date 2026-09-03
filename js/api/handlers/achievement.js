import { raEdpoints } from "../../enums/RAEndpoints.js";
import { request } from "../http.js";
import { formatDateTime } from "../../functions/time.js";

// y	Your web API key.
// u	The target username or ULID. Defaults to current.
// m	Minutes to look back. Defaults to 60.
export async function getUserRecentAchievements({ username, apiKey, minutes = 60 }) {
    const data = await request(raEdpoints.userRecentAchievements, {
        y: apiKey,
        u: username,
        m: minutes
    });
    //Add some missing fields
    return (data || []).map(cheevo => ({
        ...cheevo,
        isEarned: !!cheevo.Date,
        isEarnedHardcore: !!cheevo.HardcoreMode,
    }));
}
export async function getUserAchievementsByDateRange({ username, apiKey, fromDate, toDate }) {
    const normalizeTimeStamp = (time) => {
        if (typeof time === "string") {
            time = new Date(time);
        }
        if (time instanceof Date) {
            return Math.floor(time.getTime() / 1000);
        }

        if (typeof time === "number") {
            // Якщо timestamp схожий на мілісекунди
            return time > 1e12
                ? Math.floor(time / 1000)
                : Math.floor(time);
        }
    }
    // const unlocks = await request(raEdpoints.userAchievementsByDateRange, {
    //     y: apiKey,
    //     u: username,
    //     f: normalizeTimeStamp(fromDate),
    //     t: normalizeTimeStamp(toDate)
    // })
    // return unlocks;

    const cheevosArray = [];
    let currentFromDate = fromDate;

    while (true) {
        const cheevos = await request(raEdpoints.userAchievementsByDateRange, {
            y: apiKey,
            u: username,
            f: normalizeTimeStamp(currentFromDate),
            t: normalizeTimeStamp(toDate),
        });

        if (!cheevos?.length) {
            break;
        }

        cheevosArray.push(...cheevos);

        if (cheevos.length < 500) {
            break;
        }

        const lastUnlockDate = normalizeTimeStamp(
            cheevos.at(-1)?.Date
        );

        if (!lastUnlockDate || lastUnlockDate <= currentFromDate) {
            break;
        }

        currentFromDate = lastUnlockDate;
    }

    return cheevosArray;

}
export async function getAchievementByID({ apiKey, cheevoID, unlocksCount = 0, offset = 0 }) {
    const cheevoData = await request(raEdpoints.achievement, {
        y: apiKey,
        a: cheevoID,
        c: unlocksCount,
        o: offset,
    });
    return cheevoData;
}