import { raapi } from "../api/index.js";
import { badgeElements } from "../components/badges.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { signedIcons } from "../components/icons.js";
import { delay } from "../functions/delay.js";
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

        const loadButton = fromHtml(`<button.games__load-button/>`);
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
                    eventCheevoID,
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
                const fromTimestamp = new Date(activeFrom).getTime();
                const toTimestamp = new Date(activeUntil).getTime();
                const unlock = unlocks.find(u => u.AchievementID == cheevoID && u.HardcoreMode === 1);
                const isUnlocked = !!unlock;
                const timestamp = isUnlocked ? new Date(unlock.Date).getTime() : null;
                const isUnlockedInTime = timestamp > fromTimestamp && timestamp < toTimestamp;
                const percentage = (Date.now() - new Date(activeFrom)) / (new Date(activeUntil) - new Date(activeFrom)) * 100;

                const timeRemaining = new Date(activeUntil) - Date.now();
                const formattedTime = formatDuration(timeRemaining / 1000);
                const element = fromHtml(`
                    <li.event-cheevos__cheevo.main-column-item.right-bg-icon${isUnlocked ? ".unlocked" : ""}${!isUnlockedInTime ? ".not-in-time" : ""} award-type>
                        <img.row-item__preview.w-4em src="${isUnlocked ? achievementBadgeUrl : achievementBadgeLockedUrl}">
                        <h3.list-item__title>
                            <a target="_blank" data-title="${lang.goToRAHint}" href="${cheevoUrl({ ID: cheevoID })}">${achievementTitle}</a>
                        </h3>
                        <p.list-item__text>${achievementDescription}</p>
                        <p.icons-row-list>
                            ${isUnlocked ?
                        isUnlockedInTime ?
                            badgeElements.green("Unlocked · " + new Date(unlock.Date).toLocaleDateString()) :
                            badgeElements.green(`Unlocked previosly · ${formattedTime} remaining`) :
                        badgeElements.green(`${formattedTime} remaining`)
                    }
                        </p>
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
                    <.event-item.main-column-item.right-bg-icon>
                        <img.row-item__preview.w-4em src="${badgeUrl}">
                        <.row-item__text-block>
                            <h3.game-title>
                                <a target="_blank" data-title="${lang.goToRAHint}" href="${eventUrl(id)}">${title}</a>
                            </h3>
                            <p.list-item__text>
                                ${timeDuration}
                            </p>
                            <.icons-row-list>
                                ${signedIcons.cheevos(achievementsPublished)}
                                ${signedIcons.players(playersTotal)}
                                ${signedIcons.time(timeRemaining)}
                            </>
                        </>
                    </>
                `);
                const expanderButton = fromHtml(`<button.expander-button/>`);
                element.append(expanderButton);
                element.addEventListener("click", (event) => {
                    event.target.closest(".event-item__container")?.classList.toggle("expanded");
                })
                return element;
            }
            const container = fromHtml(`<ul.flex-main-list/>`);

            Object.values(events).map(event => {
                const eventContainer = fromHtml(`
                    <.event-item__container/>
                `)
                const element = eventElement({ id: event.id, ...event.attributes });
                const listContainer = fromHtml(`<ul.flex-main-list.expandable/>`);
                eventContainer.append(element, listContainer);
                const cheevoItems = event.items.map(cheevo => cheevoElement(cheevo));
                listContainer.append(...cheevoItems);
                container.append(eventContainer);
            })


            return container;
        }
        this.toggleLoader({ message: "Loading Events" });
        const events = await raapi.getEventAchievements({});
        let fromDate = Date.now();
        events?.forEach(event =>
            event.items.forEach(cheevo => {
                const timeStamp = new Date(cheevo.activeFrom).getTime();
                if (Number.isInteger(timeStamp)) fromDate = Math.min(fromDate, timeStamp)
            })
        );
        await delay(500);
        const unlocks = await raapi.getUserAchievementsByDateRange({ fromDate, toDate: Date.now() });
        this.toggleLoader({ show: false });


        this.container.replaceChildren();
        this.container.append(await cheevosListElement(events));
    }
}
const unlocksCache = {
    cachedFrom: 653435432,
    cachedTo: 765453453,
    unlocks: {
        9: {
            unlockedAt: 1234322424,
            unlockedAtHardcore: 1234334534,
            gameID: 1,
        }
    }
}