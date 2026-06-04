import { fromHtml } from "../../functions/html.js";
import { gameImageUrl } from "../../functions/raLinks.js";
import { ui } from "../../script.js";
import { badgeElements, generateBadges } from "../badges.js";
import { signedIcons } from "../icons.js";

export function GameListElement(gameData) {
    const gameElement = fromHtml(`
        <li class="platform_game-item games__game-item"/>
    `);

    gameElement.dataset.id = gameData.ID;
    const gamePreview = fromHtml(`
        <img class="game-preview_image" src="${gameImageUrl(gameData.ImageIcon)}">
    `);
    const gameTitle = fromHtml(`
        <h3 class="game-description_title">
            <button class="game-description_button" data-title="${ui.lang.showGameInfoHint}" data-id="${gameData.ID}" >
                    ${gameData.Title} 
                    ${gameData.Award ? badgeElements.gold(gameData.Award) : ""}
                    ${gameData.badges?.length ? generateBadges(gameData.badges, "black") : ""} 
            </button>
        </h3>
    `)
    const gameIcons = fromHtml(`
        <div class="game-description__info icons-row-list"> 
            ${signedIcons.platform(gameData.ConsoleID)}
            ${signedIcons.date(gameData.Date || "n/a")}
            ${signedIcons.cheevos((gameData.NumAwardedHardcore ? gameData.NumAwardedHardcore + '\/' : "") + gameData.NumAchievements)}
            ${signedIcons.points(gameData.Points)}
            ${signedIcons.retropoints(gameData.retropoints || "n/a")}
            ${signedIcons.time(gameData.timeToBeat)}
        </div>
    `);

    gameElement.append(gamePreview, gameTitle, gameIcons);
    if (gameData.NumAwardedHardcore) {
        const progressRate = 100 * (gameData.NumAwardedHardcore / gameData.NumAchievements);
        const gameProgress = fromHtml(`
        <div class="game-item__progressbar-container" style="--progress-rate:${progressRate}%">
            <div class="game-item__progressbar-value"/>
        </div>
    `);
        gameElement.append(gameProgress);
    }
    return gameElement;
}