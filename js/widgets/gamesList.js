import { UI } from "../ui.js";
import { config, ui, apiWorker, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { sortBy } from "../functions/sortFilter.js";
import { generateBadges } from "../components/badges.js";
import { gameImageUrl, gameImageUrlByID, gameUrl } from "../functions/raLinks.js";


export class GameList extends Widget {
    widgetIcon = {
        description: "game series",
        iconID: `side-panel__game-list`,
        onChangeEvent: `ui.gameList.VISIBLE = this.checked`,
        iconClass: "playlist-icon",
    };

    set VISIBLE(value) {
        super.VISIBLE = value;
        (watcher.GAME_DATA?.ID !== this.gameSetID) && this.generateGamesSet();
    }
    get VISIBLE() {
        return super.VISIBLE;
    }
    constructor() {
        super();
        this.generateWidget();
        this.initializeElements();
        this.addWidgetIcon();

        this.setElementsVisibility();
        this.addEvents();
        UI.applyPosition({ widget: this });
    }
    initializeElements() {
        this.section = document.getElementById("game-list");
        this.content = this.section.querySelector(".widget-content__container");
    }
    gameChangeEvent() {
        this.VISIBLE && this.generateGamesSet();
    }
    setElementsVisibility() {
    }
    addEvents() {
        super.addEvents();
        this.section.querySelector(".update-icon")?.addEventListener("click", () => this.generateGamesSet());
    }
    generateWidget() {
        const headerElementsHtml = `
            <div class="header-button header-icon update-icon" title="${ui.lang.forceReloadHint}"></div>
        `;

        const widgetData = {
            classes: ["game-list__section", "section"],
            id: "game-list",
            title: ui.lang.gameSeriesSectionName,
            headerElementsHtml: headerElementsHtml,
        };
        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
    }
    generateWidgetContent() {
        this.content.innerHTML = ``;
    }
    async generateGamesSet() {
        const gameID = this.gameSetID = watcher.GAME_DATA?.ID;
        const gamesSet = await loadGamesSet(gameID);
        const gamesAwards = (await apiWorker.SAVED_COMPLETION_PROGRESS)?.Results;

        const header = this.section.querySelector(".widget-header-text");
        const setList = this.section.querySelector(".widget-content__container");

        gamesSet.value = (await Promise.all(gamesSet?.value?.map(async game => {
            const gameInfo = await loadGameInfo(game.ID);
            game.Date = gameInfo?.Date;
            game.Award = gamesAwards.find(g => game.ID === g.GameID)?.HighestAwardKind ?? "";
            return game;
        })))?.sort((a, b) => sortBy.date(a, b));
        const gamesHtml = gamesSet?.value.reduce((html, game) => {
            const listItemHtml = `
                <li class="game-info__set-item main-column-item right-bg-icon award-type ${game.Award} ${gameID == game.ID ? "focus" : ""}">
                    <img class="awards__game-preview" src="${gameImageUrlByID(game.ImageIcon)}" alt=" ">
                    <h3 class="game-title">
                        <a target="_blank" data-title="${ui.lang.goToRAHint}" href="${gameUrl(game.ID)}">
                    ${game.Title} ${generateBadges(game?.badges)}</a></h3>
                    <p class="awards__game-description">${game.Console}</p>
                    <p class="awards__game-description">${game.Date ?? "Date unavailable"}</p>
                </li>
            `;
            html += listItemHtml;
            return html;
        }, "");
        header.innerHTML = `${gamesSet.name} Series`
        setList.innerHTML = `<ul class="flex-main-list">${gamesHtml}<ul>`;
        setList.querySelector(".focus")?.scrollIntoView();
    }
}
const loadGamesSet = async (gameID = 1) => {
    if (!watcher.gamesSets) {
        const infoResponce = await fetch(`./json/games/gamesSets.json`);
        watcher.gamesSets = await infoResponce.json();
    }
    const setNames = Object.keys(watcher.gamesSets);
    for (let i = 0; i < setNames.length; i++) {
        const setName = setNames[i];
        if (watcher.gamesSets[setName].find(g => g.ID === gameID))
            return { name: setName, value: watcher.gamesSets[setName] };
    }
    return undefined;
}
const loadGameInfo = async (gameID) => {
    if (!ui.gamesExtInfo) {
        const infoResponce = await fetch(`./json/games/all_ext.json`);
        ui.gamesExtInfo = await infoResponce.json();
    }
    return gameID ? ui.gamesExtInfo.find(g => g.ID == gameID) : undefined;
}