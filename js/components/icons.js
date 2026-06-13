
import { CHEEVO_GENRES } from "../enums/cheevoGenres.js"
import { RA_PLATFORM_CODES } from "../enums/RAPlatforms.js"
import { ui } from "../script.js"

const signedIconTemplate = ({ icon, label = "", hint = "", }) => {
    return `<p class="signed-icon" data-title="${hint}">${icon}${label}</p>`
}
export const signedIcons = {
    cheevos: (count) => signedIconTemplate({ icon: icons.cheevos, label: count, hint: ui.lang.cheevosCount }),
    points: (points) => signedIconTemplate({ icon: icons.points, label: points, hint: ui.lang.points }),
    retropoints: (retropoints) => signedIconTemplate({ icon: icons.retropoints, label: retropoints, hint: ui.lang.retropoints }),
    rarity: (rateEarned) => signedIconTemplate({ icon: icons.rarity, label: rateEarned, hint: ui.lang.unlockRate }),
    retroRatio: (retroRatio) => signedIconTemplate({ icon: icons.retroRatio, label: retroRatio, hint: ui.lang.trueRatio }),
    level: (level) => signedIconTemplate({ icon: icons.level, label: level, hint: ui.lang.level }),

    date: (date) => signedIconTemplate({ icon: icons.date, label: date, hint: ui.lang.date }),
    time: (time) => time ? signedIconTemplate({ icon: icons.time, label: time, hint: ui.lang.time }) : "",
    rating: (rating) => signedIconTemplate({ icon: icons.rating, label: rating, hint: ui.lang.gameRating }),
    platform: (platformID) => signedIconTemplate({ icon: icons.platform(platformID), label: RA_PLATFORM_CODES[platformID].Name, hint: platformID }),

    difficulty: (difficulty) => `<p class="description-icon difficult-icon difficult-badge__${difficulty}" data-title="${ui.lang.difficulty} [${difficulty}]"></p>`,
    award: (award) => `<p  class="signed-icon award-type" data-title="${award}">
    ${icons.award(award)}</p>`,
    empty: (icon) => signedIconTemplate({ icon }),
    players: (label) => {
        if (typeof label === "number") {
            label = formatViews(label);
        }
        return signedIconTemplate({ icon: icons.players, label })
    }
}
function formatViews(n) {
    const units = ['', 'K', 'M', 'B'];
    let i = 0;

    while (n >= 1000 && i < units.length - 1) {
        n /= 1000;
        i++;
    }

    return `${parseFloat(n.toFixed(1))}${units[i]}`;
}
const unicodeIcon = (symbol) => `<i>${symbol}</i>`
export const icons = {
    flag: '<i class="description-icon map-icon"></i>',
    time: unicodeIcon("⏰"),//⌛
    level: unicodeIcon("🚩"),
    points: unicodeIcon("💰"),
    retropoints: unicodeIcon("⚡️"),
    cheevos: unicodeIcon("⭐"),
    trueratio: unicodeIcon("💎"),
    players: unicodeIcon("👥"),
    date: unicodeIcon("📅"),
    rating: unicodeIcon("🔥"),
    rarity: unicodeIcon("📈"),
    retroRatio: unicodeIcon("💎"),
    masteryAward: unicodeIcon("🏆"),
    progressionAward: unicodeIcon("🎖️"),
    // rarity: (rarity) => `<i>📈</i>`,
    // retroRatio: (retroRatio) => `<i>💎</i>`,
    cheevoType: (type) => `<i class=" description-icon ${type ?? "none"}" data-title="[${type ?? "none"}]"></i> `,
    // cheevoType: (type) => type ? `<i data-title="${type}">${type == "win_condition" ? "🏁" : type == "progression" ? "🔹" : "❕"}</i>` : "",
    chat: '<i class="description-icon link_icon chat-icon"></i>',
    award: (awardType) => awardType ? `<i class="description-icon award-type__icon ${awardType}_icon"></i>` : "",
    favourite: `<i class="description-icon favourite_icon"></i>`,
    apply: '<i class="description-icon link_icon apply-icon"></i>',
    search: '<i class="description-icon link_icon search-icon google_link"></i>',
    link: '<i class="description-icon link_icon ra-link_icon"></i>',
    platform: (platformID) => `<img class="image-icon console-icon" src="${RA_PLATFORM_CODES[platformID].IconURL}">`,
    unlock: '<i class="description-icon unlock_icon"></i>',
}
export const genreIcons = {
    [CHEEVO_GENRES.KILLER]: `<i class="cheevo-genre__icon">💀</i>`,
    [CHEEVO_GENRES.PACIFIST]: `<i class="cheevo-genre__icon">☮️</i>`,
    [CHEEVO_GENRES.SCORE]: `<i class="cheevo-genre__icon">💲</i>`,
    [CHEEVO_GENRES.TIMETRIAL]: `<i class="cheevo-genre__icon">⏳</i>`,
    [CHEEVO_GENRES.NO_DEATH]: `<i class="cheevo-genre__icon">👼</i>`,//👻
    [CHEEVO_GENRES.NO_DAMAGE]: `<i class="cheevo-genre__icon">❤️</i>`,
    [CHEEVO_GENRES.COLLECTOR]: `<i class="cheevo-genre__icon">👑</i>`,
    [CHEEVO_GENRES.BOSSFIGHT]: `<i class="cheevo-genre__icon">😈</i>`,
}