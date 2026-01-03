import { gameAwardTypes } from "../../enums/gameAwards.js";
import { progressStyle, progressTypes } from "../../enums/progressBar.js";
import { formatText } from "../../functions/local.js";
import { filterBy, sortBy } from "../../functions/sortFilter.js";
import { ui } from "../../script.js";
import { badgeElements } from "../badges.js";
import { recentCheevoHtml } from "./recentCheevo.js";

const baseClass = "rp__progressbar";
export const completionMsg = (gameData, progressType, isHardMode = true) => {

    const { unlocked, total, unlockedRate } = getStats(gameData, isHardMode, progressType);
    const { gameMasteredMsg, gameCompletedMsg, unlockProgressMsg } = ui.lang;
    const progressTypeName = ui.lang?.[`${progressType}Progress`] ?? progressType;

    if (gameData.award === gameAwardTypes.MASTERED) return gameMasteredMsg;

    if (!isHardMode && gameData.award === gameAwardTypes.COMPLETED) return gameCompletedMsg;

    else return `${badgeElements.gold(`${unlocked}/${total}`)} ${formatText(unlockProgressMsg, { rate: unlockedRate, progressTypeName })}`;
}
const sessionsProgressHtml = (gameData, isHardMode, progressType) => {
    let totalCount, count = 0;
    let hint = "";
    return gameData.sessions.map(session => {
        const { cheevosCount, cheevosCountHardcore, startDate } = session;


        switch (progressType) {
            case progressTypes.cheevos:
                count = isHardMode ? cheevosCountHardcore : cheevosCount;
                totalCount = gameData.NumAchievements;
                hint = formatText(ui.lang.progressUnlockCheevosHint, {
                    count,
                    type: `${count === 1 ? ui.lang.cheevo : ui.lang.cheevos}`,
                    date: startDate
                });
                break;
            case progressTypes.points:
                count = session.cheevos.reduce((points, ID) => {
                    const cheevo = gameData.Achievements[ID];
                    ((isHardMode && cheevo.DateEarnedHardcore) || (!isHardMode && cheevo.DateEarned)) && (points += cheevo.Points);
                    return points;
                }, 0);
                totalCount = gameData.totalPoints;
                hint = formatText(ui.lang.progressEarnedPointsHint, {
                    count,
                    type: `${count === 1 ? ui.lang.point : ui.lang.points}`,
                    date: startDate
                })
                break;
            case progressTypes.retropoints:
                count = session.cheevos.reduce((retropoints, ID) => {
                    const cheevo = gameData.Achievements[ID];
                    (isHardMode && cheevo.DateEarnedHardcore) && (retropoints += cheevo.TrueRatio);
                    return retropoints;
                }, 0);
                totalCount = gameData.totalRetropoints;
                hint = formatText(ui.lang.progressEarnedPointsHint, {
                    count,
                    type: `${count === 1 ? ui.lang.retropoint : ui.lang.retropoints}`,
                    date: startDate
                })

                break;
        }
        if (count === 0) return "";
        const cheevosPercentage = 100 * count / totalCount;
        return `
            <div 
                class="${baseClass}-session"
                data-title="${hint}" 
                style="--percentage:${cheevosPercentage}%"
            ></div>
        `.trim();
    }).join("")
}
const getUnlockedCount = (gameData, isHardMode) => {
    if (isHardMode) {
        return gameData?.unlockData?.hardcore?.count ?? 0;
    }
    return gameData?.unlockData?.softcore?.count ?? 0;
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
            <div class="${baseClass}">
                <div class="${baseClass}-bg"></div>
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
    const progressBarElement = container.querySelector(`.${baseClass}`);
    const progressSessionsElement = container.querySelector(`.${baseClass}-sessions`)

    const { unlocked, total, unlockedRate } = getStats(gameData, isHardMode, progressType);

    const lastCheevos = Object.values(gameData?.Achievements ?? {})
        .filter(a => filterBy.earned(a))
        .sort((a, b) => sortBy.latest(a, b, 1, true))
        .slice(0, 6)
        .reverse();

    progressMsgElement.innerHTML = completionMsg(gameData, progressType, isHardMode);

    lastCheevosElement.innerHTML = lastCheevos.map(cheevo => recentCheevoHtml(cheevo)).join("");
    progressBarElement.style.setProperty("--unlockRate", `${100 * unlocked / total}%`);

    progressSessionsElement.innerHTML = sessionsProgressHtml(gameData, isHardMode, progressType);
    progressSessionsElement.classList.toggle("completed", unlocked === total);
}
