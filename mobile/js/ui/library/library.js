import { generateBadges } from "../components/badges.js";
import { sortBy } from "../../functions/sort.js";
import { config } from "../../main.js";
import { delay } from "../../functions/delay.js";
import { lazyLoad } from "../../functions/lazyLoad.js";
import { RAPlatforms } from "../../enums/RAPlatforms.js";
import { gamesFromJson } from "../../../../js/functions/gamesJson.js";
import { gameImageUrl, gameImageUrlByID } from "../../../../js/functions/raLinks.js";
import { LibraryHeader } from "./header.js";
import { GameElement } from "./gameItem.js";

export class Library {

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
                ...Object.keys(RAPlatforms).reduce((elems, platformCode) => {
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
        return config.ui?.mobile?.library?.sortType ?? "title";
    }
    set sortType(value) {
        config.ui.mobile.library.sortType = value;
        config.writeConfiguration();

        this.updateGames();
    }
    get sortTypeReverse() {
        return config.ui?.mobile?.library?.sortTypeReverse ?? 1;
    }
    set sortTypeReverse(value) {
        config.ui.mobile.library.sortTypeReverse = value ? -1 : 1;
        config.writeConfiguration();

        this.updateGames();
    }
    get platformFilter() {
        const code = config.ui?.mobile?.library?.platformFilter ?? "all";

        return code == "all" ? "all" : RAPlatforms[code]
    }
    get platformFilterCode() {
        const code = config.ui?.mobile?.library?.platformFilter ?? "all";
        return code;
    }
    set platformFilter(value) {
        config.ui.mobile.library.platformFilter = value;
        config.writeConfiguration();

        this.updateGames();
        document.querySelector(".games-platform-filter").innerText = `${this.platformFilter} (${this.games.length})`;

    }
    titleFilter = '';

    applyFilter() {
        this.games = this.platformFilterCode == "all" ? this.GAMES :
            this.GAMES.filter(game => game.ConsoleID == this.platformFilterCode);
        if (this.titleFilter) {
            let regex = new RegExp(this.titleFilter, "gi");
            this.games = this.games.filter(game => game?.Title.match(regex));
        }
    }
    applySort() {
        this.games = this.games.sort((a, b) => this.sortTypeReverse * sortBy[this.sortType](a, b));

    }
    constructor() {
        !config.ui.mobile.library && (config.ui.mobile.library = {});
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
        lazyLoad({ list: this.gameList, items: this.games, callback: GameElement })
    }
    updateGames() {
        this.applyFilter();
        this.applySort();
        this.gameList.innerHTML = '';
        lazyLoad({ list: this.gameList, items: this.games, callback: GameElement })

    }
    LibrarySection() {
        this.librarySection = document.createElement("section");
        this.librarySection.classList.add("library__section", "section");

        this.librarySection.appendChild(LibraryHeader(this));

        this.gameList = document.createElement("ul");
        this.gameList.classList.add("games-list");

        this.librarySection.appendChild(this.gameList);

        return this.librarySection;
    }

    async loadGamesArray() {
        this.GAMES = {};
        // this.clearList();
        await this.getAllGames();
    }
    async getAllGames() {
        try {

            this.GAMES = await gamesFromJson("../../../json/games/all_min.json");


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