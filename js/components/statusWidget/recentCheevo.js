import { cheevoImageUrl } from "../../functions/raLinks.js";

export const recentCheevoHtml = (cheevo) => `
    <li class="last-cheevo" data-achiv-id="${cheevo?.ID ?? 0}">
        <img class="last-cheevo__img" src="${cheevoImageUrl(cheevo)}" alt="">
    </li>`;