import { GAME_AWARD_TYPES } from "../../../enums/gameAwards.js";
import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { formatDateTime } from "../../../functions/time.js";
import { request } from "../../http.js";

export async function getUserAwards({ apiKey, username }) {
    const userAwards = await request(raEdpoints.userAwards, {
        y: apiKey,
        u: username,
    });

    userAwards.VisibleUserAwards = userAwards.VisibleUserAwards.map(game => ({
        ...game,
        DateEarnedHardcore: game.AwardedAt,
        timeString: formatDateTime(game.AwardedAt),
        awardedDate: new Date(game.AwardedAt),
        award:
            game.ConsoleName == 'Events' ? "event" :
                game.AwardType == "Game Beaten" ?
                    game.AwardDataExtra == "1" ? GAME_AWARD_TYPES.BEATEN : GAME_AWARD_TYPES.BEATEN_SOFTCORE :
                    game.AwardDataExtra == "1" ? GAME_AWARD_TYPES.MASTERED : GAME_AWARD_TYPES.COMPLETED,
    })
    );
    return userAwards;
}