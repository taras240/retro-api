import { progressStyle, progressTypes } from "../../enums/progressBar.js";
import { filterBy, sortBy } from "../../functions/sortFilter.js";
import { ui } from "../../script.js";
import { badgeElements } from "../badges.js";
import { recentCheevoHtml } from "./recentCheevo.js";

const baseClass = "rp__progressbar";
const completionMsg = (gameData, unlockedCount, totalCount, rate, progressType) => {
    const { gameMasteredMsg, gameCompletedMsg, unlockProgressMsg } = ui.lang;
    const label = ui.lang?.[`${progressType}Progress`] ?? progressType;

    switch (gameData.award) {
        case "mastered": return gameMasteredMsg;
        case "completed": return gameCompletedMsg;
        default:
            return `${badgeElements.gold(`${unlockedCount}/${totalCount}`)} ${unlockProgressMsg?.replace("{1}", rate).replace("{2}", label)}`;
    }
};
const sessionHtml = (gameData, session, isHardMode) => {
    const totalCount = gameData.NumAchievements;
    const { cheevosCount, cheevosCountHardcore, startDate } = session;
    const count = isHardMode ? cheevosCountHardcore : cheevosCount;
    if (count === 0) return "";
    const cheevosPercentage = 100 * count / totalCount;
    return `
        <div 
            class="${baseClass}-session" 
            data-title="Unlocked ${count} cheevo${count > 1 ? "s" : ""} on ${startDate}" 
            style="--percentage:${cheevosPercentage}%"
        ></div>
    `;
}
const getUnlockedCount = (gameData, isHardMode) => {
    if (isHardMode) {
        return gameData?.unlockData?.hardcore?.count ?? 0;
    }
    return gameData?.unlockData?.soft?.count ?? 0;
}
const getUnlockedPoints = (gameData, isHardMode) => {
    if (isHardMode) {
        return gameData?.unlockData?.hardcore?.points ?? 0;
    }
    return gameData?.unlockData?.soft?.points ?? 0;
}
const getUnlockedRetroPoints = (gameData) => {
    return gameData?.unlockData?.hardcore?.retropoints ?? 0;
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
            total = gameData?.totalRetropoints || 1;
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
        <div class="${baseClass}-container">
            <div class="${baseClass}-header">
                <div class="${baseClass}-title"></div>
                <ul class="rp__last-cheevos"></ul>
            </div>
            <div class="${baseClass}-total">
                <div class="${baseClass}-value"></div>
                <div class="${baseClass}-sessions"></div>
            </div>
        </div>
    `;
}
export const updateProgressBarData = (container, gameData, isHardMode, progressType = progressTypes.cheevos) => {
    if (!container) return;
    const progressMsgElement = container.querySelector(`.${baseClass}-title`);
    const lastCheevosElement = container.querySelector(`.rp__last-cheevos`);
    const progressBarElement = container.querySelector(`.${baseClass}-total`);
    const progressSessionsElement = container.querySelector(`.${baseClass}-sessions`)

    const { unlocked, total, unlockedRate } = getStats(gameData, isHardMode, progressType);

    const lastCheevos = Object.values(gameData?.Achievements ?? {})
        .filter(a => filterBy.earned(a))
        .sort((a, b) => sortBy.latest(a, b, 1, true))
        .slice(0, 6)
        .reverse();

    progressMsgElement.innerHTML = completionMsg(gameData, unlocked, total, unlockedRate, progressType);

    lastCheevosElement.innerHTML = lastCheevos.map(cheevo => recentCheevoHtml(cheevo)).join("");
    progressBarElement.style.setProperty("--unlockRate", unlockedRate);
    if (progressType === progressTypes.cheevos) {
        progressSessionsElement.innerHTML = gameData.sessions.map(session => sessionHtml(gameData, session, isHardMode).trim()).join("")
    }
    else {
        progressSessionsElement.innerHTML = "";
    }

}