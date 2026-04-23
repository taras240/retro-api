import { badgeElements } from "../badges.js";

export function focusCheevoHtml() {
    return `
        <div class="rp__focus-cheevo">
            <div class="rp__focus-preview">
                <img class="rp__focus-image" src="https://media.retroachievements.org/Badge/384447.png">
            </div>
            <div class="rp__focus-info">
                <h3 class="rp__focus-title">${badgeElements.gold("focus")} Picking Up The Pace</h3>
                <p class="rp__focus-description">Beat SMB1 and reach 4-3 in SMB2J under 13:00.00</p>
            </div>
        </div>
    `
}