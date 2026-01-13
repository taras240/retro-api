// export const icons = {
//     flag: '<i class="description-icon map-icon"></i>',
//     points: `
//         <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" height="24" viewBox="0 -960 960 960" width="24"><path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`,
//     retropoints: '<i>⚡️</i>',
//     cheevos: '<i>⭐</i>',
//     trueratio: '<i>💎</i>',
//     players: `<i class="notification_description-icon  players-icon"></i>`,
//     rarity: (rarity) => `<i>📈</i>`,
//     retroRatio: (retroRatio) => `<i>💎</i>`,
//     cheevoType: (type) => type ? `<i data-title="${type}">${type == "win_condition" ? "🏁" : type == "progression" ? "🔹" : "❕"}</i>` : "",
//     chat: '<i class="description-icon link_icon chat-icon"></i>',
//     award: (awardType) => awardType ? `<i class="description-icon award-type__icon ${awardType}_icon"></i>` : "",
//     favourite: `<i class="description-icon favourite_icon"></i>`,
//     apply: '<i class="description-icon link_icon apply-icon"></i>',
//     search: '<i class="description-icon link_icon search-icon google_link"></i>',
//     link: '<i class="description-icon link_icon ra-link_icon"></i>',

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
    players: (label) => signedIconTemplate({ icon: icons.players, label })
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
// export const icons = {
//     flag: '<i class="description-icon map-icon"></i>',
// time: '<i>⌛</i>',
// level: '<i>🚩</i>',
//     points: '<i class="description-icon points-icon  auto-font-size"></i>',
//     retropoints: '<i class="description-icon retropoints-icon auto-font-size"></i>',
//     cheevos: '<i class="description-icon achievements-icon auto-font-size"></i>',
//     trueratio: '<i class="description-icon rarity-icon  auto-font-size"></i>',
// players: `<i class="notification_description-icon  players-icon"></i>`,
//     rarity: (rarity) => ` <i class="description-icon  ps-rarity-icon ${rarity < 5 ? "ultra-rare" : rarity < 10 ? "very-rare" : rarity < 25 ? "rare" : ""}"></i>`,
//     retroRatio: (retroRatio) => `<i class="description-icon  ${retroRatio > 13 ? "difficult-badge__hell" : ""}  rarity-icon"></i>`,
//     cheevoType: (type) => `<i class=" description-icon ${type ?? "none"}" data-title="achievement type [${type ?? "none"}]"></i> `,
//     chat: '<i class="description-icon link_icon chat-icon"></i>',
//     award: (awardType) => awardType ? `<i class="description-icon award-type__icon ${awardType}_icon"></i>` : "",
//     favourite: `<i class="description-icon favourite_icon"></i>`,
//     apply: '<i class="description-icon link_icon apply-icon"></i>',
//     search: '<i class="description-icon link_icon search-icon google_link"></i>',
//     link: '<i class="description-icon link_icon ra-link_icon"></i>',
// }