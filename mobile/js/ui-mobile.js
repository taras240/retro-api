"use strict";
class UI {
  get favouritesGames() {
    return config.ui?.mobile?.favouritesGames ?? {};
  }
  get isSoftmode() {
    return config.ui?.mobile?.isSoftMode ?? false;
  }
  set isSoftmode(value) {
    config.ui.mobile.isSoftMode = value;
    config.writeConfiguration();
  }
  switchGameMode() {
    this.isSoftmode = !this.isSoftmode;
    this.home = new Home();
  }
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
    '/library': async () => {
      if (config.identConfirmed) {
        this.library = new Library();
        this.clearNavbar()
        this.navbar.library.classList.add("checked");
      }
      else {
        this.goto.login();
      }
    },
    '/favourites': async () => {
      if (config.identConfirmed) {
        this.favourites = new Favourites();
        this.clearNavbar()
        this.navbar.favourites.classList.add("checked");
      }
      else {
        this.goto.login();
      }
    },
    '/game': async (args) => {
      if (config.identConfirmed) {
        const gameID = args.gameID ? parseInt(args.gameID, 10) : false;
        gameID && (this.game = new Game(gameID));
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
    "library": () => {
      history.pushState(null, null, "#/library");
      this.updatePage();
    },
    "favourites": () => {
      history.pushState(null, null, "#/favourites");
      this.updatePage();
    },
    "game": (gameID) => {
      history.pushState(null, null, `#/game&gameID=${gameID}`);
      this.updatePage();
    },
    "login": () => {
      history.pushState(null, null, "#/login");
      this.updatePage();

    }
  }
  constructor() {
    (!config.ui?.mobile) && (
      config.ui.mobile = {},
      config.writeConfiguration()
    )
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
      library: document.querySelector("#navbar_library"),
      favourites: document.querySelector("#navbar_favourites"),
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
    app.addEventListener("click", () => {
      this.removeContext();
      this.removePopups();
    })
    app.addEventListener("mousedown", () => {
      this.removeContext();
      // this.removePopups();
    })
  }
  clearNavbar() {
    this.navbar.container.querySelectorAll(".checked").forEach(el => el.classList.remove("checked"));
  }

  updatePage() {
    const hash = window.location.hash.substring(1);
    const [path, queryString] = hash.split('&');
    const route = this.routes[path] || this.routes['/'];

    // Розбираємо параметри запиту
    const params = new URLSearchParams(queryString);
    const args = {};
    for (const [key, value] of params.entries()) {
      args[key] = value;
    }

    // Викликаємо маршрут з аргументами
    route(args);
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
  async showGameDetails(gameID) {
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
    await delay(500);
    document.querySelectorAll(".popup-info__image").forEach(img => {

      img.addEventListener('click', e => {
        e.stopPropagation();
        const preview = document.createElement('div');
        preview.classList.add("image-preview-popup");
        preview.innerHTML = `
          <img src="${img.src}" alt="">
        `;
        ui.content.appendChild(preview);
        preview.addEventListener("click", e => {
          e.stopPropagation();
          preview.remove();
        })
      })
    })
  }
  gamePopupHtml(game) {
    return `
      <button class="close-popup" onclick="ui.removePopups()">X</button>
      <div class="popup-info__preview-container">
          <img src="https://media.retroachievements.org${game?.ImageIcon}" alt="icon" class="popup-info__preview">
          <span class="game-header__retro-ratio  achiv-rarity__${game?.gameDifficulty}">${game?.retroRatio}</span>
      </div>
      <h2 class="popup-info__title">${game?.Title}</h2>
      <div class="hor-line"></div>
      <ul class="popup-info__image-list">
          <li class="popup-info__image-container">
              <img src="https://media.retroachievements.org${game?.ImageBoxArt}" alt="" class="popup-info__image">
          </li>
          <li class="popup-info_image-container">
              <img src="https://media.retroachievements.org${game?.ImageTitle}" alt="" class="popup-info__image">
          </li>
          <li class="popup-info__image-container">
              <img src="https://media.retroachievements.org${game?.ImageIngame}" alt="" class="popup-info__image">
          </li>

      </ul>
      <div class="hor-line"></div>
      <div class="horizontal-buttons-container">
      <a class="round-button icon-button download-icon simple-button game-popup__download-button"
          href="https://www.emu-land.net/en/search_games?q=${game?.Title}" target="_blank"></a>
      <a class="round-button icon-button redirect-icon simple-button game-popup__ra-button"
          href="https://retroachievements.org/game/${game?.ID}" target="_blank"></a>
      <button class="${ui.favouritesGames[game?.ID] ? "checked" : ''} round-button icon-button like-icon simple-button game-popup__like-button"
          onclick="addGameToFavourite(${game?.ID});this.classList.toggle('checked'); event.stopPropagation()"></button>
    </div>
    <div class="hor-line"></div>
      <div class="popup-info__properties">
          <div class="popup-info__property">Platform: <span>${game?.ConsoleName}</span></div>
          <div class="popup-info__property">Developer: <span>${game?.Developer} Soft</span></div>
          <div class="popup-info__property">Genre: <span>${game?.Genre}</span></div>
          <div class="popup-info__property">Publisher: <span>${game?.Publisher} Soft</span></div>
          <div class="popup-info__property">Released: <span>${game?.Released}</span></div>
          <div class="popup-info__property">Achievements total : <span>${game?.achievements_published}</span></div>
          <div class="popup-info__property">Total points : <span>${game?.points_total}</span></div>
          <div class="popup-info__property">Total players : <span>${game?.players_total}</span></div>

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
        <span class="game-header__retro-ratio  achiv-rarity__${achiv.difficulty}">${achiv.difficulty}</span>
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
  expandGameItem(gameID, button) {
    const targetGameElement = button.closest(`li`);
    targetGameElement.classList.toggle("expanded");

    // targetGameElement.classList.contains("expanded") ?
    //   targetGameElement.classList.remove("expanded") :
    //   (
    //     document.querySelectorAll("li.expanded")
    //       .forEach(li => li.classList.remove("expanded")),
    //     targetGameElement.classList.add("expanded")
    //   )

    const getRecentGame = (gameID) => {
      this.showLoader();
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
        this.removeLoader();
      }
      else {
        apiWorker
          .getGameProgress({ gameID: gameID })
          .then(gameObj => {
            GAMES_DATA[gameID] = gameObj;
            Object.values(gameObj.Achievements).forEach(achiv => {
              achivsList.innerHTML += this.achivHtml(achiv, gameID);
            })
          }).then(() => this.removeLoader())
      }
    }
    targetGameElement.querySelector(".user-info__game-achivs-container") ?? (getRecentGame(gameID))
  }
  achivHtml(achiv, gameID) {
    return `    
            <li class="user-info__achiv-container"  onclick="ui.showAchivDetails(${achiv.ID},${gameID}); event.stopPropagation();">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${(achiv.isHardcoreEarned || ui.isSoftmode && achiv.isEarned) && "earned"}" src="${achiv.prevSrc}" alt="">
                </div>
                <div class="user-info__achiv-description">
                    <h2 class="user-info__game-title">${achiv.Title}</h2>
                    <div class="user-info_game-stats-container">
                        
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${achiv.Points}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__retropoints-icon"></i>
                        <div class="game-stats__text">${achiv.TrueRatio}</div>
                        </div>    
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__trending-icon"></i>
                        <div class="game-stats__text">${achiv.rateEarnedHardcore}</div>
                        </div>   
                        <div class="game-stats__difficult-container">
                          <div class="game-stats__text achiv-rarity achiv-rarity__${achiv.difficulty}"> </div>
                        </div>
                  
                    </div>
                </div>             
            </li>
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
    const resp = await apiWorker.getUserSummary({ gamesCount: 5, achievesCount: 0 });
    USER_INFO = {};
    USER_INFO.userName = resp.User;
    USER_INFO.status = resp.Status.toLowerCase();
    USER_INFO.richPresence = resp.RichPresenceMsg;
    USER_INFO.memberSince = resp.MemberSince;
    USER_INFO.userImageSrc = `https://media.retroachievements.org${resp.UserPic}`;
    USER_INFO.userRank = resp.Rank ? `Rank: ${resp.Rank} (Top ${~~(10000 * resp.Rank / resp.TotalRanked) / 100}%)` : "Rank is unavailable";
    USER_INFO.softpoints = resp.TotalSoftcorePoints;
    USER_INFO.retropoints = resp.TotalTruePoints;
    USER_INFO.hardpoints = resp.TotalPoints;
    USER_INFO.lastGames = resp.RecentlyPlayed;
    USER_INFO.isInGame = resp.isInGame;

  }

  HomeSection() {
    const homeSection = document.createElement("section");
    homeSection.classList.add("home__section", "section");
    homeSection.innerHTML = `
        
            ${this.headerHtml()}
            <div class="user-info__container">
           
            <ul class="user-info__last-games-list">
                ${USER_INFO.lastGames.reduce((elements, game) => {
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
      <div class="section__header-container user-info__header-container">
        <div class="user-info__header">
            <div class="user-info__avatar-container">
                <img src="${USER_INFO.userImageSrc}" alt="" class="user-info__avatar">
            </div>
            <button class="button__switch-mode ${ui.isSoftmode ? "softmode" : ""}" onclick="ui.switchGameMode()">${ui.isSoftmode ? "SOFT" : "HARD"}</button>
            <div class="user-info__user-name-container">
                <h1 class="user-info__user-name">${USER_INFO.userName}</h1>
                <div class="user-info__user-rank">${USER_INFO.userRank}</div>
                <div class="user-info__rich-presence">Member since: ${USER_INFO.memberSince}</div>
            </div>
        </div>
        ${USER_INFO.isInGame ? `
        <div class="user-info__rich-presence"> ${USER_INFO.richPresence}</div>
        `: ""}
        ${this.pointsHtml()}
        <h2 class="user-info__block-header">Recently played</h2>
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
                        <h2 class="user-info__game-title">${game.Title}</h2>
                        <div class="game-stats__text">${game.ConsoleName}</div>
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

}
class Awards {

  awardTypeContext = () => {
    return {
      label: "Filter by type",
      elements: [
        {
          label: `All (${AWARDS.VisibleUserAwards.length})`,
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
          elems.push(filterObj);
          return elems;
        }, [])
      ]
    }
  }
  awardPlatformContext = () => {
    return {
      label: "Filter by platform",
      elements: [
        {
          label: `All (${AWARDS.VisibleUserAwards.length})`,
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
  awardListContext = () => {
    return {
      label: "Show by",
      elements: [
        ...Object.getOwnPropertyNames(this.listTypes).reduce((elems, type) => {
          const typeObj = {
            label: `${this.listTypes[type]}`,
            id: `awards_list-type-${type}`,
            type: "radio",
            onChange: `ui.awards.listType = '${type}'`,
            checked: this.listType == type,
            name: "awards-list-type"
          };
          elems.push(typeObj);
          return elems;
        }, [])
      ]
    }
  }
  get listType() {
    return config.ui?.mobile?.listType ?? "list";
  }
  set listType(value) {
    config.ui.mobile.listType = value;
    config.writeConfiguration();
    this.update();
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
    this.awardedGames = AWARDS.VisibleUserAwards;
    this.awardFilterName !== "award" && (this.awardedGames = this.awardedGames
      .filter(game => game.award == this.awardFilterName));
    this.platformFilterCode !== "platform" && (this.awardedGames =
      this.awardedGames
        .filter(game => game.ConsoleID == this.platformFilterCode));
  }

  listTypes = {
    list: 'list',
    grid: 'grid'
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
  awardedGames = [];
  constructor() {
    ui.showLoader();
    this.downloadAwardsData().then(() => {
      this.getAwardsStats();
      this.update();
    })

  }
  async update() {
    ui.showLoader();
    await delay(50);
    this.applyFilter();
    this.applySort();
    const section = this.AwardsSection()
    ui.content.innerHTML = '';
    ui.content.append(section);
    ui.removeLoader();
    const awardsList = section.querySelector(".user-info__awards-list");
    lazyLoad({ list: awardsList, items: this.awardedGames, callback: this.getGameElement })
  }
  getAwardsStats() {
    const stats = AWARDS.VisibleUserAwards
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
  async downloadAwardsData() {
    !AWARDS && (AWARDS = await apiWorker.getUserAwards({}));
  }
  AwardsSection() {
    // ${this.awardedGames.reduce((elements, game) => {
    //   const awardHtml = this.gameHtml(game);
    //   elements += awardHtml;
    //   return elements;
    // }, "")}
    const awardsSection = document.createElement("section");
    awardsSection.classList.add("awards__section", "section");
    awardsSection.innerHTML = `
            ${this.headerHtml()}
            <ul class="user-info__awards-list ${this.listType}">
               
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
            <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardSortContext(),event)">Sort</button>
            <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardPlatformContext(),event)">${this.platformFilterName ?? "Platform"}</button>
            <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardTypeContext(),event)">${this.awardFilter}</button>
            <button class="simple-button" onclick="generateContextMenu(ui.awards.awardListContext(),event)">${this.listType}</button>
            </div>
        

      </div>
    `;
  }
  getGameElement(game) {
    const gameElement = document.createElement('li');
    gameElement.className = `awards__game-item ${game.award}`;
    gameElement.dataset.id = game.AwardData;
    gameElement.innerHTML = `    
      <div class="awards__game-container"  onclick="ui.showGameDetails(${game.AwardData}); event.stopPropagation()">
          <div class="awards__game-preview-container" onclick="ui.goto.game(${game.AwardData}); event.stopPropagation()">
              <img class="awards__game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
          </div>
          <div class="awards__game-description" >
              <h2 class="awards__game-title">${game.Title}</h2>
              <div  class="game-stats__button"  onclick="ui.expandGameItem(${game.AwardData},this); event.stopPropagation()">
                <i class="game-stats__icon game-stats__expand-icon"></i>
              </div>
              <div class="awards__game-stats__text">${game.ConsoleName}</div>

              <div class="awards__game-stats-container" >
                  <div class="awards__game-stats__text awards__game-award-type">${ui.awards.awardTypesNames[game.award]}</div>
                  <div class="awards__game-stats__text">${new Date(game.AwardedAt).toLocaleDateString()}</div>
                  
              </div>
          </div>
      </div>
  `;
    return gameElement;
  }
}
class Game {
  constructor(gameID) {
    this.gameID = gameID;
    this.update();
  }
  getSectionElement() {
    const section = document.createElement("div");
    section.classList.add("game__section", "section");
    section.innerHTML = `
      ${this.SectionHeaderHtml()}
      <ul class="game-achivs__container">
        ${Object.values(this.gameData.Achievements).reduce((elementsHtml, achiv) => {
      elementsHtml += this.AchievementHtml(achiv);
      return elementsHtml;
    }, "")}
      </ul>
    `;
    return section;
  }
  AchievementHtml(achiv) {
    const trend = ~~(1000 * achiv.NumAwardedHardcore / this.gameData.NumDistinctPlayers) / 10;

    return `
      <li class="achiv__achiv-container" onclick="ui.showAchivDetails(${achiv.ID}, ${this.gameID}); event.stopPropagation()">
        <div class="achiv__title-container">
            <div class="achiv__preview-container">
                <img class="user-info__achiv-preview ${achiv.isHardcoreEarned || (ui.isSoftmode && achiv.isEarned) ? "earned" : ""}"
                    src="https://media.retroachievements.org/Badge/${achiv.BadgeName}.png" alt="">
            </div>

            <div class="achiv__achiv-description">
                <h2 class="achiv__achiv-title">${achiv.Title}</h2>
                <p class="achiv__achiv-text">${achiv.Description}</p>
                <div class="achiv__icons">
              <div class="game-stats ">
                  <i class="game-stats__icon game-stats__points-icon"></i>
                  <div class="game-stats__text">${achiv.Points}</div>
              </div>
              <div class="game-stats game-stats__points">
                  <i class="game-stats__icon game-stats__retropoints-icon"></i>
                  <div class="game-stats__text">${achiv.TrueRatio}</div>
              </div>
              <div class="game-stats game-stats__points">
                  <i class="game-stats__icon game-stats__trending-icon"></i>
                  <div class="game-stats__text">${~~trend}%</div>
              </div>
              <div class="game-stats game-stats__points">
                  <div class="game-stats__text achiv-rarity achiv-rarity__${achiv.difficulty}">${achiv.difficulty}</div>
              </div>
            </div>
            </div>
            
        </div>
        
      </li>
    
    `
  }
  SectionHeaderHtml() {
    let earnedData = Object.values(this.gameData.Achievements)
      .reduce((data, achiv) => {
        if (ui.isSoftmode) {
          achiv.isEarned && (
            data.achivs++,
            data.points += achiv.Points,
            data.retropoints += achiv.isHardcoreEarned ? achiv.TrueRatio : 0
          );
        }
        else {
          achiv.isHardcoreEarned && (
            data.achivs++,
            data.points += achiv.Points,
            data.retropoints += achiv.TrueRatio
          );
        }
        return data;
      }, { achivs: 0, points: 0, retropoints: 0 });
    const completionProgress = ~~(100 * (earnedData.points) / this.gameData.points_total)
    earnedData.achivs == 0 && (earnedData = false);
    return `
            <div class="section__header-container game__header-container" onclick="ui.showGameDetails(${this.gameID});event.stopPropagation();">
                <div class="game-header__background-container">
                    <img class="game-header__background-img" src="https://media.retroachievements.org${this.gameData.ImageTitle}" alt="">
                    <div class="game-header__background-gradient"></div>
                    

                </div>
                <div class="game-header__main-info">
                    <div class="game-header__icon-container">
                        <img class="game-header__icon" src="https://media.retroachievements.org${this.gameData.ImageIcon}" alt="">
                        <span class="game-header__retro-ratio  achiv-rarity__${this.gameData.gameDifficulty}">${this.gameData.retroRatio}
                        </span>
                        </div>
                    <div class="game-header__description-container">
                        <h1 class="game-header__title">
                          ${this.gameData.Title}                         
                        </h1>
                          
                        <div class="game-header__platform">${this.gameData.ConsoleName}</div>
                        ${completionProgress > 0 ? `
                          <div class="game-header__progress-container" style='--progress: ${completionProgress}%;'>
                              <div class="game-header__progress">Progress: ${completionProgress}% </div>
                          </div> 
                          ` : ''}  
                    </div>
                </div>
                <div class="game-points__container">
                    <div class="user-info__points-group">
                        <h3 class="game-points__points-name">cheevos</h3>
                        <p class="user-info__points">${earnedData ? (earnedData.achivs + '/') : ""}${this.gameData.NumAchievements}</p>
                    </div>
                    <div class="vertical-line"></div>

                    <div class="user-info__points-group">
                        <h3 class="game-points__points-name">points</h3>
                        <p class="user-info__points">${earnedData ? (earnedData.points + '/') : ""}${this.gameData.points_total}</p>
                    </div>
                    <div class="vertical-line"></div>
                    <div class="user-info__points-group">
                        <h3 class="game-points__points-name">retropoints</h3>
                        <p class="user-info__points">${earnedData ? (earnedData.retropoints + '/') : ""}${this.gameData.TotalRetropoints}</p>
                    </div>
                </div>
            </div>
    `;
  }
  update(gameID = this.gameID) {
    ui.showLoader();

    if (GAMES_DATA[gameID]) {
      this.gameData = GAMES_DATA[this.gameID];
      const section = this.getSectionElement();
      ui.content.innerHTML = "";
      ui.content.append(section);
      ui.removeLoader();
    }
    else {
      apiWorker.getGameProgress({ gameID: gameID }).then((resp) => {
        GAMES_DATA[gameID] = resp;
      }).then(() => this.update())
    }
  }
}
class Library {

  gamesPlatformContext = () => {
    return {
      label: "Filter by platform",
      elements: [
        {
          label: `All`,
          id: "filter_all",
          type: "radio",
          onChange: "ui.library.platformFilter = 'all'",
          checked: this.platformFilterCode === 'all',
          name: "filter-by-platform"
        },
        ...Object.getOwnPropertyNames(RAPlatforms).reduce((elems, platformCode) => {
          if (this.GAMES.some(game => game.ConsoleID == platformCode)) {
            const filterObj = {
              label: `${RAPlatforms[platformCode]}`,
              id: `filter_code-${platformCode}`,
              type: "radio",
              onChange: `ui.library.platformFilter = ${platformCode}`,
              checked: this.platformFilterCode == platformCode,
              name: "filter-by-platform"
            };
            elems.push(filterObj);
          }
          return elems;
        }, [])

      ]
    }
  }
  gamesSortContext = () => {
    return {
      label: "Sort by",
      elements: [
        {
          label: "Title",
          id: "sort_title",
          type: "radio",
          onChange: "ui.library.sortType = 'title'; ",
          checked: this.sortType === 'title',
          name: "sort-games"
        },
        {
          label: "Points",
          id: "sort_points-count",
          type: "radio",
          onChange: "ui.library.sortType = 'points'",
          checked: this.sortType === 'points',
          name: "sort-games"
        },
        {
          label: "Achieves",
          id: "sort_achieves",
          type: "radio",
          onChange: "ui.library.sortType = 'achievementsCount'",
          checked: this.sortType === 'achievementsCount',
          name: "sort-games"
        },
        {
          label: "Reverse sort",
          id: "sort_reverse-sort",
          type: "checkbox",
          onChange: "ui.library.sortTypeReverse = this.checked",
          checked: this.sortTypeReverse == -1,
          name: "sort-games-reverse"
        },
      ]
    }
  }
  get sortType() {
    return config.ui?.mobile?.librarySortType ?? "title";
  }
  set sortType(value) {
    !config.ui.mobile && (config.ui.mobile = {});

    config.ui.mobile.librarySortType = value;
    config.writeConfiguration();

    this.updateGames();
  }
  get sortTypeReverse() {
    return config.ui?.mobile?.librarysortTypeReverse ?? 1;
  }
  set sortTypeReverse(value) {
    !config.ui.mobile && (config.ui.mobile = {});

    config.ui.mobile.librarysortTypeReverse = value ? -1 : 1;
    config.writeConfiguration();

    this.updateGames();
  }
  get platformFilter() {
    const code = config.ui?.mobile?.libraryPlatformFilter ?? "all";

    return code == "all" ? "all" : RAPlatforms[code]
  }
  get platformFilterCode() {
    const code = config.ui?.mobile?.libraryPlatformFilter ?? "all";
    return code;
  }
  set platformFilter(value) {
    !config.ui.mobile && (config.ui.mobile = {});

    config.ui.mobile.libraryPlatformFilter = value;
    config.writeConfiguration();

    this.updateGames();
    document.querySelector(".games-platform-filter").innerText = `${this.platformFilter} (${this.games.length})`;

  }
  titleFilter = '';
  platformCodes = {
    "1": "Genesis/Mega Drive",
    "2": "Nintendo 64",
    "3": "SNES/Super Famicom",
    "4": "Game Boy",
    "5": "Game Boy Advance",
    "6": "Game Boy Color",
    "7": "NES/Famicom",
    "8": "PC Engine/TurboGrafx-16",
    "12": "PlayStation",
    "21": "PlayStation 2",
    "41": "PlayStation Portable",
    // "999": "etc.",
  }
  applyFilter() {
    // this.games = this.GAMES[this.platformFilterCode];

    this.games = this.platformFilterCode == "all" ? this.GAMES :
      this.GAMES.filter(game => game.ConsoleID === this.platformFilterCode);
    if (this.titleFilter) {
      let regex = new RegExp(this.titleFilter, "i");
      this.games = this.games.filter(game => regex.test(game?.Title));

    }
  }
  applySort() {
    this.games = this.games.sort((a, b) => this.sortTypeReverse * sortBy[this.sortType](a, b));

  }
  constructor() {
    this.update();
  }

  async update() {
    ui.showLoader();
    await delay(50);
    !this.GAMES && (await this.loadGamesArray());
    this.applyFilter();
    this.applySort();
    const section = this.LibrarySection();
    ui.content.innerHTML = '';
    ui.content.append(section);
    ui.removeLoader();
    lazyLoad({ list: this.gameList, items: this.games, callback: this.getGameElement })
  }
  updateGames() {
    this.applyFilter();
    this.applySort();
    this.gameList.innerHTML = '';
    lazyLoad({ list: this.gameList, items: this.games, callback: this.getGameElement })

  }
  LibrarySection() {
    this.librarySection = document.createElement("section");
    this.librarySection.classList.add("library__section", "section");

    this.librarySection.appendChild(this.headerElement());

    this.gameList = document.createElement("ul");
    this.gameList.classList.add("games-list");

    this.librarySection.appendChild(this.gameList);

    return this.librarySection;
  }

  headerElement() {
    const gamesHeader = document.createElement("div");
    gamesHeader.classList.add("section__header-container");
    gamesHeader.innerHTML = `
        <div class="section__header-title">Library</div>
        <div class="section__control-container">
            <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
            <button class="games-platform-filter simple-button" 
              onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">
              ${this.platformFilter ?? "Platform"} (${this.games.length})
            </button>
            <div class="hidden-text-input__container">
            <input class="hidden-text-input__input" type="search">
            <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                onclick="ui.library.showHiddenInput(this)"></button>

        </div>
            </div>
    `;
    return gamesHeader;
  }



  getGameElement(game) {
    const gameElement = document.createElement("li");
    gameElement.classList.add("awards__game-item");
    gameElement.dataset.id = game.ID;
    // const imgName = game.ImageIcon.slice(game.ImageIcon.lastIndexOf("/") + 1, game.ImageIcon.lastIndexOf(".") + 1) + "webp";
    gameElement.innerHTML = `    
            <li class="awards__game-item" data-id="${game.ID}">
                <div class="awards__game-container"  onclick="ui.showGameDetails(${game.ID}); event.stopPropagation()">
                    <div class="awards__game-preview-container" onclick="ui.goto.game(${game.ID}); event.stopPropagation()">
                        <img class="awards__game-preview" src="../../assets/imgCache/${game.ImageIcon}.webp" 
                          onerror="this.src='https://media.retroachievements.org/Images/${game.ImageIcon}.png';" alt=""
                        >
                    </div>
                    <div class="awards__game-description" >
                        <h2 class="awards__game-title">${game.FixedTitle} ${generateBadges(game.badges)}</h2>
                        <div  class="game-stats__button"  onclick="ui.expandGameItem(${game.ID},this); event.stopPropagation()">
                          <i class="game-stats__icon game-stats__expand-icon"></i>
                        </div>
                        <div class="awards__game-stats__text">${RAPlatforms[game.ConsoleID]}</div>

                        <div class="awards__game-stats-container" >                           
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__achivs-icon"></i>
                        <div class="game-stats__text">${game.NumAchievements}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${game.Points}</div>
                        </div>
                        </div>
                    </div>
                </div>
        `;
    return gameElement;
  }
  async loadGamesArray() {
    this.GAMES = {};
    // this.clearList();
    await this.getAllGames();
  }
  async getAllGames() {
    try {

      const gamesResponse = await fetch(`../../json/games/all.json`);
      const gamesJson = await gamesResponse.json();
      this.GAMES = gamesJson;
      // const ignoredWords = ["~UNLICENSED~", "~DEMO~", "~HOMEBREW~", "~HACK~", "~PROTOTYPE~", ".HACK//", "~TEST KIT~"];

      // this.GAMES[consoleCode] = gamesJson.map(game => {
      //   let title = game.Title;
      //   const sufixes = ignoredWords.reduce((sufixes, word) => {
      //     const reg = new RegExp(word, "gi");
      //     if (reg.test(game.Title)) {
      //       title = title.replace(reg, "");
      //       sufixes.push(word.replaceAll(new RegExp("[^A-Za-z]", "gi"), ""));
      //     }
      //     return sufixes;
      //   }, [])
      //   game.sufixes = sufixes;
      //   game.FixedTitle = title.trim();
      //   return game;
      // })


    } catch (error) {
      return [];
    }
  }
  showHiddenInput(button) {
    console.log("click")
    const container = button.closest(".hidden-text-input__container");
    container.classList.add("expanded-input");
    const textInput = container.querySelector("input");
    textInput.focus();
    textInput.addEventListener("blur", e => {
      // console.log(textInput.value = '')
      textInput.value == '' && (container.classList.remove("expanded-input"))
    })
    textInput.addEventListener("input", e => {
      this.titleFilter = textInput.value;
      this.updateGames();
    })
  }
}
class Favourites {

  constructor() {
    this.update();
  }

  async update() {
    ui.showLoader();
    await delay(50);
    !this.FAVOURITES && (await this.loadGamesArray());
    // this.applyFilter();
    // this.applySort();
    const section = this.FavouritesSection();
    ui.content.innerHTML = '';
    ui.content.append(section);
    ui.removeLoader();
    lazyLoad({ list: this.gameList, items: this.FAVOURITES, callback: this.getGameElement })
  }
  async loadGamesArray() {
    this.FAVOURITES = Object.values(ui.favouritesGames);
    // await delay(50)
  }
  FavouritesSection() {
    this.librarySection = document.createElement("section");
    this.librarySection.classList.add("favourites__section", "section");

    this.librarySection.appendChild(this.headerElement());

    this.gameList = document.createElement("ul");
    this.gameList.classList.add("games-list");

    this.librarySection.appendChild(this.gameList);

    return this.librarySection;
  }
  headerElement() {

    const gamesHeader = document.createElement("div");
    gamesHeader.classList.add("section__header-container");
    gamesHeader.innerHTML = `
        <div class="section__header-title">Favourites</div>
        <div class="section__control-container">
        <!--  <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
            <button class="games-platform-filter simple-button" onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">${this.platformFilter ?? "Platform"}</button>
            <div class="hidden-text-input__container">
            <input class="hidden-text-input__input" type="search">
            <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                onclick="ui.library.showHiddenInput(this)"></button> -->

        </div>
            </div>
    `;
    return gamesHeader;
  }
  getGameElement(game) {
    const gameElement = document.createElement("li");
    gameElement.classList.add("awards__game-item");
    gameElement.dataset.id = game?.ID;
    const imgName = game?.ImageIcon.slice(game?.ImageIcon.lastIndexOf("/") + 1, game?.ImageIcon.lastIndexOf(".") + 1) + "webp";
    gameElement.innerHTML = `    
            <li class="awards__game-item" data-id="${game?.ID}">
                <div class="awards__game-container"  onclick="ui.showGameDetails(${game?.ID}); event.stopPropagation()">
                    <div class="awards__game-preview-container" onclick="ui.goto.game(${game?.ID}); event.stopPropagation()">
                        <img class="awards__game-preview" src="../../assets/imgCache/${imgName}" alt="">
                    </div>
                    <div class="awards__game-description" >
                        <h2 class="awards__game-title">${game?.Title}</h2>
                        <div  class="game-stats__button"  onclick="ui.expandGameItem(${game?.ID},this); event.stopPropagation()">
                          <i class="game-stats__icon game-stats__expand-icon"></i>
                        </div>
                        <div class="awards__game-stats__text">${game?.ConsoleName}</div>

                        <div class="awards__game-stats-container" >                           
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__achivs-icon"></i>
                        <div class="game-stats__text">${game?.NumAchievements}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${game?.points_total}</div>
                        </div>
                        </div>
                    </div>
                </div>
        `;
    return gameElement;
  }
}
const Login = () => {
  const sectionUrl = './sections/login.elem';
  return fetch(sectionUrl)
    .then(responce => responce.text())
    .then(sectionHTML => {
      const sectionElement = document.createElement("section");
      sectionElement.className = "login__section";
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

function generateContextMenu(structureObj, event) {
  event.stopPropagation();
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
function generateBadges(badges) {
  return badges?.reduce((acc, badge) => acc += `<i class="game-badge game-badge__${badge.toLowerCase()}">${badge}</i>`, "")
}
function lazyLoad({ list, items, callback }) {
  const trigger = document.createElement("div");
  trigger.classList.add("lazy-load_trigger")
  list.appendChild(trigger);

  // Ініціалізація списку з початковими елементами
  let itemIndex = 0;
  const initialLoadCount = 40;
  const loadItems = (count) => {
    for (let i = 0; i < count && itemIndex < items.length; i++) {
      list.appendChild(callback(items[itemIndex++]));
    }
  };
  loadItems(initialLoadCount);

  // Callback функція для Intersection Observer
  const loadMoreItems = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadItems(initialLoadCount);
        // Оновлюємо спостереження
        observer.unobserve(trigger);
        list.appendChild(trigger);
        itemIndex < items.length && observer.observe(trigger);
      }
    });
  };
  // Налаштування Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  };
  const observer = new IntersectionObserver(loadMoreItems, observerOptions);

  // Початкове спостереження за тригером
  observer.observe(trigger);
}






//* --------------- ------------------------- ----------------------------------
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
    let nameA = a.Title?.toUpperCase() ?? a.FixedTitle.toUpperCase();
    let nameB = b.Title?.toUpperCase() ?? b.FixedTitle.toUpperCase();

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
function addGameToFavourite(gameID) {
  !config.ui.mobile.favouritesGames && (config.ui.mobile.favouritesGames = {});
  const {
    Title,
    ID,
    ImageIcon,
    NumAchievements,
    TotalRetropoints,
    points_total,
    ConsoleID,
    ConsoleName,

  } = GAMES_DATA[gameID];
  ui.favouritesGames[gameID] ?
    (delete config.ui.mobile.favouritesGames[gameID]) :
    config.ui.mobile.favouritesGames[gameID] = {
      Title,
      ID,
      ImageIcon,
      NumAchievements,
      TotalRetropoints,
      points_total,
      ConsoleID,
      ConsoleName,
    };
  config.writeConfiguration();
}