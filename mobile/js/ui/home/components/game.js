import { fromHtml } from "../../../../../js/functions/html.js";
import { gameImageUrl } from "../../../../../js/functions/raLinks.js";
import { toLocalString } from "../../../functions/time.js";
import { ui } from "../../../main.js";
import { generateBadges } from "../../components/badges.js";

export function recentGameElement(gameData) {
    const {
        GameID: ID,
        ImageIcon,
        FixedTitle,
        badges,
        LastPlayed,
        ConsoleName,
        NumAchieved,
        NumAchievedHardcore,
        NumPossibleAchievements,
        ScoreAchieved,
        ScoreAchievedHardcore,
        PossibleScore,
    } = gameData;
    const gameElement = fromHtml(`    
        <li class="list-game-item" data-id="${ID}">
            <div class="list-item">
                <div class="user-info__game-preview-container">
                    <img class="user-info__game-preview" src="${gameImageUrl(ImageIcon)}">
                </div>
                <div class="item-meta" >
                    <h2 class="user-info__game-title">${FixedTitle} ${generateBadges(badges)}</h2>
                    <div class="game-stats__text">${toLocalString(LastPlayed)} | ${ConsoleName}</div>
                    <div  class="game-stats__button">
                        <i class="game-stats__icon game-stats__expand-icon"></i>
                    </div>
                    <div class="user-info_game-stats-container">
                        <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"></i>
                            <div class="game-stats__text">${ui.isSoftmode ? NumAchieved : NumAchievedHardcore} / ${NumPossibleAchievements}</div>
                            </div>
                            <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"></i>
                            <div class="game-stats__text">${ui.isSoftmode ? ScoreAchieved : ScoreAchievedHardcore} / ${PossibleScore}</div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `);
    gameElement.addEventListener("click", event => {
        event.stopPropagation();
        ui.showGameDetails(ID);
    });
    gameElement.querySelector(".user-info__game-preview-container")?.addEventListener("click", event => {
        event.stopPropagation();
        ui.goto.game(ID);
    });
    gameElement.querySelector(".game-stats__button")?.addEventListener("click", event => {
        event.stopPropagation();
        ui.expandGameItem(ID, event.target);
    });
    return gameElement;
}
export function recentGamesElements({ lastGames }) {
    return lastGames.map(game => recentGameElement(game))
}