import { fromHtml } from "../../../../js/functions/html.js";
import { gameImageUrl } from "../../../../js/functions/raLinks.js";
import { RAPlatforms } from "../../enums/RAPlatforms.js";
import { generateBadges } from "../components/badges.js";

export function GameElement(gameData) {
    const {
        ID,
        ImageIcon,
        Title,
        badges,
        NumAchievements,
        Points,
        ConsoleID,
    } = gameData;

    const gameElement = fromHtml(`
        <li class="list-game-item">
            <div class="library__game-container list-item"  onclick="ui.showGameDetails(${ID}); event.stopPropagation()">
                <div class="awards__game-preview-container" onclick="ui.goto.game(${ID}); event.stopPropagation()">
                    <img class="awards__game-preview" src="${gameImageUrl(ImageIcon)}">
                </div>
                <div class="awards__game-description">
                    <h2 class="library__game-title">${Title} ${generateBadges(badges)}</h2>
                    <div  class="game-stats__button"  onclick="ui.expandGameItem(${ID},this); event.stopPropagation()">
                        <i class="game-stats__icon game-stats__expand-icon"/>
                    </div>
                    <div class="awards__game-stats__text">${RAPlatforms[ConsoleID]}</div>

                    <div class="awards__game-stats-container" >
                        <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"/>
                            <div class="game-stats__text">${NumAchievements}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"/>
                            <div class="game-stats__text">${Points}</div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `);
    gameElement.dataset.id = ID;
    return gameElement;
}