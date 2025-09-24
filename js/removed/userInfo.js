import { UI } from "../ui.js";
import { config, ui, apiWorker } from "../script.js";

export class UserInfo {
    get VISIBLE() {
        return !this.section.classList.contains("hidden");
    }
    set VISIBLE(value) {
        UI.switchSectionVisibility({ section: this.section, visible: value })
        this.widgetIcon && (this.widgetIcon.checked = value);
    }
    USER_INFO = config._cfg.ui?.userInfoData ?? {
        userName: config.USER_NAME ?? "userName",
        status: "Offline",
        userImageSrc: config.userImageSrc ?? "",
        userRank: "???",
        softpoints: "",
        retropoints: "",
        hardpoints: "",
        lastGames: [],
        lastAchivs: [],

    }

    constructor() {
        this.initializeElements();
        this.addEvents();
        this.setValues();
        if (config.identConfirmed) {
            // setTimeout(() => this.update({}), 5000);
        }
        UI.applyPosition({ widget: this });

    }
    initializeElements() {
        this.section = document.querySelector("#user_section");
        this.widgetIcon = document.querySelector("#open-user-button");
        this.userNameElement = this.section.querySelector(".user_user-name");
        this.userImg = this.section.querySelector(".user-preview");
        this.connectionStatus = this.section.querySelector(".user_online-indicator")
        this.userRankElement = this.section.querySelector(".user_rank");
        this.userSoftpointsElement = this.section.querySelector(".user_softcore-points");
        this.userHardpointsElement = this.section.querySelector(".user_hardcore-points")
        this.userRetropointsElement = this.section.querySelector(".user_retropoints")
        this.lastGamesList = this.section.querySelector(".user_last-games-list");
        this.lastAchivsList = this.section.querySelector(".user_last-achivs-list");
        this.resizer = this.section.querySelector("#user-info-resizer");

    }
    addEvents() {
        this.section.addEventListener("mousedown", (e) => {
            UI.moveEvent(this.section, e);
        });
        this.resizer.addEventListener("mousedown", event => {
            event.stopPropagation();
            this.section.classList.add("resized");
            UI.resizeEvent({
                event: event,
                section: this.section,
            });
        });
    }
    setValues() {
        this.userNameElement.innerText = this.USER_INFO.userName;
        this.connectionStatus.classList.toggle("online", this.USER_INFO.status == "online");
        this.userImg.src = this.USER_INFO.userImageSrc;
        this.userRankElement.innerText = this.USER_INFO.userRank;
        this.userHardpointsElement.innerText = this.USER_INFO.hardpoints;
        this.userSoftpointsElement.innerText = this.USER_INFO.softpoints;
        this.userRetropointsElement.innerText = this.USER_INFO.retropoints;
        this.lastGamesList.innerHTML = "";
        this.lastAchivsList.innerHTML = "";
        this.USER_INFO?.lastGames?.forEach(game => {
            this.lastGamesList.appendChild(this.generateGameElement(game));
        })
        this.USER_INFO?.lastAchivs?.forEach(achiv => {
            this.lastAchivsList.appendChild(this.generateAchivElement(achiv));
        })

    }
    async update({ userSummary }) {
        if (!userSummary) {
            userSummary = await apiWorker.getUserSummary({});
        }
        const { User, Status, UserPic, Rank, TotalRanked, TotalPoints,
            TotalSoftcorePoints, TotalTruePoints, RecentlyPlayed, RecentAchievements } = userSummary;
        this.USER_INFO.userName = User;
        this.USER_INFO.status = Status.toLowerCase();
        this.USER_INFO.userImageSrc = `https://media.retroachievements.org${UserPic}`;
        this.USER_INFO.userRank = `${Rank} (Top ${~~(10000 * Rank / TotalRanked) / 100}%)`;
        this.USER_INFO.softpoints = TotalSoftcorePoints;
        this.USER_INFO.retropoints = TotalTruePoints;
        this.USER_INFO.hardpoints = TotalPoints;
        this.USER_INFO.lastGames = RecentlyPlayed;
        this.USER_INFO.lastAchivs = RecentAchievements
            .sort((a, b) => new Date(b.DateAwarded) - new Date(a.DateAwarded));
        ui.notifications.parseUserSummary(this.USER_INFO)

        this.setValues();

        // this.updateMainInformation()
        //   .then(() => this.updateRecentAchives()
        //     .then(() => this.updateRecentGames())).then(() => {
        //       this.setValues();
        //       config._cfg.ui.userInfoData = this.USER_INFO;
        //       config.writeConfiguration();
        //     })
    }
    async updateMainInformation() {
        const resp = await apiWorker.getUserProfile({});
        const { User, UserPic, TotalPoints, TotalSoftcorePoints, TotalTruePoints } = resp;
        this.USER_INFO.userName = User;
        this.USER_INFO.userImageSrc = `https://media.retroachievements.org${UserPic}`;
        this.USER_INFO.softpoints = TotalSoftcorePoints;
        this.USER_INFO.retropoints = TotalTruePoints;
        this.USER_INFO.hardpoints = TotalPoints;
    }
    async updateRecentGames() {
        const games = await apiWorker.getRecentlyPlayedGames({ count: 3 });
        this.USER_INFO.lastGames = games;

    }
    async updateRecentAchives() {
        const achives = await apiWorker.getRecentAchieves({});
        this.USER_INFO.lastAchivs = achives
            .slice(0, 5)
            .reverse();
    }

    updatePoints({ points }) {
        this.USER_INFO.softpoints = points.TotalSoftcorePoints;
        this.USER_INFO.retropoints = points.TotalTruePoints;
        this.USER_INFO.hardpoints = points.TotalPoints;
        this.setValues();
    }

    pushNewGame({ game }) {
        this.USER_INFO.lastGames.unshift(game);
        this.USER_INFO.lastGames.pop();
        this.setValues();
    }
    pushAchievements({ achievements }) {
        achievements.forEach(achiv => {
            if (achiv.DateEarnedHardcore) {
                this.USER_INFO.hardpoints += achiv.Points;
                this.USER_INFO.retropoints += achiv.TrueRatio;
            }
            else {
                this.USER_INFO.softpoints += achiv.Points;
            }
            this.USER_INFO.lastAchivs.unshift(achiv);
            this.USER_INFO.lastAchivs.pop();
        })
        this.setValues();
    }
    generateGameElement(game) {
        const gameElement = document.createElement("li");
        gameElement.classList.add("user_last-game");
        gameElement.innerHTML = `
      <div class="user_game-preview">
          <img class="user_game-img" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
      </div>
      <div class="user_game-title">${game.Title}</div>
      <p class="user_game-description">${game.ConsoleName}</p>
      `;
        return gameElement;
    }
    generateAchivElement(achiv) {
        const achivElement = document.createElement("li");
        achivElement.classList.add("user_last-game");
        achivElement.innerHTML = `
      <div class="user_game-preview">
          <img class="user_game-img" src="https://media.retroachievements.org/Badge/${achiv.BadgeName}.png" alt="">
      </div>
      <div class="user_game-title">${achiv.Title}</div>
      <p class="user_game-description">${achiv.DateAwarded ?? achiv.Date}</p>
      `;
        return achivElement;
    }
    close() {
        ui.buttons.user.click();
    }
}