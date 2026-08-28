import { raapi } from "../api/index.js";
import { badgeElements } from "../components/badges.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { signedIcons } from "../components/icons.js";
import { fromHtml } from "../functions/html.js";
import { cheevoUrl, eventUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { formatDuration, formatTime } from "../functions/time.js";
import { Widget } from "./widget.js";


export class EventAchievements extends Widget {
    widgetIcon = {
        description: "Events widget",
        iconClass: "event-icon",
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
            id: "cheevo-events_section",
            title: `Achievement Events`,
            headerElementsHtml,
            contentClasses: ["wii-event-container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        this.section = widget;
        ui.app.appendChild(widget);

        const loadButton = fromHtml(`<button class="games__load-button"></button>`);
        loadButton.addEventListener("click", () => this.generateContent());
        widget.querySelector(".content-container")?.append(loadButton);
    }
    initializeElements() {
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
        const cheevosListElement = async (events) => {
            const cheevoElement = (cheevo) => {
                const {
                    cheevoID,
                    activeFrom,
                    activeUntil,
                    decorator,
                    achievementTitle,
                    achievementDescription,
                    achievementPoints,
                    achievementBadgeUrl,
                    achievementBadgeLockedUrl,
                    eventTitle,
                    eventBadgeUrl
                } = cheevo;
                const percentage = (Date.now() - new Date(activeFrom)) / (new Date(activeUntil) - new Date(activeFrom)) * 100;
                const timeRemaining = new Date(activeUntil) - Date.now();
                const formattedTime = formatDuration(timeRemaining / 1000);
                const element = fromHtml(`
                    <li class="event-cheevos__cheevo main-column-item right-bg-icon award-type">
                        <img class="row-item__preview w-4em" src="${achievementBadgeUrl}">
                        <h3 class="list-item__title">
                            <a target="_blank" data-title="go to retroachievements.org" href="${cheevoUrl({ ID: cheevoID })}">${achievementTitle}</a>
                        </h3>
                        <p class="list-item__text">${achievementDescription}</p>
                        <p class="icons-row-list">${badgeElements.gold(`${formattedTime} remaining`)}</p>
                    </li>
                `);
                element.style.setProperty("--percentage", percentage + "%")
                return element;
            }
            const eventElement = (props) => {
                const {
                    id,
                    title,
                    badgeUrl,
                    state,
                    playersTotal,
                    achievementsPublished,
                    activeFrom,
                    activeThrough } = props;

                const timeRemaining = activeThrough ? formatDuration((new Date(activeThrough) - Date.now()) / 1000) : "";

                const timeDuration = activeThrough ? `${new Date(activeFrom).toLocaleDateString()} - ${new Date(activeThrough).toLocaleDateString()}` : "Ongoing";

                const element = fromHtml(`
                    <div class="event-item main-column-item right-bg-icon">
                        <img class="row-item__preview w-4em" src="${badgeUrl}">
                        <div class="row-item__text-block">
                            <h3 class="game-title">
                                <a target="_blank" data-title="go to retroachievements.org" href="${eventUrl(id)}">${title}</a>
                            </h3>
                            <p class="list-item__text">
                                ${timeDuration}
                            </p>
                            <div class="icons-row-list">
                                ${signedIcons.cheevos(achievementsPublished)}
                                ${signedIcons.players(playersTotal)}
                                ${signedIcons.time(timeRemaining)}
                            </div>
                        </div>
                    </div>
                `);
                const expanderButton = fromHtml(`<button class="expander-button"/>`);
                element.append(expanderButton);
                element.addEventListener("click", (event) => {
                    event.target.closest(".event-item__container")?.classList.toggle("expanded");
                })
                return element;
            }
            const container = fromHtml(`<ul class="flex-main-list"/>`);

            Object.values(events).map(event => {
                const eventContainer = fromHtml(`
                    <div class="event-item__container"/>
                `)
                const element = eventElement({ id: event.id, ...event.attributes });
                const listContainer = fromHtml(`<ul class="flex-main-list expandable"/>`);
                eventContainer.append(element, listContainer);
                const cheevoItems = event.items.map(cheevo => cheevoElement(cheevo));
                listContainer.append(...cheevoItems);
                container.append(eventContainer);
            })


            return container;
        }

        ui.toggleLoading(true, "Loading Events");
        const events = await raapi.getEventAchievements({});
        ui.toggleLoading(false, "");

        // console.log(events);

        this.container.innerHTML = "";
        this.container.append(await cheevosListElement(events));
    }
}
