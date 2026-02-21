import { UI } from "../ui.js";
import { icons, signedIcons } from "../components/icons.js"

import { config, ui, apiWorker, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { generateBadges, badgeElements } from "../components/badges.js";
import { sortBy, sortMethods } from "../functions/sortFilter.js";
import { inputElement, inputTypes } from "../components/inputElements.js";
import { GAME_GENRE_CODES } from "../enums/gameGenres.js";
import { RA_PLATFORM_CODES } from "../enums/RAPlatforms.js";
import { platformsByManufacturer } from "../enums/platformManufacturer.js";
import { hintElement } from "../components/hint.js";
import { gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { RELEASE_TYPES } from "../enums/releaseVersions.js";
import { gamesExtMap } from "../enums/gamesExtMap.js";
import { getGenres } from "../functions/genreIDtoGenre.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { gamesFromJson } from "../functions/gamesJson.js";
import { fromHtml } from "../functions/html.js";

export class Games extends Widget {
    widgetIcon = {
        description: "games widget",
        iconID: `side-panel__games`,
        onChangeEvent: `ui.games.VISIBLE = this.checked`,
        iconClass: "games-icon",
    };
    contextMenuItems(gameID) {
        return [
            {
                type: inputTypes.BUTTON,
                id: "update-game",
                label: "**Update game**",
                event: `onclick=""`,
                onClick: () => watcher.updateGameData(gameID),
            },
            {
                type: inputTypes.CHECKBOX,
                id: "add-to-favourites",
                label: `fav`,
                checked: ui.games.FAVOURITES.includes(+gameID),
                onClick: (event) => ui.games.addToFavourite(event, gameID),
            },
        ];
    }
    get headerControls() {
        return [{
            type: inputTypes.SELECTOR,
            label: ui.lang.sort,
            id: "games__sort-selector",
            onClick: (event) => ui.showContextmenu({
                event, menuItems: [
                    {
                        type: inputTypes.RADIO,
                        name: "games__sort-type",
                        id: `games__sort-type-${sortMethods.date}`,
                        label: ui.lang.releaseDate,
                        checked: this.SORT_NAME === sortMethods.date,
                        onChange: () => this.SORT_NAME = sortMethods.date,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "games__sort-type",
                        id: `games__sort-type-${sortMethods.points}`,
                        label: ui.lang.points,
                        checked: this.SORT_NAME === sortMethods.points,
                        onChange: () => this.SORT_NAME = sortMethods.points,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "games__sort-type-order",
                        id: `games__sort-type-order`,
                        label: ui.lang.reverse,
                        checked: this.REVERSE_SORT,
                        onChange: (event) => this.REVERSE_SORT = event.currentTarget.checked,
                    }]
            }),
        },
        {
            type: inputTypes.CHECKBOX,
            label: ui.lang.filter,
            id: "games__filter-list-checkbox",
            checked: false,
            onChange: (event) => this.showFilters(event.currentTarget.checked),
        },
        {
            type: inputTypes.SEARCH_INPUT,
            label: ui.lang.search,
            id: "games__search-text-input",
            value: "",
            onInput: (event) => this.searchInputEvent(event),
            title: ui.lang.searchGameInputHint
        },
        ]
    }
    get platformFilterItems() {
        const filters = Object.keys(platformsByManufacturer).reduce((items, brend) => {
            const groupItem = {
                label: brend,
                type: inputTypes.GROUP,
            }
            const platformItems = Object.keys(platformsByManufacturer[brend]).reduce((items, platformName) => {
                const filterItem = {
                    label: platformName,
                    type: inputTypes.CHECKBOX,
                    name: 'filter-by-platform',
                    checked: this.PLATFORMS_FILTER.includes(platformsByManufacturer[brend][platformName]),
                    id: `filter-by-platform-${platformsByManufacturer[brend][platformName]}`,
                    onChange: (event) => this.platformCheckboxChangeEvent(event.currentTarget, platformsByManufacturer[brend][platformName]),
                }
                items.push(filterItem);
                return items;
            }, []);
            items = [...items, groupItem, ...platformItems];
            return items;
        }, [])

        return filters;
    }
    get awardsFilterItems() {
        return Object.keys(this.awardTypes).map((awardType) => ({
            type: inputTypes.CHECKBOX,
            label: this.awardTypes[awardType],
            name: 'filter-by-award',
            value: 'award',
            checked: this.AWARD_FILTER.includes(awardType),
            id: `filter-by-award-${awardType}`,
            onChange: (event) => this.awardCheckboxChangeEvent(event.currentTarget, awardType),
        })
        )
    }
    get releaseVersionFilterItems() {
        return Object.keys(RELEASE_TYPES).map(releaseVersion => ({
            type: inputTypes.CHECKBOX,
            label: RELEASE_TYPES[releaseVersion],
            name: 'filter-by-release',
            value: 'release',
            checked: this.RELEASE_FILTER.includes(RELEASE_TYPES[releaseVersion]),
            id: `filter-by-release-${releaseVersion}`,
            onChange: (event) => this.releaseCheckboxChangeEvent(event.currentTarget, RELEASE_TYPES[releaseVersion]),
        }))
    }
    get genresFilterItems() {
        return Object.keys(GAME_GENRE_CODES).map((genreID) => ({
            type: inputTypes.CHECKBOX,
            label: GAME_GENRE_CODES[genreID],
            name: 'filter-by-genre',
            checked: this.GENRE_FILTER.includes(genreID),
            id: `filter-by-genre-${genreID}`,
            onChange: (event) => this.genreCheckboxChangeEvent(event.currentTarget, genreID),
        }))
    }
    get sortItems() {
        const items = [
            {
                type: inputTypes.RADIO,
                label: ui.lang.released,
                name: 'games__sort-by',
                checked: this.SORT_NAME === sortMethods.date,
                id: `games__sort-by-date`,
                onChange: () => this.SORT_NAME = sortMethods.date,
            },
            {
                type: inputTypes.RADIO,
                label: ui.lang.points,
                name: 'games__sort-by',
                checked: this.SORT_NAME === sortMethods.points,
                id: `games__sort-by-points`,
                onChange: () => this.SORT_NAME = sortMethods.points,
            }
        ]

        return items;
    }
    set FAVOURITES(value) {
        this._favs = value;
        config.ui.favouritesGames = value;
        config.writeConfiguration();
    }
    get FAVOURITES() {
        return this._favs ?? [];
    }
    set COOP_FILTER(value) {
        this.coopOnly = value;
        // config.ui.games_section.coopOnly = value;
        // config.writeConfiguration();
        this.updateGamesList();
    }
    get COOP_FILTER() {
        return this.coopOnly ?? false;
    }
    awardCheckboxChangeEvent(checkbox, awardType) {
        let awards = this.AWARD_FILTER;
        checkbox.checked ?
            awards.push(awardType) :
            (awards = awards.filter(code => code != awardType));
        this.AWARD_FILTER = awards;
    }
    releaseCheckboxChangeEvent(checkbox, releaseType) {
        let release = this.RELEASE_FILTER;
        checkbox.checked ?
            release.push(releaseType) :
            (release = release.filter(code => code != releaseType));
        this.RELEASE_FILTER = release;
    }
    platformCheckboxChangeEvent(checkbox, platformCode) {
        let platforms = this.PLATFORMS_FILTER;
        checkbox.checked ?
            platforms.push(platformCode + '') :
            (platforms = platforms.filter(code => code != platformCode));
        this.PLATFORMS_FILTER = platforms;
    }
    genreCheckboxChangeEvent(checkbox, genreCode) {
        let genres = this.GENRE_FILTER;
        checkbox.checked ?
            genres.push(genreCode) :
            (genres = genres.filter(code => code != genreCode));
        this.GENRE_FILTER = genres;
    }
    set YEARS_FILTER(value) {
        this.yearsFilter = value;
        this.updateGamesList();
    }
    get YEARS_FILTER() {
        return this.yearsFilter ?? { from: -Infinity, to: Infinity };
    }
    set CHEEVOS_COUNT_FILTER(value) {
        this.cheevosCountFilter = value;
        this.updateGamesList();
    }
    get CHEEVOS_COUNT_FILTER() {
        return this.cheevosCountFilter ?? { from: -Infinity, to: Infinity };
    }
    set POINTS_PER_CHEEVO_FILTER(value) {
        this.ppcFilter = value;
        this.updateGamesList();
    }
    get POINTS_PER_CHEEVO_FILTER() {
        return this.ppcFilter ?? { from: -Infinity, to: Infinity };
    }
    set HLTB_FILTER(value) {
        this.hltbFilter = value;
        this.updateGamesList();
    }
    get HLTB_FILTER() {
        return this.hltbFilter ?? { from: 0, to: Infinity };
    }
    set PLATFORMS_FILTER(value) {

        let platformCodes = value.filter(code => Object.keys(RA_PLATFORM_CODES).includes(code));
        this.platformsFilter = platformCodes;
        // config.ui.games_section.platformsFilter = platformCodes;
        // config.writeConfiguration();
        this.updateGamesList();
        // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

    }
    get PLATFORMS_FILTER() {
        return this.platformsFilter ?? [];
    }
    set GENRE_FILTER(value) {

        let genreCodes = value.filter(code => Object.keys(GAME_GENRE_CODES).includes(code));
        this.genreFilter = genreCodes;
        // config.ui.games_section.genreFilter = genreCodes;
        // config.writeConfiguration();
        this.updateGamesList();
        // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

    }
    get GENRE_FILTER() {
        return this.genreFilter ?? [];
    }
    set AWARD_FILTER(value) {
        this.awardFilter = value;
        // config.ui.games_section.awardFilter = value;
        // config.writeConfiguration();
        this.updateGamesList();
        // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

    }
    get AWARD_FILTER() {
        return this.awardFilter ?? [];
    }

    set RELEASE_FILTER(value) {
        this.releaseFilter = value;
        this.updateGamesList();
        // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

    }
    get RELEASE_FILTER() {
        return this.releaseFilter ?? [RELEASE_TYPES.RETAIL];
    }
    set FAVOURITES_FILTER(value) {
        this.favouritesFilter = value;
        this.updateGamesList();
        // this.platformFiltersList.querySelector("#game-filters_all").checked = this.PLATFORMS_FILTER.length === Object.keys(this.gameFilters).length;

    }
    get FAVOURITES_FILTER() {
        return this.favouritesFilter;
    }
    get TYPES_FILTER() {
        return config.ui?.games_section?.typesFilter ?? ["original"];
    }
    set TYPES_FILTER(checkbox) {
        const type = checkbox.dataset.type ?? "";
        const typesFilters = this.TYPES_FILTER;
        const checked = checkbox.checked;
        if (checked) {
            typesFilters.push(type);
        }
        else {
            const index = typesFilters.indexOf(type);
            if (index !== -1) {
                typesFilters.splice(index, 1);
            }
        }
        config.ui.games_section.typesFilter = typesFilters;
        config.writeConfiguration();
        this.applyFilter();
    }
    set REVERSE_SORT(value) {
        config._cfg.ui.games_section.reverse_sort = value ? -1 : 1;
        config.writeConfiguration();
        this.updateGamesList();
    }
    get REVERSE_SORT() {
        return config._cfg.ui?.games_section?.reverse_sort ?? -1;
    }
    get SORT_METHOD() {
        // return sortBy.date; //!  <----------------------------------------
        return sortBy[this.SORT_NAME];
    }
    get SORT_NAME() {
        // return sortMethods.title;
        return config._cfg.ui?.games_section?.sort_name ?? sortMethods.date;
    }
    set SORT_NAME(value) {
        value === this.SORT_NAME &&
            (config._cfg.ui.games_section.reverse_sort = -1 * this.REVERSE_SORT)
        config._cfg.ui.games_section.sort_name = value;
        config.writeConfiguration();
        this.updateGamesList();
    }
    titleFilter = '';
    applyFilter() {

        //*Filter by Search request   
        const searchRequest = this.titleFilter
            .split(/\s/)
            .map(word => `(?=.*${word})`)
            .join('');
        const titleRegex = new RegExp(searchRequest, 'gi');
        this.games = this.titleFilter ?
            this.GAMES.filter(game =>
                `${game.Title} ${game.badges?.join(' ')} ${RA_PLATFORM_CODES[game.ConsoleID]?.Name ?? "-"}`.match(titleRegex)) :
            this.GAMES;
        this.COOP_FILTER && (this.games = this.games?.filter(game => game.Coop == "true"));

        //* Filter by Platform
        this.PLATFORMS_FILTER.length > 0 && (this.games = this.games?.filter(game => {
            let isPlatformMatch = false;
            for (let platformCode of this.PLATFORMS_FILTER) {
                platformCode == game.ConsoleID && (isPlatformMatch = true);
            }
            return isPlatformMatch;
        }))

        //* Filter by genre
        this.GENRE_FILTER.length > 0 && (this.games = this.games?.filter(game => {
            let isGenreMatch = false;
            for (let genreCode of this.GENRE_FILTER) {
                game?.Genres?.includes(+genreCode) && (isGenreMatch = true);
            }
            return isGenreMatch;
        }))
        //*Filter by Favourites
        this.FAVOURITES_FILTER && (this.games = this.games.filter(game => this.FAVOURITES.includes(game.ID)))

        //* Filter by Awards
        this.AWARD_FILTER.length > 0 && (this.games = this.games.filter(game => {
            let isAwarded = false;
            for (let award of this.AWARD_FILTER) {
                award == game.Award && (isAwarded = true);
            }
            return isAwarded;
        }))

        //* Filter by RELEASE type
        this.RELEASE_FILTER.length > 0 && (this.games = this.games.filter(game => {
            for (let releaseVersion of this.RELEASE_FILTER) {
                if (releaseVersion === RELEASE_TYPES.RETAIL) {
                    return game.badges?.length === 0;
                }
                return game.badges?.includes(releaseVersion)
            }
        }))
        //* Filter by POINTS per CHEEVO
        this.games = this.games.filter(game => {
            const ppc = game.Points / game.NumAchievements;
            return ppc <= this.POINTS_PER_CHEEVO_FILTER.to && ppc >= this.POINTS_PER_CHEEVO_FILTER.from
        })
        //* HLTB Filter
        this.games = this.games.filter(game => {
            const hltbValues = Object.values(game.HLTB || {});
            const hltb = Math.min(...(hltbValues.length ? hltbValues : [0]));
            return hltb <= this.HLTB_FILTER.to && hltb >= this.HLTB_FILTER.from
        })
        //* Filter by CHEEVOS Count
        this.games = this.games.filter(game => {
            // !isFinite(game.NumAchievements) && console.log(game.NumAchievements);
            const count = parseInt(game.NumAchievements) ?? 0;
            return count <= this.CHEEVOS_COUNT_FILTER.to && count >= this.CHEEVOS_COUNT_FILTER.from
        })
        //* Filter by YEAR 
        this.games = this.games.filter(game => {
            const gameYear = +(game.Date?.split("-")?.[0] ?? 0);
            return gameYear <= this.YEARS_FILTER.to && gameYear >= this.YEARS_FILTER.from
        })
    }
    applySort() {
        this.games = this.games.sort((a, b) => this.REVERSE_SORT * this.SORT_METHOD(a, b));
    }
    platformCodes = {

    }
    awardTypes = {
        'mastered': 'mastered',
        'beaten-hardcore': 'beaten',
        'completed': 'completed',
        'beaten-softcore': 'beaten softcore',
        'started': 'started',
    }

    games = {}
    gamesInfo = {};
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this._favs = config.ui.favouritesGames ?? [];
        this.initializeElements();
        this.container.appendChild(this.sideMenuElement());
        this.setValues();
        this.addEvents();
        this.gamesList.innerHTML = `
      <button class="games__load-button" onclick="ui.games.loadGames()"></button>
      `;
        UI.applyPosition({ widget: this });

        this.section.querySelector(".games__main-controls").append(
            ...this.headerControls.map(control => inputElement(control))
        );

    }
    generateWidget() {
        const controlsElement = document.createElement("div");
        controlsElement.classList.add("games__main-controls");
        const containerHtml = `
            <ul class="platform-list" id="games-list" data--console-id="all" data-current-games-array-position="0"></ul>
        `
        const widgetID = "games_section";
        const headerElementsHtml = `
            ${buttonsHtml.reload("ui.games.loadGames()")}
            ${buttonsHtml.fulscreen("ui.games.toggleFullscreen()")}
        `;

        const widgetData = {
            classes: ["games_setion", "section"],
            id: widgetID,
            title: `RA Games Library`,
            headerElementsHtml: headerElementsHtml,
            contentClasses: ["games_container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        const contentContainer = widget.querySelector(".games_container");
        contentContainer.innerHTML = containerHtml;
        widget.insertBefore(controlsElement, contentContainer);
        ui.app.appendChild(widget);
    }
    initializeElements() {
        this.section = document.querySelector("#games_section");
        this.header = this.section.querySelector(".header-container");
        this.container = this.section.querySelector(".games_container");
        this.searchbar = this.section.querySelector("#games__searchbar");
        this.platformFiltersList = this.section.querySelector("#games_filter-platform-list");
        this.gamesList = this.section.querySelector("#games-list");
    }
    setValues() {
        this.header.classList.add("fixed");
    }
    searchInputEvent(event) {
        const searchbarValue = event.target.value;
        this.titleFilter = searchbarValue;
        event.target.classList.toggle("empty", searchbarValue == "");
        this.updateGamesList();
    }
    addEvents() {
        super.addEvents();
        this.section.addEventListener("contextmenu", event => {
            const gameItem = event.target.closest(".games__game-item");
            if (gameItem) {
                event.preventDefault();
                event.stopPropagation();
                const gameID = gameItem.dataset.id;
                ui.showContextmenu({
                    event: event,
                    menuItems: this.contextMenuItems(gameID),
                });
            }

        });
        this.section.querySelectorAll(".side-menu__subitem").forEach(subitem => {
            const itemHeader = subitem.querySelector(".side-menu__item-header");
            const mainHeader = subitem.querySelector(".side-menu__header");
            const content = subitem.querySelector('.side-menu__subitem-content');
            const submenu = subitem.querySelector('.side-menu__submenu');

            if (itemHeader && content) {
                itemHeader.addEventListener("click", (event) => {
                    event.stopPropagation();
                    content.classList.add('active');
                });
            }

            if (mainHeader && submenu) {
                mainHeader.addEventListener("click", (event) => {
                    event.stopPropagation();
                    submenu.classList.remove('active');
                });
            }
        });

    }
    async loadWantToPlay() {
        const gamesList = await apiWorker.getWantToPlayGames({});
        this._favs = Array.from(new Set([...gamesList]));//...this._favs,
    }
    updateGamesList() {
        this.applyFilter();
        this.applySort();
        this.gamesList.innerHTML = "";
        lazyLoad({ list: this.gamesList, items: this.games, callback: this.gameElement })
    }
    loadGames() {
        this.loadWantToPlay().then(
            this.getAllGames()
                .then(() => {
                    this.updateGamesList();
                })
        )
        this.loadGameInfo();
    }
    async loadGameInfo() {
        const infoResponce = await fetch(`./json/games/all_info.json`);
        this.gamesInfo = await infoResponce.json();
    }
    async getAllGames() {
        this.GAMES = {};

        try {
            const gamesJson = await gamesFromJson();
            const lastPlayedGames = await apiWorker.completionProgress();
            for (let lastGame of lastPlayedGames.Results) {
                let gameToModify = gamesJson.find(game => lastGame.ID === game.ID);
                if (gameToModify) {
                    lastGame.NumAwardedHardcore && (gameToModify.NumAwardedHardcore = lastGame.NumAwardedHardcore);
                    lastGame.HighestAwardKind ? (gameToModify.Award = lastGame.HighestAwardKind) : (gameToModify.Award = 'started');
                    lastGame.MostRecentAwardedDate && (gameToModify.MostRecentAwardedDate = lastGame.MostRecentAwardedDate);
                }
                else {
                    gameToModify = lastGame;
                    gameToModify.ImageIcon = gameToModify.ImageIcon.match(/\d+/gi)[0];
                    lastGame.NumAwardedHardcore && (gameToModify.NumAwardedHardcore = lastGame.NumAwardedHardcore);
                    lastGame.HighestAwardKind ? (gameToModify.Award = lastGame.HighestAwardKind) : (gameToModify.Award = 'started');
                    gameToModify.Points = '';
                    gamesJson.push(gameToModify);
                }
            }
            this.GAMES = gamesJson;
        } catch (error) {
            return [];
        }
    }
    gameElement(gameData) {
        const bool = (value) => value === "true";
        const gameElement = document.createElement("li");

        gameElement.classList.add("platform_game-item", "games__game-item");
        gameElement.dataset.id = gameData.ID;
        // const iconCode = game.ImageIcon.match(/\d+/g);
        gameElement.innerHTML = `
            <img class="game-preview_image" src="${gameImageUrl(gameData.ImageIcon)}" alt="game preview">
            <h3 class="game-description_title">
            <button data-title="${ui.lang.showGameInfoHint}" class="game-description_button"
                    onclick="ui.games.showGameInfoPopup(${gameData.ID})">
                    ${gameData.Title} 
                    ${gameData.Award ? badgeElements.infoBadge(gameData.Award) : ""}
                    ${gameData.badges?.length ? generateBadges(gameData.badges, "infoBadge") : ""} 
                    ${bool(gameData.Coop) ? badgeElements.infoBadge('coop') : ""} 
                    ${gameData.Genres ? generateBadges(getGenres(gameData.Genres), "infoBadge") : ""}
            </button>
            </h3>
            <div class="game-description__info icons-row-list"> 
                ${signedIcons.platform(gameData.ConsoleID)}
                ${signedIcons.date(gameData.Date || "n/a")}
                ${signedIcons.rating(gameData.Rating || "n/a")}
                ${signedIcons.cheevos((gameData.NumAwardedHardcore ? gameData.NumAwardedHardcore + '\/' : "") + gameData.NumAchievements)}
                ${signedIcons.points(gameData.Points)}
                ${signedIcons.time(gameData.timeToBeat)}
            </div>
        `;
        return gameElement;
    }
    addToFavourite(event, gameID) {
        const isFavourite = this.FAVOURITES.includes(gameID);
        if (isFavourite) {
            this.FAVOURITES = this.FAVOURITES.filter(id => id != gameID);
        }
        else {
            this.FAVOURITES = [gameID, ...this.FAVOURITES];
        }
        // event.target.closest('button').classList.toggle('checked', !isFavourite);
    }
    showFilters(isVisible = true) {
        this.section.querySelector(".section__side-menu")?.classList.toggle("active", isVisible);
    }
    toggleFilterList(event, filterType) {
        const hideFilters = () => {
            this.section.querySelector('.games__filters-list')?.remove();
            this.section.querySelectorAll('.games__filter-header .extended')
                .forEach(el => el.classList.remove('extended'))
        }
        const filterButton = event.target.closest('button');

        if (filterButton.classList.contains('extended')) {
            hideFilters();
        }
        else {
            hideFilters();
            filterButton.classList.add('extended');
            let list;
            switch (filterType) {
                case 'platform':
                    list = this.generateCheckboxList(this.platformFilterItems);
                    break;
                case 'award':
                    list = this.generateCheckboxList(this.awardsFilterItems);
                    break;
                case 'genre':
                    list = this.generateCheckboxList(this.genresFilterItems);
                    break;
            }
            this.section.append(list);
            this.section.querySelector('.games__filter-container').appendChild(list);
        }

    }
    toggleSortList(event) {
        const hideFilters = () => {
            this.section.querySelector('.games__filters-list')?.remove();
            this.section.querySelectorAll('.games__filter-header .extended')
                .forEach(el => el.classList.remove('extended'))
        }

        if (!event.target.classList.contains("extended")) {
            event.target.classList.toggle("extended");
            const list = this.generateCheckboxList(this.sortItems);
            this.section.append(list);
            this.section.querySelector('.games__filter-container').appendChild(list);
        }
        else {
            hideFilters();
        }

    }
    generateCheckboxList(itemsObj) {
        const list = Object.values(itemsObj).reduce((list, item) => {
            if (item.type == 'group') {
                const groupHeader = document.createElement('li');
                groupHeader.classList.add('filter-list__platform-header');
                groupHeader.innerText = item.label + ': ';
                list.appendChild(groupHeader);
            }
            else {
                const filterItem = document.createElement("li");
                filterItem.classList.add("checkbox-input_container");
                filterItem.append(inputElement(item));
                list.appendChild(filterItem);
            }
            return list;
        }, document.createElement('ul'));
        list.classList.add("games__filters-list");
        return list;
    }
    async showGameInfoPopup(gameID = 1) {
        const properyLine = ({ label, value }) => `
            <div class="game-description__property">
                ${label}: <span>${value}</span>
            </div>
        `;
        const gamePreviewImage = (linkEndpoint) => `<img src="${gameImageUrl(linkEndpoint)}" alt="game preview" class="game__image">`
        document.querySelectorAll(".game-popup__section").forEach(popup => popup.remove());
        const gamePopupElement = document.createElement("div");

        const game = await apiWorker.getGameInfoAndProgress({ gameID: gameID });

        gamePopupElement.innerHTML = `
            <section class="section game-popup__section">
                <div class="game-popup__header-container header-container">
                    <h2 class="widget-header-text"><a href="${gameUrl(game.ID)}" target="_blank">${game.Title} ${generateBadges(game.badges)}</a></h2>
                    ${buttonsHtml.close("this.closest('section').remove();")}
                </div>
                <div class="game-info__container">
                    <div class="game-info__images-container scrollable">
                        ${gamePreviewImage(game.ImageBoxArt)}
                        ${gamePreviewImage(game.ImageIngame)}
                        ${gamePreviewImage(game.ImageTitle)}
                    </div>
                    <div class="game-info__descriptions-container">
                        ${properyLine({ label: ui.lang.platform, value: game?.ConsoleName })}
                        ${properyLine({ label: ui.lang.developer, value: game?.Developer })}
                        ${properyLine({ label: ui.lang.genre, value: game?.Genre })}
                        ${properyLine({ label: ui.lang.publisher, value: game?.Publisher })}
                        ${properyLine({ label: ui.lang.released, value: game?.Released })}
                        ${properyLine({ label: ui.lang.cheevosCount, value: `${game?.NumAwardedToUserHardcore} / ${game?.NumAwardedToUser} / ${game?.NumAchievements}` })}
                        ${properyLine({ label: ui.lang.retropoints, value: `${game?.unlockData.hardcore.retropoints} / ${game?.totalRetropoints}` })}
                        ${properyLine({ label: ui.lang.points, value: `${game?.unlockData.hardcore.points} / ${game?.unlockData.softcore.points} / ${game?.totalPoints}` })}
                        ${properyLine({ label: ui.lang.retroRatio, value: game?.retroRatio })}
                        ${properyLine({ label: ui.lang.players, value: `${game?.masteredCount} / ${game?.beatenCount} / ${game?.players_total}` })}
                        ${properyLine({ label: ui.lang.completion, value: `${game?.masteryRate}% / ${game?.beatenRate}%` })}
                    </div>
                    <div class="game-info__cheevos-container"></div>
                </div>
            </section>
        `;
        ui.app.appendChild(gamePopupElement);
    }
    toggleFullscreen() {
        this.section.classList.toggle("fullscreen")
    }
    sideMenuElement(menu, title) {
        if (!menu) {
            title = `${ui.lang.filters}`;
            menu = [
                {
                    title: `${ui.lang.platform}`,
                    type: "submenu",
                    submenu: [
                        {
                            elements: this.platformFilterItems,
                        },

                    ]
                },
                {
                    title: `${ui.lang.genre}`,
                    type: "submenu",
                    submenu: [
                        {
                            elements: this.genresFilterItems,
                        },
                    ]
                },
                {
                    title: `${ui.lang.releaseYear}:`,
                    elements: [
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-released-from",
                            label: `${ui.lang.from}`,
                            onChange: (event) => this.YEARS_FILTER = {
                                ...ui.games.YEARS_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-released-to",
                            label: `${ui.lang.to}`,
                            onChange: (event) => this.YEARS_FILTER = {
                                ...ui.games.YEARS_FILTER,
                                to: Number(event.currentTarget.value) || Infinity
                            },
                        },
                    ]
                },
                {
                    title: `${ui.lang.cheevosCount}:`,
                    elements: [
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-cheevos-from",
                            label: `${ui.lang.from}`,
                            onChange: (event) => this.CHEEVOS_COUNT_FILTER = {
                                ...this.CHEEVOS_COUNT_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                            // event: `onclick="watcher.updateGameData(${gameID})"`,
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-cheevos-to",
                            label: `${ui.lang.to}`,
                            onChange: (event) => this.CHEEVOS_COUNT_FILTER = {
                                ...this.CHEEVOS_COUNT_FILTER,
                                to: Number(event.currentTarget.value) || Infinity
                            },
                        },
                    ]
                },
                {
                    title: `${ui.lang.pointsPerCheevo}:`,
                    elements: [
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-ppc-from",
                            label: `${ui.lang.from}`,
                            onChange: (event) => this.POINTS_PER_CHEEVO_FILTER = {
                                ...this.POINTS_PER_CHEEVO_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-ppc-to",
                            label: `${ui.lang.to}`,
                            onChange: (event) => this.POINTS_PER_CHEEVO_FILTER = {
                                ...this.POINTS_PER_CHEEVO_FILTER,
                                to: Number(event.currentTarget.value) || Infinity
                            },
                        },
                    ]
                },
                {
                    title: `${ui.lang.hltb}:`,
                    elements: [
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-hltb-from",
                            label: `${ui.lang.from}`,
                            onChange: (event) => this.HLTB_FILTER = {
                                ...this.HLTB_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            id: "side-list-released-to",
                            label: `${ui.lang.to}`,
                            onChange: (event) => this.HLTB_FILTER = {
                                ...this.HLTB_FILTER,
                                to: Number(event.currentTarget.value) || Infinity,
                            }
                        },
                    ]
                },
                {
                    title: `${ui.lang.highestAward}:`,
                    elements: this.awardsFilterItems
                },
                {
                    title: `${ui.lang.releaseVersion}:`,
                    elements: this.releaseVersionFilterItems
                },
                {
                    title: `${ui.lang.other}:`,
                    elements: [
                        {
                            type: inputTypes.CHECKBOX,
                            label: "WTPlay",
                            checked: this.FAVOURITES_FILTER,
                            onChange: (event) => this.FAVOURITES_FILTER = event.currentTarget.checked,
                            id: `filter-by-wtp`,
                        },
                        {
                            type: inputTypes.CHECKBOX,
                            label: "Coop",
                            checked: this.COOP_FILTER,
                            onChange: (event) => this.COOP_FILTER = event.currentTarget.checked,
                            id: `filter-by-coop`,
                        }
                    ]
                },
            ]
        }
        else {
            title = `<-- ${title}`;
        }
        const generateMenuItem = ({ title, elements, type, submenu }) => {
            const menuHeader = (title) => `<h3 class="side-menu__item-header">
                        ${title}
                    </h3>`;
            const menuItem = () => {
                const menuElement = fromHtml(`
                        <div class="side-menu__item-container">
                            ${title ? menuHeader(title) : "<br>"}
                        </div>
                    `);
                const menuContent = fromHtml(`
                        <div class="side-menu__item-inputs"></div>
                    `);
                menuContent.append(...elements.map(el => inputElement(el)));
                menuElement.append(menuContent);
                return menuElement;
                // ${elements.map(element => typeof element === 'object' ? input(element) : element).join("\n")}

            };
            const submenuItem = (submenu, title) => {
                const container = fromHtml(`
                    <div class="side-menu__item-container side-menu__subitem" >
                        ${title ? menuHeader(title) : "<br>"}
                    </div>
                    `)
                    ;
                const submenuContent = fromHtml(`
                        <div class="side-menu__subitem-content side-menu__submenu"></div>
                    `);
                const content = this.sideMenuElement(submenu, title);
                submenuContent.append(content);
                container.append(submenuContent);
                return container;
            }
            switch (type) {
                case "submenu":
                    return submenuItem(submenu, title);
                default:
                    return menuItem();
            }

        };
        const sideMenu = fromHtml(`
            <div class="section__side-menu">
                <h2 class="side-menu__header">${title}</h2>
            </div>
        `);
        const sideMenuContainer = fromHtml(`
            <div class="side-menu__content scrollable"></div>`);
        menu.forEach(item => {
            const menu = generateMenuItem(item)
            sideMenuContainer.append(menu);
            // console.log(item, menu)
        })
        // ${menu.map(item => generateMenuItem(item)).join("")}
        sideMenu.append(sideMenuContainer);
        return sideMenu;
    }
}
function lazyLoad({ list, items, callback }) {
    const trigger = document.createElement("div");
    trigger.classList.add("lazy-load_trigger")
    list.appendChild(trigger);

    // Ініціалізація списку з початковими елементами
    let itemIndex = 0;
    const initialLoadCount = 20;
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



const googleQuerySite = 'site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en';
