export function normalizeUserData({ userSummary, raProfileInfo, isInit }) {
    let userData = {};
    if (userSummary) {
        userData = isInit ? {
            ...userData,
            rank: userSummary.Rank,
            percentile: +(100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2),
            userName: userSummary.User,
            richPresence: userSummary.RichPresenceMsg,
            points: userSummary.TotalPoints,
            retropoints: userSummary.TotalTruePoints,
            softpoints: userSummary.TotalSoftcorePoints,
            trueRatio: userSummary.TotalTruePoints / userSummary.TotalPoints,
        } :
            {
                ...userData,
                rank: userSummary.Rank,
                percentile: +(100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2),
            }
    }
    if (raProfileInfo) {
        userData = {
            ...userData,
            userName: raProfileInfo.User,
            points: raProfileInfo.TotalPoints,
            retropoints: raProfileInfo.TotalTruePoints,
            softpoints: raProfileInfo.TotalSoftcorePoints,
            richPresence: raProfileInfo.RichPresenceMsg,
            trueRatio: raProfileInfo.TotalTruePoints / raProfileInfo.TotalPoints,
        }
    }
    return userData;
}