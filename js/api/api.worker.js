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
    // ...achievements,
    // ...games,
};

self.onmessage = async ({ data }) => {

    const { id, method, params } = data;

    try {
        const result = await handlers[method](...(params || []));
        self.postMessage({ id, result });
    } catch (error) {
        self.postMessage({
            id,
            error: error.message,
        });
    }
};