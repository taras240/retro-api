import { raapi } from "../../api/index.js";
import { CACHE_TYPES } from "../../enums/cacheDataTypes.js";
import { delay } from "../delay.js";
export async function cachedCompletionProgress(username) {
    const { cache, USER_NAME, configData } = window.config ?? {};
    let cachedData = cache.getData({ dataType: CACHE_TYPES.COMPLETION_PROGRESS });

    if (!cachedData?.Total || (username !== cachedData.UserName)) {
        await updateCompletionProgress({ batchSize: 500 });
        cachedData = cache.getData({ dataType: CACHE_TYPES.COMPLETION_PROGRESS });
        return cachedData;
    }
    else {
        const date = new Date();
        if (date - cachedData.Date < 60 * 1000) {
            return cachedData;
        }
        else {
            await updateCompletionProgress({ batchSize: 10, savedArray: cachedData.Results })
            return cache.getData({ dataType: CACHE_TYPES.COMPLETION_PROGRESS });
        }
    }
}
async function updateCompletionProgress({ savedArray = [], completionProgress = [], batchSize = 500 }) {

    const { cache, USER_NAME, configData } = window.config ?? {};

    let completionOffset = await raapi.getUserCompletionProgress({ count: batchSize, offset: completionProgress.length });
    completionProgress = [...completionProgress, ...completionOffset.Results];
    let lastGame = completionProgress.at(-1);

    let savedIndex = savedArray.findIndex(game => {
        return game.GameID === lastGame.GameID &&
            game.MostRecentAwardedDate === lastGame.MostRecentAwardedDate;
    });
    if (savedIndex >= 0 || completionProgress.length === completionOffset.Total) {
        const completionIDs = completionProgress.map(game => game.GameID);
        savedArray = savedArray.filter(game => !completionIDs.includes(game.GameID))
        savedArray = [...completionProgress, ...savedArray];
        cache.push({
            dataType: CACHE_TYPES.COMPLETION_PROGRESS,
            data: {
                Date: new Date(),
                Total: savedArray.length,
                Results: savedArray,
                UserName: configData.targetUser || USER_NAME
            }
        });
        // this.SAVED_COMPLETION_PROGRESS = { Date: new Date(), Total: savedArray.length, Results: savedArray };
    }
    else {
        await delay(200);
        await updateCompletionProgress({ savedArray: savedArray, completionProgress: completionProgress, batchSize: batchSize });
    }
}
