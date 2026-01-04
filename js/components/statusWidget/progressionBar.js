import { cheevoTypes } from "../../enums/cheevoTypes.js";
import { filterBy, sortBy } from "../../functions/sortFilter.js";
import { ui } from "../../script.js";
import { badgeElements } from "../badges.js";

const mainClass = "rp__progression";

export const updateProgressionBar = (container, gameData, isHardMode = true) => {
    const isEarned = (cheevo) => cheevo.isEarnedHardcore ||
        (cheevo.isEarned && !isHardMode);
    const progressionMessage = (focusCheevo, focusIndex, cheevos) => {
        let message;
        if (focusIndex >= 0) {
            message = `${badgeElements.gold(`${focusIndex + 1}/${cheevos.length}`)} ${focusCheevo.Description}`;
        } else if (gameData?.progressionAward) {
            message = ui.lang.gameBeatenMsg;
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
                    cheevo.Type === cheevoTypes.WIN && "win",
                    isEarned(cheevo) && "earned",
                    focusCheevo?.ID === cheevo.ID && "focus",
                ]
                    .filter(Boolean)
                    .join(" ");

                return `<div class="${classes}" data-achiv-id="${cheevo.ID}"></div>`;
            })
            .join("");
    }
    if (!gameData) return "n/a";

    const cheevos = Object.values(gameData.Achievements)
        .filter(c => filterBy.progression(c))
        .sort((a, b) => sortBy.default(a, b));

    const focusCheevo = cheevos.find(a => !isEarned(a));
    const focusIndex = cheevos.findIndex(c => !isEarned(c));
    const message = progressionMessage(focusCheevo, focusIndex, cheevos);
    container.innerHTML = `
        <h3 class="${mainClass}-target" data-title='${message}'>
            ${message}
        </h3>
        <div class="${mainClass}-points">
            ${progressionPoints(focusCheevo, cheevos)}
        </div>
    `;
}

export const progressionBarHtml = (theme) => {
    return `
        <div class="${mainClass}-container">
            <h3 class="${mainClass}-target"></h3>
            <div class="${mainClass}-points"></div>
        </div>
    `;
}