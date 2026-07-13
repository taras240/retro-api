import { apiWorker, config, ui } from "./main.js";
import { Home } from "./ui/home/home.js";
import { Awards } from "./ui/awards.js";
import { Game } from "./ui/game.js";
import { Library } from "./ui/library/library.js";
import { Favourites } from "./ui/favourites.js";
import { Login } from "./ui/login.js";
import { Loader } from "./ui/components/loader.js";
import { sortBy } from "./functions/sort.js";
import { delay } from "./functions/delay.js";
import { RAPlatforms } from "./enums/RAPlatforms.js";
import { toLocalString } from "./functions/time.js";
import { fromHtml } from "../../js/functions/html.js";
import { Unlocks } from "./ui/unlocks.js";

export let USER_INFO;
export let GAMES_DATA = {};
export class UI {
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
    '/unlocks': async (args) => {
      if (config.identConfirmed) {
        this.unlocks = new Unlocks();
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
    },
    "unlocks": () => {
      history.pushState(null, null, "#/unlocks");
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
    !config.ui.mobile && (config.ui.mobile = {});
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
    config.identConfirmed && this.navbar.login.classList.add("hidden");
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

    if (GAMES_DATA[gameID]) {
      gameElement.innerHTML = this.gamePopupHtml(GAMES_DATA[gameID]);
      this.content.append(gameElement);
      this.removeLoader();
    }
    else {
      apiWorker
        .getGameProgress({ gameID: gameID })
        .then(gameObj => {
          GAMES_DATA[gameID] = gameObj;
          console.log(gameObj)
          gameElement.innerHTML = this.gamePopupHtml(gameObj);
          this.content.append(gameElement);
        }).then(() => this.removeLoader())
    }

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
          href="https://google.com/search?q='${game?.FixedTitle}' '${RAPlatforms[game?.ConsoleID]}' ${googleQuerySite}" target="_blank"></a>
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
          <div class="popup-info__property">Achievements total : <span>${game?.NumAchievements}</span></div>
          <div class="popup-info__property">Total points : <span>${game?.points_total}</span></div>
          <div class="popup-info__property">Total players : <span>${game?.players_total}</span></div>

      </div>
    `
  }
  async showAchivDetails(cheevoID, gameID) {
    this.removePopups();
    this.showLoader();
    if (GAMES_DATA[gameID]) {
      const achivElement = document.createElement("div");
      achivElement.addEventListener("touchend", e => e.stopPropagation());

      achivElement.classList.add("popup-info__container", "popup");
      const achiv = GAMES_DATA[gameID].Achievements[cheevoID];
      const achivHtml = this.achivPopupHtml(achiv)
      achivElement.innerHTML = achivHtml;
      this.content.append(achivElement)
      this.removeLoader()
    }
    else {
      const gameData = await apiWorker.getGameProgress({ gameID });
      GAMES_DATA[gameID] = gameData;
      this.showAchivDetails(cheevoID, gameID);
    }

  }
  achivPopupHtml(achiv) {
    return `
    <button class="close-popup" onclick="ui.removePopups()"></button>
    <div class="popup-info__preview-container">
        <img src="${achiv?.prevSrc}" alt="" class="popup-info__preview">
        <span class="game-header__retro-ratio  achiv-rarity__${achiv?.difficulty}">${achiv?.difficulty}</span>
    </div>
    <h2 class="popup-info__title">${achiv?.Title}</h2>
    <div class="hor-line"></div>
    <p class="popup-info__description">
    ${achiv?.Description}
    </p>
    <div class="hor-line"></div>
    <div class="popup-info__properties">
        <div class="popup-info__property">Points: <span>${achiv?.Points}</span></div>
        <div class="popup-info__property">Retropoints: <span>${achiv?.TrueRatio}</span></div>
        <div class="popup-info__property">Total players: <span>${achiv?.totalPlayers}</span></div>
        <div class="popup-info__property">Earned by: <span>${achiv?.NumAwarded}</span></div>
        <div class="popup-info__property">Earned harcore by: <span>${achiv?.NumAwardedHardcore}</span></div>
        ${achiv?.isEarned ? `<div class="popup-info__property">Date earned : <span>${toLocalString(achiv?.DateEarned)}</span></div>` : ''}
        ${achiv?.isHardcoreEarned ? `<div class="popup-info__property">Date earned hardcore: <span>${toLocalString(achiv?.DateEarnedHardcore)}</span></div>` : ''}
        <div class="popup-info__property">Date created : <span>${new Date(achiv?.DateCreated).toLocaleDateString()}</span></div>
        <div class="popup-info__property">Author : <span>${achiv?.Author}</span></div>
    </div>
  `;
  }
  expandGameItem(gameID, button) {
    const targetGameElement = button.closest(`li`);
    targetGameElement.classList.toggle("expanded");

    const getRecentGame = (gameID) => {
      this.showLoader();
      const achivsContainer = fromHtml(`
        <div class="user-info__game-achivs-container">
            <ul class ="user-info__game-achivs-list"/>
        </div>
      `);

      const achivsList = achivsContainer.querySelector("ul");

      targetGameElement.appendChild(achivsContainer);
      if (GAMES_DATA[gameID]) {
        Object.values(GAMES_DATA[gameID].Achievements)
          .sort((a, b) => sortBy.date(a, b))
          .forEach(achiv => {
            achivsList.innerHTML += this.cheevoBadgeHtml(achiv, gameID);
          });
        this.removeLoader();
      }
      else {
        apiWorker
          .getGameProgress({ gameID: gameID })
          .then(gameObj => {
            GAMES_DATA[gameID] = gameObj;
            Object.values(gameObj.Achievements)
              .sort((a, b) => sortBy.date(a, b))
              .forEach(achiv => {
                achivsList.innerHTML += this.cheevoBadgeHtml(achiv, gameID);
              })
          }).then(() => this.removeLoader())
      }
    }
    targetGameElement.querySelector(".user-info__game-achivs-container") ?? (getRecentGame(gameID))
  }
  achivHtmlList(achiv, gameID) {
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
  cheevoBadgeHtml(achiv, gameID) {
    return `    
            <li class="ach-badge-item ${achiv.isHardcoreEarned ? "hardcore" : ""} ${achiv.isEarned ? "unlocked" : ""}"  onclick="ui.showAchivDetails(${achiv.ID},${gameID}); event.stopPropagation();">                
                <div class="ach-badge-preview">
                    <img class="ach-badge-image ${(achiv.isHardcoreEarned || ui.isSoftmode && achiv.isEarned) && "earned"}" src="${achiv.prevSrc}"/>
                  <div class="achiv-rarity achiv-rarity__${achiv.difficulty}"></div>
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






//* --------------- ------------------------- ----------------------------------





const googleQuerySite = 'site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en';