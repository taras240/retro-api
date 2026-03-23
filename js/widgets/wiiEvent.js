import { badgeElements } from "../components/badges.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { gamesFromJson } from "../functions/gamesJson.js";
import { fromHtml } from "../functions/html.js";
import { gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { apiWorker, ui } from "../script.js";
import { UI } from "../ui.js";
import { Widget } from "./widget.js";


export class WiiEvent extends Widget {
    widgetIcon = {
        description: "Wii widget",
        iconID: "side-panel__wii",
        onChangeEvent: `ui.wiiEvent.VISIBLE = this.checked`,
        // onChangeEvent: (event)=> this.VISIBLE = event.currentTarget.checked,
        iconClass: "wii-icon",
    };
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        UI.applyPosition({ widget: this });
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

                return gameElement;
            }
            const container = fromHtml(`<ul class="flex-main-list"></ul>`);
            eventGamesArray
                .sort((g1, g2) => g1.Title.localeCompare(g2.Title))
                .sort((g1, g2) => g2.bonusMult - g1.bonusMult)
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
        const eventGames = {
            38: 3,
            144: 3,
            208: 3,
            34694: 3,
            195: 3,
            204: 3,
            34618: 2,
            34632: 2,
            187: 2,
            34619: 2,
            58: 2
        }
        const completionProgress = (await apiWorker.completionProgress())?.Results ?? [];
        const eventGamesArray = completionProgress.map(game => {
            if (game.ConsoleID !== 19) return;
            const isSubset = /subset/gi.test(game.Title);
            game.bonusMult = eventGames[game.GameID] ?? 1;
            game.maxEventPoints = (isSubset ? 1 : 2) * game.bonusMult;
            game.eventPoints = game.HighestAwardKind === "mastered" ? game.maxEventPoints : game.bonusMult * (awardMultiplier[game.HighestAwardKind] ?? 0)
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