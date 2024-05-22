class UI {
  routes = {
    '/': async () => {
      if (config.identConfirmed) {
        this.home = new Home();
        this.clearNavbar();
        this.navbar.home.classList.add("checked");
      }
      else {
        content.innerHTML = "";
        content.append(await Login());
        this.clearNavbar()
        this.navbar.login.classList.add("checked");
      }
    },

    '/login': async () => {
      content.innerHTML = "";
      content.append(await Login());
      this.clearNavbar()
      this.navbar.login.classList.add("checked");
    },

    '/home': async () => {
      if (config.identConfirmed) {
        this.home = new Home();
        this.clearNavbar()
        this.navbar.home.classList.add("checked");
      }
      else {
        content.innerHTML = "";
        content.append(await Login());
        this.clearNavbar()
        this.navbar.login.classList.add("checked");
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
}
class Home {
  USER_INFO = {};
  constructor() {
    this.update();
  }


  update() {
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
        ui.content.innerHTML = '';
        ui.content.append(this.HomeSection());
      })
  }

  expandRecentGame(gameID) {
    const targetGameElement = document
      .querySelector(`.user-info__last-game-container[data-id='${gameID}'`);
    targetGameElement.classList.toggle("expanded");

    const getRecentGame = (gameID) => {

      const achivsContainer = document.createElement("div");
      achivsContainer.classList.add("user-info__game-achivs-container");

      const achivsList = document.createElement("ul");
      achivsList.classList.add("user-info__game-achivs-list");

      achivsContainer.appendChild(achivsList);
      targetGameElement.appendChild(achivsContainer);
      GAMES_DATA[gameID] ?
        Object.values(GAMES_DATA[gameID].Achievements).forEach(achiv => {
          achivsList.innerHTML += this.achivHtml(achiv, gameID);
        })
        : apiWorker
          .getGameProgress({ gameID: gameID })
          .then(gameObj => {
            GAMES_DATA[gameID] = gameObj;
            Object.values(gameObj.Achievements).forEach(achiv => {
              achivsList.innerHTML += this.achivHtml(achiv, gameID);
            })
          })
    }



    targetGameElement.querySelector(".user-info__game-achivs-container") ?? (getRecentGame(gameID))
  }
  showGameDetails(gameID) {
    ui.removePopups();
    const gameElement = document.createElement("div");
    gameElement.classList.add("popup-info__container", "popup");
    ui.content.append(gameElement);
    GAMES_DATA[gameID] ?
      gameElement.innerHTML = this.gamePopupHtml(GAMES_DATA[gameID]) :
      apiWorker
        .getGameProgress({ gameID: gameID })
        .then(gameObj => {
          GAMES_DATA[gameID] = gameObj;
          gameElement.innerHTML = this.gamePopupHtml(gameObj);
        })

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
    ui.removePopups();
    const achivElement = document.createElement("div");
    achivElement.classList.add("popup-info__container", "popup");
    const achiv = GAMES_DATA[gameID].Achievements[achivID];
    const achivHtml = this.achivPopupHtml(achiv)
    achivElement.innerHTML = achivHtml;
    ui.content.append(achivElement)
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
                <div class="user-info__points-group">
                    <h3 class="user-info__points-name">softpoints</h3>
                    <p class="user-info__points">${this.USER_INFO.softpoints}</p>
                </div>

                <div class="vertical-line"></div>
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
                <div class="user-info__game-main-info"  onclick="ui.home.showGameDetails(${game.GameID}); event.stopPropagation()">
                    <div class="user-info__game-preview-container">
                        <img class="user-info__game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
                    </div>
                    <div class="user-info__game-description" >
                        <h2 class="user-info__game-title">${game.Title}</h2>
                        <div class="user-info_game-stats-container" onclick="ui.home.expandRecentGame(${game.GameID}); event.stopPropagation()">
                            <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"></i>
                            <div class="game-stats__text">${game.NumAchievedHardcore} / ${game.NumPossibleAchievements}</div>
                            </div>
                            <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"></i>
                            <div class="game-stats__text">${game.ScoreAchievedHardcore} / ${game.PossibleScore}</div>
                            </div>
                            <div  class="game-stats__button">
                                <i class="game-stats__icon game-stats__expand-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        `;
  }
  achivHtml(achiv, gameID) {
    return `    
            <li class="user-info__achiv-container"  onclick="ui.home.showAchivDetails(${achiv.ID},${gameID})">                
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
