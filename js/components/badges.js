import { DIFFICULTY_NAMES } from "../enums/difficulty.js";
import { genreIcons, icons, signedIcons } from "./icons.js";

export function generateBadges(badges, badgeType = "gameTitle") {
    return badges?.reduce((acc, label) => {
        if (!label) return acc;
        label = label.toString();
        if (label.trim() == "") return acc;
        const badge = badgeElements[badgeType](label);
        acc.push(badge);
        return acc;
    }, []).join(" ");
}

export const badgeElements = {
    default: (text) => badgeTemplate({ text }),
    infoBadge: (text) => badgeTemplate({ text, classes: ["badge_transparent"] }),
    selection: (text, onClick) => badgeTemplate({ text, classes: ["badge_selection"], event: `onclick="${onClick}"`, }),
    black: (text) => badgeTemplate({ text, classes: ["badge_black"] }),
    gold: (text) => badgeTemplate({ text, classes: ["badge_gold"] }),
    green: (text) => badgeTemplate({ text, classes: ["badge_dark-green"] }),
    gameTitle: (text) => badgeTemplate({ text, classes: ["badge_gold"] }),
    gameGenre: (text) => badgeTemplate({ text, classes: ["game-title_genre"] }),
    cheevoLevel: (level, isTarget) => `<div 
            class="${isTarget ? "target-level-badge" : ""} badge badge-green" 
            data-title="${ui.lang.level}" >
            ${icons.flag}${level}
        </div>`,
    difficultBadge: (difficulty, prefix = "") => {
        if (difficulty == "") return "";
        const badge = `
            <p class="badge difficult-badge difficult-badge__${difficulty}" >
                ${prefix} ${DIFFICULTY_NAMES[difficulty]}
                    </p >
            `;
        return badge;
    },
    hltbBadge: (time, prefix = "") => {
        const badge = badgeElements.gold(`HLTB: ${time} `);
        return badge;
    },
    buttonGenreBadge: (text) => badgeTemplate({
        text: text,
        classes: ["target-genre-badge", "badge-bold", "badge-gold", "badge-button"],
        // hint: text.toUpperCase(),
        dataProp: `data-genre="${text}"`
    }),
    customBadge: (text) => badgeTemplate({ text, classes: ["badge_custom-color"] })
}
export const badgeTemplate = ({ text, classes = [], hint, event, dataProp }) => {
    const classNames = ["badge", ...classes].join(" ");
    const dataTitle = hint ? `data-title="${hint}"` : "";
    return `<i class="${classNames}" ${dataTitle} ${event || ""} ${dataProp || ""}>${text.toString().trim()}</i>`;
}
export const goldBadge = (text) => {
    return badgeElements.gold(text);
}