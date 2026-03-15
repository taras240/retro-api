export function normalizeUserData({ userSummary, raProfileInfo }) {
    let userData = {};
    if (userSummary) {
        userData = {
            userName: userSummary.User,
            richPresence: userSummary.RichPresenceMsg,
            points: userSummary.TotalPoints,
            retropoints: userSummary.TotalTruePoints,
            softpoints: userSummary.TotalSoftcorePoints,
            rank: userSummary.Rank,
            percentile: +(100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2),
            trueRatio: userSummary.TotalTruePoints / userSummary.TotalPoints,
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