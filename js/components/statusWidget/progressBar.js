import { progressStyle, progressTypes } from "../../enums/progressBar.js";
import { filterBy, sortBy } from "../../functions/sortFilter.js";
import { ui } from "../../script.js";
import { badgeElements } from "../badges.js";
import { recentCheevoHtml } from "./recentCheevo.js";

const completionMsg = (gameData, unlockedCount, totalCount, rate, progressType) => {
    const { gameMasteredMsg, gameCompletedMsg, unlockProgressMsg } = ui.lang;
    const label = ui.lang?.[progressType]?.toLowerCase() ?? progressType;

    switch (gameData.award) {
        case "mastered": return gameMasteredMsg;
        case "completed": return gameCompletedMsg;
        default:
            return `${badgeElements.gold(`${unlockedCount}/${totalCount}`)} ${unlockProgressMsg?.replace("{1}", rate).replace("{2}", label)}`;
    }
};
const getUnlockedCount = (gameData, isHardMode) => {
    if (isHardMode) {
        return gameData?.earnedStats?.hard?.count ?? 0;
    }
    return gameData?.earnedStats?.soft?.count ?? 0;
}
const getUnlockedPoints = (gameData, isHardMode) => {
    if (isHardMode) {
        return gameData?.earnedStats?.hard?.points ?? 0;
    }
    return gameData?.earnedStats?.soft?.points ?? 0;
}
const getUnlockedRetroPoints = (gameData) => {
    return gameData?.earnedStats?.hard?.retropoints ?? 0;
}
const getStats = (gameData, isHardMode, progressType) => {
    let unlocked, total, unlockedRate;
    switch (progressType) {
        case progressTypes.points:
            unlocked = getUnlockedPoints(gameData, isHardMode);
            total = gameData?.totalPoints || 1;
            unlockedRate = Math.round(100 * unlocked / total) + "%";
            break;
        case progressTypes.retropoints:
            unlocked = getUnlockedRetroPoints(gameData, isHardMode);
            total = gameData?.TotalRetropoints || 1;
            unlockedRate = Math.round(100 * unlocked / total) + "%";
            break;
        default:
            unlocked = getUnlockedCount(gameData, isHardMode);
            total = gameData?.NumAchievements || 1;
            unlockedRate = Math.round(100 * unlocked / total) + "%";
            break;
    }
    return { unlocked, total, unlockedRate }
}
export const progressBarHtml = (theme = progressStyle.default) => {
    return `
        <div class="rp__progressbar-header">
            <div class="rp__progressbar-title"></div>
            <ul class="rp__last-cheevos"></ul>
        </div>
        <div class="rp__progressbar-total">
            <div class="rp__progressbar-value"></div>
        </div>
    `;
}
export const updateProgressBarData = (container, gameData, isHardMode, progressType = progressTypes.cheevos) => {
    const progressMsgElement = container.querySelector(".rp__progressbar-title");
    const lastCheevosElement = container.querySelector(".rp__last-cheevos");
    const progressBarElement = container.querySelector(".rp__progressbar-total");

    const { unlocked, total, unlockedRate } = getStats(gameData, isHardMode, progressType);

    const lastCheevos = Object.values(gameData?.Achievements ?? {})
        .filter(a => filterBy.earned(a))
        .sort((a, b) => sortBy.latest(a, b, 1, true))
        .slice(0, 6)
        .reverse();

    progressMsgElement.innerHTML = completionMsg(gameData, unlocked, total, unlockedRate, progressType);

    lastCheevosElement.innerHTML = lastCheevos.map(cheevo => recentCheevoHtml(cheevo)).join("");
    progressBarElement.style.setProperty("--unlockRate", unlockedRate);
}