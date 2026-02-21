import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";
import { progressStyle, PROGRESS_TYPES } from "../../enums/progressBar.js";
import { getCheevosCount, getPointsCount, getRetropointsCount } from "../../functions/gameProperties.js";
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

    if (gameData.award === GAME_AWARD_TYPES.MASTERED) return gameMasteredMsg;

    if (!isHardMode && gameData.award === GAME_AWARD_TYPES.COMPLETED) return gameCompletedMsg;

    else return `${badgeElements.gold(`${unlocked}/${total}`)} ${formatText(unlockProgressMsg, { rate: unlockedRate, progressTypeName })}`;
}
const sessionsProgressHtml = (gameData, isHardMode, progressType) => {
    if (gameData.visibleSubsets?.length) return "";
    let totalCount, count = 0;
    let hint = "";
    return gameData.sessions.map(session => {
        const { cheevosCount, cheevosCountHardcore, startDate } = session;


        switch (progressType) {
            case PROGRESS_TYPES.cheevos:
                count = isHardMode ? cheevosCountHardcore : cheevosCount;

                totalCount = gameData.NumAchievements;
                hint = formatText(ui.lang.progressUnlockCheevosHint, {
                    count,
                    type: `${count === 1 ? ui.lang.cheevo : ui.lang.cheevos}`,
                    date: startDate
                });
                break;
            case PROGRESS_TYPES.points:
                count = session.cheevos.reduce((points, ID) => {
                    const cheevo = gameData.AllAchievements[ID];
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
            case PROGRESS_TYPES.retropoints:
                count = session.cheevos.reduce((retropoints, ID) => {
                    const cheevo = gameData.AllAchievements[ID];
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
    let softCount, hardCount = 0;
    const sets = [gameData, ...Object.values(gameData.subsetsData)];
    sets.forEach(set => {
        hardCount += set?.unlockData?.hardcore?.count ?? 0;
        softCount += set?.unlockData?.softcore?.count ?? 0;
    })
    return isHardMode ? hardCount : softCount;
}
const getUnlockedPoints = (gameData, isHardMode) => {
    let softPoints, hardPoints = 0;
    const sets = [gameData, ...Object.values(gameData.subsetsData)];
    sets.forEach(set => {
        hardPoints += set?.unlockData?.hardcore?.points ?? 0;
        softPoints += set?.unlockData?.softcore?.points ?? 0;
    })
    return isHardMode ? hardPoints : softPoints;
}
const getUnlockedRetroPoints = (gameData) => {
    let retropoints = 0;
    const sets = [gameData, ...Object.values(gameData.subsetsData)];
    sets.forEach(set => {
        retropoints += set?.unlockData?.hardcore?.retropoints ?? 0;
    })
    return retropoints;
}
const getStats = (gameData, isHardMode, progressType) => {
    let unlocked, total, unlockedRate;
    switch (progressType) {
        case PROGRESS_TYPES.points:
            unlocked = getUnlockedPoints(gameData, isHardMode);
            total = getPointsCount(gameData);
            unlockedRate = Math.round(100 * unlocked / total) + "%";
            break;
        case PROGRESS_TYPES.retropoints:
            unlocked = getUnlockedRetroPoints(gameData, isHardMode);
            total = getRetropointsCount(gameData);
            unlockedRate = Math.round(100 * unlocked / total) + "%";
            break;
        default:
            unlocked = getUnlockedCount(gameData, isHardMode);
            total = getCheevosCount(gameData);
            unlockedRate = Math.round(100 * unlocked / total) + "%";
            break;
    }
    return { unlocked, total, unlockedRate }
}
export const progressBarHtml = (type = PROGRESS_TYPES.cheevos) => {
    return `
        <div class="${baseClass}-container" data-type="${type}">
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
export const updateProgressBarData = (container, gameData, isHardMode, progressType) => {
    if (!container) return;

    const progressMsgElement = container.querySelector(`.${baseClass}-title`);
    const lastCheevosElement = container.querySelector(`.rp__last-cheevos`);
    const progressBarElement = container.querySelector(`.${baseClass}`);
    const progressSessionsElement = container.querySelector(`.${baseClass}-sessions`)
    progressType = container.dataset.type ?? PROGRESS_TYPES.cheevos;
    const { unlocked, total, unlockedRate } = getStats(gameData, isHardMode, progressType);

    const lastCheevos = Object.values(gameData?.AllAchievements ?? {})
        .filter(a => filterBy.earned(a))
        .sort((a, b) => sortBy.latest(a, b, 1, true))
        .slice(0, 6)
        .reverse();
    const message = completionMsg(gameData, progressType, isHardMode)

    progressMsgElement.innerHTML = message;

    lastCheevosElement.innerHTML = lastCheevos.map(cheevo => recentCheevoHtml(cheevo)).join("");
    progressBarElement.style.setProperty("--unlockRate", `${100 * unlocked / total}%`);

    progressSessionsElement.innerHTML = sessionsProgressHtml(gameData, isHardMode, progressType);
    progressSessionsElement.classList.toggle("completed", unlocked === total);
}
