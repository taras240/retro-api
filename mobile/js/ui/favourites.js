import { lazyLoad } from "../functions/lazyLoad.js";

export class Favourites {

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