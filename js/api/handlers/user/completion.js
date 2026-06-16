import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { addReleaseBadges } from "../../../functions/releaseTypeParser.js";
import { request } from "../../http.js";
/*
    y	Yes	Your web API key.
    u		The target username or ULID.
    c		Count, number of records to return (default: 100, max: 500).
    o		Offset, number of entries to skip (default: 0).
*/
export async function getUserCompletionProgress({ apiKey, username, count, offset, cachedData }) {
    const data = await request(raEdpoints.completionProgress, {
        y: apiKey,
        u: username,
        c: count ?? 500,
        o: offset ?? 0,
    });
    data.Results = data.Results.map((game) => {
        game.ID = game.GameID;
        game.NumAchievements = game.MaxPossible;
        delete game.MaxPossible;
        delete game.NumLeaderboards;
        return game;
    })
    return data;
}

