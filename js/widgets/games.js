import { UI } from "../ui.js";
import { icons, signedIcons } from "../components/icons.js"

import { config, ui, apiWorker, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { generateBadges, badgeElements } from "../components/badges.js";
import { sortGamesBy, gamesSortNames } from "../functions/sortFilter.js";
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
import { GameListElement } from "../components/gamesWidget/gameItem.js";
import { GameCardElement } from "../components/gamesWidget/gameCard.js";
import { PlaylistsContainer } from "../components/gamesWidget/playlists.js";

export class Games extends Widget {
    widgetIcon = {
        description: ui.lang.gamesLibrary,
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
                checked: this.FAVOURITES.includes(+gameID),
                onClick: (event) => this.addToFavourite(event, gameID),
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
                    ...Object.values(gamesSortNames).map(sortName => (
                        {
                            type: inputTypes.RADIO,
                            name: "games-sort-method",
                            id: `games-sort-method-${sortName}`,
                            label: ui.lang[sortName] ?? sortName,
                            checked: this.uiProps.sortName === sortName,
                            onChange: () => this.uiProps.sortName = sortName,
                        })
                    ),
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.reverse,
                        checked: this.uiProps.reverseSort === -1,
                        onChange: (event) => this.uiProps.reverseSort = event.currentTarget.checked,
                    }]
            }),
        },
        {
            type: inputTypes.CHECKBOX,
            label: ui.lang.filter,
            checked: false,
            onChange: (event) => this.showFilters(event.currentTarget.checked),
        },
        {
            type: inputTypes.SEARCH_INPUT,
            label: ui.lang.search,
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
        return [];
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
                checked: this.uiProps.sortName === gamesSortNames.date,
                id: `games__sort-by-date`,
                onChange: () => this.uiProps.sortName = gamesSortNames.date,
            },
            {
                type: inputTypes.RADIO,
                label: ui.lang.points,
                name: 'games__sort-by',
                checked: this.uiProps.sortName === gamesSortNames.points,
                id: `games__sort-by-points`,
                onChange: () => this.uiProps.sortName = gamesSortNames.points,
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
        this.updateGamesList();
    }
    get COOP_FILTER() {
        return this.coopOnly ?? false;
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
        this.updateGamesList();

    }
    get PLATFORMS_FILTER() {
        return this.platformsFilter ?? [];
    }
    set GENRE_FILTER(value) {

        let genreCodes = value.filter(code => Object.keys(GAME_GENRE_CODES).includes(code));
        this.genreFilter = genreCodes;
        this.updateGamesList();

    }
    get GENRE_FILTER() {
        return this.genreFilter ?? [];
    }
    set AWARD_FILTER(value) {
        this.awardFilter = value;
        this.updateGamesList();

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
        return this.typesFilter ?? ["original"];
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
        this.typesFilter = typesFilters;
        this.applyFilter();
    }


    get PLAYLIST_FILTER() {
        return this.currentPlaylist;
    }
    set PLAYLIST_FILTER(playlistName) {
        if (this.playlists[playlistName]) {
            this.currentPlaylist = playlistName;
        }
        else {
            this.currentPlaylist = null;
        }
        this.updateGamesList();
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

    titleFilter = '';
    applyFilter() {

        // if (!this.games?.length) return;
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
        // this.COOP_FILTER && (this.games = this.games?.filter(game => game.Coop == "true"));
        //*Playlist Filter
        if (this.PLAYLIST_FILTER && this.playlists[this.PLAYLIST_FILTER]?.games) {
            this.games = this.games
                .filter(game =>
                    this.playlists[this.PLAYLIST_FILTER]?.games?.includes(game.ID)
                )
        }

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
            const hltb = (game.timeToBeat || 0) / 60;
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
            const date = new Date(game.relisedAt);
            const gameYear = Number.parseInt(date.getFullYear());

            return gameYear <= this.YEARS_FILTER.to && gameYear >= this.YEARS_FILTER.from
        })
        return;
    }
    applySort() {
        // if (!this.games?.length) return;
        this.games = this.games.sort((a, b) => sortGamesBy[this.uiProps.sortName]?.(a, b, this.uiProps.reverseSort));
    }
    platformCodes = {

    }
    awardTypes = {
        mastered: 'mastered',
        'beaten-hardcore': 'beaten',
        completed: 'completed',
        'beaten-softcore': 'beaten softcore',
        started: 'started',
    }
    defaultPlaylists = {
        "All Games": {
            title: "All Games",
            locked: true,
            editable: false,
            games: null,
            displayOrder: 0
        },
        WantToPlay: {
            title: "WantToPlay",
            locked: true,
            editable: false,
            games: [],
            displayOrder: 1,
        },
        WithProgress: {
            title: "WithProgress",
            locked: true,
            editable: false,
            games: [],
            displayOrder: 2,
        },
        AlmostMastered: {
            title: "AlmostMastered",
            locked: true,
            editable: false,
            games: [],
            displayOrder: 3,
        },
        'Add New': {
            title: "Add New",
            locked: true,
            editable: false,
            games: [],
            displayOrder: Infinity,
            onClick: () => this.createPlaylist(),
        }
    }
    games = {}
    gamesInfo = {};


    uiDefaultValues = {
        sortName: gamesSortNames.gameRelease,
        reverseSort: false,
        userPlaylists: {},
    }
    uiValuePreprocessors = {
        reverseSort(value) {
            return value ? -1 : 1;
        },
    }
    uiSetCallbacks = {
        userPlaylists(value) {
            this.showPlaylists()
        },
        sortName() {
            this.updateGamesList();
        },
        reverseSort() {
            this.updateGamesList();
        }
    }
    showPlaylists() {

        this.section.querySelector("#games_playlists")
            ?.replaceChildren(...PlaylistsContainer({
                playlists: this.playlists,
                onClick: t => this.openPlaylist(t),
                onEdit: p => this.editPlaylist(p),
            }).childNodes);
    }
    get playlists() {
        return {
            ...this.defaultPlaylists,
            ...this.uiProps.userPlaylists,
        }
    }
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();

        this.setValues();
        this.addEvents();

        this.applyPosition();
        this.showPlaylists();
        this.section.querySelector(".games__main-controls").append(
            ...this.headerControls.map(control => inputElement(control))
        );

    }
    createPlaylist() {
        const genTitle = () => {
            let title = "New Playlist";
            let index = 1;
            while (Object.hasOwn(this.playlists, title)) {
                title = title.replace(/\[\d+\]/, "");
                title += `[${++index}]`;
            }
            return title;
        }
        const title = genTitle();
        const playlistObject = {
            title,
            displayOrder: Object.keys(this.playlists).length - 1,
            games: [],
            editable: true,
            locked: false,
        }
        this.playlists[title] = playlistObject;
        this.uiProps.userPlaylists = {
            ...this.uiProps.userPlaylists,
            [title]: playlistObject,
        }

    }
    editPlaylist(props) {
        const { title, newTitle, isRemoved } = props;
        if (newTitle) {
            if (!this.playlists[newTitle]) {
                const edited = {
                    ...this.uiProps.userPlaylists[title],
                    title: newTitle,
                };
                delete this.uiProps.userPlaylists[title];
                this.uiProps.userPlaylists[newTitle] = edited;
            };
        }
        else if (isRemoved) {
            delete this.uiProps.userPlaylists[title];
        }
        this.uiProps.userPlaylists = this.uiProps.userPlaylists;
    }
    addGameToPlaylist(gameID, playlistName) {
        gameID = Number(gameID);
        const playlist = this.uiProps.userPlaylists[playlistName];
        if (playlist && playlist.editable) {
            playlist.games.push(gameID);
            playlist.games = [...new Set(playlist.games)];
            this.saveConfig();
        }
    }
    removeGameFromPlaylist(gameID, playlistName, gameItem) {
        gameID = Number(gameID);
        const playlist = this.uiProps.userPlaylists[playlistName];
        if (playlist && playlist.editable) {
            playlist.games = playlist.games.filter(g => g !== gameID);
            this.saveConfig();
            gameItem?.remove();
        }
    }
    async openPlaylist(playlistName) {
        if (!Object.keys(this.GAMES ?? {}).length) {
            await this.loadGames();
        }
        if (!this.playlists[playlistName]) playlistName = null;
        this.PLAYLIST_FILTER = playlistName;
        this.gamesList.classList.toggle("editable", this.playlists[playlistName].editable);
        const playlists = this.container.querySelectorAll("#games_playlists .games__playlist-item");
        playlists.forEach(p => p.classList.toggle("active", p.dataset.playlistName === playlistName));
    }
    generateWidget() {
        const controlsElement = document.createElement("div");
        controlsElement.classList.add("games__main-controls");
        const gameList = fromHtml(`
            <ul id="games-list" class="games-list scrollable" data-current-games-array-position="0"/>
        `);
        const playlistsContainer = PlaylistsContainer({});
        const widgetID = "games_section";
        const headerElementsHtml = `
            ${buttonsHtml.reload()}
            ${buttonsHtml.fulscreen()}
        `;

        const widgetData = {
            classes: ["games_setion", "section"],
            id: widgetID,
            title: ui.lang.gamesLibrary,
            headerElementsHtml: headerElementsHtml,
            contentClasses: ["games_container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        const contentContainer = widget.querySelector(".games_container");
        contentContainer.append(playlistsContainer, gameList, this.sideMenuElement());
        widget.insertBefore(controlsElement, contentContainer);
        ui.app.appendChild(widget);
    }
    initializeElements() {
        this.section = document.querySelector("#games_section");
        this.sectionID = this.section.id;
        this.header = this.section.querySelector(".header-container");
        this.container = this.section.querySelector(".games_container");
        this.searchbar = this.section.querySelector("#games__searchbar");
        this.platformFiltersList = this.section.querySelector("#games_filter-platform-list");
        this.gamesList = this.section.querySelector("#games-list");
        const showGamesButton = fromHtml(`
            <button class="games__load-button"></button>
        `);
        showGamesButton.addEventListener("click", () => this.loadGames())
        this.gamesList.append(showGamesButton);
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

        const gamesList = this.container.querySelector("#games-list");
        const playlistsContainer = this.container.querySelector("#games_playlists");

        gamesList.addEventListener('dragstart', e => {
            const game = e.target.closest('.games__game-item');
            if (!game) return;
            e.dataTransfer.setData('gameID', game.dataset.id);
        });
        playlistsContainer.addEventListener('dragleave', e => {
            const playlist = e.target.closest('.games__playlist-item');
            if (!playlist) return;
            playlist.classList.remove('drag-over');
        });
        playlistsContainer.addEventListener('dragover', e => {
            const playlist = e.target.closest('.games__playlist-item');
            if (!playlist) return;
            e.preventDefault(); // дозволяє drop
            playlist.classList.add('drag-over');
        });
        playlistsContainer.addEventListener('drop', e => {
            const playlist = e.target.closest('.games__playlist-item');
            if (!playlist) return;
            playlist.classList.remove('drag-over');
            e.preventDefault();

            const gameID = e.dataTransfer.getData('gameID');
            const playlistName = playlist.dataset.playlistName;

            this.addGameToPlaylist(gameID, playlistName);
        });
        this.container.addEventListener("click", event => {
            const gameItem = event.target.closest(".games__game-item");
            if (gameItem) {
                if (event.target.closest("button.delete-icon")) {
                    this.removeGameFromPlaylist(gameItem.dataset.id, this.currentPlaylist, gameItem);
                }
                else if (event.target.closest("button.game-description_button")) {
                    const el = event.target.closest("button");
                    this.showGameInfoPopup(el.dataset.id);
                }

            }
        })
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
        this.section.querySelectorAll(".side-menu__item-container.submenu").forEach(subitem => {
            const itemHeader = subitem.querySelector(".side-menu__item-header");
            const mainHeader = subitem.querySelector(".side-menu__header");
            const content = subitem.querySelector('.side-menu__item-inputs.submenu');
            const submenu = subitem.querySelector('.side-menu__item-inputs.submenu');

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
        this.header.addEventListener("click", event => {
            const el = event.target;
            if (el.classList.contains("update-icon")) {
                this.loadGames();
            }
            else if (el.classList.contains("fullscreen-button")) {
                this.toggleFullscreen();
            }
        })
    }
    async loadWantToPlay() {
        const gamesList = await apiWorker.getWantToPlayGames({});
        this._favs = Array.from(new Set([...gamesList]));

    }
    updatePlaylists() {

        this.playlists.WantToPlay.games = this._favs;
        const getAlmostMastered = () => {
            return [...this.GAMES].filter(g =>
                g.NumAwardedHardcore &&
                g.NumAchievements - g.NumAwardedHardcore <= 3 &&
                g.NumAchievements !== g.NumAwardedHardcore)
                .map(g => g.ID);
        }
        const getRecentlyPlayed = () => {
            return [...this.GAMES].filter(g =>
                g.wasPlayed).map(g => g.ID);
        }
        const almostMastered = getAlmostMastered();
        const recenrlyPlayed = getRecentlyPlayed();

        this.playlists.WithProgress.games = recenrlyPlayed;
        this.playlists.AlmostMastered.games = almostMastered;
    }
    updateGamesList() {
        this.applyFilter();
        this.applySort();
        this.gamesList.innerHTML = "";
        lazyLoad({ list: this.gamesList, items: this.games, elementGenerator: GameListElement })
    }
    async loadGames() {
        await this.loadWantToPlay();
        await this.getAllGames();
        await this.updateGamesList();
        this.updatePlaylists();
        // this.loadGameInfo();
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
                    gameToModify.datePlayed = lastGame.MostRecentAwardedDate;
                    gameToModify.wasPlayed = true;
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
        document.querySelectorAll(".game-popup__section").forEach(popup =>
            popup.remove());
        const gameData = await apiWorker.getGameInfoAndProgress({ gameID });
        const gamePopupElement = GameCardElement(gameData);
        ui.app.appendChild(gamePopupElement);
    }
    toggleFullscreen() {
        this.section.classList.toggle("fullscreen")
    }
    sideMenuElement(menu, title) {
        if (!menu) {
            title = ui.lang.filters;
            menu = [
                {
                    title: ui.lang.platform,
                    type: "submenu",
                    submenu: [
                        {
                            elements: this.platformFilterItems,
                        },

                    ]
                },
                {
                    title: ui.lang.genre,
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
                            label: ui.lang.from,
                            onChange: (event) => this.YEARS_FILTER = {
                                ...this.YEARS_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.to,
                            onChange: (event) => this.YEARS_FILTER = {
                                ...this.YEARS_FILTER,
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
                            label: ui.lang.from,
                            onChange: (event) => this.CHEEVOS_COUNT_FILTER = {
                                ...this.CHEEVOS_COUNT_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.to,
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
                            label: ui.lang.from,
                            onChange: (event) => this.POINTS_PER_CHEEVO_FILTER = {
                                ...this.POINTS_PER_CHEEVO_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.to,
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
                            label: ui.lang.from,
                            onChange: (event) => this.HLTB_FILTER = {
                                ...this.HLTB_FILTER,
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.to,
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
                        },
                        {
                            type: inputTypes.CHECKBOX,
                            label: "Coop",
                            checked: this.COOP_FILTER,
                            onChange: (event) => this.COOP_FILTER = event.currentTarget.checked,
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
                const submenuClass = submenu ? "submenu" : "";
                const menuElement = fromHtml(`
                        <div class="side-menu__item-container ${submenuClass}">
                            ${title ? menuHeader(title) : "<br>"}
                        </div>
                    `);
                const menuContent = fromHtml(`
                        <div class="side-menu__item-inputs ${submenuClass}"></div>
                    `);
                if (submenu) {
                    menuContent.append(this.sideMenuElement(submenu, title));
                }
                else {
                    menuContent.append(
                        ...elements?.map(el => inputElement(el))
                    );
                }

                menuElement.append(menuContent);
                return menuElement;

            };
            return menuItem();
        };
        const sideMenu = fromHtml(`
            <div class="section__side-menu">
                <h2 class="side-menu__header">${title}</h2>
            </div>
        `);
        const sideMenuContainer = fromHtml(`
            <div class="side-menu__content scrollable"/>`);
        menu.forEach(item => {
            const menu = generateMenuItem(item)
            sideMenuContainer.append(menu);
        })
        sideMenu.append(sideMenuContainer);
        return sideMenu;
    }
}
function lazyLoad({ list, items, elementGenerator }) {
    const trigger = document.createElement("div");
    trigger.classList.add("lazy-load_trigger")
    list.appendChild(trigger);

    // Ініціалізація списку з початковими елементами
    let itemIndex = 0;
    const initialLoadCount = 20;
    const loadItems = (count) => {
        for (let i = 0; i < count && itemIndex < items.length; i++) {
            list.appendChild(elementGenerator(items[itemIndex++]));
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
