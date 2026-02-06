import { UI } from "../ui.js";
import { ALERT_TYPES } from "../enums/alerts.js";

import { icons, signedIcons } from "../components/icons.js"

import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";
import { apiWorker, config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { filterBy, sortBy } from "../functions/sortFilter.js";
import { showComments } from "../components/comments.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { delay } from "../functions/delay.js";
import { formatTime } from "../functions/time.js";
import { gamePropsPopup } from "../components/gamePropsPopup.js";
import { CHEEVO_TYPES } from "../enums/cheevoTypes.js";
import { cheevoImageUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { infiniteLineScrolling } from "../functions/infiniteLineScrolling.js";
import { generateMagicLineText } from "../functions/tickerTextGenerator.js";
import { inputTypes } from "../components/inputElements.js";
import { scrollElementIntoView } from "../functions/scrollingToElement.js";
import { getHoveredEdge } from "../functions/hoveredEdges.js";
import { moveDirections } from "../enums/moveDirections.js";
import { recentCheevoHtml } from "../components/statusWidget/recentCheevo.js";
import { progressionBarHtml, updateProgressionBar } from "../components/statusWidget/progressionBar.js";
import { progressBarHtml, updateProgressBarData } from "../components/statusWidget/progressBar.js";
import { progressTypes } from "../enums/progressBar.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { resizerHtml } from "../components/resizer.js";
import { tickerHtml } from "../components/statusWidget/ticker.js";
import { richPresenceHtml } from "../components/statusWidget/richPresence.js";
import { indicatorHtml } from "../components/statusWidget/statusIndicator.js";
import { statusStyles } from "../enums/statusThemes.js";
import { StatusPanel } from "../removed/status.js";
import { alertHtml, hideAlert, showAlert } from "../components/statusWidget/alert.js";
import { gameInfoHtml } from "../components/statusWidget/gameInfo.js";
import { timePosition } from "../enums/timePosition.js";
import { GAME_INFO_TYPES } from "../enums/gameInfoTypes.js";
import { gameInfoIconsHtml, richInfoHtml } from "../components/statusWidget/gameInfoIcons.js";
import { sweepEffect } from "../components/windowEffects.js";
import { getCheevosCount, getPointsCount, getRetropointsCount } from "../functions/gameProperties.js";

export class Status extends Widget {

    ACHIV_DURATION = 15000;
    IS_HARD_MODE = true;

    widgetIcon = {
        description: "status widget",
        iconID: `side-panel__status1`,
        onChangeEvent: `ui['${this.widgetName}'].VISIBLE = this.checked`,
        iconClass: "status-icon",
    };
    static themes = {
        legacy: "legacy",
        default: "default"
    }
    get contextMenuItems() {
        return [
            this.contextSetsMenu(),

            this.theme !== Status.themes.legacy ? {
                label: ui.lang.elements,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-rp",
                        label: ui.lang.richPresence,
                        checked: this.uiProps.showRichPresence,
                        onChange: (event) => this.uiProps.showRichPresence = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-ticker",
                        label: ui.lang.ticker,
                        checked: this.uiProps.showTicker,
                        onChange: (event) => this.uiProps.showTicker = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-progression",
                        label: ui.lang.progression,
                        checked: this.uiProps.showProgression,
                        onChange: (event) => this.uiProps.showProgression = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-progressbar",
                        label: ui.lang.progressbar,
                        checked: this.uiProps.showProgressbar,
                        onChange: (event) => this.uiProps.showProgressbar = event.currentTarget.checked,
                    },
                ],
            } : "",
            {
                label: ui.lang.infoPanel,
                elements: Object.values(GAME_INFO_TYPES).map(type =>
                ({
                    type: inputTypes.RADIO,
                    name: "info-type",
                    id: `info-type-${type}`,
                    label: ui.lang?.[type] ?? type,
                    checked: this.uiProps.gameInfoType == type,
                    onChange: () => this.uiProps.gameInfoType = type,
                })
                )
            },
            {
                label: ui.lang.style,
                elements: Object.values(statusStyles).map(theme =>
                ({
                    type: inputTypes.RADIO,
                    name: "status-theme",
                    id: `status-theme-${theme}`,
                    label: ui.lang?.[theme] ?? theme,
                    checked: this.uiProps.statusTheme == theme,
                    onChange: () => this.uiProps.statusTheme = theme,
                })
                )
            },
            {
                label: ui.lang.progressbar,
                elements: Object.values(progressTypes).map(type =>
                ({
                    type: inputTypes.RADIO,
                    name: "progressbar-type",
                    id: `progressbar-type-${type}`,
                    label: ui.lang?.[type] ?? type,
                    checked: this.uiProps.progressType == type,
                    onChange: () => this.uiProps.progressType = type,
                })
                )
            },
            {
                label: ui.lang.time,
                elements: [
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "show-playTime",
                        label: ui.lang.gameTime,
                        checked: this.uiProps.time == "playTime",
                        onChange: () => this.uiProps.time = 'playTime',
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "show-sessionTime",
                        label: ui.lang.sessionGameTime,
                        checked: this.uiProps.time == "sessionTime",
                        onChange: () => this.uiProps.time = 'sessionTime',
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "show-totalTime",
                        label: ui.lang.sessionTime,
                        checked: this.uiProps.time == "totalSessionTime",
                        onChange: () => this.uiProps.time = 'totalSessionTime',
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "show-timer",
                        label: ui.lang.timer,
                        checked: this.uiProps.time == "timer",
                        onChange: () => this.uiProps.time = 'timer',
                    },
                    {
                        prefix: ui.lang.timer,
                        postfix: ui.lang.min,
                        type: inputTypes.NUM_INPUT,
                        id: "stats-timer-duration",
                        label: ui.lang.timer,
                        value: ~~(this.uiProps.timerTime / 60 * 100) / 100,
                        onChange: (event) => this.uiProps.timerTime = event.currentTarget.checked,
                    },
                    ...Object.keys(timePosition).map(position =>
                    ({
                        type: inputTypes.RADIO,
                        name: "time-pos",
                        id: `time-pos-${position}`,
                        label: ui.lang?.[position] ?? position,
                        checked: this.uiProps.timePosition == position,
                        onChange: () => this.uiProps.timePosition = position,
                    })
                    )
                ],
            },
            {
                type: inputTypes.CHECKBOX,
                id: "game-bg",
                label: ui.lang.gameBg,
                checked: this.uiProps.showGameBg,
                onChange: (event) => this.uiProps.showGameBg = event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                id: "show-target-preview",
                label: ui.lang.focusCheevoPreview,
                checked: this.uiProps.showTargetPreview,
                onChange: (event) => this.uiProps.showTargetPreview = event.currentTarget.checked,
            },

        ];
    }
    contextSetsMenu = () => Object.values(watcher.GAME_DATA?.availableSubsets ?? {})?.length > 1 ? {
        label: ui.lang.subsets,
        elements: Object.entries(watcher.GAME_DATA?.availableSubsets).map(([subsetName, subsetID]) => {
            subsetID = parseInt(subsetID);
            const isMainSet = subsetName === "Main";
            if (isMainSet || !subsetID) return "";
            const isVisible = config.gameConfig().visibleSubsets?.includes(subsetID);
            const checked = isMainSet || isVisible;
            return {
                type: inputTypes.CHECKBOX,
                name: "subset-select",
                id: `subset-select-${subsetName}`,
                label: subsetName,
                checked,
                onChange: () => watcher.setSubset(subsetID),
            }
        }),
    } : "";
    uiDefaultValues = {
        time: "playTime",
        timerTime: 30,
        showRichPresence: true,
        showTicker: true,
        showProgressbar: true,
        showProgression: true,
        progressType: progressTypes.cheevos,
        statusTheme: statusStyles.DEFAULT,
        timePosition: timePosition.normal,
        gameInfoType: GAME_INFO_TYPES.icons,
        showGameBg: false,
        showTargetPreview: false,
    }
    uiDefaultValuesLegacy = {
        showRichPresence: false,
        showTicker: false,
        showProgressbar: false,
        showProgression: false,
        statusTheme: statusStyles.THICK,
        timePosition: timePosition.background,
        gameInfoType: GAME_INFO_TYPES.progression,
        showTargetPreview: false,
        showGameBg: false,
    }
    uiSetCallbacks = {
        time() {
            this.gameElements.time.innerHTML = watcher.getActiveTime(this.uiProps.time, this.uiProps.timerTime);
        },
        showTicker(value) {
            this.setElementsValues();
            value ? this.updateTicker() : this.ticker?.stopScrolling();
        },
        progressType() {
            this.updateProgressBar();
        },
        gameInfoType() {
            this.updateGameInfo();
        },
        showTargetPreview() {
            this.updateFocusPreview();
        }
    };

    uiValuePreprocessors = {
        timerTime(value) {
            if (value <= 0) value = 1;
            if (value > 24 * 60) value = 24 * 60;
            return value * 60;
        }
    };
    loadDefaultValues() {
        if (this.theme === Status.themes.legacy) {
            Object.assign(this.uiDefaultValues, this.uiDefaultValuesLegacy);
        }
    }
    constructor(widgetName = "status", isLegacy = false) {
        super();
        this.setWidgetData(widgetName, isLegacy);
        this.loadDefaultValues();
        this.generateWidget();
        this.addWidgetIcon();
        // this.initializeElements();
        UI.applyPosition({ widget: this });
        this.setElementsValues();
        this.addEvents();
    }
    setWidgetData(widgetName, isLegacy) {
        this.widgetName = widgetName;
        this.theme = isLegacy ? Status.themes.legacy : Status.themes.default;
        this.widgetIcon = {
            description: "status widget",
            iconID: `side-panel__${widgetName}`,
            onChangeEvent: `ui['${widgetName}'].VISIBLE = this.checked`,
            iconClass: "status-icon",
            badgeLabel: isLegacy && "compact",
        };
    }
    initializeElements(widget) {
        this.section = widget;
        this.sectionID = this.section.id;
        this.watchButton = this.section.querySelector("#rp__watch-button");
        this.indicatorElement = this.section.querySelector(".rp__indicator");
        this.gameElements = {
            icon: this.section.querySelector(".rp__game-image"),

            title: this.section.querySelector(".rp__game-title"),
            platform: this.section.querySelector(".rp__game-platform"),
            gameIcons: this.section.querySelector(".rp__game-icons"),
            time: this.section.querySelector(".rp__game-time"),
        }
        this.alertElements = {
            container: this.section.querySelector(".rp__alert-container"),
        }
        this.richPresenceElement = this.section.querySelector(".rp__rich-presence");
        this.progressionContainer = this.section.querySelector(".rp__progression-container")

        this.progressbarElements = {
            container: this.section.querySelector(".rp__progressbar-container"),
            title: this.section.querySelector(".rp__progressbar-title"),
            lastCheevos: this.section.querySelector(".rp__last-cheevos"),
        }
        this.tickerElement = this.section.querySelector(".rp__ticker");

    }
    generateWidget() {
        const isLegacy = this.theme === Status.themes.legacy;
        const widgetID = isLegacy ? "update-section" : "rp__section";
        const headerElementsHtml = `
            ${buttonsHtml.tweek()}
        `;

        const widgetData = {
            classes: isLegacy ? ["status__section", "section"] : ["rp__section", "section"],
            id: widgetID,
            headerElementsHtml: headerElementsHtml,
            isLegacy
        };

        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
        this.initializeElements(widget);
    }
    generateWidgetElement({ classes, id, headerElementsHtml, isLegacy }) {
        const modernThemeHtml = () => `
            <div class="hidden-header-buttons">
                ${headerElementsHtml ?? ""}
                ${buttonsHtml.close()}
            </div>
            ${indicatorHtml()}
            ${alertHtml()}
            <div class="rp-content__container">
                ${gameInfoHtml()}
                ${richPresenceHtml()}
                ${progressionBarHtml()}
                ${progressBarHtml()}
            </div>
            ${tickerHtml()}
            ${resizerHtml()}`;
        const legacyThemeHtml = () => `
            <div class="hidden-header-buttons">
                ${headerElementsHtml ?? ""}
                ${buttonsHtml.close()}
            </div>
            ${indicatorHtml()}
            <div class="status__container">
                ${alertHtml()}
                <div class="rp-content__container">
                    ${gameInfoHtml()}
                </div>
            </div>
            ${resizerHtml()}`
        const widget = document.createElement("section");
        widget.classList.add(...classes);
        widget.id = id;
        const theme = config.ui?.[id]?.statusTheme ?? statusStyles.DEFAULT;
        const isWatching = watcher?.IS_WATCHING;

        widget.innerHTML = isLegacy ? legacyThemeHtml() : modernThemeHtml();;
        return widget;
    }

    addEvents() {
        this.section.addEventListener("mousemove", (event) => {
            this.section.classList.remove(...Object.values(moveDirections).map(dir => "hover-" + dir), "resize-hover");
            const hoveredEdge = getHoveredEdge(event, this.section)
            hoveredEdge && this.section.classList.add(`hover-${hoveredEdge}`, "resize-hover");
        })
        this.section.addEventListener('mousedown', (event) => {
            // Resize Section Event
            const hoveredEdge = getHoveredEdge(event, this.section);
            if (event.target.matches(".resizer") || hoveredEdge) {
                this.section.classList.add("resized");
                resizeEvent({
                    event: event,
                    section: this.section,
                    resizeDirection: event.target.matches(".resizer") ?
                        moveDirections.bottomRight :
                        hoveredEdge,
                })
            }
            else if (event.target.matches(".comments-button")) {
                event.stopPropagation();
                showComments(watcher.GAME_DATA?.ID, 1);
            }
            else if (event.target.matches(".game-props-button")) {
                event.stopPropagation();
                gamePropsPopup().open(watcher.GAME_DATA);
            }
            else if (event.target.matches(".tweak-button")) {
                this.contextMenuItems && ui.settings.openSettings(this.contextMenuItems);
            }
            else if (event.target.matches(".close-icon")) {
                event.stopPropagation();
                this.close();
            }
            // Drag Section Event
            else if (event.button === 0) {
                moveEvent(this.section, event);
            }
        });
        this.section.addEventListener("contextmenu", (event) => {
            ui.showContextmenu({
                event: event,
                menuItems: this.contextMenuItems,
            });
        });
        this.watchButton.addEventListener("click", (e) => {
            e.stopPropagation();
            watcher.isActive ?
                watcher.stop() : watcher.start();
        });
    }
    setElementsValues() {
        this.section.classList.toggle("show-ticker", this.uiProps.showTicker);
        this.section.classList.toggle("show-progression", this.uiProps.showProgression);
        this.section.classList.toggle("show-progressbar", this.uiProps.showProgressbar);
        this.richPresenceElement?.classList.toggle("hidden", !this.uiProps.showRichPresence)
        this.gameElements.time && (this.gameElements.time.dataset.position = this.uiProps.timePosition);

        this.section.dataset.theme = this.uiProps.statusTheme ?? statusStyles.DEFAULT;
        this.section.classList.toggle("game-bg", this.uiProps.showGameBg);
    }
    doUpdateAnimation() {
        if (this.theme === Status.themes.legacy) return;
        sweepEffect(this.section);
    }
    gameChangeEvent(isNewGame = false) {
        // this.addAlertsToQuery([{ type: ALERT_TYPES.GAME, value: watcher.GAME_DATA }]);

        if (isNewGame && watcher.IS_WATCHING) {
            this.addAlertsToQuery([{ type: ALERT_TYPES.GAME, value: watcher.GAME_DATA }]);
        }
        this.fillGameData();
        this.doUpdateAnimation();
        this.updateTicker();

    }
    updateTicker() {
        if (!this.tickerElement) return;
        this.ticker?.stopScrolling();
        this.ticker = infiniteLineScrolling({
            container: this.tickerElement,
            textGenerator: () =>
                generateMagicLineText(watcher.GAME_DATA, watcher.sessionData, watcher.userData)
        });
        this.uiProps.showTicker && this.ticker.startScrolling();
    }
    updateFocusPreview() {
        const isHardMode = this.IS_HARD_MODE;
        const focusCheevo = Object.values(watcher.CHEEVOS)
            .filter(c => filterBy.progression(c))
            .sort((a, b) => sortBy.default(a, b))
            .find(c => !(isHardMode ? c.isEarnedHardcore : c.isEarned));

        if (focusCheevo && this.uiProps.showTargetPreview) {
            this.section.querySelector(".rp__game-image")?.setAttribute(
                "src",
                cheevoImageUrl(focusCheevo)
            );
        }
        else {
            this.section.querySelector(".rp__game-image")?.setAttribute(
                "src",
                gameImageUrl(watcher.GAME_DATA?.ImageIcon)
            );
        }

    }
    updateProgressionBar() {
        this.section
            .querySelectorAll(".rp__progression-container")
            ?.forEach(container => {
                updateProgressionBar(container, watcher?.GAME_DATA, this.IS_HARD_MODE);

                scrollElementIntoView({
                    container,
                    element: container.querySelector(`.rp__progression-points .focus`),
                    scrollByX: true,
                    scrollByY: false,

                });
            }
            )

    }
    updateProgressBar() {
        this.section.querySelectorAll(".rp__progressbar-container")?.forEach(
            container => updateProgressBarData(
                container,
                watcher?.GAME_DATA,
                this.IS_HARD_MODE,
                this.uiProps.progressType
            ));
    }
    updateGameInfo() {
        const gameInfoContent = this.section.querySelector(".rp__game-info-content");
        if (!gameInfoContent) return;
        const updateIcons = () => {
            const gameData = watcher.GAME_DATA;
            let { ConsoleID, NumAchievements, totalPoints, retroRatio, totalRetropoints } = gameData;
            if (gameData.visibleSubsets?.length) {
                NumAchievements = getCheevosCount(gameData);
                totalPoints = getPointsCount(gameData);
                totalRetropoints = getRetropointsCount(gameData);
                retroRatio = (totalRetropoints / totalPoints).toFixed(2);
            }
            this.section.querySelector(".rp__game-platform")?.setHTMLUnsafe(signedIcons.platform(ConsoleID));

            this.section.querySelector(".rp__game-icons")?.setHTMLUnsafe(`
                    ${signedIcons.cheevos(NumAchievements)}
                    ${signedIcons.points(totalPoints)}
                    ${signedIcons.retroRatio(retroRatio)}
                `)
        }
        switch (this.uiProps.gameInfoType) {
            case GAME_INFO_TYPES.progressbar:
                gameInfoContent.innerHTML = progressBarHtml();
                this.updateProgressBar();
                break;
            case GAME_INFO_TYPES.progression:
                gameInfoContent.innerHTML = progressionBarHtml();
                this.updateProgressionBar();
                break;
            case GAME_INFO_TYPES.icons:
                gameInfoContent.innerHTML = gameInfoIconsHtml();
                updateIcons();
                break;
            case GAME_INFO_TYPES.richPresence:
                gameInfoContent.innerHTML = richInfoHtml();
                updateIcons();
                break;
            default:
                gameInfoContent.innerHTML = progressionBarHtml();
                this.updateProgressionBar();
                break;
        }

    }
    fillGameData() {
        const fillGameInfoData = () => {
            const { ImageIcon, ImageIngame, Title, badges, ConsoleName, ConsoleID, ID, NumAchievements, totalPoints, retroRatio } = watcher.GAME_DATA;

            this.gameElements.icon.src = gameImageUrl(ImageIcon);

            this.section.style.setProperty("--bg-image", `url(${gameImageUrl(ImageIngame)})`);
            this.gameElements.title.innerHTML = `
                ${Title || ""}
                ${generateBadges(badges)}
            `;
            this.gameElements.title.href = gameUrl(ID);

            setTimeout(() => this.startAutoScrollElement(this.gameElements.title, true, 10 * 1000), 10 * 1000);

            const time = watcher.getActiveTime(this.uiProps.time, this.uiProps.timerTime);
            this.gameElements.time.innerHTML = time;
        }


        fillGameInfoData();
        this.updateRichPresence();
        this.updateGameInfo();
        this.updateProgressionBar();
        this.updateFocusPreview();
        this.updateProgressBar();
        // this.startAutoScrollElement(this.richPresenceElement, true, 10 * 1000);
    }
    updateProgress({ earnedAchievementIDs }) {
        earnedAchievementIDs?.length > 0 && (this.IS_HARD_MODE = !!watcher.CHEEVOS[earnedAchievementIDs[0]].isEarnedHardcore);

        this.updateProgressionBar();
        this.updateFocusPreview();
        this.updateProgressBar();
        this.updateTicker();
        this.doUpdateAnimation();

        // this.gameChangeEvent();
    }
    updateRichPresence(richPresenceText) {
        this.section.querySelectorAll(".rp__rich-presence")?.forEach(el => {
            const message = richPresenceText || ui.lang.richPresence;
            el.innerText = message;
            el.dataset.title = message;
        })
    }
    alertsQuery = [];
    addAlertsToQuery(elements) {
        // if (!this.SHOW_NEW_ACHIV) return;
        if (this.alertsQuery.length > 0) {
            this.alertsQuery = [...this.alertsQuery, ...elements];
        }
        else {
            this.alertsQuery = [...elements];
            this.startAlerts();
        }
    }
    async startAlerts() {
        while (this.alertsQuery.length > 0) {
            const currentAlert = this.alertsQuery[0];
            if (!currentAlert.value) {
                this.alertsQuery.shift();
                return;
            } const onAlertStart = () => {
                showAlert(currentAlert, this.alertElements.container);
            }
            const onAlertFinish = async () => {
                await hideAlert(this.alertElements.container);
                this.alertsQuery.shift();
            }
            await delay(1000); //*waiting for previous animation ending
            onAlertStart();
            await delay(this.ACHIV_DURATION); //*waiting alert duration
            await onAlertFinish();
        }
    }

    timeWatcher() {
        this.watchButton.classList.toggle("active", watcher.isActive);
        this.section.classList.toggle("watching", watcher.IS_ONLINE && watcher.isActive);
        const start = () => {
            this.timeWatcher().stop();
            this.indicatorElement.classList.add("online");
            this.gameTimeInterval = setInterval(() => {
                if (this.uiProps.time === "timer" && watcher.playTime.timer < 0) {
                    this.section.classList.add("timer-timeout");
                }
                const time = watcher.getActiveTime(this.uiProps.time, this.uiProps.timerTime);
                if (time && time !== this.gameElements.time.innerHTML) {
                    this.gameElements.time.innerHTML = time;
                }

            }, 1000)
        }
        const stop = () => {
            this.gameTimeInterval && clearInterval(this.gameTimeInterval);
            this.indicatorElement.classList.remove("offline", "online", "error", "blink");
        }
        return { start, stop };
    }
    BLINK_ON_UPDATE = true;
    blinkUpdate() {
        this.indicatorElement.classList.remove("offline", "blink");
        this.section.classList.toggle("offline", !watcher.IS_ONLINE);
        this.indicatorElement.classList.toggle("online", watcher.IS_ONLINE);
        this.indicatorElement.classList.toggle("realtime", (watcher.IS_ONLINE && watcher.isLogOK));
        if (this.BLINK_ON_UPDATE && watcher.IS_ONLINE) {
            // this.indicatorElement.classList.add("blink");
            // setTimeout(() => this.indicatorElement.classList.remove("blink", "offline"), 1000);
        }
        else if (!watcher.IS_ONLINE) {
            // this.indicatorElement.classList.add("offline");
        }
    }
    autoscrollAlertInterval = {};
    startAutoScrollElement(element, toLeft = true, pause = 1000) {
        if (!element) return;
        const containerID = element.id || element.className;
        if (this.autoscrollAlertInterval[containerID]) {
            this.stopAutoScrollElement(element);
        } else {
            this.autoscrollAlertInterval[containerID] = {};
        }
        const refreshRateMiliSecs = 50;
        const scrollContainer = element;
        // Часовий інтервал для прокручування вниз
        this.autoscrollAlertInterval[containerID].interval = setInterval(() => {
            if (scrollContainer.clientWidth == scrollContainer.scrollWidth) {
                this.stopAutoScrollElement(element);
                this.autoscrollAlertInterval[containerID].timeout = setTimeout(() => this.startAutoScrollElement(element, true, pause), 10 * 1000);
            }
            else if (toLeft) {
                scrollContainer.scrollLeft++;
                if (
                    scrollContainer.scrollLeft + scrollContainer.clientWidth >=
                    scrollContainer.scrollWidth
                ) {
                    this.stopAutoScrollElement(element);
                    this.autoscrollAlertInterval[containerID].timeout = setTimeout(() => this.startAutoScrollElement(element, false, pause), pause);
                }
            } else {
                scrollContainer.scrollLeft = Math.max(0, scrollContainer.scrollLeft - 1);
                if (scrollContainer.scrollLeft == 0) {
                    this.stopAutoScrollElement(element);
                    this.autoscrollAlertInterval[containerID].timeout = setTimeout(() => this.startAutoScrollElement(element, true, pause), pause);
                }
            }
        }, refreshRateMiliSecs);

    }
    stopAutoScrollElement(element, reset = false) {
        reset && (element.scrollLeft = 0);
        const containerID = element.id || element.className;
        if (this.autoscrollAlertInterval[containerID]) {
            clearInterval(this.autoscrollAlertInterval[containerID].interval);
            clearTimeout(this.autoscrollAlertInterval[containerID].timeout);
        }
    }



}