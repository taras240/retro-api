class UI {
  routes = {
    '/': async () => {
      if (config.identConfirmed) {
        this.home = new Home();
        this.clearNavbar();
        this.navbar.home.classList.add("checked");
      }
      else {
        this.goto.login();
      }
    },

    '/login': async () => {
      this.showLoader();
      const login = await Login()
      content.innerHTML = "";
      content.append(login);
      this.clearNavbar()
      this.navbar.login.classList.add("checked");
      this.removeLoader();
    },

    '/home': async () => {
      if (config.identConfirmed) {
        this.home = new Home();
        this.clearNavbar()
        this.navbar.home.classList.add("checked");
      }
      else {
        this.goto.login();
      }
    },
    '/awards': async () => {
      if (config.identConfirmed) {
        this.awards = new Awards();
        this.clearNavbar()
        this.navbar.awards.classList.add("checked");
      }
      else {
        this.goto.login();
      }
    },

    '/test': async () => {
      content.innerHTML = "";
      content.append(await Test());
    },
  };

  goto = {
    "home": () => {
      history.pushState(null, null, "#/home");
      this.updatePage();
    },
    "awards": () => {
      history.pushState(null, null, "#/awards");
      this.updatePage();
    },
    "login": () => {
      history.pushState(null, null, "#/login");
      this.updatePage();

    }
  }
  constructor() {
    this.initializeElements();
    this.addEvents();
  }
  initializeElements() {
    this.sectionContainer = document.querySelector(".section-container");
    this.app = document.getElementById('app');
    this.content = document.getElementById('content');
    this.navbar = {
      container: document.querySelector(".navbar"),
      home: document.querySelector("#navbar_home"),
      awards: document.querySelector("#navbar_awards"),
      login: document.querySelector("#navbar_login"),
    }
  }
  addEvents() {
    window.addEventListener('hashchange', () => {
      this.updatePage();
    });

    window.addEventListener('DOMContentLoaded', () => {
      window.dispatchEvent(new Event('hashchange'));
    });
    app.addEventListener("touchend", () => {
      this.removeContext();
      this.removePopups();
    })
    app.addEventListener("mousedown", () => {
      this.removeContext();
      this.removePopups();
    })
  }
  clearNavbar() {
    this.navbar.container.querySelectorAll(".checked").forEach(el => el.classList.remove("checked"));
  }
  updatePage() {
    const hash = window.location.hash.substring(1);
    const route = this.routes[hash] || this.routes['/'];
    route();
  }
  removePopups() {
    document.querySelectorAll(".popup").forEach(el => el.remove());
  }
  removeContext() {
    document.querySelectorAll(".context").forEach(el => {
      el.classList.add("hidden");
      setTimeout(() => el.remove(), 1000);
    });
  }
  showGameDetails(gameID) {
    this.removePopups();
    this.showLoader();

    const gameElement = document.createElement("div");
    gameElement.addEventListener("touchend", e => e.stopPropagation());
    gameElement.classList.add("popup-info__container", "popup");

    GAMES_DATA[gameID] ?
      (
        gameElement.innerHTML = this.gamePopupHtml(GAMES_DATA[gameID]),
        this.content.append(gameElement),
        this.removeLoader()
      ) :
      apiWorker
        .getGameProgress({ gameID: gameID })
        .then(gameObj => {
          GAMES_DATA[gameID] = gameObj;
          gameElement.innerHTML = this.gamePopupHtml(gameObj);
          this.content.append(gameElement);
        }).then(() => this.removeLoader())

    const game = GAMES_DATA[gameID];
    const gameHtml = this.gamePopupHtml(game)
    gameElement.innerHTML = gameHtml;
  }
  gamePopupHtml(game) {
    return `
      <button class="close-popup" onclick="ui.removePopups()">X</button>
      <div class="popup-info__preview-container">
          <img src="https://media.retroachievements.org${game.ImageIcon}" alt="" class="popup-info__preview">
      </div>
      <h2 class="popup-info__title">${game.Title}</h2>
      <div class="hor-line"></div>
      <ul class="popup-info__image-list">
          <li class="popup-info__image-container">
              <img src="https://media.retroachievements.org${game.ImageBoxArt}" alt="" class="popup-info__image">
          </li>
          <li class="popup-info_image-container">
              <img src="https://media.retroachievements.org${game.ImageTitle}" alt="" class="popup-info__image">
          </li>
          <li class="popup-info__image-container">
              <img src="https://media.retroachievements.org${game.ImageIngame}" alt="" class="popup-info__image">
          </li>

      </ul>
      <div class="hor-line"></div>
      <div class="popup-info__properties">
          <div class="popup-info__property">Platform: <span>${game.ConsoleName}</span></div>
          <div class="popup-info__property">Developer: <span>${game.Developer} Soft</span></div>
          <div class="popup-info__property">Genre: <span>${game.Genre}</span></div>
          <div class="popup-info__property">Publisher: <span>${game.Publisher} Soft</span></div>
          <div class="popup-info__property">Released: <span>${game.Released}</span></div>
          <div class="popup-info__property">Achievements total : <span>${game.achievements_published}</span></div>
          <div class="popup-info__property">Total points : <span>${game.points_total}</span></div>
          <div class="popup-info__property">Total players : <span>${game.players_total}</span></div>

      </div>
    `
  }
  showAchivDetails(achivID, gameID) {
    this.removePopups();
    this.showLoader();
    const achivElement = document.createElement("div");
    achivElement.addEventListener("touchend", e => e.stopPropagation());

    achivElement.classList.add("popup-info__container", "popup");
    const achiv = GAMES_DATA[gameID].Achievements[achivID];
    const achivHtml = this.achivPopupHtml(achiv)
    achivElement.innerHTML = achivHtml;
    this.content.append(achivElement)
    this.removeLoader()
  }
  achivPopupHtml(achiv) {
    return `
    <button class="close-popup" onclick="ui.removePopups()"></button>
    <div class="popup-info__preview-container">
        <img src="${achiv.prevSrc}" alt="" class="popup-info__preview">
    </div>
    <h2 class="popup-info__title">${achiv.Title}</h2>
    <div class="hor-line"></div>
    <p class="popup-info__description">
    ${achiv.Description}
    </p>
    <div class="hor-line"></div>
    <div class="popup-info__properties">
        <div class="popup-info__property">Points: <span>${achiv.Points}</span></div>
        <div class="popup-info__property">Retropoints: <span>${achiv.TrueRatio}</span></div>
        <div class="popup-info__property">Total players: <span>${achiv.totalPlayers}</span></div>
        <div class="popup-info__property">Earned by: <span>${achiv.NumAwarded}</span></div>
        <div class="popup-info__property">Earned harcore by: <span>${achiv.NumAwardedHardcore}</span></div>
        ${achiv.isEarned ? `<div class="popup-info__property">Date earned : <span>${new Date(achiv.DateEarned).toLocaleDateString()}</span></div>` : ''}
        ${achiv.isHardcoreEarned ? `<div class="popup-info__property">Date earned hardcore: <span>${new Date(achiv.DateEarnedHardcore).toLocaleDateString()}</span></div>` : ''}
        <div class="popup-info__property">Date created : <span>${new Date(achiv.DateCreated).toLocaleDateString()}</span></div>
        <div class="popup-info__property">Author : <span>${achiv.Author}</span></div>
    </div>
  `;
  }
  showLoader() {
    this.removeLoader();
    this.app.append(Loader());
  }
  removeLoader() {
    document.querySelectorAll(".loading_screen").forEach(el => el.remove())
  }

}
class Home {
  USER_INFO = {};
  constructor() {
    this.update();
  }
  update() {
    ui.showLoader();
    apiWorker.getUserSummary({ gamesCount: 5, achievesCount: 0 })
      .then(resp => {
        this.USER_INFO.userName = resp.User;
        this.USER_INFO.status = resp.Status.toLowerCase();
        this.USER_INFO.richPresence = resp.RichPresenceMsg;
        this.USER_INFO.memberSince = resp.MemberSince;
        this.USER_INFO.userImageSrc = `https://media.retroachievements.org${resp.UserPic}`;
        this.USER_INFO.userRank = `${resp.Rank} (Top ${~~(10000 * resp.Rank / resp.TotalRanked) / 100}%)`;
        this.USER_INFO.softpoints = resp.TotalSoftcorePoints;
        this.USER_INFO.retropoints = resp.TotalTruePoints;
        this.USER_INFO.hardpoints = resp.TotalPoints;
        this.USER_INFO.lastGames = resp.RecentlyPlayed;

      })
      .then(() => {
        const section = this.HomeSection()
        ui.content.innerHTML = '';
        ui.content.append(section);
        ui.removeLoader();
      })
  }

  async expandRecentGame(gameID, button) {

    const targetGameElement = button.closest(`.user-info__last-game-container[data-id='${gameID}'`);
    targetGameElement.classList.toggle("expanded");

    const getRecentGame = (gameID) => {
      ui.showLoader();
      const achivsContainer = document.createElement("div");
      achivsContainer.classList.add("user-info__game-achivs-container");

      const achivsList = document.createElement("ul");
      achivsList.classList.add("user-info__game-achivs-list");

      achivsContainer.appendChild(achivsList);
      targetGameElement.appendChild(achivsContainer);

      if (GAMES_DATA[gameID]) {
        Object.values(GAMES_DATA[gameID].Achievements).forEach(achiv => {
          achivsList.innerHTML += this.achivHtml(achiv, gameID);
        });
        ui.removeLoader();
      }

      else {
        apiWorker
          .getGameProgress({ gameID: gameID })
          .then(gameObj => {
            GAMES_DATA[gameID] = gameObj;
            Object.values(gameObj.Achievements).forEach(achiv => {
              achivsList.innerHTML += this.achivHtml(achiv, gameID);
            })
          }).then(() => ui.removeLoader())
      }
    }
    targetGameElement.querySelector(".user-info__game-achivs-container") ?? (getRecentGame(gameID));
  }

  HomeSection() {
    const homeSection = document.createElement("section");
    homeSection.classList.add("home__section");
    homeSection.innerHTML = `
        <div class="user-info__container">
            ${this.headerHtml()}
            <div class="user-info__rich-presence"> ${this.USER_INFO.richPresence}</div>
            ${this.pointsHtml()}
            <h2 class="user-info__block-header">Recently played</h2>
            <ul class="user-info__last-games-list">
                ${this.USER_INFO.lastGames.reduce((elements, game) => {
      const gameHtml = this.gameHtml(game);
      elements += gameHtml;
      return elements;
    }, "")}
            </ul>
        </div>
        `;
    return homeSection;

  }

  headerHtml() {
    return `
            <div class="user-info__header">
                <div class="user-info__avatar-container">
                    <img src="${this.USER_INFO.userImageSrc}" alt="" class="user-info__avatar">
                </div>
                <div class="user-info__user-name-container">
                    <h1 class="user-info__user-name">${this.USER_INFO.userName}</h1>
                    <div class="user-info__user-rank">RANK: ${this.USER_INFO.userRank}</div>
                    <div class="user-info__rich-presence">Member since: ${this.USER_INFO.memberSince}</div>
                </div>
            </div>
        `;
  }
  pointsHtml() {
    return `
            
        <div class="user-info__points-container">
          ${this.USER_INFO.softpoints > 0 ? `
            <div class="user-info__points-group">
              <h3 class="user-info__points-name">softpoints</h3>
              <p class="user-info__points">${this.USER_INFO.softpoints}</p>
            </div>
            <div class="vertical-line"></div>
          `: ""
      }
            <div class="user-info__points-group">
                <h3 class="user-info__points-name">hardpoints</h3>
                <p class="user-info__points">${this.USER_INFO.hardpoints}</p>

            </div>
            <div class="vertical-line"></div>
            <div class="user-info__points-group">
                <h3 class="user-info__points-name">retropoints</h3>
                <p class="user-info__points">${this.USER_INFO.retropoints}</p>

            </div>
        </div>
    `;
  }

  gameHtml(game) {
    return `    
            <li class="user-info__last-game-container" data-id="${game.GameID}">
                <div class="user-info__game-main-info"  onclick="ui.showGameDetails(${game.GameID}); event.stopPropagation()">
                    <div class="user-info__game-preview-container">
                        <img class="user-info__game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
                    </div>


                    <div class="user-info__game-description" >
                        <h2 class="user-info__game-title">${game.Title}</h2>
                        <div class="game-stats__text">${game.ConsoleName}</div>
                        <div  class="game-stats__button"  onclick="ui.home.expandRecentGame(${game.GameID},this); event.stopPropagation()">
                          <i class="game-stats__icon game-stats__expand-icon"></i>
                        </div>
                        <div class="user-info_game-stats-container">
                            <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"></i>
                            <div class="game-stats__text">${game.NumAchievedHardcore} / ${game.NumPossibleAchievements}</div>
                            </div>
                            <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"></i>
                            <div class="game-stats__text">${game.ScoreAchievedHardcore} / ${game.PossibleScore}</div>
                            </div>
                           
                        </div>
                    </div>
                </div>
            </li>
        `;
  }
  achivHtml(achiv, gameID) {
    return `    
            <li class="user-info__achiv-container"  onclick="ui.showAchivDetails(${achiv.ID},${gameID})">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${achiv.isHardcoreEarned && "earned"}" src="${achiv.prevSrc}" alt="">
                </div>
                <div class="user-info__achiv-description">
                    <h2 class="user-info__game-title">${achiv.Title}</h2>
                    <div class="user-info_game-stats-container">
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${achiv.Points}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${achiv.TrueRatio}</div>
                        </div>                        
                    </div>
                </div>             
            </li>
        `;
  }
}
class Awards {
  awardTypeContext = () => {
    return {
      label: "Filter by",
      elements: [
        {
          label: "All",
          id: "filter_all",
          type: "radio",
          onChange: "ui.awards.awardFilter = 'award'",
          checked: this.awardFilterName === 'award',
          name: "filter-by-award"
        },
        // {
        //   label: "Mastered",
        //   id: "filter_mastered",
        //   type: "radio",
        //   onChange: "ui.awards.awardFilter = 'mastered'",
        //   checked: this.awardFilterName === 'mastered',
        //   name: "filter-by-award"
        // },
        ...Object.getOwnPropertyNames(this.awardTypes).reduce((elems, award) => {
          const filterObj = {
            label: `${this.awardTypes[award].name} (${this.awardTypes[award].count})`,
            id: `filter_code-${award}`,
            type: "radio",
            onChange: `ui.awards.awardFilter = '${award}'`,
            checked: this.awardFilterName == award,
            name: "filter-by-award"
          };
          console.log(filterObj);
          elems.push(filterObj);
          return elems;
        }, [])
      ]
    }
  }
  awardPlatformContext = () => {
    return {
      label: "Filter by",
      elements: [
        {
          label: `All (${this.awardsObj.VisibleUserAwards.length})`,
          id: "filter_all",
          type: "radio",
          onChange: "ui.awards.platformFilterCode = 'platform'",
          checked: this.platformFilterName === 'platform',
          name: "filter-by-platform"
        },
        ...Object.getOwnPropertyNames(this.platformCodes).reduce((elems, platformCode) => {
          const filterObj = {
            label: `${this.platformCodes[platformCode].name} (${this.platformCodes[platformCode].count})`,
            id: `filter_code-${platformCode}`,
            type: "radio",
            onChange: `ui.awards.platformFilterCode = ${platformCode}`,
            checked: this.platformFilterCode == platformCode,
            name: "filter-by-platform"
          };
          elems.push(filterObj);
          return elems;
        }, [])

      ]
    }
  }
  awardSortContext = () => {
    return {
      label: "Sort by",
      elements: [
        {
          label: "Date earned",
          id: "sort_date-earned",
          type: "radio",
          onChange: "ui.awards.awardSortType = 'date'",
          checked: this.awardSortType === 'date',
          name: "sort-awards"
        },
        {
          label: "Title",
          id: "sort_title",
          type: "radio",
          onChange: "ui.awards.awardSortType = 'title'",
          checked: this.awardSortType === 'title',
          name: "sort-awards"
        },
        {
          label: "Reverse sort",
          id: "sort_reverse-sort",
          type: "checkbox",
          onChange: "ui.awards.awardSortTypeReverse = this.checked",
          checked: this.awardSortTypeReverse == -1,
          name: "sort-awards-reverse"
        },
      ]
    }
  }
  get awardFilter() {
    const type = config.ui?.mobile?.awardsTypeFilter ?? "award";
    return this.awardTypesNames[type]
  }
  get awardFilterName() {
    const type = config.ui?.mobile?.awardsTypeFilter ?? "award";
    return type;
  }
  set awardFilter(value) {
    !config.ui.mobile && (config.ui.mobile = {});

    config.ui.mobile.awardsTypeFilter = value;
    config.writeConfiguration()

    this.update();
  }

  get platformFilterName() {
    const code = config.ui?.mobile?.platformFilter ?? "platform";
    return code == "platform" ? "platform" : RAPlatforms[code];
  }
  get platformFilterCode() {
    const code = config.ui?.mobile?.platformFilter ?? "platform";
    return code;
  }
  set platformFilterCode(value) {
    !config.ui.mobile && (config.ui.mobile = {});
    config.ui.mobile.platformFilter = value;
    config.writeConfiguration()
    this.update();
  }

  get awardSortType() {
    return config.ui?.mobile?.awardSortType ?? "date";
  }

  set awardSortType(value) {
    !config.ui.mobile && (config.ui.mobile = {});
    config.ui.mobile.awardSortType = value;
    config.writeConfiguration()
    this.update();
  }
  get awardSortTypeReverse() {
    return config.ui?.mobile?.awardSortTypeReverse ?? "1";
  }

  set awardSortTypeReverse(value) {
    !config.ui.mobile && (config.ui.mobile = {});
    config.ui.mobile.awardSortTypeReverse = value ? -1 : 1;
    config.writeConfiguration()
    this.update();

  }

  applySort() {
    this.awardedGames = this.awardedGames.sort((a, b) => this.awardSortTypeReverse * sortBy[this.awardSortType](a, b));
  }

  applyFilter() {
    this.awardedGames = this.awardsObj.VisibleUserAwards;
    this.awardFilterName !== "award" && (this.awardedGames = this.awardedGames
      .filter(game => game.award == this.awardFilterName));
    this.platformFilterCode !== "platform" && (this.awardedGames =
      this.awardedGames
        .filter(game => game.ConsoleID == this.platformFilterCode));
  }
  awardTypesNames = {
    beaten: "Beaten",
    beaten_softcore: "Beaten Softcore",
    completed: "Completed",
    mastered: "Mastered",
    award: "Award Type",
  }
  sortMethods = {
    latest: "date",
    // earnedCount: "earnedCount",
    // points: "points",
    // truepoints: "truepoints",
    // disable: "disable",
    // id: "id",
    // default: "default",
    // achievementsCount: "achievementsCount",
    title: "title",
  };
  awardsObj;
  awardedGames = [];
  constructor() {
    this.update();
  }
  async update() {
    ui.showLoader();
    await delay(50);
    !this.awardsObj && (await this.downloadAwardsData());
    this.applyFilter();
    this.applySort();
    const section = this.AwardsSection()
    ui.content.innerHTML = '';
    ui.content.append(section);
    ui.removeLoader();
  }
  async downloadAwardsData() {
    const resp = await apiWorker.getUserAwards({});
    this.awardsObj = resp;

    const stats = this.awardsObj.VisibleUserAwards
      .reduce((res, game) => {
        !res.platforms[game.ConsoleID] && (res.platforms[game.ConsoleID] = { count: 0 });
        res.platforms[game.ConsoleID].name = game.ConsoleName;
        res.platforms[game.ConsoleID].count++;

        !res.awards[game.award] && (res.awards[game.award] = { count: 0 });
        res.awards[game.award].name = this.awardTypesNames[game.award];
        res.awards[game.award].count++;

        return res;
      }, { platforms: {}, awards: {} });
    this.platformCodes = stats.platforms;
    this.awardTypes = stats.awards;
  }
  AwardsSection() {
    const awardsSection = document.createElement("section");
    awardsSection.classList.add("awards__section");
    awardsSection.innerHTML = `
            ${this.headerHtml()}
            <ul class="user-info__awards-list">
                ${this.awardedGames.reduce((elements, game) => {
      const awardHtml = this.gameHtml(game);
      elements += awardHtml;
      return elements;
    }, "")}
            </ul>
        </div>
        `;
    return awardsSection;
  }
  headerHtml() {
    return `
      <div class="section__header-container">
        <div class="section__header-title">Awards</div>
        <div class="section__control-container">
            <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardSortContext())">Sort</button>
            <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardPlatformContext())">${this.platformFilterName ?? "Platform"}</button>
            <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardTypeContext())">${this.awardFilter}</button>
        </div>
      </div>
    `;
  }
  gameHtml(game) {
    return `    
            <li class="awards__game-item" data-id="${game.AwardData}">
                <div class="awards__game-container"  onclick="ui.showGameDetails(${game.AwardData}); event.stopPropagation()">
                    <div class="awards__game-preview-container">
                        <img class="awards__game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
                    </div>
                    <div class="awards__game-description" >
                        <h2 class="awards__game-title">${game.Title}</h2>
                        <div  class="game-stats__button"  onclick="ui.awards.expandAwardGame(${game.AwardData},this); event.stopPropagation()">
                          <i class="game-stats__icon game-stats__expand-icon"></i>
                        </div>
                        <div class="awards__game-stats__text">${game.ConsoleName}</div>

                        <div class="awards__game-stats-container" >
                            <div class="awards__game-stats__text awards__game-award-type">${this.awardTypesNames[game.award]}</div>
                            <div class="awards__game-stats__text">${new Date(game.AwardedAt).toLocaleDateString()}</div>
                           
                        </div>
                    </div>
                </div>
            </li>
        `;
  }
  expandAwardGame(gameID, button) {
    button.closest(`.awards__game-item[data-id='${gameID}'`)
    const targetGameElement = button.closest(`.awards__game-item[data-id='${gameID}'`)
    targetGameElement.classList.toggle("expanded");

    const getRecentGame = (gameID) => {
      ui.showLoader();
      const achivsContainer = document.createElement("div");
      achivsContainer.classList.add("user-info__game-achivs-container");

      const achivsList = document.createElement("ul");
      achivsList.classList.add("user-info__game-achivs-list");

      achivsContainer.appendChild(achivsList);
      targetGameElement.appendChild(achivsContainer);
      if (GAMES_DATA[gameID]) {
        Object.values(GAMES_DATA[gameID].Achievements).forEach(achiv => {
          achivsList.innerHTML += this.achivHtml(achiv, gameID);
        });
        ui.removeLoader();
      }
      else {
        apiWorker
          .getGameProgress({ gameID: gameID })
          .then(gameObj => {
            GAMES_DATA[gameID] = gameObj;
            Object.values(gameObj.Achievements).forEach(achiv => {
              achivsList.innerHTML += this.achivHtml(achiv, gameID);
            })
          }).then(() => ui.removeLoader())
      }
    }
    targetGameElement.querySelector(".user-info__game-achivs-container") ?? (getRecentGame(gameID))
  }
  achivHtml(achiv, gameID) {
    return `    
            <li class="user-info__achiv-container"  onclick="ui.showAchivDetails(${achiv.ID},${gameID})">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${achiv.isHardcoreEarned && "earned"}" src="${achiv.prevSrc}" alt="">
                </div>
                <div class="user-info__achiv-description">
                    <h2 class="user-info__game-title">${achiv.Title}</h2>
                    <div class="user-info_game-stats-container">
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${achiv.Points}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${achiv.TrueRatio}</div>
                        </div>                        
                    </div>
                </div>             
            </li>
        `;
  }

}
const Login = () => {
  const sectionUrl = './sections/login.elem';
  return fetch(sectionUrl)
    .then(responce => responce.text())
    .then(sectionHTML => {
      const sectionElement = document.createElement("section");
      sectionElement.className = "login__section section";
      sectionElement.innerHTML = sectionHTML;
      return sectionElement;
    })
    .then(sectionElement => {
      config.USER_NAME && (sectionElement.querySelector("#login_user-name").value = config.USER_NAME);
      config.API_KEY && (sectionElement.querySelector("#login__api-key").value = config.API_KEY);
      config.identConfirmed && (sectionElement.querySelector("#login__submit-button").classList.add("verified"));
      return sectionElement;
    })
}
const Loader = () => {
  const loader = document.createElement("div");
  loader.classList.add("loading_screen");
  loader.innerHTML = `<div class="loading_screen__loader-icon"></div>`;
  return loader;
}
const Test = () => {
  const sectionUrl = './sections/test.elem';
  return fetch(sectionUrl)
    .then(responce => responce.text())
    .then(sectionHTML => {
      const sectionElement = document.createElement("section");
      sectionElement.className = "test__section section";
      sectionElement.innerHTML = sectionHTML;
      return sectionElement;
    })
}

function generateContextMenu(structureObj) {

  ui.removeContext();
  const contextElement = document.createElement("div");
  contextElement.classList.add("context-menu__container", "context");
  contextElement.addEventListener("touchend", e => e.stopPropagation());
  contextElement.addEventListener("mousedown", e => e.stopPropagation());
  contextElement.innerHTML += `
    <div class="context__header" onclick="ui.removeContext()">${structureObj.label}</div>
  `;
  const generateContextElements = () => {
    const controlsContainer = document.createElement("div");
    controlsContainer.classList.add("context__controls");
    structureObj.elements.forEach(el => {
      switch (el.type) {
        case "radio":
          controlsContainer.innerHTML += `
            <div class="context__radio">
              <input type="radio" onchange="${el.onChange}"
                    name="${el.name}" ${el.checked && "checked"} id="${el.id}">
              <label class="context__radio-label" for="${el.id}">${el.label}</label>
            </div>
          `;
          break;
        case "checkbox":
          controlsContainer.innerHTML += `
            <div class="context__checkbox">
              <input type="checkbox" onchange="${el.onChange}"
                    name="${el.name}" ${el.checked && "checked"} id="${el.id}">
              <label class="context__checkbox-label" for="${el.id}">${el.label}</label>
            </div>
          `;
          break;
        default:
          return "";
      }

    })
    return controlsContainer;
  }
  const controlContainer = document.createElement("div");
  controlContainer.classList.add("context__control-container");
  controlContainer.append(generateContextElements(structureObj));
  contextElement.append(controlContainer);
  ui.app.appendChild(contextElement);
}

const sortMethods = {
  latest: "date",
  earnedCount: "earnedCount",
  points: "points",
  truepoints: "truepoints",
  disable: "disable",
  id: "id",
  default: "default",
  achievementsCount: "achievementsCount",
  title: "title",
};
const sortBy = {
  date: (a, b) => {
    // Перевіряємо, чи існують дати та обираємо найновішу
    const dateA = a.DateEarnedHardcore
      ? new Date(a.DateEarnedHardcore)
      : -Infinity;
    const dateB = b.DateEarnedHardcore
      ? new Date(b.DateEarnedHardcore)
      : -Infinity;
    return dateB - dateA; // Повертає різницю дат
  },

  earnedCount: (a, b) => b.NumAwardedHardcore - a.NumAwardedHardcore,

  points: (a, b) => parseInt(a.Points) - parseInt(b.Points),

  truepoints: (a, b) => a.TrueRatio - b.TrueRatio,

  default: (a, b) => a.DisplayOrder - b.DisplayOrder,

  id: (a, b) => a.ID - b.ID,

  disable: (a, b) => 0,

  achievementsCount: (a, b) => parseInt(a.NumAchievements) - parseInt(b.NumAchievements),

  title: (a, b) => {
    let nameA = a.Title?.toUpperCase();
    let nameB = b.Title?.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;

  }
}


const RAPlatforms = {
  "1": "Genesis/Mega Drive",
  "2": "Nintendo 64",
  "3": "SNES/Super Famicom",
  "4": "Game Boy",
  "5": "Game Boy Advance",
  "6": "Game Boy Color",
  "7": "NES/Famicom",
  "8": "PC Engine/TurboGrafx-16",
  "9": "Sega CD",
  "10": "32X",
  "11": "Master System",
  "12": "PlayStation",
  "13": "Atari Lynx",
  "14": "Neo Geo Pocket",
  "15": "Game Gear",
  "17": "Atari Jaguar",
  "18": "Nintendo DS",
  "21": "PlayStation 2",
  "23": "Magnavox Odyssey 2",
  "24": "Pokemon Mini",
  "25": "Atari 2600",
  "27": "Arcade",
  "28": "Virtual Boy",
  "29": "MSX",
  "33": "SG-1000",
  "37": "Amstrad CPC",
  "38": "Apple II",
  "39": "Saturn",
  "40": "Dreamcast",
  "41": "PlayStation Portable",
  "43": "3DO Interactive Multiplayer",
  "44": "ColecoVision",
  "45": "Intellivision",
  "46": "Vectrex",
  "47": "PC-8000/8800",
  "49": "PC-FX",
  "51": "Atari 7800",
  "53": "WonderSwan",
  "56": "Neo Geo CD",
  "57": "Fairchild Channel F",
  "63": "Watara Supervision",
  "69": "Mega Duck",
  "71": "Arduboy",
  "72": "WASM-4",
  "73": "Arcadia 2001",
  "74": "Interton VC 4000",
  "75": "Elektor TV Games Computer",
  "76": "PC Engine CD/TurboGrafx-CD",
  "77": "Atari Jaguar CD",
  "78": "Nintendo DSi",
  "80": "Uzebox",
  "101": "Events",
  "102": "Standalone"
}
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}