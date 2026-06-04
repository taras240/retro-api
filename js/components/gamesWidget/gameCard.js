import { fromHtml } from "../../functions/html.js";
import { gameImageUrl, gameUrl } from "../../functions/raLinks.js";
import { generateBadges } from "../badges.js";
import { buttonsHtml } from "../htmlElements.js";

export function GameCardElement(gameData) {
    const properyLine = (label, value) => `
            <div class="game-description__property">
                ${label}: <span>${value}</span>
            </div>
        `;
    const gamePreviewImage = (linkEndpoint) => `<img class="game__image" src="${gameImageUrl(linkEndpoint)}">`

    const gameHeader = fromHtml(`
        <div class="game-popup__header-container header-container">
            <h2 class="widget-header-text">
                <a href="${gameUrl(gameData.ID)}" target="_blank">${gameData.Title} ${generateBadges(gameData.badges)}</a>
            </h2>
            ${buttonsHtml.close("this.closest('section').remove();")}
        </div>
    `);
    const gameInfoContainer = fromHtml(`
        <div class="game-info__container"/>
    `);
    const previewList = fromHtml(`
        <div class="game-info__images-container scrollable">
            ${gamePreviewImage(gameData.ImageBoxArt)}
            ${gamePreviewImage(gameData.ImageIngame)}
            ${gamePreviewImage(gameData.ImageTitle)}
        </div>
    `);
    const descriptionsContainer = fromHtml(`
        <div class="game-info__descriptions-container">
            ${properyLine(ui.lang.platform, gameData?.ConsoleName)}
            ${properyLine(ui.lang.developer, gameData?.Developer)}
            ${properyLine(ui.lang.genre, gameData?.Genre)}
            ${properyLine(ui.lang.publisher, gameData?.Publisher)}
            ${properyLine(ui.lang.released, gameData?.Released)}
            ${properyLine(ui.lang.cheevosCount, `${gameData?.NumAwardedToUserHardcore} / ${gameData?.NumAwardedToUser} / ${gameData?.NumAchievements}`)}
            ${properyLine(ui.lang.retropoints, `${gameData?.unlockData.hardcore.retropoints} / ${gameData?.totalRetropoints}`)}
            ${properyLine(ui.lang.points, `${gameData?.unlockData.hardcore.points} / ${gameData?.unlockData.softcore.points} / ${gameData?.totalPoints}`)}
            ${properyLine(ui.lang.retroRatio, gameData?.retroRatio)}
            ${properyLine(ui.lang.players, `${gameData?.masteredCount} / ${gameData?.beatenCount} / ${gameData?.players_total}`)}
            ${properyLine(ui.lang.completion, `${gameData?.masteryRate}% / ${gameData?.beatenRate}%`)}
        </div>
    `);

    gameInfoContainer.append(previewList, descriptionsContainer);
    const gamePopupElement = fromHtml(`<section class="section game-popup__section"/>`);
    gamePopupElement.append(gameHeader, gameInfoContainer);
    return gamePopupElement;
}