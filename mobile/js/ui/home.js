import { generateBadges } from "./components/badges.js";
import { sortBy } from "../functions/sort.js";
import { apiWorker } from "../main.js";

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
        const resp = await apiWorker.getUserSummary({ gamesCount: 5, achievesCount: 8 });
        USER_INFO = {
            userName: resp.User,
            status: resp.Status.toLowerCase(),
            richPresence: resp.RichPresenceMsg,
            memberSince: resp.MemberSince,
            userImageSrc: `https://media.retroachievements.org${resp.UserPic}`,
            userRank: resp.Rank ? `Rank: ${resp.Rank} (Top ${~~(10000 * resp.Rank / resp.TotalRanked) / 100}%)` : "Rank is unavailable",
            softpoints: resp.TotalSoftcorePoints,
            retropoints: resp.TotalTruePoints,
            hardpoints: resp.TotalPoints,
            lastGames: resp.RecentlyPlayed,
            lastAchievements: resp.RecentAchievements.map(a => {
                a.DateEarnedHardcore = a.DateAwarded;
                return a;
            })
                .sort((a, b) => sortBy.date(a, b)),
            isInGame: resp.isInGame,
        }
    }

    HomeSection() {
        const homeSection = document.createElement("section");
        homeSection.classList.add("home__section", "section");
        homeSection.innerHTML = `
      ${this.headerHtml()}
      <div class="user-info__container">
      
        <ul class="user-info__last-games-list">
          <h2 class="user-info__block-header">Recently played</h2>
          ${USER_INFO.lastGames.reduce((elements, game) => {
            const gameHtml = this.gameHtml(game);
            elements += gameHtml;
            return elements;
        }, "")}
        </ul>
        <ul class="user-info__last-games-list">
        <h2 class="user-info__block-header">Last cheevos</h2>
          ${USER_INFO.lastAchievements.reduce((elements, achievement) => {
            const achievementHtml = this.achievementHtml(achievement);
            elements += achievementHtml;
            return elements;
        }, "")}
        </ul>
        
      </div>
    `;
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
        ${this.pointsHtml()}
        
      </div>
    `;
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
                  <div class="game-stats__text">${fixTimeString(game.LastPlayed)} | ${game.ConsoleName}</div>
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
      <li class="achiv__achiv-container">
        <div class="achiv__title-container achiv__title-container_small" 
           onclick="ui.showAchivDetails(${achiv.ID}, ${achiv.GameID}); event.stopPropagation()">
            <div class="achiv__preview-container">
                <img class="user-info__achiv-preview ${achiv.HardcoreAchieved || (ui.isSoftmode && achiv.IsAwarded) ? "earned" : ""}"
                    src="https://media.retroachievements.org/Badge/${achiv.BadgeName}.png" alt="">
            </div>

            <div class="achiv__achiv-description">
                <h2 class="achiv__achiv-title">${achiv.Title}</h2>
                <p class="achiv__achiv-text">${achiv.Description}</p>
            <div class="user-info_game-stats-container">
              <div class="game-stats">
                  <i class="game-stats__icon game-stats__points-icon"></i>
                  <div class="game-stats__text">${achiv.Points}</div>
              </div>  
              <div class="game-stats ">
                  <div class="game-stats__text">${fixTimeString(achiv.DateEarned)}</div>
              </div>  
            </div>
          </div>            
        </div>
        
      </li>
    
    `
    }

}
const fixTimeString = (
    (dateString) => {
        const date = new Date(dateString);
        const options = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        };
        return date.toLocaleDateString("uk-UA", options);
    }
)