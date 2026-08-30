import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";
import { progressStyle, PROGRESS_TYPES } from "../../enums/progressBar.js";
import { getCheevosCount, getPointsCount, getRetropointsCount } from "../../functions/gameProperties.js";
import { formatText } from "../../functions/formatText.js";
import { filterBy, sortBy } from "../../functions/sortFilter.js";
import { badgeElements } from "../badges.js";
import { recentCheevoHtml } from "./recentCheevo.js";
import { fromHtml } from "../../functions/html.js";

const baseClass = "rp__progressbar";
export const CompletionMsg = (gameData, progressType, isHardMode = true) => {

    const { unlocked, total, unlockedRate } = getStats(gameData, isHardMode, progressType);
    const { gameMasteredMsg, gameCompletedMsg, unlockProgressMsg } = lang;
    const progressTypeName = lang?.[`${progressType}Progress`] ?? progressType;
    const isMainSet = !Object.values(gameData.subsetsData ?? {}).length;
    let msg = "";
    if (isMainSet && gameData.award === GAME_AWARD_TYPES.MASTERED) {
        msg = gameMasteredMsg;
    }
    else if (!isHardMode && isMainSet && gameData.award === GAME_AWARD_TYPES.COMPLETED) {
        msg = gameCompletedMsg;

    }
    else {
        msg = formatText(
            unlockProgressMsg,
            {
                rate: unlockedRate,
                progressTypeName
            })
    }
    return fromHtml([
        badgeElements.gold(`${unlocked}/${total}`),
        `<span> ${msg}</span>`
    ]);
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
                hint = formatText(lang.progressUnlockCheevosHint, {
                    count,
                    type: `${count === 1 ? lang.cheevo : lang.cheevos}`,
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
                hint = formatText(lang.progressEarnedPointsHint, {
                    count,
                    type: `${count === 1 ? lang.point : lang.points}`,
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
                hint = formatText(lang.progressEarnedPointsHint, {
                    count,
                    type: `${count === 1 ? lang.retropoint : lang.retropoints}`,
                    date: startDate
                })

                break;
        }
        if (count === 0) return "";
        const cheevosPercentage = 100 * count / totalCount;
        return fromHtml(`
            <.${baseClass}-session
                data-title="${hint}"
                style="--percentage:${cheevosPercentage}%"
            />
        `);
    })
}
const getUnlockedCount = (gameData, isHardMode) => {
    let softCount = 0;
    let hardCount = 0;
    const sets = [gameData, ...Object.values(gameData.subsetsData)];
    sets.forEach(set => {
        hardCount += set?.unlockData?.hardcore?.count ?? 0;
        softCount += set?.unlockData?.softcore?.count ?? 0;
    })
    return isHardMode ? hardCount : softCount;
}
const getUnlockedPoints = (gameData, isHardMode) => {
    let softPoints = 0;
    let hardPoints = 0;
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
        <.${baseClass}-container data-type="${type}">
            <.${baseClass}-header>
                <.${baseClass}-title/>
                <ul.rp__last-cheevos/>
            </>
            <.${baseClass}>
                <.${baseClass}-bg/>
                <.${baseClass}-value/>
                <.${baseClass}-sessions/>
            </>
        </>
    `;
}
export const updateProgressBarData = (container, gameData, isHardMode, progressType) => {
    if (!container) return;

    const progressMsgContainer = container.querySelector(`.${baseClass}-title`);
    const progressBarElement = container.querySelector(`.${baseClass}`);
    const progressSessionsElement = container.querySelector(`.${baseClass}-sessions`)
    progressType = container.dataset.type ?? PROGRESS_TYPES.cheevos;
    const { unlocked, total } = getStats(gameData, isHardMode, progressType);

    progressMsgContainer.replaceChildren(
        ...CompletionMsg(gameData, progressType, isHardMode)
    );

    progressBarElement.style.setProperty("--unlockRate", `${100 * unlocked / total}%`);

    progressSessionsElement.replaceChildren(
        ...sessionsProgressHtml(gameData, isHardMode, progressType)
    );
    progressSessionsElement.classList.toggle("completed", unlocked === total);
}
