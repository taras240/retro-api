import { generateBadges } from "./components/badges.js";
import { sortBy } from "../functions/sort.js";
import { apiWorker } from "../main.js";
import { svgIcons } from "./components/svgIcons.js";
import { toLocalString } from "../functions/time.js";
import { fromHtml } from "../../../js/functions/html.js"

let USER_INFO;
export class Home {
    constructor() {
        this.update();
    }
    async update() {
        ui.showLoader();
        if (USER_INFO) {
            const section = this.HomeSection()
            ui.content.innerHTML = '';
            ui.content.append(section);
            ui.removeLoader();
        }
        else {
            await this.loadUserInfo();
            this.update()
        }

    }
    async loadUserInfo() {
        const userData = await apiWorker.getUserSummary({ gamesCount: 5, achievesCount: 8 });
        // const userData = await fetch("/json/apiTemplates/API_GetUserSummary.json").then(resp => resp.json()).then(summary => {
        //     summary.RecentlyPlayed = summary.RecentlyPlayed.map(game => {
        //         game.LastPlayed = apiWorker.toLocalTimeString(game.LastPlayed);
        //         summary.Awarded[game.GameID] && (game = { ...game, ...summary.Awarded[game.GameID] })
        //         game = apiWorker.fixGameTitle(game);
        //         return game;
        //     });
        //     summary.RecentAchievements = Object.values(summary.RecentAchievements)
        //         .flatMap(RecentAchievements => Object.values(RecentAchievements)).map(achiv => {
        //             achiv.DateEarned = apiWorker.toLocalTimeString(achiv.DateAwarded);
        //             return achiv;
        //         });
        //     summary.isInGame = (new Date() - new Date(summary.RecentlyPlayed[0].LastPlayed)) < 5 * 60 * 1000;

        //     return summary;
        // });
        USER_INFO = {
            userName: userData.User,
            status: userData.Status?.toLowerCase(),
            richPresence: userData.RichPresenceMsg,
            memberSince: userData.MemberSince,
            userImageSrc: `https://media.retroachievements.org${userData.UserPic}`,
            userRank: userData.Rank ? `Rank: ${userData.Rank} (Top ${~~(10000 * userData.Rank / userData.TotalRanked) / 100}%)` : "Rank is unavailable",
            softpoints: userData.TotalSoftcorePoints,
            retropoints: userData.TotalTruePoints,
            hardpoints: userData.TotalPoints,
            lastGames: userData.RecentlyPlayed,
            lastAchievements: Object.values(userData.RecentAchievements).map(a => {
                a.DateEarnedHardcore = a.DateAwarded;
                return a;
            })
                .sort((a, b) => sortBy.date(a, b)),
            isInGame: userData.isInGame,
        }
    }

    HomeSection() {
        const homeSection = fromHtml(`
            <section class="home__section section">
                ${this.headerHtml()}
                <div class="user-info__container">
                    <ul class="user-info__last-games-list">
                        <button  class="user-info__block-header">
                            <h2>Last Unlocks</h2>
                            <p style="display:none">See more</p>
                        </button>
                        ${USER_INFO.lastAchievements.reduce((elements, achievement) => {
            const achievementHtml = this.achievementHtml(achievement);
            elements += achievementHtml;
            return elements;
        }, "")}
                        <button  class="user-info__block-header">
                            <h2>Recently Played</h2>
                            <p style="display:none">See more</p>
                        </button>
                        ${USER_INFO.lastGames.reduce((elements, game) => {
            const gameHtml = this.gameHtml(game);
            elements += gameHtml;
            return elements;
        }, "")}
                    </ul>
                </div>
            </section
        `);
        return homeSection;
    }

    headerHtml() {
        const retroRatio = +(USER_INFO.retropoints / USER_INFO.hardpoints).toFixed(2);
        return `
      <div class="section__header-container user-info__header-container">
        <div class="user-info__header">
            <div class="user-info__avatar-container">
                <img src="${USER_INFO.userImageSrc}" alt="" class="user-info__avatar" onclick="ui.goto.login()">
                ${retroRatio ? `<span class="game-header__retro-ratio  achiv-rarity__standard">${retroRatio}</span>` : ""}
            </div>
            <button class="button__switch-mode ${ui.isSoftmode ? "softmode" : ""}" onclick="ui.switchGameMode()">${ui.isSoftmode ? "SOFT" : "HARD"}</button>
            <div class="user-info__user-name-container">
                <h1 class="user-info__user-name">${USER_INFO.userName}</h1>
                <div class="user-info__user-rank">${USER_INFO.userRank}</div>
                <div class="user-info__rich-presence">Member since: ${new Date(USER_INFO.memberSince).toLocaleDateString()}</div>
            </div>
        </div>
        ${USER_INFO.isInGame ? `
        <div class="user-info__rich-presence"> ${USER_INFO.richPresence}</div>
        `: ""}
        
        
      </div>
    `;//${this.pointsHtml()}
    }
    pointsHtml() {
        return `
        <div class="user-info__points-container">
          ${USER_INFO.softpoints > 0 ? `
            <div class="user-info__points-group">
              <h3 class="user-info__points-name">softpoints</h3>
              <p class="user-info__points">${USER_INFO.softpoints}</p>
            </div>
            <div class="vertical-line"></div>
          `: ""
            }
            <div class="user-info__points-group">
                <h3 class="user-info__points-name">hardpoints</h3>
                <p class="user-info__points">${USER_INFO.hardpoints}</p>

            </div>
            <div class="vertical-line"></div>
            <div class="user-info__points-group">
                <h3 class="user-info__points-name">retropoints</h3>
                <p class="user-info__points">${USER_INFO.retropoints}</p>

            </div>
        </div>
    `;
    }

    gameHtml(game) {
        return `    
      <li class="user-info__last-game-container" data-id="${game.GameID}">
          <div class="user-info__game-main-info"  onclick="ui.showGameDetails(${game.GameID}); event.stopPropagation()">
              <div class="user-info__game-preview-container" onclick="ui.goto.game(${game.GameID}); event.stopPropagation()">
                  <img class="user-info__game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
              </div>


              <div class="user-info__game-description" >
                  <h2 class="user-info__game-title">${game.FixedTitle} ${generateBadges(game.badges)}</h2>
                  <div class="game-stats__text">${toLocalString(game.LastPlayed)} | ${game.ConsoleName}</div>
                  <div  class="game-stats__button"  onclick="ui.expandGameItem(${game.GameID},this); event.stopPropagation()">
                    <i class="game-stats__icon game-stats__expand-icon"></i>
                  </div>
                  <div class="user-info_game-stats-container">
                      <div class="game-stats ">
                        <i class="game-stats__icon game-stats__achivs-icon"></i>
                        <div class="game-stats__text">${ui.isSoftmode ? game.NumAchieved : game.NumAchievedHardcore} / ${game.NumPossibleAchievements}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${ui.isSoftmode ? game.ScoreAchieved : game.ScoreAchievedHardcore} / ${game.PossibleScore}</div>
                        
                      </div>
                       
                  </div>
              </div>
          </div>
      </li>
        `;
    }
    achievementHtml(achiv) {
        // {
        //   "ID": 307869,
        //   "GameID": 3490,
        //   "GameTitle": "Bangai-O",
        //   "Title": "The Planet Dan Star",
        //   "Description": "Clear Level-01.",
        //   "Points": 1,
        //   "Type": "progression",
        //   "BadgeName": "340584",
        //   "IsAwarded": "1",
        //   "DateAwarded": "Mon Jun 10 2024 21:54:55 GMT+0300 (за східноєвропейським літнім часом)",
        //   "HardcoreAchieved": 1
        // }

        return `
      <li class="user-info__cheevo-container">
        <div class="user-info__cheevo-title-container" 
           onclick="ui.showAchivDetails(${achiv.ID}, ${achiv.GameID}); event.stopPropagation()">
            <div class="user-info__cheevo-preview-container">
                <img class="user-info__cheevo-preview ${achiv.HardcoreAchieved || (ui.isSoftmode && achiv.IsAwarded) ? "earned" : ""}"
                    src="https://media.retroachievements.org/Badge/${achiv.BadgeName}.png" alt="">
            </div>

            <div class="user-info__cheevo-descriptions">
                <h2 class="user-info__cheevo-title">${achiv.Title}</h2>
                <p class="user-info__cheevo-description">${achiv.Description}</p>
            <div class="user-info__cheevo-stats-container">
                <p class="user-info__cheevo-stats-text points">
                ${svgIcons.points} ${achiv.Points} Points</p>
                <p class="game-stats__text cheevo-stats__unlocked">${getDeltaTime(achiv.DateEarned)}</p>
            </div>
          </div>
        </div>
        
      </li>
    
    `
    }

}


const getDeltaTime = (dateString) => {
    const date = new Date(dateString);
    const time = date.getTime();
    const now = Date.now();
    const deltaMin = Math.round((now - date) / 6e4);


    if (deltaMin < 2) return "just now";
    if (deltaMin < 60) return deltaMin + " minutes ago";

    const deltaH = Math.round(deltaMin / 60);

    if (deltaH < 24) return deltaH + " hours ago";
    else return date.toLocaleString();
    const deltaDays = Math.round(deltaH / 24);
    if (deltaDays < 2) return "yesterday";
    if (deltaDays < 7) return deltaDays + " days ago";

    const deltaWeeks = Math(deltaDays / 7);
    if (deltaWeeks < 2) return "last week";

    if (deltaWeeks < 5) return "few weeks ago";



}