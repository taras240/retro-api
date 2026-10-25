import { Widget } from "./widget.js";
import { icons } from "../components/icons.js";
import { inputTypes } from "../components/inputElements.js";
import { alertHtml } from "../components/notifications/alertElement.js";
import { ALERT_TYPES } from "../enums/alerts.js";
import { cheevoImageUrl, cheevoUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { fromHtml } from "../functions/html.js";

const DEFAULT_ALERT_DURATION = 8;
const ALERT_EXIT_DURATION = 200;

export class Alerts extends Widget {
    widgetIcon = {
        description: "alerts widget",
        iconClass: "alert-icon",
        onChangeEvent: () => {
            this.widgetIcon.element.checked = false;
            ui.settings.openSettings(this.contextMenuItems);
        },
    };

    get contextMenuItems() {
        return [
            {
                label: lang.alertPosition,
                elements: [
                    ...["top-left", "top-right", "bottom-left", "bottom-right"].map(position => ({
                        type: inputTypes.RADIO,
                        name: "alerts-position",
                        label: lang[`alertPosition_${position.replace("-", "_")}`],
                        checked: this.uiProps.position === position,
                        onChange: () => this.uiProps.position = position,
                    })),
                ],
            },
            {
                label: lang.alertTypes,
                elements: [
                    {
                        label: lang.showGameAlerts,
                        type: inputTypes.CHECKBOX,
                        checked: this.uiProps.showGameAlerts,
                        onChange: (event) => this.uiProps.showGameAlerts = event.currentTarget.checked,
                    },
                    {
                        label: lang.showAwardAlerts,
                        type: inputTypes.CHECKBOX,
                        checked: this.uiProps.showAwardAlerts,
                        onChange: (event) => this.uiProps.showAwardAlerts = event.currentTarget.checked,
                    },
                    {
                        label: lang.showCheevoAlerts,
                        type: inputTypes.CHECKBOX,
                        checked: this.uiProps.showCheevoAlerts,
                        onChange: (event) => this.uiProps.showCheevoAlerts = event.currentTarget.checked,
                    },
                ],
            },
            {
                prefix: lang.alertDuration,
                postfix: lang.sec,
                type: inputTypes.NUM_INPUT,
                value: this.uiProps.duration,
                onInput: (event) => this.uiProps.duration = event.currentTarget.value,
            },
            {
                label: lang.disableAlerts,
                type: inputTypes.CHECKBOX,
                checked: this.uiProps.disabled,
                onChange: (event) => this.uiProps.disabled = event.currentTarget.checked,
            },
        ];
    }

    uiDefaultValues = {
        duration: DEFAULT_ALERT_DURATION,
        position: "top-right",
        disabled: false,
        showCheevoAlerts: true,
        showAwardAlerts: true,
        showGameAlerts: true,
    };

    uiSetCallbacks = {
        disabled: (disabled) => {
            if (disabled) this.container.replaceChildren();
        },
    };

    uiValuePreprocessors = {
        duration: (value) => {
            const seconds = Number(value);
            return Number.isFinite(seconds)
                ? Math.min(60, Math.max(1, Math.round(seconds)))
                : DEFAULT_ALERT_DURATION;
        },
        position: (value) => ["top-left", "top-right", "bottom-left", "bottom-right"].includes(value)
            ? value
            : "top-right",
    };

    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.widgetIcon.element.checked = false;
        this.initializeElements();
        this.setElementsValues();
    }

    initializeElements() {
        this.sectionID = this.section.id;
        this.container = this.section.querySelector(".alerts-container");
    }

    generateWidget() {
        this.section = document.createElement("section");
        this.section.classList.add("alerts_section", "section");
        this.section.id = "alerts_section";
        this.container = document.createElement("ul");
        this.container.className = "alerts-container";
        this.section.append(this.container);
        ui.app.appendChild(this.section);
    }

    setElementsValues() {
        if (!this.section) return;
        this.section.dataset.position = this.uiProps.position;
    }

    onGameChange({ gameData, isNewGame, isWatching }) {
        if (!isNewGame || !isWatching || !gameData) return;
        this.showAlerts([{ type: ALERT_TYPES.GAME, value: gameData }]);
    }

    onStartSession({ gameData }) {
        if (!gameData) return;
        this.showAlerts([{ type: ALERT_TYPES.GAME, value: gameData }]);
    }

    onCheevoUnlocks({ cheevos }) {
        if (!Array.isArray(cheevos) || cheevos.length === 0) return;
        this.showAlerts(cheevos.map(cheevo => ({ type: ALERT_TYPES.CHEEVO, value: cheevo })));
    }

    onAwardsEarned({ awardsArray }) {
        if (!Array.isArray(awardsArray) || awardsArray.length === 0) return;
        this.showAlerts(awardsArray);
    }

    showAlerts(alerts) {
        if (!Array.isArray(alerts) || this.uiProps.disabled) return;

        const alertElements = alerts.flatMap(alert => {
            switch (alert?.type) {
                case ALERT_TYPES.GAME:
                    return this.uiProps.showGameAlerts ? [this.gameAlertElement(alert.value)] : [];
                case ALERT_TYPES.CHEEVO:
                    return this.uiProps.showCheevoAlerts ? [this.cheevoAlertElement(alert.value)] : [];
                case ALERT_TYPES.AWARD:
                    return this.uiProps.showAwardAlerts ? [this.awardAlertElement(alert)] : [];
                default:
                    console.warn("Unknown alert type:", alert?.type);
                    return [];
            }
        });

        alertElements.reverse().forEach(element => {
            this.container.prepend(element);
            const duration = this.uiProps.duration * 1000;
            setTimeout(() => {
                element.classList.add("alerts-popup--leaving");
                setTimeout(() => element.remove(), ALERT_EXIT_DURATION);
            }, Math.max(0, duration - ALERT_EXIT_DURATION));
        });
    }

    gameAlertElement(game) {
        const alertElement = fromHtml(`<li.notification-game.new-game.alerts-popup/>`);
        alertElement.append(fromHtml(alertHtml({
            alertType: ALERT_TYPES.GAME,
            imageUrl: gameImageUrl(game.ImageIcon),
            title: game.Title,
            titleUrl: gameUrl(game.ID ?? game.GameID),
            meta: game.ConsoleName,
            icons: [
                { type: "players", value: game.NumDistinctPlayers },
                { type: "cheevos", value: game.NumAchievements },
                { type: "points", value: game.totalPoints },
                { type: "retroRatio", value: game.retroRatio },
            ],
        })));
        return alertElement;
    }

    cheevoAlertElement(cheevo) {
        const alertElement = fromHtml(`<li.notification-achiv.new-achiv.alerts-popup/>`);
        alertElement.append(fromHtml(alertHtml({
            alertType: ALERT_TYPES.CHEEVO,
            imageUrl: cheevoImageUrl(cheevo),
            title: cheevo.Title,
            badge: icons.progressionAward,
            titleUrl: cheevoUrl(cheevo),
            meta: cheevo.Description,
            icons: [
                { type: "points", value: cheevo.Points },
                { type: "retropoints", value: cheevo.TrueRatio },
                { type: "retroRatio", value: cheevo.retroRatio },
                { type: "rarity", value: cheevo.rateEarnedHardcore },
            ],
        })));
        return alertElement;
    }

    awardAlertElement({ award, value: game }) {
        const alertElement = fromHtml(`<li.notification-game.new-game.alerts-popup/>`);
        alertElement.append(fromHtml(alertHtml({
            alertType: award,
            imageUrl: gameImageUrl(game.ImageIcon),
            badge: icons.masteryAward,
            title: game.Title,
            titleUrl: gameUrl(game.ID ?? game.GameID),
            meta: game.ConsoleName,
            icons: [
                { type: "players", value: game.NumDistinctPlayers },
                { type: "cheevos", value: game.NumAchievements },
                { type: "points", value: game.totalPoints },
                { type: "retroRatio", value: game.retroRatio },
            ],
        })));
        return alertElement;
    }
}
