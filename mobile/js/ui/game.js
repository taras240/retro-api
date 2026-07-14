import { generateBadges } from "./components/badges.js"
import { cheevosFiterNames, cheevosSortNames, sortBy, filterBy } from "../../../js/functions/sortFilter.js"
import { apiWorker, config, ui } from "../main.js"
import { GAMES_DATA } from "../ui-mobile.js"
import { fromHtml } from "../../../js/functions/html.js"
import { formatDuration } from "../../../js/functions/time.js"
import { cheevoImageUrl, gameImageUrl } from "../../../js/functions/raLinks.js"
import { generateContextMenu } from "./components/contextMenu.js"

export
    class Game {
    filterContext = () => {
        return {
            label: "Filter by",
            elements: [
                ...Object.values(cheevosFiterNames)
                    .map(filterName => {
                        return {
                            label: filterName,
                            id: `filter_${filterName}`,
                            type: "radio",
                            onChange: `ui.game.filter = '${filterName}'`,
                            checked: this.filter === filterName,
                            name: `filter-by-${filterName}`
                        }
                    }),
                {
                    label: "disabled",
                    id: `filter_disabled`,
                    type: "radio",
                    onChange: `ui.game.filter = 'disabled'`,
                    checked: this.filter === "disabled",
                    name: `filter-by-disabled`
                },
                {
                    label: "Reverse filter",
                    id: "filter_reverse-filter",
                    type: "checkbox",
                    onChange: "ui.game.filterReverse = this.checked",
                    checked: this.filterReverse == true,
                    name: "filter-cheevos-reverse"
                },
            ]
        }
    }
    sortContext = () => {
        return {
            label: "Sort by",
            elements: [...Object.values(cheevosSortNames)
                .filter(sortName => ![cheevosSortNames.CUSTOM_ORDER, cheevosSortNames.TIME_TO_UNLOCK].includes(sortName))
                .map(sortName => {
                    return {
                        label: sortName,
                        id: `context-${sortName}`,
                        type: "radio",
                        onChange: `ui.game.sortType = '${sortName}'; `,
                        checked: this.sortType === sortName,
                        name: "sort-cheevos"
                    };
                }),
            {
                label: "Reverse sort",
                id: "sort_reverse-sort",
                type: "checkbox",
                onChange: "ui.game.sortTypeReverse = this.checked",
                checked: this.sortTypeReverse == -1,
                name: "sort-cheevos-reverse"
            },
            ],
        }
    }
    cheevosListContext = () => {
        return {
            label: "Show by",
            elements: [
                ...Object.getOwnPropertyNames(this.listTypes).reduce((elems, type) => {
                    const typeObj = {
                        label: `${this.listTypes[type]}`,
                        id: `game_list-type-${type}`,
                        type: "radio",
                        onChange: `ui.game.listType = '${type}'`,
                        checked: this.listType == type,
                        name: "game-list-type"
                    };
                    elems.push(typeObj);
                    return elems;
                }, [])
            ]
        }
    }
    get sortType() {
        return config.ui?.mobile?.game?.sortType ?? "title";
    }
    set sortType(value) {
        config.ui.mobile.game.sortType = value;
        config.writeConfiguration();

        this.updateCheevos();
    }
    get filter() {
        return config.ui?.mobile?.game?.filter ?? "disabled";
    }
    set filter(value) {
        config.ui.mobile.game.filter = value;
        config.writeConfiguration();

        this.updateCheevos();
    }
    get sortTypeReverse() {
        return config.ui?.mobile?.game?.sortTypeReverse ?? 1;
    }
    set sortTypeReverse(value) {
        config.ui.mobile.game.sortTypeReverse = value ? -1 : 1;
        config.writeConfiguration();

        this.updateCheevos();
    }
    get filterReverse() {
        return config.ui?.mobile?.game?.filterReverse ?? false;
    }
    set filterReverse(value) {
        config.ui.mobile.game.filterReverse = value;
        config.writeConfiguration();

        this.updateCheevos();
    }
    get listType() {
        return config.ui?.mobile?.game.listType ?? "grid";
    }
    set listType(value) {
        config.ui.mobile.game.listType = value;
        config.writeConfiguration();
        this.update();
    }
    listTypes = {
        list: 'list',
        grid: 'grid'
    }
    constructor(gameID) {
        !config.ui.mobile.game && (config.ui.mobile.game = {});
        this.gameID = gameID;
        this.update();
    }
    updateCheevos() {
        this.achievements = Object.values(GAMES_DATA[this.gameID]?.Achievements ?? {});
        if (this.filter === "disabled") this.achievements = this.achievements.filter(c => true);
        else {
            this.achievements = this.achievements
                .filter(a => this.filterReverse ?
                    !filterBy[this.filter](a) : filterBy[this.filter](a)
                );

        }
        this.achievements = this.achievements.sort((a, b) => this.sortTypeReverse * sortBy[this.sortType](a, b));
        this.updateGameSection();
    }
    getSectionElement() {
        const section = document.createElement("div");
        section.classList.add("game__section", "section");
        section.innerHTML = `
            ${this.SectionHeaderHtml()}
            <ul class="game-achivs__container ${this.listType}"></ul>
        `;
        return section;
    }
    AchievementHtml(achiv) {
        const trend = ~~(1000 * achiv.NumAwardedHardcore / this.gameData.NumDistinctPlayers) / 10;

        return `
            <li class="achiv__achiv-container ${achiv.isHardcoreEarned ? "hardcore" : ""}" onclick="ui.showAchivDetails(${achiv.ID}, ${this.gameID}); event.stopPropagation()">
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
    AchievementsListHtml() {
        return `
            <div class="section__control-container">
                <button class=" simple-button" onclick="generateContextMenu(ui.game.sortContext(),event)">Sort</button>
                <button class="games-platform-filter simple-button" 
                onclick="generateContextMenu(ui.game.filterContext(),event)">
                ${this.platformFilter ?? "Filter"}
                </button>
                <button class="games-items-type simple-button" 
                onclick="generateContextMenu(ui.game.cheevosListContext(),event)">
                ${this.listType ?? "List"}
                </button>
            </div>
            ${this.achievements.reduce((elementsHtml, achiv) => {
            elementsHtml += this.AchievementHtml(achiv);
            return elementsHtml;
        }, "")}
        `;
    }
    SectionHeaderHtml() {
        const earnedData = ui.isSoftmode ? {
            count: this.gameData.earnedStats.soft.count,
            points: this.gameData.earnedStats.soft.points,
            retropoints: this.gameData.earnedStats.hard.retropoints
        } :
            {
                count: this.gameData.earnedStats.hard.count,
                points: this.gameData.earnedStats.hard.points,
                retropoints: this.gameData.earnedStats.hard.retropoints
            };
        // let earnedData = Object.values(this.gameData.Achievements)
        //   .reduce((data, achiv) => {
        //     if (ui.isSoftmode) {
        //       achiv.isEarned && (
        //         data.achivs++,
        //         data.points += achiv.Points,
        //         data.retropoints += achiv.isHardcoreEarned ? achiv.TrueRatio : 0
        //       );
        //     }
        //     else {
        //       achiv.isHardcoreEarned && (
        //         data.achivs++,
        //         data.points += achiv.Points,
        //         data.retropoints += achiv.TrueRatio
        //       );
        //     }
        //     return data;
        //   }, { achivs: 0, points: 0, retropoints: 0 });
        // style = { '--progress': this.gameData.completionProgress + "%" }
        // earnedData.achivs == 0 && (earnedData = false);
        const completionProgress = ~~(100 * earnedData.count / this.gameData.NumAchievements);
        return `
      <div class="section__header-container game__header-container" onclick="ui.showGameDetails(${this.gameID});event.stopPropagation();">
            <!--<div class="game-header__background-container">
                <img class="game-header__background-img" src="https://media.retroachievements.org${this.gameData.ImageTitle}" alt="">
                <div class="game-header__background-gradient"></div>
                

            </div>-->
            <div class="game-header__main-info">
                <div class="game-header__icon-container">
                    <img class="game-header__icon" src="https://media.retroachievements.org${this.gameData.ImageIcon}" alt="">
                    <span class="game-header__retro-ratio  achiv-rarity__${this.gameData.gameDifficulty}">${this.gameData.retroRatio}
                    </span>
                    </div>
                <div class="game-header__description-container">
                    <h1 class="game-header__title">
                     ${this.gameData.FixedTitle} ${generateBadges(this.gameData.badges)}                       
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
                    <p class="user-info__points">${earnedData.count > 0 ? (earnedData.count + '/') : ""}${this.gameData.NumAchievements}</p>
                </div>
                <div class="vertical-line"></div>

                <div class="user-info__points-group">
                    <h3 class="game-points__points-name">points</h3>
                    <p class="user-info__points">${earnedData.count > 0 ? (earnedData.points + '/') : ""}${this.gameData.points_total}</p>
                </div>
                <div class="vertical-line"></div>
                <div class="user-info__points-group">
                    <h3 class="game-points__points-name">retropoints</h3>
                    <p class="user-info__points">${earnedData.count > 0 ? (earnedData.retropoints + '/') : ""}${this.gameData.TotalRetropoints}</p>
                </div>
            </div>

      </div>
    `;
    }
    update(gameID = this.gameID) {
        ui.showLoader();

        if (GAMES_DATA[gameID]) {
            this.gameData = GAMES_DATA[this.gameID];
            this.achievements = Object.values(GAMES_DATA[this.gameID].Achievements);
            const section = this.generateGameSection(this.gameData);
            ui.content.innerHTML = "";
            ui.content.append(section);
            this.updateCheevos(this.gameData);
            ui.removeLoader();
        }
        else {
            apiWorker.getGameProgress({ gameID: gameID }).then((resp) => {
                GAMES_DATA[gameID] = resp;
            }).then(() => this.update())
        }
    }

    updateGameSection(gameData) {
        gameData ??= this.gameData;
        const updateGameBar = (gameData) => {
            const { ImageIcon, Title, ConsoleName, Developer, UserTotalPlaytime, TotalPoints } = gameData;

            document.querySelector(".game-image").src = gameImageUrl(ImageIcon);
            document.querySelector(".game-title").innerHTML = Title;
            document.querySelector(".game-meta>.platform").innerHTML = ConsoleName;
            document.querySelector(".game-meta>.game-dev").innerHTML = Developer;
            document.querySelector(".playtime").innerHTML = "Time played: " + formatDuration(UserTotalPlaytime, false);
        }
        const updateProgressBar = (gameData) => {
            const { NumAchievements, NumAwardedToUserHardcore, points_total: TotalPoints } = gameData;
            const PointsUnlocked = gameData.earnedStats?.hard?.points ?? 0;
            const unlockRate = Math.floor(100 * NumAwardedToUserHardcore / NumAchievements);
            document.querySelector(".progress-card").style.setProperty("--unlock-rate", `${unlockRate}%`);
            document.querySelector(".progress-card .progress-count").innerHTML = `${NumAwardedToUserHardcore} / ${NumAchievements}`;
            document.querySelector(".progress-footer .points").innerHTML = `${PointsUnlocked} / ${TotalPoints} points`;
            document.querySelector(".progress-card .progress-footer>span").innerHTML = `${unlockRate}% completed`;


        }
        const updateAchievements = (gameData) => {
            function AchievementElement(cheevo, gameData) {
                const { Title, Description, Points, BadgeName, DateEarnedHardcore } = cheevo;
                const element = fromHtml(`
                    <div class="list-item achievement ${DateEarnedHardcore ? 'unlocked' : 'locked'}">
                        <div class="item-icon">
                            <img class="item-img" src="${cheevoImageUrl({ BadgeName })}"/>
                        </div>
                        <div class="item-meta">
                            <div class="item-name">${Title}</div>
                            <div class="item-desc">${Description}</div>
                        </div>
                        <div class="item-points">${Points}</div>
                    </div>
                `);
                element.addEventListener("click", (event) => {
                    event.stopPropagation();
                    ui.showAchivDetails(cheevo.ID, gameData.ID);
                    console.log(gameData);
                })
                return element;
            }
            const updateButtons = () => {
                document.querySelector("#sort-name").innerHTML = this.sortType;
                document.querySelector("#filter-name").innerHTML = this.filter;
            }
            const container = document.querySelector(".achievement-list");
            container.innerHTML = "";
            this.achievements.forEach(cheevo => {
                const achievementElement = AchievementElement(cheevo, gameData);
                container.append(achievementElement)
            })
            updateButtons();
        }

        updateGameBar(gameData);
        updateProgressBar(gameData);
        updateAchievements(gameData);
    }
    generateGameSection(gameData) {
        const currentGameElement = () => {
            const element = fromHtml(`
                <div class="current-game">
                    <div class="game-icon">
                        <img class="game-image" />
                    </div>
                    <div class="game-info">
                        <div class="game-title"></div>
                        <div class="game-meta">
                            <span class="platform"></span>
                            <span class="game-dev"></span>
                        </div>
                        <div class="playtime"></div>
                    </div>
                </div>
            `);
            element.addEventListener("click", (event) => {
                event.stopPropagation();
                ui.showGameDetails(gameData.ID);
            })
            return element;
        }
        const progressElement = () => fromHtml(`
            <div class="progress-card">
                <div class="progress-header">
                    <span class="progress-label">Completion progress</span>
                    <span class="progress-count"></span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill"></div>
                </div>
                <div class="progress-footer">
                    <span></span>
                    <span class="points"></span>
                </div>
            </div>
        `)
        const achievementSectionElement = () => {
            const element = fromHtml(`
                <div class="achievements-section">
                    <div class="section-title">Achievements</div>
                    <div class="toolbar">
                        <button id="sort-ach-button" class="btn btn-exp">Sort By: <span id="sort-name"></span></button>
                        <button id="filter-ach-button" class="btn btn-exp">Filter By: <span id="filter-name"></span></button>
                        <!--<select>
                            <option>Default</option>
                            <option>Unlock Rate</option>
                            <option>Points</option>
                            <option>Unlocked First</option>
                        </select>
                        <div class="filter-group">
                            <button class="btn active">All</button>
                            <button class="btn">Unlocked</button>
                            <button class="btn">Missable</button>
                            <button class="btn">Progression</button>
                        </div>-->
                    </div>
                    <div class="achievement-list"></div>
                </div>
            `);
            element.querySelector("#sort-ach-button").addEventListener("click", event => {
                generateContextMenu(this.sortContext(), event)
            });
            element.querySelector("#filter-ach-button").addEventListener("click", event => {
                generateContextMenu(this.filterContext(), event)
            })
            return element;
        }
        const section = fromHtml(`
            <div class="game-content content"></div>
        `);

        section.append(
            currentGameElement(),
            progressElement(),
            achievementSectionElement(),
        )
        return section;
    }

}