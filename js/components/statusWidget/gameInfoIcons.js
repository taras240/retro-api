import { richPresenceHtml } from "./richPresence.js";

export const gameInfoIconsHtml = () => `
        <p class="rp__game-platform"></p>
        <div class="icons-row-list rp__game-icons"></div>
    `;
export const richInfoHtml = () => `
${richPresenceHtml()}
        <div class="icons-row-list rp__game-icons"></div>
    `