export const getCheevosCount = (gameData) => {
    const cheevosCount = getSummarySetsPropery(gameData, "NumAchievements");
    return cheevosCount || 1;
}
export const getRetropointsCount = (gameData) => {
    const retropointsCount = getSummarySetsPropery(gameData, "totalRetropoints");
    return retropointsCount || 1;
}
export const getPointsCount = (gameData) => {
    const totalPoints = getSummarySetsPropery(gameData, "totalPoints");
    return totalPoints || 1;
}

function getSummarySetsPropery(gameData, property) {
    let total = gameData[property] || 0;
    if (gameData.visibleSubsets?.length) {
        Object.values(gameData.subsetsData).forEach(subset => {
            total += subset[property];
        })
    }
    return total;
}