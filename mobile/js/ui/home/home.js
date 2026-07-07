import { generateBadges } from "../components/badges.js";
import { sortBy } from "../../functions/sort.js";
import { apiWorker, ui } from "../../main.js";
import { svgIcons } from "../components/svgIcons.js";
import { toLocalString } from "../../functions/time.js";
import { fromHtml } from "../../../../js/functions/html.js"
import { headerHtml } from "./components/header.js";
import { recentCheevosListHtml } from "./components/achievement.js";
import { recentGamesListHtml } from "./components/game.js";

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
                ${headerHtml(USER_INFO)}
                <div class="user-info__container">
                    <ul class="user-info__last-games-list">
                        <button id="see-more-cheevos" class="user-info__block-header">
                            <h2>Last Unlocks</h2>
                            <p>See more</p>
                        </button>
                        ${recentCheevosListHtml(USER_INFO)}
                        <button  class="user-info__block-header">
                            <h2>Recently Played</h2>
                            <p style="display:none">See more</p>
                        </button>
                        ${recentGamesListHtml(USER_INFO)}
                    </ul>
                </div>
            </section
        `);
        homeSection.querySelector("#see-more-cheevos")?.addEventListener("click", (event) => {
            ui.goto.unlocks();
        })
        return homeSection;
    }

}


