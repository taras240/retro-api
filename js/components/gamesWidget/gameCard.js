import { fromHtml } from "../../functions/html.js";
import { gameImageUrl, gameUrl } from "../../functions/raLinks.js";
import { generateBadges } from "../badges.js";
import { buttonsHtml } from "../htmlElements.js";
const formatStatsLine = (stats = [], sufix = "") => [...new Set(stats.filter(v => v))].map(v => v + sufix).join(" / ");
export function GameCardElement(gameData) {
    const properyLine = (label, value) => `
            <.game-description__property>
                ${label}: <span>${value}</span>
            </>
        `;
    const gamePreviewImage = (linkEndpoint) => `<img class="game__image" src="${gameImageUrl(linkEndpoint)}">`

    const gameHeader = fromHtml(`
        <.game-popup__header-container.header-container>
            <h2 class="widget-header-text">
                <a href="${gameUrl(gameData.ID)}" target="_blank">${gameData.Title} ${generateBadges(gameData.badges)}</a>
            </h2>
            ${buttonsHtml.close("this.closest('section').remove();")}
        </>
    `);
    const gameInfoContainer = fromHtml(`
        <.game-info__container/>
    `);
    const previewList = fromHtml(`
        <.game-info__images-container.scrollable>
            ${gamePreviewImage(gameData.ImageBoxArt)}
            ${gamePreviewImage(gameData.ImageIngame)}
            ${gamePreviewImage(gameData.ImageTitle)}
        </>
    `);
    const descriptionsContainer = fromHtml(`
        <.game-info__descriptions-container/>
    `);
    const descriptions = fromHtml([
        properyLine(lang.platform, gameData?.ConsoleName),
        properyLine(lang.developer, gameData?.Developer),
        properyLine(lang.genre, gameData?.Genre),
        properyLine(lang.publisher, gameData?.Publisher),
        properyLine(lang.released, gameData?.Released),
        properyLine(lang.cheevosCount, formatStatsLine([
            gameData?.NumAwardedToUserHardcore,
            gameData?.NumAwardedToUser,
            gameData?.NumAchievements,
        ])),
        properyLine(lang.retropoints, formatStatsLine([
            gameData?.unlockData.hardcore.retropoints,
            gameData?.totalRetropoints,
        ])),
        properyLine(lang.points, formatStatsLine([
            gameData?.unlockData.hardcore.points,
            gameData?.unlockData.softcore.points,
            gameData?.totalPoints
        ])),
        properyLine(lang.retroRatio, gameData?.retroRatio),
        properyLine(lang.players, formatStatsLine([
            gameData?.masteredCount,
            gameData?.beatenCount,
            gameData?.NumDistinctPlayers,
        ])),
        properyLine(lang.completion, formatStatsLine([
            gameData?.masteryRate,
            gameData?.beatenRate
        ], "%")),
    ]);
    descriptionsContainer.append(...descriptions);
    gameInfoContainer.append(previewList, descriptionsContainer);
    const gamePopupElement = fromHtml(`<section class="section game-popup__section"/>`);
    gamePopupElement.append(gameHeader, gameInfoContainer);
    return gamePopupElement;
}