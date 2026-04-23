import { UI } from "../ui.js";
import { ALERT_TYPES } from "../enums/alerts.js";

import { signedIcons } from "../components/icons.js"

import { generateBadges } from "../components/badges.js";
import { APIEvents, config, configData, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { filterBy, sortBy, sortMethods } from "../functions/sortFilter.js";
import { showComments } from "../components/comments.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { delay } from "../functions/delay.js";
import { cheevoImageUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { infiniteLineScrolling } from "../functions/infiniteLineScrolling.js";
import { generateMagicLineText } from "../functions/tickerTextGenerator.js";
import { inputTypes } from "../components/inputElements.js";
import { scrollElementIntoView } from "../functions/scrollingToElement.js";
import { getHoveredEdge } from "../functions/hoveredEdges.js";
import { moveDirections } from "../enums/moveDirections.js";
import { progressionBarHtml, updateProgressionBar } from "../components/statusWidget/progressionBar.js";
import { progressBarHtml, updateProgressBarData } from "../components/statusWidget/progressBar.js";
import { PROGRESS_TYPES } from "../enums/progressBar.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { resizerHtml } from "../components/resizer.js";
import { tickerHtml } from "../components/statusWidget/ticker.js";
import { richPresenceHtml } from "../components/statusWidget/richPresence.js";
import { indicatorHtml } from "../components/statusWidget/statusIndicator.js";
import { statusStyles } from "../enums/statusThemes.js";
import { alertHtml, hideAlert, showAlert } from "../components/statusWidget/alert.js";
import { gameInfoHtml } from "../components/statusWidget/gameInfo.js";
import { timePosition } from "../enums/timePosition.js";
import { GAME_INFO_TYPES } from "../enums/gameInfoTypes.js";
import { gameInfoIconsHtml, richInfoHtml } from "../components/statusWidget/gameInfoIcons.js";
import { sweepEffect } from "../components/windowEffects.js";
import { getCheevosCount, getPointsCount, getRetropointsCount } from "../functions/gameProperties.js";
import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { parseTimeParts } from "../functions/time.js";
import { createAutoScroll } from "../functions/autosScroll.js";
import { getRandomID } from "../functions/randomID.js";
import { focusCheevoHtml } from "../components/statusWidget/focusCheevo.js";

export class Status extends Widget {

    ACHIV_DURATION = 15000;

    widgetIcon = {
        description: "status widget",
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
                        id: "show-game-info",
                        label: ui.lang.infoPanel,
                        checked: this.uiProps.showGameInfo,
                        onChange: (event) => this.uiProps.showGameInfo = event.currentTarget.checked,
                    },
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
                        label: `${ui.lang.cheevos} ${ui.lang.progressbar}`,
                        checked: this.uiProps.showProgressbar,
                        onChange: (event) => this.uiProps.showProgressbar = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-points-progress",
                        label: `${ui.lang.points} ${ui.lang.progressbar}`,
                        checked: this.uiProps.showPointsProgress,
                        onChange: (event) => this.uiProps.showPointsProgress = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-retropoints-progress",
                        label: `${ui.lang.retropoints} ${ui.lang.progressbar} `,
                        checked: this.uiProps.showRetropointsProgress,
                        onChange: (event) => this.uiProps.showRetropointsProgress = event.currentTarget.checked,
                    },
                ],
            } : "",
            {
                label: ui.lang.infoPanel,
                elements: [...Object.values(GAME_INFO_TYPES).map(type =>
                ({
                    type: inputTypes.RADIO,
                    name: "info-type",
                    id: `info-type-${type}`,
                    label: ui.lang?.[type] ?? type,
                    checked: this.uiProps.gameInfoType == type,
                    onChange: () => this.uiProps.gameInfoType = type,
                })
                ),
                {
                    type: inputTypes.CHECKBOX,
                    name: "info-type-switch",
                    id: `info-type-switch`,
                    label: ui.lang.switchProgressionIfBeaten,
                    hint: ui.lang.switchProgressionIfBeatenHint,
                    checked: this.uiProps.switchProgressionIfBeaten,
                    onChange: (event) => this.uiProps.switchProgressionIfBeaten = event.currentTarget.checked,
                }
                ]
            },
            {
                label: ui.lang.progressbar,
                elements: [
                    //  [...Object.values(PROGRESS_TYPES).map(type =>
                    // ({
                    //     type: inputTypes.RADIO,
                    //     name: "progressbar-type",
                    //     id: `progressbar-type-${type}`,
                    //     label: ui.lang?.[type] ?? type,
                    //     checked: this.uiProps.progressType == type,
                    //     onChange: () => this.uiProps.progressType = type,
                    // })
                    // ),
                    ...Object.values(statusStyles).map(theme =>
                    ({
                        type: inputTypes.RADIO,
                        name: "status-theme",
                        id: `status-theme-${theme}`,
                        label: ui.lang?.[theme] ?? theme,
                        checked: this.uiProps.statusTheme == theme,
                        onChange: () => this.uiProps.statusTheme = theme,
                    })
                    ),
                    {
                        type: inputTypes.CHECKBOX,
                        name: "progressbar-sessions",
                        id: `progressbar-sessions`,
                        label: ui.lang.progressBySession,
                        checked: this.uiProps.progressBySession == true,
                        onChange: (event) => this.uiProps.progressBySession = event.currentTarget.checked,
                        hint: ui.lang.progressBySessionHint,
                    }
                ]
            },
            {
                label: ui.lang.style,
                elements: [
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
                    {
                        type: inputTypes.CHECKBOX,
                        id: "blink-on-update",
                        label: ui.lang.blinkOnUpdate,
                        checked: this.uiProps.blinkOnUpdate,
                        onChange: (event) => this.uiProps.blinkOnUpdate = event.currentTarget.checked,
                    },
                ]
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
                        value: ~~(parseFloat(this.uiProps.timerTime) / 60 * 100) / 100,
                        onInput: (event) => this.uiProps.timerTime = event.currentTarget.value,
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
                label: ui.lang.autoscroll,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "rp-scroll-title",
                        label: ui.lang.title,
                        checked: this.uiProps.scrollTitle,
                        onChange: (event) => this.uiProps.scrollTitle = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "rp-scroll-rp",
                        label: ui.lang.richPresence,
                        checked: this.uiProps.scrollRP,
                        onChange: (event) => this.uiProps.scrollRP = event.currentTarget.checked,
                    },
                    {
                        prefix: ui.lang.scrollSpeed,
                        postfix: "px/s",
                        type: inputTypes.NUM_INPUT,
                        id: "menu_scroll-speed",
                        hint: ui.lang.scrollSpeed,
                        value: this.uiProps.scrollSpeed,
                        onInput: (event) => this.uiProps.scrollSpeed = event.currentTarget.value,
                    },
                    {
                        prefix: ui.lang.scrollPauseDuration,
                        postfix: "sec",
                        type: inputTypes.NUM_INPUT,
                        id: "menu_scroll-pause-dur",
                        hint: ui.lang.scrollPauseDuration,
                        value: this.uiProps.scrollPauseDuration,
                        onInput: (event) => this.uiProps.scrollPauseDuration = event.currentTarget.value,
                    },
                ]
            },
            {
                type: inputTypes.CHECKBOX,
                name: "rp-hardmode",
                id: `rp-hardmode`,
                label: ui.lang.hardcoreMode,
                checked: this.uiProps.isHardMode,
                onChange: (event) => this.uiProps.isHardMode = event.currentTarget.checked,
            }

        ];
    }
    contextSetsMenu = () => Object.values(watcher.GAME_DATA?.availableSubsets ?? {})?.length > 1 ? {
        label: ui.lang.subsets,
        elements: Object.entries(watcher.GAME_DATA?.availableSubsets).map(([subsetName, subsetID]) => {
            subsetID = parseInt(subsetID);
            const isCurrentSet = subsetID === watcher.GAME_DATA.ID;
            if (isCurrentSet || !subsetID) return "";
            const isVisible = config.gameConfig().visibleSubsets?.includes(subsetID);
            const checked = isCurrentSet || isVisible;
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
        showGameInfo: true,
        showRichPresence: true,
        showTicker: true,
        showProgressbar: true,
        showPointsProgress: false,
        showRetropointsProgress: false,
        showProgression: true,
        progressType: PROGRESS_TYPES.cheevos,
        statusTheme: statusStyles.DEFAULT,
        timePosition: timePosition.normal,
        gameInfoType: GAME_INFO_TYPES.icons,
        showGameBg: false,
        showTargetPreview: false,
        switchProgressionIfBeaten: true,
        blinkOnUpdate: true,
        scrollRP: false,
        scrollTitle: true,
        scrollSpeed: 20,
        scrollPauseDuration: 15,
        progressBySession: true,
        isHardMode: true,
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
            this.updateTime();
        },
        showTicker(value) {
            this.setElementsValues();
            value ? this.updateTicker() : this.ticker?.stopScrolling();
        },
        progressType() {
            this.updateGameInfo();
        },
        gameInfoType() {
            this.updateGameInfo();
        },
        showTargetPreview() {
            this.updateFocusPreview();
        },
        switchProgressionIfBeaten() {
            this.updateGameInfo();
        },
        scrollTitle() {
            this.setElementsValues();
            this.startElementsAutoscroll(0);
        },
        scrollRP() {
            this.setElementsValues();
            this.startElementsAutoscroll(0);
        },
        scrollSpeed(value) {
            value = value < 10 ? 10 : value;
            Object.values(this.autoscrollIntervals ?? {}).forEach(scr => scr.setSpeed(value));
            this.ticker?.setSpeed(value);
        },
        scrollPauseDuration(value) {
            value = value < 0 ? 0 : value;
        },
        isHardMode() {
            this.updateProgressionBar();
            this.updateFocusPreview();
            this.updateProgressBar();
        }
    };

    uiValuePreprocessors = {
        timerTime(value) {
            if (value <= 0) value = 1;
            if (value > 24 * 60) value = 24 * 60;
            return value * 60;
        },
        scrollSpeed(value) {
            return (value <= 10) ? 10 : value;
        },
        scrollPauseDuration(value) {
            return value < 0 ? 0 : value;
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
        this.applyPosition();
        this.setElementsValues();
        this.addEvents();
    }
    setWidgetData(widgetName, isLegacy) {
        this.widgetName = widgetName;
        this.theme = isLegacy ? Status.themes.legacy : Status.themes.default;
        this.widgetIcon = {
            description: "status widget",
            iconClass: "status-icon",
            badgeLabel: isLegacy && "compact",
        };
    }
    initializeElements(widget) {
        this.section = widget;
        this.sectionID = widget.id;
        this.watchButton = widget.querySelector("#rp__watch-button");
        this.indicatorElement = widget.querySelector(".rp__indicator");
        this.gameElements = {
            icon: widget.querySelector(".rp__game-image"),

            title: widget.querySelector(".rp__game-title"),
            platform: widget.querySelector(".rp__game-platform"),
            gameIcons: widget.querySelector(".rp__game-icons"),
            time: widget.querySelector(".rp__game-time"),
            timeElements: {
                hoursElement: widget.querySelector(".rp__time-hours"),
                minutesElement: widget.querySelector(".rp__time-minutes"),
                secondsElement: widget.querySelector(".rp__time-seconds"),
                markElement: widget.querySelector(".rp__time-mark"),
            }

        }
        this.alertElements = {
            container: widget.querySelector(".rp__alert-container"),
        }
        this.richPresenceElement = widget.querySelector(".rp__rich-presence");
        this.progressionContainer = widget.querySelector(".rp__progression-container")

        this.progressbarElements = {
            container: widget.querySelector(".rp__progressbar-container"),
            title: widget.querySelector(".rp__progressbar-title"),
            lastCheevos: widget.querySelector(".rp__last-cheevos"),
        }
        this.tickerElement = widget.querySelector(".rp__ticker");

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
                <!--${focusCheevoHtml()}-->
                ${progressionBarHtml()}
                ${progressBarHtml(PROGRESS_TYPES.cheevos)}
                ${progressBarHtml(PROGRESS_TYPES.points)}
                ${progressBarHtml(PROGRESS_TYPES.retropoints)}
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
    onGameChange({ gameData, isNewGame, isWatching }) {
        // this.addAlertsToQuery([{ type: ALERT_TYPES.GAME, value: watcher.GAME_DATA }]);
        if (isNewGame && isWatching) {
            this.addAlertsToQuery([{ type: ALERT_TYPES.GAME, value: gameData }]);
        }
        this.updateHardMode();
        this.fillGameData();
        this.doUpdateAnimation();
        this.updateTicker();
        this.startElementsAutoscroll();

    }
    updateHardMode(cheevos) {
        cheevos ??= Object.values(watcher.CHEEVOS);
        const lastEarned = cheevos?.sort((a, b) => sortBy.latest(a, b))[0] ?? {};
        const isHardMode = lastEarned.isEarnedHardcore || !lastEarned.isEarned;
        if (this.uiProps.isHardMode === isHardMode) return;
        this.uiProps.isHardMode = isHardMode;
    }
    onCheevoUnlocks({ cheevos }) {
        if (!cheevos?.length) return;
        const pushCheevoAlerts = (cheevos) => {
            const cheevoAlerts = cheevos
                .map(cheevo => ({
                    type: ALERT_TYPES.CHEEVO,
                    value: cheevo
                }));
            this.addAlertsToQuery(cheevoAlerts);
        }
        this.uiProps.isHardMode = cheevos[0].isEarnedHardcore;

        this.updateProgressionBar();
        this.updateFocusPreview();
        this.updateProgressBar();
        this.updateTicker();
        this.doUpdateAnimation();

        pushCheevoAlerts(cheevos);

    }
    onAwardsEarned({ awardsArray }) {
        if (!awardsArray?.length) return;
        this.addAlertsToQuery(awardsArray);
        this.updateProgressionBar();
        this.updateProgressBar();
    }
    onStartSession({ }) {
        this.timeWatcher().start();
        this.watchButton.classList.add("active");
    }
    onStopSession() {
        this.timeWatcher().stop();
        this.watchButton.classList.remove("active");
    }
    onStatsUpdate({ userData }) {
        const { richPresence } = userData;
        this.updateRichPresence(richPresence);
    }
    onAPIRequest() {
        this.blinkUpdate();
    }
    setElementsValues() {
        const addScrollableFlags = () => {
            this.section.querySelectorAll(".rp__rich-presence").forEach(rp => rp.classList.toggle("autoscroll", this.uiProps.scrollRP));
            this.section.querySelector(".rp__game-title").classList.toggle("autoscroll", this.uiProps.scrollTitle);
        }
        this.section.classList.toggle("hide-game-info", !this.uiProps.showGameInfo)
        this.section.classList.toggle("show-ticker", this.uiProps.showTicker);
        this.section.classList.toggle("show-progression", this.uiProps.showProgression);
        this.section.classList.toggle("show-progressbar", this.uiProps.showProgressbar);
        this.section.classList.toggle("show-points-progress", this.uiProps.showPointsProgress);
        this.section.classList.toggle("show-retropoints-progress", this.uiProps.showRetropointsProgress);
        this.richPresenceElement?.classList.toggle("hidden", !this.uiProps.showRichPresence)
        this.gameElements.time && (this.gameElements.time.dataset.position = this.uiProps.timePosition);

        this.section.dataset.theme = this.uiProps.statusTheme ?? statusStyles.DEFAULT;
        this.section.classList.toggle("game-bg", this.uiProps.showGameBg);
        this.section.classList.toggle("progress-by-session", this.uiProps.progressBySession);
        addScrollableFlags();
    }
    doUpdateAnimation() {
        if (this.theme === Status.themes.legacy) return;
        sweepEffect(this.section);
    }

    updateTicker() {
        if (!this.tickerElement) return;
        this.ticker?.stopScrolling();
        this.ticker = infiniteLineScrolling({
            container: this.tickerElement,
            textGenerator: () =>
                generateMagicLineText(watcher.GAME_DATA, watcher.sessionData, watcher.userData),
            speed: this.uiProps.scrollSpeed,
        });
        this.uiProps.showTicker && this.ticker.startScrolling();
    }
    updateFocusPreview() {
        const isHardMode = this.uiProps.isHardMode;
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
                updateProgressionBar(container, watcher?.GAME_DATA, this.uiProps.isHardMode);

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
                this.uiProps.isHardMode,
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
            const platformElement = this.section.querySelector(".rp__game-platform");
            const iconsContainerElement = this.section.querySelector(".rp__game-icons");

            if (platformElement) platformElement.innerHTML = signedIcons.platform(ConsoleID);
            if (iconsContainerElement) iconsContainerElement.innerHTML = `
                    ${signedIcons.cheevos(NumAchievements)}
                    ${signedIcons.points(totalPoints)}
                    ${signedIcons.retroRatio(retroRatio)}
                `;
        }
        switch (this.uiProps.gameInfoType) {
            case GAME_INFO_TYPES.progressbar:
                gameInfoContent.innerHTML = progressBarHtml(this.uiProps.progressType);
                this.updateProgressBar();
                break;
            case GAME_INFO_TYPES.progression:
                const isProgressbarVisible = this.uiProps.showProgressbar;
                const isGameBeaten = watcher.GAME_DATA.progressionAward === GAME_AWARD_TYPES.BEATEN;
                const isProgressionAvailable = watcher.GAME_DATA.progressionSteps || watcher.GAME_DATA.subsetsData?.progressionSteps;

                if (this.uiProps.switchProgressionIfBeaten && (isGameBeaten || !isProgressionAvailable) && !isProgressbarVisible) {
                    gameInfoContent.innerHTML = progressBarHtml();
                    this.updateProgressBar(this.uiProps.progressType);
                }
                else {
                    gameInfoContent.innerHTML = progressionBarHtml();
                    this.updateProgressionBar();
                }
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
        this.setElementsValues();
    }
    updateTime() {
        const timeSeconds = watcher.getActiveTime(this.uiProps.time, this.uiProps.timerTime);
        const timeParts = parseTimeParts(timeSeconds);

        const { hours, minutes, seconds, isNegative } = timeParts;

        const { hoursElement, minutesElement, secondsElement, markElement } = this.gameElements.timeElements;
        hoursElement.classList.toggle("hidden", hours == 0);
        secondsElement.classList.toggle("hidden", hours > 0);

        markElement.innerText = isNegative ? "-" : "";
        hoursElement.innerText = hours;
        minutesElement.innerText = minutes;
        secondsElement.innerText = seconds;

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
        }

        fillGameInfoData();
        this.updateTime();
        this.updateRichPresence();
        this.updateGameInfo();
        this.updateProgressionBar();
        this.updateFocusPreview();
        this.updateProgressBar();
    }
    updateRichPresence(richPresenceText) {
        this.section.querySelectorAll(".rp__rich-presence")?.forEach(el => {
            const message = richPresenceText || ui.lang.richPresence;
            el.innerHTML = message.replace(
                /\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu,
                (emoji) => `<span class="emoji">${emoji}</span>`);
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

        this.section.classList.toggle("watching", watcher.isOnline && watcher.isActive);
        const start = () => {
            this.timeWatcher().stop();
            this.indicatorElement.classList.add("online");
            this.gameTimeInterval = setInterval(() => {
                if (this.uiProps.time === "timer" && watcher.playTime.timer < 0) {
                    this.section.classList.add("timer-timeout");
                }
                this.updateTime();

            }, 1000)
        }
        const stop = () => {
            this.gameTimeInterval && clearInterval(this.gameTimeInterval);
            this.indicatorElement.classList.remove("offline", "online", "error", "blink");
        }
        return { start, stop };
    }

    blinkUpdate() {
        const { isOnline, isWatching, isLogOK } = watcher;
        const { pauseIfOffline } = configData;
        // this.indicatorElement.classList.remove("offline", "blink");
        this.section.classList.toggle("offline", !isOnline);
        this.section.classList.toggle("watching", isWatching && (isOnline || !pauseIfOffline));
        this.indicatorElement.classList.toggle("offline", !isOnline);
        this.indicatorElement.classList.toggle("online", isOnline);
        this.indicatorElement.classList.toggle("blink", this.uiProps.blinkOnUpdate);
        this.indicatorElement.classList.toggle("realtime", (isOnline && isLogOK))
        setTimeout(() => this.indicatorElement.classList.remove("blink"), 500);
    }
    async startElementsAutoscroll(delaySec = 10) {
        await delay(delaySec * 1e3);
        this.stopAllAutoscrolls();
        const elements = this.section.querySelectorAll(".autoscroll");
        elements.forEach(element => {
            this.startAutoScrollElement(element)
        });
    }
    autoscrollIntervals = {};
    _getScrollId(element) {
        element.dataset.autoscrollId ??= getRandomID();
        return element.dataset.autoscrollId;
    }
    startAutoScrollElement(element) {
        if (!element) return;
        const containerID = this._getScrollId(element);
        this.autoscrollIntervals[containerID] ??= createAutoScroll(element, {
            axis: "x",
            speed: this.uiProps.scrollSpeed,
            pauseOnEndMs: this.uiProps.scrollPauseDuration * 1e3,
        });
        this.autoscrollIntervals[containerID].start();
    }
    stopAutoScrollElement(element, reset = false) {
        const containerID = this._getScrollId(element);
        this.autoscrollIntervals[containerID]?.stop();
    }
    stopAllAutoscrolls() {
        Object.values(this.autoscrollIntervals).forEach(scr => scr.stop(true))
    }
}