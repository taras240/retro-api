import { UI } from "../ui.js";
import { config, ui, apiWorker } from "../script.js";
import { Widget } from "./widget.js";
import { gameImageUrl } from "../functions/raLinks.js";
import { buttonsHtml } from "../components/htmlElements.js";

export class Awards extends Widget {
    widgetIcon = {
        description: "awards widget",
        iconID: "side-panel__awards",
        onChangeEvent: `ui.awards.VISIBLE = this.checked`,
        iconClass: "awards-icon",
    };
    awardTypes = {
        mastery: "mastery",
        completion: "completion",
        beatenSoftcore: "beatenSoftcore",
        beatenHardcore: "beatenHardcore",
    };
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        UI.applyPosition({ widget: this });
    }
    generateWidget() {
        const headerElementsHtml = `
            ${buttonsHtml.reload("ui.awards.updateAwards()")}
        `;

        const widgetData = {
            classes: ["awards_section", "section"],
            id: "awards_section",
            title: ui.lang.awardsSectionName,
            headerElementsHtml: headerElementsHtml,
            contentClasses: ["awards-content_container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
    }
    initializeElements() {
        this.section = document.querySelector(".awards_section");
        this.container = this.section.querySelector(".awards-content_container");
    }
    addEvents() {
        super.addEvents();
    }
    async updateAwards() {
        const response = await apiWorker.getUserAwards({});
        this.parseAwards(response);
    }
    parseAwards(userAwards) {
        if (!userAwards?.TotalAwardsCount) return;
        this.container.innerHTML = "";
        const { dataset } = this.container;

        dataset.total = userAwards.TotalAwardsCount;
        dataset.beatenSoftcore = userAwards.BeatenSoftcoreAwardsCount;
        dataset.beatenHard = userAwards.BeatenHardcoreAwardsCount;
        dataset.completion = userAwards.CompletionAwardsCount;
        dataset.mastery = userAwards.MasteryAwardsCount;

        // Створюємо копію масиву нагород користувача
        let gamesArray = [...userAwards.VisibleUserAwards];

        // Викликаємо метод fixGamesProperties для виправлення властивостей ігор
        gamesArray = this.fixGamesProperties(gamesArray);

        // Генеруємо відсортований масив груп нагород з відсортованих ігор
        const sortedGames = this.generateAwardsGroupsArray(gamesArray);

        // Генеруємо нагороди для консолей
        this.generateConsolesAwards(sortedGames);
    }

    fixGamesProperties(gamesArray) {
        return (
            gamesArray
                .map((game) => {
                    // Перетворюємо строку дати на об'єкт Date
                    game.awardedDate = new Date(game.AwardedAt);

                    // Встановлюємо правильний тип нагороди для гри на основі додаткових даних
                    game.awardeTypeFixed =
                        game.AwardType === "Game Beaten"
                            ? game.AwardDataExtra === 1
                                ? this.awardTypes.beatenHardcore
                                : this.awardTypes.beatenSoftcore
                            : game.AwardDataExtra === 1
                                ? this.awardTypes.mastery
                                : this.awardTypes.completion;
                    return game;
                })
                // Сортуємо ігри за датою нагородження в спадаючому порядку
                .sort((a, b) => {
                    return b.awardedDate - a.awardedDate;
                })
        );
    }
    //Групуємо нагороди по консолям
    generateAwardsGroupsArray(gamesArray) {
        return gamesArray.reduce(
            (sortedGames, game) => {
                if (!sortedGames.hasOwnProperty(game.ConsoleName)) {
                    sortedGames[game.ConsoleName] = [];
                }
                sortedGames[game.ConsoleName].push(game);
                sortedGames["Total"].push(game);
                return sortedGames;
            },
            { Total: [] }
        );
    }
    generateConsolesAwards(sortedGames) {
        Object.getOwnPropertyNames(sortedGames).forEach((consoleName) => {
            let consoleListItem = document.createElement("li");
            consoleListItem.classList.add("console-awards");
            consoleName !== "Total" ? consoleListItem.classList.add("collapsed") : "";
            consoleListItem.dataset.consoleName = consoleName;
            let total = sortedGames[consoleName].length;
            const awardsCount = ({ awardType, gamesArray }) =>
                gamesArray.filter((game) => game.awardeTypeFixed === awardType).length;
            let beatenSoftcore = awardsCount({
                awardType: this.awardTypes.beatenSoftcore,
                gamesArray: sortedGames[consoleName],
            });
            let beaten = awardsCount({
                awardType: this.awardTypes.beatenHardcore,
                gamesArray: sortedGames[consoleName],
            });
            let compleated = awardsCount({
                awardType: this.awardTypes.completion,
                gamesArray: sortedGames[consoleName],
            });
            let mastered = awardsCount({
                awardType: this.awardTypes.mastery,
                gamesArray: sortedGames[consoleName],
            });
            consoleListItem.innerHTML = `
          <h3 class="awards-console_header" onclick="ui.awards.expandAwards(this)">${consoleName}</h3>
          <ul class="console-awards-values">      
            <li class="awarded-games total" data-title="${ui.lang.totalAwardsHint}" onclick="ui.awards.filterAwards('all')">${total}</li>
            <li class="awarded-games beaten-softcore" data-title="${ui.lang.beatenSoftHint}" onclick="ui.awards.filterAwards('${this.awardTypes.beatenSoftcore
                }')">${beatenSoftcore}</li>
            <li class="awarded-games beaten"  data-title="${ui.lang.beatenHint}"  onclick="ui.awards.filterAwards('${this.awardTypes.beatenHardcore
                }')">${beaten}</li>
            <li class="awarded-games completed"  data-title="${ui.lang.completedHint}" onclick="ui.awards.filterAwards('${this.awardTypes.completion
                }')">${compleated}</li>
            <li class="awarded-games mastered"  data-title="${ui.lang.masteredHint}" onclick="ui.awards.filterAwards('${this.awardTypes.mastery
                }')">${mastered}</li>
          </ul>
          <button class="expand-awards_button" onclick="ui.awards.expandAwards(this)"> </button>
          <ul class="flex-main-list awarded-games_list ${consoleName == "Total" ? "" : "hidden"
                } total">
          </ul>
          `;
            this.container.appendChild(consoleListItem);
            let gamesList = consoleListItem.querySelector(".flex-main-list");
            sortedGames[consoleName].forEach((game) => {
                gamesList.appendChild(this.generateAwardElement(game));
            });
        });
    }

    generateAwardElement(game) {
        let gameElement = document.createElement("li");
        gameElement.classList.add("awarded-game", "awards__game-item", "main-column-item", "right-bg-icon", game.awardeTypeFixed);
        gameElement.dataset.title = `${ui.lang.awardTypeHint}: ${game.awardeTypeFixed}`;
        gameElement.innerHTML = `
            <img class="awards__game-preview" src="${gameImageUrl(game.ImageIcon)}" alt=" ">
            <h3 class="game-title">${game.Title}</h3>
            <p class="awards__game-description">${game.ConsoleName}</p>
            <p class="awards__game-description">${game.timeString}</p>
        `;
        return gameElement;
    }

    expandAwards(element) {
        const consoleElement = element.parentNode;
        const expandContent = consoleElement.querySelector(".awarded-games_list");
        if (expandContent.classList.contains("hidden")) {
            consoleElement.classList.remove("collapsed");
            expandContent.classList.remove("hidden");
        } else {
            consoleElement.classList.add("collapsed");
            expandContent.classList.add("hidden");
        }
    }
    filterAwards(awardType) {
        let awards = this.container.querySelectorAll(".awarded-game");
        awards.forEach((award) => {
            award.classList.remove("hidden");
            if (!award.classList.contains(awardType) && awardType !== "all") {
                award.classList.add("hidden");
            }
        });
    }
}