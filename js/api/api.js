import { APIEvents, ui, watcher } from "../script.js";
import { getRecentlyPlayedGames } from './handlers/user/recentlyPlayedGames.js';
import { getUserProfile } from './handlers/user/userProfile.js';
import { getUserSummary } from './handlers/user/userSummary.js';
import { getWantToPlayGamesList } from './handlers/user/wantToPlay.js';
import { getUserCompletionProgress } from './handlers/user/completion.js';
import { getUserAwards } from './handlers/user/awards.js';
import { getAotW } from './handlers/events/aotw.js';
import * as comments from './handlers/comments.js';
import * as game from './handlers/game.js';
import * as achievement from './handlers/achievement.js';
import { getConsolesList } from './handlers/systems/consolesList.js';
import { getConsoleGameList } from './handlers/systems/consoleGameList.js';

const handlers = {
    getRecentlyPlayedGames,
    getUserProfile,
    getUserSummary,
    getWantToPlayGamesList,
    getAotW,
    getUserCompletionProgress,
    getUserAwards,
    getConsolesList,
    getConsoleGameList,
    ...comments,
    ...game,
    ...achievement,
};

export async function call(method, ...params) {
    APIEvents.dispatchEvent(new CustomEvent("APIRequest"));

    try {
        const result = await handlers[method](...(params || []));
        ui.showAPIError(false);
        return result;
    } catch (error) {
        ui.showAPIError(true, `RA API [${method}] ${error}`);
        console.error(error.message);
    }
}