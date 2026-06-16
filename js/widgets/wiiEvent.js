import { raapi } from "../api/index.js";
import { badgeElements } from "../components/badges.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { fromHtml } from "../functions/html.js";
import { gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { ui } from "../script.js";
import { UI } from "../ui.js";
import { Widget } from "./widget.js";


export class WiiEvent extends Widget {
    widgetIcon = {
        description: "Wii widget",
        iconClass: "wii-icon",
    };
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        this.applyPosition();
        // this.generateContent();
    }
    generateWidget() {
        const headerElementsHtml = buttonsHtml.reload();
        const widgetData = {
            classes: ["wii-event_section", "section"],
            id: "wii-event_section",
            title: `Wii Launch Event`,
            headerElementsHtml,
            contentClasses: ["wii-event-container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);

        const loadButton = fromHtml(`<button class="games__load-button"></button>`);
        loadButton.addEventListener("click", () => this.generateContent());
        widget.querySelector(".content-container")?.append(loadButton);
    }
    initializeElements() {
        this.section = document.querySelector("#wii-event_section");
        this.sectionID = this.section.id;
        this.container = this.section.querySelector(".content-container");
        this.resizer = this.section.querySelector(".resizer");
    }
    addEvents() {
        super.addEvents();
        this.section.addEventListener("click", e => {
            if (e.target.classList.contains("update-icon")) {
                this.generateContent();
            }
        })
    }
    async generateContent() {
        ui.toggleLoading(true, "Loading your progress");
        const PointsRulesElement = () => {
            const container = fromHtml(`
                <ul class="launch__rules-list">
                    <li>15 Points - 🥉 Bronze</li>
                    <li>25 Points - 🥈 Silver</li>
                    <li>35 Points - 🥇 Gold</li>
                    <li>50 Points - ⭐ Grandmaster</li>
                </ul>
            `);
            return container;
        }
        const StatusElement = (gainedPoints) => {
            const gainedAward = gainedPoints >= 50 ? "⭐ Grandmaster" :
                gainedPoints >= 35 ? "🥇 Gold" :
                    gainedPoints >= 25 ? "🥈 Silver" :
                        gainedPoints >= 15 ? "🥉 Bronze" : "";

            const message = gainedPoints > 0
                ? `You earned <span class="event__accent-text">${gainedPoints}</span> event point${gainedPoints !== 1 ? "s" : ""}`
                : "You haven't earned any event points yet";
            const awardMessage = gainedAward ? ` and unlocked <span class="event__accent-text">${gainedAward}</span> award` : "";
            return fromHtml(`
                    <div class="launch__summary-line">${message + awardMessage}</div>
                `);
        }
        const gamesListElement = async () => {
            const GameElement = (game) => {
                const { ImageIcon, ID, Title, NumAchievements, NumAwardedHardcore, maxEventPoints, eventPoints } = game;
                const percentage = 100 * NumAwardedHardcore / NumAchievements;
                const gameElement = fromHtml(`
                    <li class="event__game-item game-info__set-item main-column-item right-bg-icon award-type">
                        <img class="awards__game-preview" src="${gameImageUrl(ImageIcon)}">
                        <h3 class="game-title">
                            <a target="_blank" data-title="go to retroachievements.org" href="${gameUrl(ID)}">${Title}</a>
                        </h3>
                        <p class="awards__game-description">Achievements: ${NumAwardedHardcore
                    }/${NumAchievements}</p>
                        <p class="awards__game-description">${badgeElements.gold(`Max event Points: ${maxEventPoints}`)}</p>
                    </li>
                `);
                gameElement.dataset.points = eventPoints ? eventPoints : "";
                gameElement.style.setProperty("--percentage", percentage + "%")
                return gameElement;
            }
            const container = fromHtml(`<ul class="flex-main-list"></ul>`);
            eventGamesArray
                .sort((g1, g2) => new Date(g2.MostRecentAwardedDate) - new Date(g1.MostRecentAwardedDate))
                // .sort((g1, g2) => g1.Title.localeCompare(g2.Title))
                // .sort((g1, g2) => g2.bonusMult - g1.bonusMult)
                .forEach(game => {
                    const gameElement = GameElement(game);
                    container.append(gameElement);
                })
            return container;
        }
        const awardMultiplier = {
            "beaten-hardcore": 1,
            "mastered": 2,
        }
        const bountyGames = {
            double: [34632, 187, 34619, 58, 35669, 43, 115, 35082, 34689, 34706, 34606, 34597, 34696, 35257, 171, 34604, 34600, 35935, 11088, 34664, 248, 89, 7775, 189, 190, 34714, 34903],
            triple: [38, 144, 208, 34694, 195, 204, 100, 27, 34566, 34679, 34693, 35266, 34569, 34610, 34587, 34758, 34708, 34618, 34685, 34836, 186]
        }
        const completionProgress = (await raapi.getUserCompletionProgress())?.Results ?? [];
        const eventGamesArray = completionProgress.map(game => {

            if (game.ConsoleID !== 19) return;
            // const isSubset = /subset/gi.test(game.Title);
            game.bonusMult = bountyGames.triple.includes(game.GameID) ? 3 : bountyGames.double.includes(game.GameID) ? 2 : 1;
            game.maxEventPoints = 2 * game.bonusMult;
            game.eventPoints = game.bonusMult * (awardMultiplier[game.HighestAwardKind] ?? 0)
            return game;
        }).filter(g => g)

        const gainedPoints = eventGamesArray.reduce((acc, game) => {
            acc += game.eventPoints;
            return acc;
        }, 0);
        this.container.innerHTML = "";
        this.container.append(PointsRulesElement(), await gamesListElement(), StatusElement(gainedPoints));
        ui.toggleLoading(false, "");
    }
}