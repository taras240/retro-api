import { Widget } from "./widget.js";
import { inputTypes } from "../components/inputElements.js";
import { ALERT_TYPES } from "../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { createAlertData } from "../components/notifications/alertData.js";
import { classicAlert } from "../components/notifications/skins/classic.js";
import { minimalAlert } from "../components/notifications/skins/minimal.js";
import { retroBannerAlert } from "../components/notifications/skins/retroBanner.js";
import { xboxToastAlert } from "../components/notifications/skins/xboxToast.js";

const DEFAULT_ALERT_DURATION = 8;
const ALERT_EXIT_DURATION = 200;
const ALERT_SKINS = ["classic", "minimal", "banner", "xbox-toast"];
const ALERT_SKIN_RENDERERS = {
    classic: classicAlert,
    minimal: minimalAlert,
    banner: retroBannerAlert,
    "xbox-toast": xboxToastAlert,
};
const ALERT_SOUNDS = Object.freeze({
    off: null,
    arc: "arc.m4a",
    coin: "smb-coin.m4a",
    ps: "pstrophies.mp3",
    ring: "son-ring.m4a",
    steam: "steam.mp3",
    switch: "switch.mp3",
    x360: "360-unlock.mp3",
});

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
                    {
                        prefix: lang.alertSpacingX,
                        postfix: "px",
                        type: inputTypes.NUM_INPUT,
                        value: this.uiProps.spacingX,
                        onInput: (event) => this.uiProps.spacingX = event.currentTarget.value,
                    },
                    {
                        prefix: lang.alertSpacingY,
                        postfix: "px",
                        type: inputTypes.NUM_INPUT,
                        value: this.uiProps.spacingY,
                        onInput: (event) => this.uiProps.spacingY = event.currentTarget.value,
                    },
                ],
            },
            {
                label: lang.alertSkin,
                elements: ALERT_SKINS.map(skin => ({
                    type: inputTypes.RADIO,
                    name: "alerts-skin",
                    label: lang[`alertSkin_${skin}`],
                    checked: this.uiProps.skin === skin,
                    onChange: () => this.uiProps.skin = skin,
                })),
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
                label: lang.alertSound,
                elements: Object.keys(ALERT_SOUNDS).map(sound => ({
                    type: inputTypes.RADIO,
                    name: "alerts-sound",
                    label: lang[`alertSound_${sound}`],
                    checked: this.uiProps.sound === sound,
                    onChange: () => this.uiProps.sound = sound,
                })),
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
        spacingX: 25,
        spacingY: 25,
        position: "top-right",
        skin: "banner",
        disabled: true,
        sound: "coin",
        showCheevoAlerts: true,
        showAwardAlerts: true,
        showGameAlerts: true,
    };

    uiSetCallbacks = {
        disabled: (disabled) => {
            if (disabled) this.container.replaceChildren();
        },
        skin: () => {
            this.setElementsValues();
            this.showSkinPreview();
        },
        sound: (sound) => this.playAlertSound(sound),
    };

    uiValuePreprocessors = {
        duration: (value) => {
            const seconds = Number(value);
            return Number.isFinite(seconds)
                ? Math.min(60, Math.max(1, Math.round(seconds)))
                : DEFAULT_ALERT_DURATION;
        },
        spacingX: (value) => {
            const spacing = Number(value);
            return Number.isFinite(spacing) ? Math.max(0, spacing) : 25;
        },
        spacingY: (value) => {
            const spacing = Number(value);
            return Number.isFinite(spacing) ? Math.max(0, spacing) : 25;
        },
        position: (value) => ["top-left", "top-right", "bottom-left", "bottom-right"].includes(value)
            ? value
            : "top-right",
        skin: (value) => ALERT_SKINS.includes(value) ? value : "banner",
        sound: (value) => Object.hasOwn(ALERT_SOUNDS, value) ? value : "coin",
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
        this.section.dataset.skin = this.uiProps.skin;
        this.section.style.setProperty("--spacing-x", `${this.uiProps.spacingX}px`);
        this.section.style.setProperty("--spacing-y", `${this.uiProps.spacingY}px`);
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
                    return this.uiProps.showGameAlerts ? [this.createAlertElement(alert)] : [];
                case ALERT_TYPES.CHEEVO:
                    return this.uiProps.showCheevoAlerts ? [this.createAlertElement(alert)] : [];
                case ALERT_TYPES.AWARD:
                    return this.uiProps.showAwardAlerts ? [this.createAlertElement(alert)] : [];
                default:
                    console.warn("Unknown alert type:", alert?.type);
                    return [];
            }
        });

        this.displayAlertElements(alertElements);
        if (alertElements.length > 0) this.playAlertSound();
    }

    showSkinPreview() {
        const game = watcher.GAME_DATA;
        if (!game) return;

        this.container.querySelectorAll(".alerts-popup--preview").forEach(element => element.remove());

        const cheevo = Object.values(game.AllAchievements ?? {}).find(achievement => achievement?.BadgeName);
        const previewAlerts = [
            { type: ALERT_TYPES.GAME, value: game },
            cheevo && { type: ALERT_TYPES.CHEEVO, value: cheevo },
            { type: ALERT_TYPES.AWARD, award: GAME_AWARD_TYPES.MASTERED, value: game },
        ].filter(Boolean);
        const elements = previewAlerts.map(alert => {
            const element = this.createAlertElement(alert);
            element.classList.add("alerts-popup--preview");
            return element;
        });
        this.displayAlertElements(elements);
    }

    displayAlertElements(alertElements) {
        alertElements.reverse().forEach(element => {
            this.container.prepend(element);
            const duration = this.uiProps.duration * 1000;
            setTimeout(() => {
                element.classList.add("alerts-popup--leaving");
                setTimeout(() => element.remove(), ALERT_EXIT_DURATION);
            }, Math.max(0, duration - ALERT_EXIT_DURATION));
        });
    }

    createAlertElement(alert) {
        const renderer = ALERT_SKIN_RENDERERS[this.uiProps.skin];
        if (!renderer) {
            throw new Error(`Unknown alert skin: ${this.uiProps.skin}`);
        }

        return renderer(createAlertData(alert, watcher.GAME_DATA), lang);
    }

    playAlertSound(soundName = this.uiProps.sound) {
        const soundFile = ALERT_SOUNDS[soundName];
        if (!soundFile) return;

        const audio = new Audio(new URL(`./assets/sounds/${soundFile}`, document.baseURI));
        audio.volume = 0.9;
        audio.play().catch(error => {
            console.warn(`Unable to play alert sound "${soundName}":`, error);
        });
    }

}
