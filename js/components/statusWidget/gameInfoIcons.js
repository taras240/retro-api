import { richPresenceHtml } from "./richPresence.js";

export const gameInfoIconsHtml = () => `
        <p.rp__game-platform/>
        <.icons-row-list.rp__game-icons/>
    `;
export const richInfoHtml = () => `
        ${richPresenceHtml()}
        <.icons-row-list.rp__game-icons/>
    `