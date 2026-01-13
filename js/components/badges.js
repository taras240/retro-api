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
    gameTitle: (text) => badgeTemplate({ text, classes: [text.toLowerCase().replace(/[\s\'\"\`]/g, "-")] }),
    gameGenre: (text) => badgeTemplate({ text, classes: ["game-title_genre"] }),
    cheevoLevel: (level, isTarget) => `<div 
            class="${isTarget ? "target-level-badge" : ""} badge badge_gold" 
            data-title="${ui.lang.level}" >
            ${icons.flag}${level}
        </div>`,
    difficultBadge: (difficulty, prefix = "") => {
        if (difficulty == "") return "";
        const badge = `
            <p class="badge difficult-badge__${difficulty}" >
                ${prefix} ${DIFFICULTY_NAMES[difficulty]}
                    </p >
            `;
        return badge;
    },
    hltbBadge: (time, prefix = "") => {
        const badge = badgeElements.gold(`HLTB: ${time} `);
        return badge;
    },
    buttonGenreBadge: (text, onClick) => badgeTemplate({
        text: text,
        classes: ["target-genre-badge", "badge-bold", "badge_gold", "badge-button"],
        // hint: text.toUpperCase(),
        event: `onclick="${onClick}"`,
        dataProp: `data-genre="${text}"`
    })
}
const badgeTemplate = ({ text, classes = [], hint, event, dataProp }) => {
    const classNames = ["badge", ...classes].join(" ");
    const dataTitle = hint ? `data-title="${hint}"` : "";
    return `<i class="${classNames}" ${dataTitle} ${event || ""} ${dataProp || ""}>${text.trim()}</i>`;
}
export const goldBadge = (text) => {
    return badgeElements.gold(text);
}