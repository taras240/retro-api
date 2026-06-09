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
import { lazyLoad } from "../functions/lazyLoad.js";
import { downloadJSON } from "../functions/exportData.js";

export class Games extends Widget {
    widgetIcon = {
        description: ui.lang.gamesLibrary,
        iconClass: "games-icon",
    };
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
    gameContextMenuItems(gameID) {
        return [
            {
                type: inputTypes.BUTTON,
                id: "update-game",
                label: ui.lang.showInTracker,
                onClick: () => {
                    watcher.stop();
                    watcher.updateGameData(gameID);
                },
            },
            {
                label: ui.lang.addToPlaylist,
                elements: [
                    ...Object.entries(this.uiProps.userPlaylists).map(([playlistName, playlistData]) => {
                        return {
                            type: inputTypes.CHECKBOX,
                            name: "games-add-to-pl",
                            id: `games-add-to-pl-${playlistName}`,
                            label: playlistName,
                            checked: playlistData.games.includes(+gameID),
                            onChange: (e) => {
                                if (e.currentTarget.checked) {
                                    this.addGameToPlaylist(gameID, playlistName)
                                }
                                else {
                                    this.removeGameFromPlaylist(gameID, playlistName)
                                }
                            }
                        }
                    })
                ]
            }
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
            title: ui.lang.searchGameInputHint,
            onInput: (event) => {
                const searchbarValue = event.target.value;
                this.titleFilter = searchbarValue;
                event.target.classList.toggle("empty", searchbarValue == "");
                this.updateGamesList();
            },
        },
        ]
    }
    titleFilter = '';
    get platformFilterItems() {
        const filters = Object.keys(platformsByManufacturer).reduce((items, brend) => {
            const groupItem = {
                label: brend,
                type: inputTypes.GROUP,
            }
            const platformItems = Object.keys(platformsByManufacturer[brend]).reduce((items, platformName) => {
                const platformCode = platformsByManufacturer[brend][platformName];
                const filterItem = {
                    id: `games-filter-platform-${platformCode}`,
                    label: platformName,
                    type: inputTypes.CHECKBOX,
                    checked: this.platformFilter.includes(platformCode),
                    onChange: (event) => {
                        const isChecked = event.currentTarget.checked;
                        let platforms = this.platformFilter;
                        if (isChecked) {
                            platforms.push(platformCode.toString());
                        } else {
                            platforms = platforms.filter(code => code != platformCode);
                        }
                        this.platformFilter = platforms;
                    }
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
            id: `games-filter-award-${awardType}`,
            type: inputTypes.CHECKBOX,
            label: this.awardTypes[awardType],
            checked: this.awardFilter.includes(awardType),
            onChange: (event) => {
                const isChecked = event.currentTarget.checked;
                let awards = this.awardFilter;
                if (isChecked) {
                    awards.push(awardType)
                }
                else {
                    awards = awards.filter(code => code != awardType)
                }
                this.awardFilter = awards;
            },
        })
        )
    }
    get releaseVersionFilterItems() {
        return Object.values(RELEASE_TYPES).map(releaseType => ({
            id: `games-filter-release-${releaseType}`,
            type: inputTypes.CHECKBOX,
            label: releaseType,
            checked: this.releaseFilter.includes(releaseType),
            onChange: (event) => {
                const isChecked = event.currentTarget.checked;
                let release = this.releaseFilter;
                if (isChecked) {
                    release.push(releaseType);
                } else {
                    release = release.filter(code => code != releaseType);
                }
                this.releaseFilter = release;
            }
        }))
    }
    get genresFilterItems() {
        return Object.keys(GAME_GENRE_CODES).map((genreID) => ({
            id: `games-filter-genre-${genreID}`,
            type: inputTypes.CHECKBOX,
            label: GAME_GENRE_CODES[genreID],
            checked: this.genreFilter.includes(genreID),
            onChange: (event) => {
                const isChecked = event.currentTarget.checked;
                let genres = this.genreFilter;
                if (isChecked) {
                    genres.push(genreID);
                } else {
                    genres = genres.filter(code => code != genreID);
                }
                this.genreFilter = genres;
            }
        }))
    }
    set releaseDateFilter(value) {
        this.__releaseDateFilter = value;
        this.updateGamesList();
    }
    get releaseDateFilter() {
        return this.__releaseDateFilter ?? { from: 0, to: Infinity };
    }

    set playersCountFilter(value) {
        this.__playersCountFilter = value;
        this.updateGamesList();
    }
    get playersCountFilter() {
        return this.__playersCountFilter ?? { from: 0, to: Infinity };
    }
    set beatenRateFilter(value) {
        this.__beatenRateFilter = value;
        this.updateGamesList();
    }
    get beatenRateFilter() {
        return this.__beatenRateFilter ?? { from: 0, to: Infinity };
    }
    set masteryRateFilter(value) {
        this.__masteryRateFilter = value;
        this.updateGamesList();
    }
    get masteryRateFilter() {
        return this.__masteryRateFilter ?? { from: 0, to: Infinity };
    }
    set trueRatioFilter(value) {
        this.__trueRatioFilter = value;
        this.updateGamesList();
    }
    get trueRatioFilter() {
        return this.__trueRatioFilter ?? { from: 0, to: Infinity };
    }
    set cheevosFilter(value) {
        this.__cheevosFilter = value;
        this.updateGamesList();
    }
    get cheevosFilter() {
        return this.__cheevosFilter ?? { from: 0, to: Infinity };
    }
    set ppcFilter(value) {
        this.__ppcFilter = value;
        this.updateGamesList();
    }
    get ppcFilter() {
        return this.__ppcFilter ?? { from: 0, to: Infinity };
    }
    set hltbFilter(value) {
        this.__hltbFilter = value;
        this.updateGamesList();
    }
    get hltbFilter() {
        return this.__hltbFilter ?? { from: 0, to: Infinity };
    }
    set hltmFilter(value) {
        this.__hltmFilter = value;
        this.updateGamesList();
    }
    get hltmFilter() {
        return this.__hltmFilter ?? { from: 0, to: Infinity };
    }
    set platformFilter(value) {
        let platformCodes = value.filter(code => Object.keys(RA_PLATFORM_CODES).includes(code));
        this.__platformsFilter = platformCodes;
        this.updateGamesList();

    }
    get platformFilter() {
        return this.__platformsFilter ?? [];
    }
    set genreFilter(value) {

        let genreCodes = value.filter(code => Object.keys(GAME_GENRE_CODES).includes(code));
        this.__genreFilter = genreCodes;
        this.updateGamesList();

    }
    get genreFilter() {
        return this.__genreFilter ?? [];
    }
    set awardFilter(value) {
        this.__awardFilter = value;
        this.updateGamesList();

    }
    get awardFilter() {
        return this.__awardFilter ?? [];
    }

    set releaseFilter(value) {
        this.__releaseFilter = value;
        this.updateGamesList();
    }
    get releaseFilter() {
        return this.__releaseFilter ?? [];
    }


    get currentPlaylist() {
        return this.__currentPlaylist;
    }
    set currentPlaylist(playlistName) {
        if (this.playlists[playlistName]) {
            this.__currentPlaylist = playlistName;
        }
        else {
            this.__currentPlaylist = null;
        }
        this.updateGamesList();
        this.syncPlaylistUI();
    }
    get playlists() {
        return {
            ...this.defaultPlaylists,
            ...this.uiProps.userPlaylists,
        }
    }
    applyFilter() {
        if (!this.GAMES?.length) {
            this.games = [];
            return;
        }

        let result = this.GAMES;

        // Filter by Search request
        if (this.titleFilter) {
            const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const words = this.titleFilter.trim().split(/\s+/).filter(Boolean);
            const searchRequest = words
                .map(word => `(?=.*${escapeRegExp(word)})`)
                .join('');
            let titleRegex = null;
            try {
                titleRegex = new RegExp(searchRequest, 'gi');
            } catch (e) {
                titleRegex = null;
            }
            if (titleRegex) {
                result = result.filter(game =>
                    `${game.Title} ${game.badges?.join(' ')} ${RA_PLATFORM_CODES[game.ConsoleID]?.Name ?? '-'}`.match(titleRegex)
                );
            } else {
                const lowerWords = words.map(w => w.toLowerCase());
                result = result.filter(game => {
                    const hay = `${game.Title} ${game.badges?.join(' ')} ${RA_PLATFORM_CODES[game.ConsoleID]?.Name ?? '-'}`.toLowerCase();
                    return lowerWords.every(w => hay.includes(w));
                });
            }
        }

        // Playlist Filter
        if (this.currentPlaylist && this.playlists[this.currentPlaylist]?.games) {
            const playlistGames = this.playlists[this.currentPlaylist].games;
            result = result.filter(game => playlistGames.includes(game.ID));
        }

        // Filter by Platform
        if (this.platformFilter.length > 0) {
            result = result.filter(game =>
                this.platformFilter.some(code => code == game.ConsoleID)
            );
        }

        // Filter by Genre
        if (this.genreFilter.length > 0) {
            result = result.filter(game =>
                this.genreFilter.some(code => game.genres?.includes(+code))
            );
        }


        // Filter by Awards
        if (this.awardFilter.length > 0) {
            result = result.filter(game =>
                this.awardFilter.some(award => award == game.Award)
            );
        }

        // Filter by RELEASE type
        if (this.releaseFilter.length > 0) {
            result = result.filter(game =>
                this.releaseFilter.some(version =>
                    version === RELEASE_TYPES.RETAIL
                        ? game.badges?.length === 0
                        : game.badges?.includes(version)
                )
            );
        }

        Object.entries(this.rangeFilters).forEach(([filterName, { getValue }]) => {
            result = result.filter(game => {
                const value = getValue(game);
                return value >= this[filterName].from
                    && value <= this[filterName].to;
            })
        });

        this.games = result;
    }

    applySort() {
        this.games = this.games.sort((a, b) => sortGamesBy[this.uiProps.sortName]?.(a, b, this.uiProps.reverseSort));
    }
    rangeFilters = {
        releaseDateFilter: {
            title: "releaseYear",
            getValue: (game) => new Date(game.relisedAt).getFullYear(),
        },
        playersCountFilter: {
            title: "players",
            getValue: (game) => game.playersTotal,
        },
        hltbFilter: {
            title: "timeToBeat",
            getValue: (game) => (game.timeToBeat ?? Infinity) / 60,
        },
        hltmFilter: {
            title: "timeToMaster",
            getValue: (game) => (game.timeToMaster ?? Infinity) / 60,
        },
        beatenRateFilter: {
            title: "beatenRate",
            getValue: (game) => game.beatenRate,
        },
        masteryRateFilter: {
            title: "masteryRate",
            getValue: (game) => game.masteryRate,
        },
        trueRatioFilter: {
            title: "trueRatio",
            getValue: (game) => game.trueRatio,
        },
        cheevosFilter: {
            title: "cheevosCount",
            getValue: (game) => parseInt(game.NumAchievements) ?? 0,
        },
        ppcFilter: {
            title: "pointsPerCheevo",
            getValue: (game) => game.Points / game.NumAchievements,
        },
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
    platformCodes = {}


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
        this.searchbar = this.section.querySelector("#games__searchbar");
    }
    generateWidget() {
        const controlsElement = document.createElement("div");
        controlsElement.classList.add("games__main-controls");
        const gameList = fromHtml(`
            <ul id="games-list" class="games-list scrollable" data-current-games-array-position="0"/>
        `);
        const activeFiltersRow = fromHtml(`
            <div class="games__active-filters-row hidden"></div>
        `);
        const gameListWrapper = document.createElement("div");
        gameListWrapper.classList.add("games__listing-wrapper");
        gameListWrapper.append(activeFiltersRow, gameList);
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
        contentContainer.append(playlistsContainer, gameListWrapper, this.sideMenuElement());
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
        this.activeFiltersRow = this.section.querySelector(".games__active-filters-row");
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
    addEvents() {
        super.addEvents();


        const playlistsContainer = this.container.querySelector("#games_playlists");

        this.gamesList.addEventListener('dragstart', e => {
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
            event.stopPropagation();
            event.preventDefault()
            const gameItem = event.target.closest(".games__game-item");
            if (gameItem) {
                event.preventDefault();
                event.stopPropagation();
                const gameID = gameItem.dataset.id;
                ui.showContextmenu({
                    event: event,
                    menuItems: this.gameContextMenuItems(gameID),
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
        this.wantToPlayList = Array.from(new Set([...gamesList]));

    }
    updateGamesList() {
        this.applyFilter();
        this.applySort();
        this.renderActiveFilters();
        this.syncFilterPanelState();
        this.gamesList.innerHTML = "";
        lazyLoad({ list: this.gamesList, items: this.games, elementGenerator: GameListElement })
    }

    getActiveFilters() {
        const filters = [];

        if (this.titleFilter?.trim()) {
            filters.push({
                type: 'search',
                label: `${ui.lang.search}: ${this.titleFilter}`,
                remove: () => {
                    this.titleFilter = '';
                    if (this.searchbar) {
                        this.searchbar.value = '';
                        this.searchbar.classList.add('empty');
                    }
                    this.updateGamesList();
                },
            });
        }

        if (this.currentPlaylist) {
            filters.push({
                type: 'playlist',
                label: `${ui.lang.playlist}: ${this.playlists[this.currentPlaylist]?.title ?? this.currentPlaylist}`,
                remove: () => {
                    this.currentPlaylist = null;
                },
            });
        }

        this.platformFilter.forEach(code => {
            filters.push({
                type: 'platform',
                value: code,
                label: RA_PLATFORM_CODES[code]?.Name ?? code,
                remove: () => {
                    this.platformFilter = this.platformFilter.filter(item => item != code);
                },
            });
        });

        this.genreFilter.forEach(code => {
            filters.push({
                type: 'genre',
                value: code,
                label: GAME_GENRE_CODES[code] ?? code,
                remove: () => {
                    this.genreFilter = this.genreFilter.filter(item => item != code);
                },
            });
        });

        this.awardFilter.forEach(code => {
            filters.push({
                type: 'award',
                value: code,
                label: this.awardTypes[code] ?? code,
                remove: () => {
                    this.awardFilter = this.awardFilter.filter(item => item != code);
                },
            });
        });

        this.releaseFilter.forEach(code => {
            filters.push({
                type: 'release',
                value: code,
                label: code,
                remove: () => {
                    this.releaseFilter = this.releaseFilter.filter(item => item != code);
                },
            });
        });

        Object.entries(this.rangeFilters).forEach(([filterName, { title }]) => {
            const filterValue = this[filterName];
            if (!filterValue) return;
            const from = filterValue.from ?? 0;
            const to = filterValue.to ?? Infinity;
            if (from > 0 || to < Infinity) {
                let label = `${ui.lang[title] ?? title}: `;
                if (from > 0 && to < Infinity) {
                    label += `${from}-${to}`;
                } else if (from > 0) {
                    label += `${ui.lang.from ?? 'from'} ${from}`;
                } else {
                    label += `${ui.lang.to ?? 'to'} ${to}`;
                }
                filters.push({
                    type: 'range',
                    value: filterName,
                    label,
                    remove: () => {
                        this[filterName] = { from: 0, to: Infinity };
                    },
                });
            }
        });

        return filters;
    }

    renderActiveFilters() {
        if (!this.activeFiltersRow) return;

        const filters = this.getActiveFilters();
        this.activeFiltersRow.innerHTML = '';
        if (!filters.length) {
            this.activeFiltersRow.classList.add('hidden');
            return;
        }

        this.activeFiltersRow.classList.remove('hidden');
        filters.forEach(filter => {
            const filterButton = fromHtml(`
                <button type="button" class="games__active-filter badge badge-button badge_transparent">
                    <span>${filter.label}</span>
                    <span aria-hidden="true">×</span>
                </button>
            `);
            filterButton.addEventListener('click', filter.remove);
            this.activeFiltersRow.append(filterButton);
        });
    }

    syncPlaylistUI() {
        if (!this.container) return;
        const playlists = this.container.querySelectorAll("#games_playlists .games__playlist-item");
        playlists.forEach(p => p.classList.toggle("active", p.dataset.playlistName === this.currentPlaylist));
        if (this.gamesList) {
            this.gamesList.classList.toggle("editable", !!this.currentPlaylist && this.playlists[this.currentPlaylist]?.editable);
        }
    }

    syncFilterPanelState() {
        if (!this.section) return;

        const setInputChecked = (id, checked) => {
            const input = this.section.querySelector(`#${CSS.escape(id)}`);
            if (input) {
                input.checked = checked;
            }
        };

        if (this.searchbar) {
            this.searchbar.value = this.titleFilter ?? '';
            this.searchbar.classList.toggle('empty', !this.titleFilter?.trim());
        }

        Object.values(platformsByManufacturer).flatMap(brand => Object.values(brand)).forEach(platformCode => {
            setInputChecked(`games-filter-platform-${platformCode}`, this.platformFilter.includes(platformCode));
        });

        Object.keys(GAME_GENRE_CODES).forEach(genreID => {
            setInputChecked(`games-filter-genre-${genreID}`, this.genreFilter.includes(genreID));
        });

        Object.keys(this.awardTypes).forEach(awardType => {
            setInputChecked(`games-filter-award-${awardType}`, this.awardFilter.includes(awardType));
        });

        Object.values(RELEASE_TYPES).forEach(releaseType => {
            setInputChecked(`games-filter-release-${releaseType}`, this.releaseFilter.includes(releaseType));
        });

        Object.keys(this.rangeFilters).forEach(filterName => {
            const value = this[filterName];
            const fromInput = this.section.querySelector(`#games-filter-${filterName}-from`);
            const toInput = this.section.querySelector(`#games-filter-${filterName}-to`);
            if (fromInput) fromInput.value = value?.from ?? 0;
            if (toInput) toInput.value = value?.to === Infinity ? '' : value?.to ?? '';
        });

        this.syncPlaylistUI();
    }
    async loadGames() {
        await this.loadWantToPlay();
        await this.getAllGames();
        await this.updateGamesList();
        this.updatePlaylists();
    }
    async getAllGames() {

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
    updatePlaylists() {
        this.playlists.WantToPlay.games = this.wantToPlayList;
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
    showPlaylists() {
        this.section.querySelector("#games_playlists")
            ?.replaceChildren(...PlaylistsContainer({
                playlists: this.playlists,
                onClick: t => this.openPlaylist(t),
                onEdit: p => this.editPlaylist(p),
            }).childNodes);
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
    async editPlaylist(props) {
        const { title, newTitle, isRemoved, isExport } = props;
        if (!this.GAMES) await this.loadGames();
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
        else if (isExport) {
            const gameIDArray = this.playlists[title].games;
            const playlistGames = this.GAMES
                ?.filter(game => gameIDArray.includes(game.ID))
                .map(({ Title, ID, ConsoleID, Award }) =>
                    ({ Title, ID, ConsoleName: RA_PLATFORM_CODES[ConsoleID].Name, Award }));

            downloadJSON(playlistGames, `${title}_rcplaylist`);
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
            if (playlistName === this.currentPlaylist) {
                gameItem ??= this.gamesList.querySelector(`li.games__game-item[data-id="${gameID}"]`);
                gameItem?.remove();
            }
        }
    }
    async openPlaylist(playlistName) {
        if (!this.GAMES) {
            await this.loadGames();
        }
        if (!this.playlists[playlistName]) playlistName = null;
        this.currentPlaylist = playlistName;
        this.syncPlaylistUI();

    }
    showFilters(isVisible = true) {
        this.section.querySelector(".section__side-menu")?.classList.toggle("active", isVisible);
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
                ...Object.entries(this.rangeFilters).map(([filterName, { title }]) => ({
                    title: `${ui.lang[title] ?? title}:`,
                    elements: [
                        {
                            id: `games-filter-${filterName}-from`,
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.from,
                            onChange: (event) => this[filterName] = {
                                ...this[filterName],
                                from: Number(event.currentTarget.value) || 0
                            },
                        },
                        {
                            id: `games-filter-${filterName}-to`,
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.to,
                            onChange: (event) => this[filterName] = {
                                ...this[filterName],
                                to: Number(event.currentTarget.value) || Infinity
                            },
                        },
                    ]
                })),
                {
                    title: `${ui.lang.highestAward}:`,
                    elements: this.awardsFilterItems
                },
                {
                    title: `${ui.lang.releaseVersion}:`,
                    elements: this.releaseVersionFilterItems
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
                        <div class="side-menu__item-inputs ${submenuClass}"/>
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
const googleQuerySite = 'site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en';
