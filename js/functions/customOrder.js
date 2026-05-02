export const saveOrder = ({ gameData, items = [], config }) => {
    const gameID = gameData.ID;
    const cachedGameData = config.gamesDB[gameID] ?? {};
    cachedGameData.customOrder ??= {};
    items.forEach((cheevo, index) => {
        const cheevoID = cheevo.dataset.achivId;
        cachedGameData.customOrder[cheevoID] = index;
        gameData.AllAchievements[cheevoID].customOrder = index;
    })
    config.writeConfiguration(500);
}