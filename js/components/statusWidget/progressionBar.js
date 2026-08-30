import { CHEEVO_TYPES } from "../../enums/cheevoTypes.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";
import { calcEtaTimeToBeat } from "../../functions/estimatedTime.js";
import { formatText } from "../../functions/formatText.js";
import { fromHtml } from "../../functions/html.js";
import { scrollElementIntoView } from "../../functions/scrollingToElement.js";
import { filterBy, sortBy } from "../../functions/sortFilter.js";
import { formatDuration } from "../../functions/time.js";
import { badgeElements } from "../badges.js";

const mainClass = "rp__progression";
let updateInterval, updateTimeout;
const isEarned = (cheevo, isHardMode) => {
    const isEarnedCasual = cheevo.isEarned && !isHardMode;
    return cheevo.isEarnedHardcore || isEarnedCasual;
};
const PointElement = ({ cheevo, focusCheevo, isHardMode }) => {
    const isFocus = focusCheevo?.ID === cheevo.ID;
    const classList = [
        `${mainClass}-point`,
        cheevo.Type === CHEEVO_TYPES.WIN && "win",
        isEarned(cheevo, isHardMode) && "earned",
        isFocus && "focus",
    ].filter(Boolean);

    const point = fromHtml(`
            <.${classList.join(".")} data-achiv-id="${cheevo.ID}" style="--focus-time:${cheevo.progressionFocusTime || 1}"/>
        `)
    return point;
}

export const updateProgressionBar = (container, gameData, isHardMode = true) => {
    updateInterval && clearInterval(updateInterval);
    updateTimeout && clearTimeout(updateTimeout);
    const mainSetID = gameData.availableSubsets?.Main;


    const progressionMessage = (focusCheevo, focusIndex, cheevos, winCount) => {
        let message;
        if (focusIndex >= 0) {
            message = `${badgeElements.gold(`${focusIndex + 1}/${cheevos.length}`)} ${focusCheevo.Description}`;
        } else if (gameData?.progressionAward || gameData.subsetsData?.[mainSetID]?.progressionAward) {
            message = winCount > 1 ? lang.gameBeatenAllEndingsMsg : lang.gameBeatenMsg;
        } else {
            message = lang.noProgressionMsg;
        }
        return message;
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
        return formatText(lang.estTimeMsg, { beatenRate, time });
    }
    const cheevos = reorderCheevos(Object.values(gameData.AllAchievements));
    const winCount = Object.values(gameData.AllAchievements).filter(c => c.Type == CHEEVO_TYPES.WIN).length;

    const focusCheevo = cheevos.find(a => !isEarned(a, isHardMode));
    const focusIndex = cheevos.findIndex(c => !isEarned(c, isHardMode));
    const message = progressionMessage(focusCheevo, focusIndex, cheevos, winCount);

    const tittleEl = fromHtml(`
        <h3.${mainClass}-target data-title="${focusCheevo?.Description ?? ""}">
            ${message}
        </h3>
    `);
    const progressContainer = fromHtml(`
        <.${mainClass}-points/>
    `)
    progressContainer.append(
        ...cheevos.map((cheevo) => PointElement({ cheevo, focusCheevo, isHardMode }))
    )

    container.replaceChildren(tittleEl, progressContainer);

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
        <.${mainClass}-container>
            <h3.${mainClass}-target/>
            <.${mainClass}-points/>
        </>
    `;
}