import { highestAwardMap } from "../../enums/gameAwards.js";
import { GAME_GENRE_CODES } from "../../enums/gameGenres.js";
import { fromHtml } from "../../functions/html.js";
import { gameImageUrl } from "../../functions/raLinks.js";
import { ui } from "../../script.js";
import { badgeElements, generateBadges } from "../badges.js";
import { buttonsHtml } from "../htmlElements.js";
import { signedIcons } from "../icons.js";

export function GameListElement(gameData) {
    const gameElement = fromHtml(`
        <li class="platform_game-item games__game-item" draggable="true"/>
    `);

    gameElement.dataset.id = gameData.ID;
    const gamePreview = fromHtml(`
        <img class="game-preview_image" src="${gameImageUrl(gameData.ImageIcon)}">
    `);
    const genreBadges = gameData.genres
        ?.map(genreID => badgeElements.green(GAME_GENRE_CODES[genreID]))
        .join(" ");

    const gameTitle = fromHtml(`
        <h3 class="game-description_title">
            <button class="game-description_button" data-id="${gameData.ID}" >
                    ${gameData.Title} 
                    ${gameData.Award ? badgeElements.gold(ui.lang[highestAwardMap[gameData.Award]]) : ""}
                    ${gameData.badges?.length ? generateBadges(gameData.badges, "black") : ""} 
                    ${genreBadges?.length ? genreBadges : ""}
            </button>
        </h3>
    `)
    const gameIcons = fromHtml(`
        <div class="game-description__info icons-row-list"> 
            ${signedIcons.platform(gameData.ConsoleID)}
            ${signedIcons.date(gameData.Date || "n/a")}
            ${signedIcons.players(gameData.playersTotal)}
            ${signedIcons.cheevos((gameData.NumAwardedHardcore ? gameData.NumAwardedHardcore + '\/' : "") + gameData.NumAchievements)}
            ${signedIcons.points(gameData.Points)}
            ${signedIcons.retroRatio(gameData.trueRatio || "n/a")}
            ${signedIcons.rarity(([gameData.beatenRate, gameData.masteryRate].filter(v => v).join("/")) + "%")}
            ${signedIcons.time(gameData.timeToBeatString)}
        </div>
    `);

    const controlsContainer = fromHtml(`<div class="list-item-controls"/>`);
    const removeButton = fromHtml(buttonsHtml.delete());
    controlsContainer.append(removeButton);
    gameElement.append(gamePreview, gameTitle, gameIcons, controlsContainer);
    if (gameData.NumAwardedHardcore) {
        const progressRate = 100 * (gameData.NumAwardedHardcore / gameData.NumAchievements);
        const gameProgress = fromHtml(`
        <div class="game-item__progressbar-container" style="--progress-rate:${progressRate}%">
            <div class="game-item__progressbar-value"/>
        </div>
    `);
        gameElement.append(gameProgress);
    }
    if (gameData.series?.length) {
        gameElement.dataset.series = gameData.series.join(",");
        const seriesButton = fromHtml(`
            <button class="show-series-button" data-title="${ui.lang.showSeries}">${ui.lang.series}</button>
        `)
        controlsContainer.prepend(seriesButton)
    }
    return gameElement;
}