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