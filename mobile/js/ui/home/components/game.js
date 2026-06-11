import { gameImageUrl } from "../../../../../js/functions/raLinks.js";
import { toLocalString } from "../../../functions/time.js";
import { generateBadges } from "../../components/badges.js";

export function recentGameHtml(gameData) {
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

    return `    
        <li class="user-info__last-game-container" data-id="${ID}">
            <div class="user-info__game-main-info"  onclick="ui.showGameDetails(${ID}); event.stopPropagation()">
                <div class="user-info__game-preview-container" onclick="ui.goto.game(${ID}); event.stopPropagation()">
                    <img class="user-info__game-preview" src="${gameImageUrl(ImageIcon)}" alt="">
                </div>
                <div class="user-info__game-description" >
                    <h2 class="user-info__game-title">${FixedTitle} ${generateBadges(badges)}</h2>
                    <div class="game-stats__text">${toLocalString(LastPlayed)} | ${ConsoleName}</div>
                    <div  class="game-stats__button"  onclick="ui.expandGameItem(${ID},this); event.stopPropagation()">
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
        `;
}
export function recentGamesListHtml({ lastGames }) {
    return lastGames.reduce((elements, game) => {
        const gameHtml = recentGameHtml(game);
        elements += gameHtml;
        return elements;
    }, "")
}