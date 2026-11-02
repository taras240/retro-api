
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
    const unlocks = Object.values(gameData?.AllAchievements ?? {})
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
