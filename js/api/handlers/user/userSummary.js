import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { formatDateTime } from "../../../functions/time.js";
import { request } from "../../http.js";

export async function getUserSummary({ apiKey, username, games, cheevos, }) {
    const data = await request(raEdpoints.userSummary, {
        y: apiKey,
        u: username,
        g: games,
        a: cheevos,
    });

    // Format recent achievements
    if (data.RecentAchievements) {
        data.RecentAchievements = Object.values(data.RecentAchievements)
            .flatMap(achievements => Object.values(achievements))
            .map(cheevo => ({
                ...cheevo,
                DateAwarded: formatDateTime(cheevo.DateAwarded),
                isEarned: !!cheevo.DateAwarded,
            }));
    }

    // Format recently played games
    if (data.RecentlyPlayed) {
        data.RecentlyPlayed = data.RecentlyPlayed.map(game => ({
            ...game,
            LastPlayed: formatDateTime(game.LastPlayed),
        }));
        data.isInGame = (new Date() - new Date(data.RecentlyPlayed[0]?.LastPlayed || 0)) < 5 * 60 * 1000;
    }
    return data;
}