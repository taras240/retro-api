
const baseClass = "rp__heatmapbar";

export const heatmapBarHtml = () => {
    return `
        <.${baseClass}-container>
            <.${baseClass}>
                <.${baseClass}-bg/>
                <.${baseClass}-unlocks/>
            </>
        </>
    `;
}

export const updateHeatmapBar = (container, gameData, isHardMode = true) => {
    const unlocksContainer = container?.querySelector(`.${baseClass}-unlocks`);
    if (!unlocksContainer) return;

    const elapsedTime = Number(gameData?.TimePlayed);
    const cheevosArray = Object.values(gameData?.AllAchievements ?? {});
    const totalCheevos = cheevosArray.length;
    const unlocks = cheevosArray
        .map(cheevo => ({
            cheevo,
            unlockTime: Number(cheevo.unlockTime),
            isEarned: isHardMode
                ? !!cheevo.DateEarnedHardcore
                : !!cheevo.DateEarned,
        }))
        .filter(({ unlockTime, isEarned }) =>
            isEarned && Number.isFinite(unlockTime) && unlockTime >= 0);

    if (!unlocks.length) {
        unlocksContainer.replaceChildren();
        return;
    }
    let unlockWidth = totalCheevos < 20 ? 4 : totalCheevos < 50 ? 3 : totalCheevos < 100 ? 2 : 1;
    unlocksContainer.style.setProperty("--unlock-width", `${unlockWidth}%`);
    const markers = unlocks.map(({ cheevo, unlockTime }) => {
        const marker = document.createElement("span");
        marker.className = `${baseClass}-unlock`;
        const position = Number.isFinite(elapsedTime) && elapsedTime > 0
            ? Math.min((unlockTime / elapsedTime) * 100, 100)
            : 0;
        marker.style.setProperty("--unlock-position", `${position}%`);
        return marker;
    });

    unlocksContainer.replaceChildren(...markers);
}
