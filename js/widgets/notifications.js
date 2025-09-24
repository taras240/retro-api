import { UI } from "../ui.js";
import { config, ui, apiWorker, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { sortBy } from "../functions/sortFilter.js";
import { badgeElements, generateBadges } from "../components/badges.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { icons, signedIcons } from "../components/icons.js";
import { cheevoElementFull } from "../components/cheevo.js";
import { alertTypes } from "../enums/alerts.js";
import { gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { inputTypes } from "../components/inputElements.js";


export class Notifications extends Widget {
    widgetIcon = {
        description: "notifications widget",
        iconID: "side-panel__notifications",
        onChangeEvent: `ui.notifications.VISIBLE = this.checked`,
        iconClass: "notification-icon",
    };
    get contextMenuItems() {
        return [
            {
                label: ui.lang.showHeader,
                type: inputTypes.CHECKBOX,
                id: "context_hide-notification-header",
                checked: this.uiProps.showHeader,
                event: `onchange="ui.notifications.uiProps.showHeader = this.checked;"`,
            },
            {
                label: ui.lang.transparentBg,
                type: inputTypes.CHECKBOX,
                id: "context_hide-notification-bg",
                checked: this.uiProps.hideBg,
                event: `onchange="ui.notifications.uiProps.hideBg = this.checked;"`,
            },
            {
                label: ui.lang.showTimestamps,
                type: inputTypes.CHECKBOX,
                id: "context_show-notification-time",
                checked: this.uiProps.showTimestamp,
                event: `onchange="ui.notifications.uiProps.showTimestamp = this.checked;"`,
            }
        ];
    }
    types = {
        newGame: "newGame",
        earnedAchivs: "earnedAchivs",
    }
    uiDefaultValues = {
        showTimestamp: true,
        showHeader: false,
        hideBg: false,

    }
    uiSetCallbacks = {
    };
    uiValuePreprocessors = {
    };


    get NOTIFICATIONS() {
        return this._notifications ?? {
            time: "",
            notifications: [],
        };
    }
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        this.setValues();
    }

    initializeElements() {
        this.section = document.querySelector("#notification_section");
        this.sectionID = this.section.id;
        this.container = this.section.querySelector(".notification-container");
        this.resizer = this.section.querySelector(".resizer");
    }
    generateWidget() {
        const widgetData = {
            classes: ["notification_section", "bg-visible", "section", "compact-header"],
            id: "notification_section",
            title: ui.lang.alertsSectionName,
            contentClasses: ["notification-container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
    }
    addEvents() {
        super.addEvents();
    }
    setElementsValues() {
        this.section.classList.toggle("compact-timestamp", !this.uiProps.showTimestamp);
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);
        this.section.classList.toggle("hide-bg", this.uiProps.hideBg);

    }
    setValues() {
        UI.applyPosition({ widget: this });
        this.setElementsValues();
        this.updateInterval = setInterval(() => {
            this.container.querySelectorAll(".notification_timestamp").forEach(timeStamp => {
                timeStamp.innerText = this.getDeltaTime(timeStamp.dataset.time);
            })
        }, 1 * 1000 * 60)
    }
    gameChangeEvent() {
        const gameAlert = [{ type: alertTypes.GAME, value: watcher.GAME_DATA }];
        this.pushAlerts(gameAlert)
    }
    pushAlerts(alerts) {
        const generateAlertsBlock = (alertElements) => {
            const timeStamp = this.generatePopupTime();
            const alertsBlockElement = document.createElement("ul");
            alertsBlockElement.classList.add("notification_timeblock-list");
            alertsBlockElement.appendChild(timeStamp);
            alertElements.forEach(element => {
                alertsBlockElement.appendChild(element);
            })
            return alertsBlockElement;
        }
        if (alerts.length == 0) return;
        let alertElements = [];

        alerts?.forEach(alert => {
            switch (alert.type) {
                case alertTypes.CHEEVO:
                    alertElements.push(this.cheevoAlertElement(alert.value));
                    break;
                case alertTypes.GAME:
                    alertElements.push(this.gameAlertElement(alert.value))
                    break;
                default:
                    console.log(`notification type doesn't exist`);
                    break;
            }
        })
        if (alertElements.length > 0) {
            const alertsBlockElement = generateAlertsBlock(alertElements);
            this.container.prepend(alertsBlockElement);
            const elementHeight = alertsBlockElement.getBoundingClientRect().height;
            this.container.style.setProperty("--offset-height", `${elementHeight}px`);
            alertsBlockElement.classList.add("notification_popup");
        }
    }

    generatePopupTime(time) {
        !time && (time = new Date().toLocaleString())
        const toDate = (s) => {
            const [datePart, timePart] = s.split(', ');

            const [day, month, year] = datePart.split('.').map(Number);

            const [hours, minutes] = timePart.split(':').map(Number);

            return new Date(year, month - 1, day, hours, minutes);
        }
        const timestampElement = document.createElement("li");
        const popupTime = (time ? toDate(time) : new Date()).getTime();
        timestampElement.dataset.time = popupTime;
        timestampElement.classList.add("notification_timestamp");
        timestampElement.innerHTML = `
            ${this.getDeltaTime(popupTime)}
        `;
        return timestampElement;
    }

    gameAlertElement(game) {
        const gameMessage = document.createElement("li");
        gameMessage.classList.add("notification-game", "new-game");
        // <div class="notificaton_header">Launched game</div>
        gameMessage.innerHTML =
            `
        <div class="prev">
          <img class="prev-img" src="${gameImageUrl(game.ImageIcon)}" alt=" ">
        </div>
        <div class="notification_details">
          <h3 class="achiv-name">
            <a target="_blanc" href="${gameUrl(game.ID ?? game.GameID)}">
              ${game.Title}
            </a>
          </h3>
          <p class="achiv-description">${game.Genre ? game.Genre + ",\n" : ""}${game.ConsoleName}</p>
          <div class="notification_description-icons">
            <p class="notification_description-text" data-title="${ui.lang.points}">
              ${icons.points}
              ${game.totalPoints ?? ""}
            </p>
            <p class="notification_description-text" data-title="${ui.lang.retropoints}">
              ${icons.cheevos}
              ${game.NumAchievements ?? game.AchievementsTotal}
            </p>
            <p class="notification_description-text" data-title="${ui.lang.unlockedBy}">
              ${icons.players}
              ${game.NumDistinctPlayersHardcore ?? ""}
            </p>
          </div>
        </div>
      `;
        return gameMessage;
    }

    cheevoAlertElement(cheevo) {
        const cheevoElement = cheevoElementFull(cheevo);
        cheevoElement.classList.add("notification-achiv", "new-achiv");
        return cheevoElement;
    }


    getDeltaTime(timeStamp) {
        let date = +timeStamp;
        let now = (new Date()).getTime();
        let deltaSeconds = ~~((now - date) / 1000);
        return deltaSeconds < 2 * 60 ? "moment ago" :
            deltaSeconds < 10 * 60 ? `few minutes ago` :
                deltaSeconds < 60 * 60 ? `${~~(deltaSeconds / 60)} minutes ago` :
                    deltaSeconds < 60 * 60 * 12 ? new Date(date).toLocaleTimeString().replace(/:[^:]*$/gi, "") :
                        new Date(date).toLocaleString().replace(/:[^:]*$/gi, "");
    }
}