import { formatDate, formatDateTime, secondsToBadgeString } from "../functions/time.js";
import { badgeElements, generateBadges } from "./badges.js";
import { icons, signedIcons } from "./icons.js";

export function cheevoPopupElement(cheevo, isFixed = false) {
    const propElem = (title, value, isShown = true) => {
        const valueDivider = `<span class="popup__value-divider"> | </span>`;
        const valueText = Array.isArray(value) ? [...new Set(value)].join(valueDivider) : value;
        return isShown ? `
        <p><span class="popup__prop-title">${title}: </span>${valueText}</p>
    ` : ""
    };
    const badges = (level, genres) => {
        if (!level && genres.length === 0) return "";

        const badgeArr = [level && `LVL: ${level}`, ...genres];

        const badgeElems = generateBadges(badgeArr, "selection");

        return `
            <div class="cheevo-popup__icons">${badgeElems}</div>
        `;
    }
    const subLevel = cheevo.level?.toString()?.split(".")[1];
    const level = cheevo.zone ?
        subLevel ? `${cheevo.zone} [${subLevel}]` : cheevo.zone :
        cheevo.level?.toString()?.replace(".", "-");

    let popup = document.createElement("div");
    popup.classList.add("cheevo-popup", "popup", cheevo.isHardcoreEarned ? "hardcore" : cheevo.isEarned ? "softcore" : "f",);
    popup.classList.toggle("fixed", isFixed);
    popup.dataset.id = cheevo.ID;
    popup.innerHTML = `
        <div class="cheevo-popup__header">
            <h3 class="cheevo-popup__title">${cheevo.Title}</h3>
            <div class="cheevo-popup__description"> ${cheevo.Description} </div>
            ${badges(level, cheevo.genres)}
            <div class="points">
                ${signedIcons.points(cheevo.Points)}
                ${signedIcons.retropoints(cheevo.TrueRatio)}
                ${signedIcons.rarity(cheevo.rateEarnedHardcore)}
                ${signedIcons.retroRatio(cheevo.retroRatio)}
                ${icons.cheevoType(cheevo.Type)}
                ${badgeElements.difficultBadge(cheevo.difficulty)}
            </div>
        </div>
        <div class="cheevo-popup__props">
            ${propElem(ui.lang.unlockDate, formatDateTime(cheevo.DateEarnedHardcore), !!cheevo.DateEarnedHardcore)}
            ${propElem(ui.lang.unlockDate + ui.lang.casual_, formatDateTime(cheevo.DateEarned), !!cheevo.DateEarned && (cheevo.DateEarnedHardcore != cheevo.DateEarned))}
            ${propElem(ui.lang.playersTotal, [cheevo.totalPlayers])}
            ${propElem(ui.lang.unlockedBy, [cheevo.NumAwardedHardcore, cheevo.NumAwarded])}
            ${propElem(ui.lang.unlockRate, [cheevo.rateEarnedHardcore, cheevo.rateEarned])}
            ${propElem(ui.lang.timeToUnlock, [secondsToBadgeString(cheevo.timeToUnlock), secondsToBadgeString(cheevo.timeToUnlockSoftcore)])}
            ${propElem(ui.lang.created, [formatDate(cheevo.DateCreated), formatDate(cheevo.DateModified)])}
            ${propElem(ui.lang.createdBy, cheevo.Author)}
        </div>
    `;

    return popup;
}