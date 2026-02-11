import { UI } from "../ui.js";
import { ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { icons } from "../components/icons.js";
import { ALERT_TYPES } from "../enums/alerts.js";
import { cheevoImageUrl, cheevoUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { inputTypes } from "../components/inputElements.js";
import { alertHtml } from "../components/notifications/alertElement.js";
import { buttonsHtml } from "../components/htmlElements.js";


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
                label: ui.lang.alertTypes,
                elements: [
                    {
                        label: ui.lang.showGameAlerts,
                        type: inputTypes.CHECKBOX,
                        id: "show-notification-game",
                        checked: this.uiProps.showGameAlerts,
                        onChange: (event) => this.uiProps.showGameAlerts = event.currentTarget.checked,
                    },
                    {
                        label: ui.lang.showAwardAlerts,
                        type: inputTypes.CHECKBOX,
                        id: "show-notification-award",
                        checked: this.uiProps.showAwardAlerts,
                        onChange: (event) => this.uiProps.showAwardAlerts = event.currentTarget.checked,
                    },
                    {
                        label: ui.lang.showCheevoAlerts,
                        type: inputTypes.CHECKBOX,
                        id: "show-notification-cheevo",
                        checked: this.uiProps.showCheevoAlerts,
                        onChange: (event) => this.uiProps.showCheevoAlerts = event.currentTarget.checked,
                    }
                ]
            },
            {
                label: ui.lang.showHeader,
                type: inputTypes.CHECKBOX,
                id: "hide-notification-header",
                checked: this.uiProps.showHeader,
                onChange: (event) => this.uiProps.showHeader = event.currentTarget.checked,
            },
            {
                label: ui.lang.transparentBg,
                type: inputTypes.CHECKBOX,
                id: "hide-notification-bg",
                checked: this.uiProps.hideBg,
                onChange: (event) => this.uiProps.hideBg = event.currentTarget.checked,
            },
            {
                label: ui.lang.showTimestamps,
                type: inputTypes.CHECKBOX,
                id: "show-notification-time",
                checked: this.uiProps.showTimestamp,
                onChange: (event) => this.uiProps.showTimestamp = event.currentTarget.checked,
            }
        ];
    }

    uiDefaultValues = {
        showTimestamp: true,
        showHeader: false,
        hideBg: false,
        showCheevoAlerts: true,
        showAwardAlerts: true,
        showGameAlerts: true,
    }
    uiSetCallbacks = {
        showCheevoAlerts: () => this.showSavedAlert(),
        showAwardAlerts: () => this.showSavedAlert(),
        showGameAlerts: () => this.showSavedAlert(),
    };
    uiValuePreprocessors = {
    };
    alertsCacheName = "raApiAlertsCache";


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
        this.setElementsValues();
        UI.applyPosition({ widget: this });
        this.updateInterval = setInterval(() => {
            this.container.querySelectorAll(".notification_timestamp").forEach(timeStamp => {
                timeStamp.innerText = this.getDeltaTime(timeStamp.dataset.time);
            })
        }, 1 * 1000 * 60);
        this.showSavedAlert();
    }

    initializeElements() {
        this.section = document.querySelector("#notification_section");
        this.sectionID = this.section.id;
        this.container = this.section.querySelector(".notification-container");
        this.resizer = this.section.querySelector(".resizer");
    }
    generateWidget() {
        const headerElementsHtml = buttonsHtml.tweek();
        const widgetData = {
            classes: ["notification_section", "bg-visible", "section", "compact-header"],
            id: "notification_section",
            title: ui.lang.alertsSectionName,
            headerElementsHtml,
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
    gameChangeEvent(isNewGame) {
        if (!isNewGame) return;
        const gameAlert = [{ type: ALERT_TYPES.GAME, value: watcher.GAME_DATA }];
        this.addAlertsToQuery(gameAlert);
    }

    saveAlerts(alerts) {
        const timeStamp = new Date().toISOString();
        const normalizedAlerts = alerts.map(alert => {
            if ([ALERT_TYPES.GAME, ALERT_TYPES.AWARD].includes(alert.type)) {
                const {
                    Title,
                    ImageIcon,
                    totalPoints,
                    NumDistinctPlayers,
                    retroRatio,
                    NumAchievements,
                    ConsoleName,
                    ID
                } = alert.value;

                const normalizedGameData = {
                    Title,
                    ImageIcon,
                    totalPoints,
                    NumDistinctPlayers,
                    retroRatio,
                    NumAchievements,
                    ConsoleName,
                    ID
                };
                return { ...alert, value: normalizedGameData }
            }
            else if (alert.type === ALERT_TYPES.CHEEVO) {
                const {
                    Title,
                    BadgeName,
                    Points,
                    Description,
                    TrueRatio,
                    retroRatio,
                    rateEarnedHardcore,
                    ID,
                } = alert.value;

                const normalizedGameData = {
                    Title,
                    BadgeName,
                    Points,
                    Description,
                    TrueRatio,
                    retroRatio,
                    rateEarnedHardcore,
                    ID,
                };
                return { ...alert, value: normalizedGameData }
            }
            else {
                console.log(`notification type doesn't exist`);
            }
        });
        const savedData = this.getSavedAlerts();
        savedData.length >= 20 && savedData.shift();
        savedData.push({ timeStamp, alerts: normalizedAlerts });
        localStorage.setItem(this.alertsCacheName, JSON.stringify(savedData));
    }
    getSavedAlerts() {
        return JSON.parse(localStorage.getItem(this.alertsCacheName)) ?? [];
    }
    showSavedAlert() {
        this.container.innerHTML = "";
        const savedAlerts = this.getSavedAlerts();
        savedAlerts.forEach(({ timeStamp, alerts }) => {
            this.showAlerts(alerts, new Date(timeStamp));
        })

    }
    addAlertsToQuery(alerts = []) {
        if (this.alertsQueryArray?.length > 0) {
            this.alertsQueryArray = [...this.alertsQueryArray, ...alerts]
        }
        else {
            this.alertsQueryArray = [...alerts];
            setTimeout(() => {
                this.saveAlerts([...this.alertsQueryArray]);
                this.showAlerts(this.alertsQueryArray);
            }, 2000)
        }

    }
    showAlerts(alerts, time) {
        if (!alerts) return;
        const generateAlertsBlock = (alertElements, time) => {
            const timeStamp = this.generatePopupTime(time);
            const alertsBlockElement = document.createElement("ul");
            alertsBlockElement.classList.add("notification_timeblock-list");
            alertsBlockElement.appendChild(timeStamp);
            alertElements.forEach(element => {
                alertsBlockElement.appendChild(element);
            })
            return alertsBlockElement;
        }
        let alertElements = [];
        while (alerts.length > 0) {
            const alert = alerts.shift();
            if (!alert) continue;
            switch (alert.type) {
                case ALERT_TYPES.GAME:
                    this.uiProps.showGameAlerts && alertElements.push(this.gameAlertElement(alert.value))
                    break;
                case ALERT_TYPES.CHEEVO:
                    this.uiProps.showCheevoAlerts && alertElements.push(this.cheevoAlertElement(alert.value));
                    break;
                case ALERT_TYPES.AWARD:
                    this.uiProps.showAwardAlerts && alertElements.push(this.awardAlertElement(alert))
                    break;
                default:
                    console.log(`notification type doesn't exist`);
                    break;
            }
        }

        if (alertElements.length > 0) {
            const alertsBlockElement = generateAlertsBlock(alertElements, time);
            this.container.prepend(alertsBlockElement);
            const elementHeight = alertsBlockElement.getBoundingClientRect().height;
            this.container.style.setProperty("--offset-height", `${elementHeight}px`);
            alertsBlockElement.classList.add("notification_popup");
        }
    }
    generatePopupTime(popupTime) {

        popupTime ??= new Date().getTime();


        const timestampElement = document.createElement("li");
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
        const html = alertHtml({
            alertType: ALERT_TYPES.GAME,
            imageUrl: gameImageUrl(game.ImageIcon),
            title: game.Title,
            titleUrl: gameUrl(game.ID ?? game.GameID),
            meta: `${game.ConsoleName}`,
            icons: [
                {
                    type: "players",
                    value: game.NumDistinctPlayers
                },
                {
                    type: "cheevos",
                    value: game.NumAchievements
                },
                {
                    type: "points",
                    value: game.totalPoints
                },
                {
                    type: "retroRatio",
                    value: game.retroRatio
                },
            ]
        });
        gameMessage.innerHTML = html;
        return gameMessage;
    }

    cheevoAlertElement(cheevo) {
        const cheevoAlert = document.createElement("li");
        cheevoAlert.classList.add("notification-achiv", "new-achiv");
        const html = alertHtml({
            alertType: ALERT_TYPES.CHEEVO,
            imageUrl: cheevoImageUrl(cheevo),
            title: cheevo.Title,
            badge: icons.progressionAward,
            titleUrl: cheevoUrl(cheevo),
            meta: cheevo.Description,
            icons: [
                {
                    type: "points",
                    value: cheevo.Points
                },
                {
                    type: "retropoints",
                    value: cheevo.TrueRatio
                },
                {
                    type: "retroRatio",
                    value: cheevo.retroRatio
                },
                {
                    type: "rarity",
                    value: cheevo.rateEarnedHardcore
                },
            ]
        });
        cheevoAlert.innerHTML = html;
        return cheevoAlert;
    }

    awardAlertElement({ award, value: game }) {
        // {
        // type: ALERT_TYPES.AWARD,
        // award: "beaten-softcore",
        // value: this.GAME_DATA
        // }
        const gameMessage = document.createElement("li");
        gameMessage.classList.add("notification-game", "new-game");
        const html = alertHtml({
            alertType: award,
            imageUrl: gameImageUrl(game.ImageIcon),
            badge: icons.masteryAward,
            title: game.Title,
            titleUrl: gameUrl(game.ID ?? game.GameID),
            meta: `${game.ConsoleName}`,
            icons: [
                {
                    type: "players",
                    value: game.NumDistinctPlayers
                },
                {
                    type: "cheevos",
                    value: game.NumAchievements
                },
                {
                    type: "points",
                    value: game.totalPoints
                },
                {
                    type: "retroRatio",
                    value: game.retroRatio
                },
            ]
        });
        gameMessage.innerHTML = html;
        return gameMessage;
    }
    getDeltaTime(timeStamp) {
        let date = +timeStamp;
        let now = (new Date()).getTime();
        let deltaSeconds = ~~((now - date) / 1000);
        return deltaSeconds < 3 * 60 ? "moment ago" :
            deltaSeconds < 10 * 60 ? `few minutes ago` :
                deltaSeconds < 60 * 60 ? `${~~(deltaSeconds / 60)} minutes ago` :
                    deltaSeconds < 60 * 60 * 12 ? new Date(date).toLocaleTimeString().replace(/:[^:]*$/gi, "") :
                        new Date(date).toLocaleString().replace(/:[^:]*$/gi, "");
    }
}