import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { addReleaseBadges } from "../../../functions/releaseTypeParser.js";
import { request } from "../../http.js";



export async function getRecentlyPlayedGames({ apiKey, username, count }) {
    const data = await request(raEdpoints.recentlyPlayedGames, {
        y: apiKey,
        u: username,
        c: count,
    });
    return data.map((game, index) => {
        return {
            ...game,
            ...addReleaseBadges(game),
            ID: game.GameID,
            Points: game.ScoreAchievedHardcore + "/" + game.PossibleScore,
            NumAchievements: game.NumAchievedHardcore + "/" + game.AchievementsTotal,
            DateEarnedHardcore: game.LastPlayed //for sort methods
        }
    });
}
