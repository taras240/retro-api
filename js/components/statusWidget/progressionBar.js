import { CHEEVO_TYPES } from "../../enums/cheevoTypes.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";
import { calcEtaTimeToBeat } from "../../functions/estimatedTime.js";
import { formatText } from "../../functions/formatText.js";
import { scrollElementIntoView } from "../../functions/scrollingToElement.js";
import { filterBy, sortBy } from "../../functions/sortFilter.js";
import { formatDuration } from "../../functions/time.js";
import { ui } from "../../script.js";
import { badgeElements } from "../badges.js";

const mainClass = "rp__progression";
let updateInterval, updateTimeout;
export const updateProgressionBar = (container, gameData, isHardMode = true) => {
    updateInterval && clearInterval(updateInterval);
    updateTimeout && clearTimeout(updateTimeout);
    const mainSetID = gameData.availableSubsets?.Main;
    const isEarned = (cheevo) => cheevo.isEarnedHardcore ||
        (cheevo.isEarned && !isHardMode);

    const progressionMessage = (focusCheevo, focusIndex, cheevos, winCount) => {
        let message;
        if (focusIndex >= 0) {
            message = `${badgeElements.gold(`${focusIndex + 1}/${cheevos.length}`)} ${focusCheevo.Description}`;
        } else if (gameData?.progressionAward || gameData.subsetsData?.[mainSetID]?.progressionAward) {
            message = winCount > 1 ? ui.lang.gameBeatenAllEndingsMsg : ui.lang.gameBeatenMsg;
        } else {
            message = ui.lang.noProgressionMsg;
        }
        return message;
    }
    const progressionPoints = (focusCheevo, cheevos) => {
        return cheevos
            .map((cheevo) => {
                const classes = [
                    "rp__progression-point",
                    cheevo.Type === CHEEVO_TYPES.WIN && "win",
                    isEarned(cheevo) && "earned",
                    focusCheevo?.ID === cheevo.ID && "focus",
                ]
                    .filter(Boolean)
                    .join(" ");

                return `<div class="${classes}" data-achiv-id="${cheevo.ID}" style="--focus-time:${cheevo.progressionFocusTime || 1}"></div>`;
            })
            .join("");
    }
    if (!gameData) return "n/a";
    const reorderCheevos = (cheevos) => {
        const sortedCheevos = cheevos.sort((a, b) => sortBy.progression(a, b)).sort((a, b) =>
            isHardMode ? sortBy.latestHardcore(a, b, -1, true) : sortBy.latest(a, b, -1, true))
        const progresionCheevos = sortedCheevos.filter(c => c.Type === CHEEVO_TYPES.PROGRESSION);
        const winCheevos = sortedCheevos.filter(c => c.Type === CHEEVO_TYPES.WIN);
        return [...progresionCheevos, ...winCheevos];
    }
    const etaMessage = (cheevos) => {
        let etaTime = gameData.eta;
        if (!etaTime) return null;
        const beatenRate = Math.round(gameData.TimePlayed / (etaTime + gameData.TimePlayed) * 100) + "%";
        const time = formatDuration(etaTime);
        return formatText(ui.lang.estTimeMsg, { beatenRate, time });
    }
    const cheevos = reorderCheevos(Object.values(gameData.AllAchievements));
    const winCount = Object.values(gameData.AllAchievements).filter(c => c.Type == CHEEVO_TYPES.WIN).length;

    const focusCheevo = cheevos.find(a => !isEarned(a));
    const focusIndex = cheevos.findIndex(c => !isEarned(c));
    const message = progressionMessage(focusCheevo, focusIndex, cheevos, winCount);
    container.innerHTML = `
        <h3 class="${mainClass}-target" data-title="${focusCheevo?.Description ?? ""}">
            ${message}
        </h3>
        <div class="${mainClass}-points">
            ${progressionPoints(focusCheevo, cheevos)}
        </div>
    `;
    scrollElementIntoView({
        container: container.querySelector(`.${mainClass}-points`),
        element: container.querySelector(".focus"),
        scrollByX: true,
        scrollByY: false,
    })
    const updateProgressionText = () => {
        updateTimeout && clearTimeout(updateTimeout);
        const textContainer = container.querySelector(`.${mainClass}-target`);
        if (textContainer) {
            textContainer.innerHTML = message;
            textContainer.dataset.title = etaMessage(cheevos);
        }
        updateTimeout = setTimeout(() => {
            if (!textContainer) return;
            textContainer.innerHTML = etaMessage(cheevos) || message;
            textContainer.dataset.title = focusCheevo?.Description ?? "";
        }, 5 * 60 * 1000);
    };
    try {

        updateProgressionText();
        updateInterval = setInterval(() => updateProgressionText(), 6 * 60 * 1000);
    }
    catch (err) {
        console.warn(err);
    }
}

export const progressionBarHtml = (theme) => {
    return `
        <div class="${mainClass}-container">
            <h3 class="${mainClass}-target"></h3>
            <div class="${mainClass}-points"></div>
        </div>
    `;
}