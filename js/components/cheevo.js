import { badgeElements, goldBadge } from "./badges.js";
import { icons, signedIcons } from "./icons.js";

export const cheevoElementFull = (cheevo, isTarget = false) => {
    const cheevoElement = document.createElement("li");
    cheevoElement.classList.add("cheevo-column-item");
    cheevoElement.classList.toggle("earned", cheevo.isEarned);
    cheevoElement.classList.toggle("hardcore", cheevo.isHardcoreEarned)
    cheevoElement.dataset.achivId = cheevo.ID;

    const subLevel = cheevo.level?.toString()?.split(".")[1];
    const level = cheevo.zone ? subLevel ? `${cheevo.zone} [${subLevel}]` : cheevo.zone : cheevo.level?.toString()?.replace(".", "-");
    const rarity = 100 * cheevo.NumAwardedHardcore / cheevo.totalPlayers;
    const sideButtonsHtml = `
        <div class="target__buttons-container">
                <button class="header-button header-icon  target__comments-button edit-cheevo-button edit-icon" data-title="edit props" data-cheevo-id="${cheevo.ID}"></button>
                <button class="header-button header-icon  target__comments-button comments-button chat-icon" data-title="${ui.lang.showCommentsHint}"></button>
                <button class="header-button header-icon  delete-icon delete-from-target" data-title="remove"></button>
        </div>
    `;
    cheevoElement.innerHTML = `
            ${isTarget ? sideButtonsHtml : ""}
            <div class="prev">
                <img
                class="prev-img"
                src="${cheevo.prevSrc}"
                alt="${cheevo.Title}"
                />
            </div>
            <div class="target__cheevo-details">
                <h3 class="target__cheevo-header">
                    ${level ? badgeElements.cheevoLevel(level, true) : ""}
                    <!--${cheevo.genres.length > 0 ? cheevo.genres?.map(genre => goldBadge(genre)).join("") : ""}-->
                    <a target="_blanc" data-title="go to RA cheevo-page" href="https://retroachievements.org/achievement/${cheevo.ID}">
                        ${cheevo.Title}
                    </a>
                </h3>
                <p class="list-item__text">${cheevo.Description}</p>
                <div class="icons-row-list">
                    ${icons.cheevoType(cheevo.Type)}
                    ${signedIcons.points(cheevo.Points)}
                    ${signedIcons.retropoints(cheevo.TrueRatio)}
                    ${signedIcons.rarity(cheevo.rateEarnedHardcore)}
                    ${signedIcons.retroRatio(cheevo.retroRatio)}
                    ${badgeElements.difficultBadge(cheevo.difficulty)}
                </div>
            </div>
            `;
    return cheevoElement;
}