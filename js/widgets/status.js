import { UI } from "../ui.js";

import { alertTypes } from "../enums/alerts.js";

import { icons, signedIcons } from "../components/icons.js"

import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";

import { config, configData, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { filterBy, sortBy } from "../functions/sortFilter.js";
import { showComments } from "../components/comments.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { delay } from "../functions/delay.js";
import { RAPlatforms } from "../enums/RAPlatforms.js";
import { formatTime } from "../functions/time.js";
import { gamePropsPopup } from "../components/gamePropsPopup.js";
import { cheevoTypes } from "../enums/cheevoTypes.js";
import { cheevoImageUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { infiniteLineScrolling } from "../functions/infiniteLineScrolling.js";
import { generateMagicLineText } from "../functions/tickerTextGenerator.js";
import { inputTypes } from "../components/inputElements.js";
import { getHoveredEdge } from "../functions/hoveredEdges.js";
import { moveDirections } from "../enums/moveDirections.js";
export class StatusPanel extends Widget {
    widgetIcon = {
        description: "status widget",
        iconID: `side-panel__status`,
        onChangeEvent: `ui.statusPanel.VISIBLE = this.checked`,
        badgeLabel: "legacy",
        iconClass: "status-icon",
    };
    get contextMenuItems() {
        return [
            {
                label: ui.lang.gameTime,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-time",
                        label: ui.lang.showTimeBar,
                        checked: this.uiProps.showTimeBar,
                        event: `onchange="ui.statusPanel.uiProps.showTimeBar = this.checked;"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "game-time",
                        id: "show-playTime",
                        label: ui.lang.gameTime,
                        checked: this.uiProps.time == "playTime",
                        event: `onclick="ui.statusPanel.uiProps.time = 'playTime';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "game-time",
                        id: "show-sessionTime",
                        label: ui.lang.sessionGameTime,
                        checked: this.uiProps.time == "sessionTime",
                        event: `onclick="ui.statusPanel.uiProps.time = 'sessionTime';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "game-time",
                        id: "show-full-time",
                        label: ui.lang.totalTime,
                        checked: this.uiProps.time == "totalSessionTime",
                        event: `onclick="ui.statusPanel.uiProps.time = 'totalSessionTime';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "game-time",
                        id: "show-timer",
                        label: ui.lang.timer,
                        checked: this.uiProps.time == "timer",
                        event: `onclick="ui.statusPanel.uiProps.time = 'timer';"`,
                    },
                    {
                        prefix: ui.lang.timer,
                        postfix: ui.lang.min,
                        type: inputTypes.NUM_INPUT,
                        id: "context-menu_stats-timer-duration",
                        label: ui.lang.timer,
                        value: ~~(this.uiProps.timerTime / 60 * 100) / 100,
                        event: `onchange="ui.statusPanel.uiProps.timerTime = this.value;"`,
                        onChange: "ui.statusPanel.uiProps.timerTime = this.value;",
                    },


                ],
            },
            {
                label: ui.lang.elements,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-target-preview",
                        label: ui.lang.focusCheevoPreview,
                        checked: this.uiProps.showTargetPreview,
                        event: `onchange="ui.statusPanel.uiProps.showTargetPreview = this.checked;"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "description-variant-radio",
                        id: "show-progression-description",
                        label: ui.lang.progression,
                        checked: this.uiProps.statusDescriptionVariant === "progression",
                        event: `onchange="ui.statusPanel.uiProps.statusDescriptionVariant = 'progression';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "description-variant-radio",
                        id: "show-game-info-description",
                        label: ui.lang.richPresence,
                        checked: this.uiProps.statusDescriptionVariant === "gameInfo",
                        event: `onchange="ui.statusPanel.uiProps.statusDescriptionVariant = 'gameInfo';"`,
                    },

                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-mastery-rate",
                        label: ui.lang.showMasteryRate,
                        checked: this.uiProps.showMasteryRate,
                        event: `onclick="ui.statusPanel.uiProps.showMasteryRate = this.checked;"`,
                    },

                ],
            },
            {
                label: ui.lang.progressionStyleTypes,
                elements: [
                    {
                        type: inputTypes.RADIO,
                        name: "progression-variant",
                        id: "progression-variant-dots",
                        label: ui.lang.dots,
                        checked: this.uiProps.progressionVariant === "dots",
                        event: `onchange="ui.statusPanel.uiProps.progressionVariant = 'dots';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "progression-variant",
                        id: "progression-variant-rects",
                        label: ui.lang.rects,
                        checked: this.uiProps.progressionVariant === "rects",
                        event: `onchange="ui.statusPanel.uiProps.progressionVariant = 'rects';"`,
                    },
                ]
            },
            {
                label: ui.lang.alerts,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-new-cheevos",
                        label: ui.lang.showAlerts,
                        checked: this.uiProps.showNewAchiv,
                        event: `onchange="ui.statusPanel.uiProps.showNewAchiv = this.checked;"`,
                    },
                    {
                        prefix: ui.lang.duration,
                        postfix: ui.lang.sec,
                        type: inputTypes.NUM_INPUT,
                        id: "context-menu_stats-earned-duration",
                        label: ui.lang.duration,
                        value: this.uiProps.newAchivDuration,
                        event: `onchange="ui.statusPanel.uiProps.newAchivDuration = this.value;"`,
                        onChange: "ui.statusPanel.uiProps.newAchivDuration = this.value;",
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-stats-alert",
                        label: ui.lang.statsAlerts,
                        checked: this.uiProps.showStatisticsAlert,
                        event: `onchange="ui.statusPanel.uiProps.showStatisticsAlert = this.checked;"`,
                    },
                ],
            },
            {
                type: inputTypes.CHECKBOX,
                id: "show-update-blink",
                label: ui.lang.showUpdateBlink,
                checked: this.uiProps.showUpdateBlink,
                event: `onchange="ui.statusPanel.uiProps.showUpdateBlink = this.checked;"`,
            },
            {
                type: inputTypes.CHECKBOX,
                id: "hard-mode",
                label: ui.lang.hardcoreMode,
                checked: this.uiProps.hardMode,
                event: `onchange="ui.statusPanel.uiProps.hardMode = this.checked; ui.statusPanel.generateProgressionBlock()"`,
            },
            {
                type: inputTypes.CHECKBOX,
                id: "game-bg",
                label: ui.lang.gameBg,
                checked: this.uiProps.showGameBg,
                event: `onchange="ui.statusPanel.uiProps.showGameBg = this.checked;"`,
            },
        ];
    }
    uiProps = new Proxy({}, {
        get: (_, property) => {
            const defValue = this.uiDefaultValues[property] ?? true;
            return config.getUIProperty({ sectionID: this.sectionID, property }) ?? defValue;
        },
        set: (_, property, value) => {
            const preprocessor = this.uiValuePreprocessors[property];
            if (typeof preprocessor === 'function') {
                value = preprocessor(value);
            }

            config.saveUIProperty({ sectionID: this.sectionID, property, value });

            const callback = this.uiSetCallbacks?.[property];
            if (typeof callback === 'function') {
                callback.call(this, value);
            }
            else {
                this.setElementsValues();
            }
            return true;
        }
    });
    uiDefaultValues = {
        newAchivDuration: 15,
        time: "playTime",
        timerTime: 30,
        showTargetPreview: false,
        progressionVariant: "dots",
        showMasteryRate: true,
        showGameBg: true,
        showTimeBar: true,
        statusDescriptionVariant: "progression",
        hardMode: true,
        showNewAchiv: true,
        showUpdateBlink: true,
    }
    uiSetCallbacks = {
        showStatisticsAlert() {
        },
        showNewAchiv() {
        },
        time() {
            this.startStatsAnimation();
        },
        timerTime() {
            this.startStatsAnimation();
        },
        statusDescriptionVariant(value) {
            const statusVariants = {
                gameInfo: "show-game-info",
                progression: "show-game-progress"
            }
            Object.values(statusVariants).forEach(value => this.section.classList.remove(value))
            this.section.classList.add(statusVariants[value]);
        },
        showTargetPreview() {
            this.generateProgressionBlock();
        },
        progressionVariant() {
            this.generateProgressionBlock()
        },
        showGameBg() {
            this.container.classList.toggle("game-bg", this.SHOW_GAME_BG);
        }
    };
    uiValuePreprocessors = {
        newAchivDuration(value) {
            return (value <= 5 || value > 60) ? 5 : value;
        },
        timerTime(value) {
            return value <= 5 || value > 10e5 ? 5 : value * 60
            this.timerTime = this.TIMER_TIME;
        },
    };


    stats = {
        userName: configData.targetUser,
        gameTitle: watcher.GAME_DATA?.Title ?? "Title",
        gamePlatform: watcher.GAME_DATA?.ConsoleName ?? "Platform",
        richPresence: "Waiting...",
        imageSrc: gameImageUrl(watcher.GAME_DATA?.ImageIcon),
        totalPoints: watcher.GAME_DATA?.totalPoints ?? 0,
        totalAchievesCount: watcher.GAME_DATA?.NumAchievements ?? 0,
        totalSoftpoints: 0,
        earnedPoints: 0,
        earnedAchievesCount: 0,
        totalRetropoints: watcher.GAME_DATA?.totalRetropoints,
        earnedRetropoints: 0,
        earnedSoftpoints: 0,
        showStatisticsAlert: true,
    }
    awards = {
        award: "",
        progressionAward: "",
    }

    gameTimeInterval;

    getActiveTime = () => {
        let time = 0;

        switch (this.uiProps.time) {
            case ("playTime"):
                time = watcher.playTime.totalGameTime;
                break;
            case ("sessionTime"):
                time = watcher.playTime.gameTime;
                break;
            case ("totalSessionTime"):
                time = watcher.playTime.sessionTime;
                time = time < 0 ? 0 : time;
                break;
            case ("timer"):
                time = this.uiProps.timerTime - watcher.playTime.gameTime;
                break;
        }

        return formatTime(time, true);
    }
    get statusTextValues() {
        const statusObj = {}
        this.uiProps.time && (statusObj.gameTime = this.getActiveTime())
        return statusObj;
    }
    constructor() {
        super();
        this.addWidgetIcon();
        !config.ui.update_section && (config.ui.update_section = {});

        this.initializeElements();
        this.addEvents();
        UI.applyPosition({ widget: this });


        this.infiniteLine = infiniteLineScrolling({ container: this.section.querySelector("#magic-line"), textGenerator: generateMagicLineText });

        setTimeout(() => {
            this.fitFontSize();
        }, 1000);

    }
    initializeElements() {
        this.section = document.querySelector("#update-section");
        this.sectionID = this.section.id;
        this.container = this.section.querySelector(".status__container");
        this.guideLink = this.section.querySelector("#status-game-guide");
        this.progresBar = this.section.querySelector("#status-progress-bar");
        this.progresBarDelta = this.section.querySelector("#status_progress-bar-delta");
        this.progressStatusText = this.section.querySelector("#status-progress-text");
        this.resizer = this.section.querySelector("#status-resizer");
        this.frontSide = {
            container: this.section.querySelector(".status__front-side"),
            gamePreview: this.section.querySelector("#game-preview"),
            retroRatioElement: this.section.querySelector(".status__retro-ratio"),
            gameTitle: this.section.querySelector("#game-title"),
            gamePlatform: this.section.querySelector("#game-platform"),
            richPresence: this.section.querySelector("#rich-presence"),
            watchButton: this.section.querySelector("#watching-button"),
            sideBlock: this.section.querySelector(".status__sideblock-container"),
            iconsContainer: this.section.querySelector("#status__sideblock-icons"),
        }
        this.backSide = {
            container: this.section.querySelector(".status__back-side"),
            imgElement: this.section.querySelector("#update_achiv-preview"),
            titleElement: this.section.querySelector("#update_achiv-title"),
            descriptionElement: this.section.querySelector("#update_achiv-description"),
            badgesElement: this.section.querySelector("#update_achiv-earned-points"),
        }
    }
    setElementsValues() {
        const fillStatusbarData = () => {
            //main information
            const { ImageIcon, Title, ConsoleName, ConsoleID, badges, ID, GuideURL } = watcher.GAME_DATA;
            const { gamePreview, gameTitle, gamePlatform, richPresence } = this.frontSide;

            gamePreview.setAttribute(
                "src",
                gameImageUrl(ImageIcon)
            );

            gameTitle.innerHTML = `
                <a target="_blank" class="status__game-title" href="${gameUrl(ID)}">${Title}</a>
                ${generateBadges(badges)} 
                ${generateBadges([RAPlatforms[ConsoleID || 1].Name])}

            `;
            setTimeout(() => {
                this.startAutoScrollElement(gameTitle, true, 60 * 1000);
                this.startAutoScrollElement(richPresence, true, 60 * 1000);
            }, 10000);

            this.guideLink.setAttribute('href', GuideURL);
            this.guideLink.classList.toggle("hidden", !GuideURL);

            gamePlatform.innerText = ConsoleName || "";

            this.generateProgressionBlock();
        }
        const setClasses = () => {
            this.container.classList.toggle("show-game-ratio", this.uiProps.showMasteryRate);
            this.container.classList.toggle("game-bg", this.uiProps.showGameBg);
            this.container.classList.toggle("show-time-bar", this.uiProps.showTimeBar);
        }
        const setRatioBadge = () => {
            const masteryRate = watcher.GAME_DATA.masteryRate;
            this.frontSide.retroRatioElement.innerText = masteryRate;
            this.frontSide.retroRatioElement.className = `status__retro-ratio badge badge-gold`;
        }
        this.uiProps.statusDescriptionVariant = this.uiProps.statusDescriptionVariant;
        this.progressStatusText.innerText = "";
        const imageSrc = watcher.GAME_DATA.ImageIngame; //"/Images/005200.png";//
        this.container.style.setProperty("--bg-image", `url(${gameImageUrl(imageSrc)})`);

        setClasses();
        setRatioBadge();
        fillStatusbarData();
        this.fillSidebarIcons();
        this.startStatsAnimation();

    }

    addEvents() {
        this.section.addEventListener("mousemove", (event) => {
            this.section.classList.remove(...Object.values(moveDirections).map(dir => "hover-" + dir), "resize-hover");
            const hoveredEdge = getHoveredEdge(event, this.section)
            hoveredEdge && this.section.classList.add(`hover-${hoveredEdge}`, "resize-hover");

        })
        this.section.addEventListener("mousedown", (event) => {
            const hoveredEdge = getHoveredEdge(event, this.section);
            if (event.target.matches(".resizer") || hoveredEdge) {
                event.stopPropagation();
                this.section.classList.add("resized");
                resizeEvent({
                    event: event,
                    section: this.section,
                    callback: () => this.fitFontSize(true),
                    resizeDirection: event.target.matches(".resizer") ?
                        moveDirections.bottomRight :
                        hoveredEdge,
                });
            }
            else if (event.target.matches(".status__watch-button")) {
                event.stopPropagation();
                watcher.isActive ?
                    watcher.stop() : watcher.start();
            }
            else if (event.target.matches(".comments-button")) {
                event.stopPropagation();
                showComments(watcher.GAME_DATA?.ID, 1);
            }
            else if (event.target.matches(".game-props-button")) {
                event.stopPropagation();
                gamePropsPopup().open(watcher.GAME_DATA);
            }

            else if (event.target.matches(".close-icon")) {
                event.stopPropagation();
                this.close();
            }
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

    }
    fillSidebarIcons() {
        const unlockData = this.uiProps.hardMode ? { ...watcher.GAME_DATA.unlockData.hardcore } : { ...watcher.GAME_DATA.unlockData.softcore };
        this.frontSide.iconsContainer.innerHTML = `
            <p class="signed-icon auto-font-size" data-title="${ui.lang.cheevosCount}">
                ${icons.cheevos}
                ${unlockData.count}/${watcher.GAME_DATA.NumAchievements}
            </p>

            <p class="signed-icon auto-font-size" data-title="${ui.lang.points}">
                ${icons.points}
                ${unlockData.points}/${watcher.GAME_DATA.totalPoints}
            </p>
            <p class="signed-icon auto-font-size" data-title="${ui.lang.trueRatio}">
                ${icons.trueratio}
                ${watcher.GAME_DATA.retroRatio}
            </p>
            <p class="signed-icon auto-font-size" data-title="${ui.lang.retropoints}">
                ${icons.retropoints}
                ${unlockData.retropoints}/${watcher.GAME_DATA.totalRetropoints}
            </p>
        `;
    }
    updateGameData(isNewGame = false) {
        this.stats = {
            userName: configData.targetUser,
            gameTitle: watcher.GAME_DATA?.Title ?? "Title",
            gamePlatform: watcher.GAME_DATA?.ConsoleName ?? "Platform",
            richPresence: "Waiting...",
            imageSrc: gameImageUrl(watcher.GAME_DATA?.ImageIcon),
            totalPoints: watcher.GAME_DATA?.totalPoints ?? 0,
            totalSoftPoints: watcher.GAME_DATA.totalPoints - watcher.GAME_DATA.unlockData.softcore.points,
            totalAchievesCount: watcher.GAME_DATA?.NumAchievements ?? 0,
            totalProgressionCount: watcher.GAME_DATA?.progressionSteps,
            earnedPoints: watcher.GAME_DATA.unlockData.hardcore.points,
            earnedAchievesCount: watcher.GAME_DATA.unlockData.hardcore.count,
            earnedProgressionCount: watcher.GAME_DATA.unlockData.softcore.progressionCount,
            totalRetropoints: watcher.GAME_DATA?.totalRetropoints,
            earnedRetropoints: watcher.GAME_DATA.unlockData.hardcore.retropoints,
            earnedSoftpoints: watcher.GAME_DATA.unlockData.softcore.points - watcher.GAME_DATA.unlockData.hardcore.points,

        }
        isNewGame && (
            this.awards.award = watcher.GAME_DATA.award,
            this.awards.progressionAward = watcher.GAME_DATA.progressionAward
        )
    }
    gameChangeEvent(isNewGame = false) {
        if (isNewGame && watcher.IS_WATCHING) {
            this.addAlertsToQuery([{ type: alertTypes.GAME, value: watcher.GAME_DATA }])
        }
        this.updateGameData(true);

        this.setElementsValues();

    }
    timeWatcher() {
        this.frontSide.watchButton.classList.toggle("active", watcher.isActive);
        this.section.classList.toggle("watching", watcher.IS_ONLINE && watcher.isActive);
        const start = () => {
            ui.statusPanel.timeWatcher().stop();
            this.gameTimeInterval = setInterval(() => {
                if (this.uiProps.time === "timer" && watcher.playTime.timer < 0) {
                    this.section.classList.add("timer-timeout");
                }
                const time = this.getActiveTime();
                const timeElement = this.section.querySelector(`.status__game-time`);

                if (timeElement && timeElement.innerHTML !== time) {
                    timeElement.innerHTML = time;
                    // this.frontSide.sideBlock.classList.toggle("long-time", time.length > 6);
                }
            }, 1000)
        }
        const stop = () => {
            this.gameTimeInterval && clearInterval(this.gameTimeInterval);
        }
        return { start, stop };
    }

    generateProgressionBlock() {
        if (this.uiProps.progressionVariant !== "dots") {
            this.uiProps.progressionVariant = "dots";
            return;
        }
        const progressionPointsElement = this.section.querySelector(".status__progression-container");
        const progressionDescriptionElement = this.section.querySelector(".status__description-text");

        const isEarned = (cheevo) => this.uiProps.hardMode ?
            (cheevo.isHardcoreEarned ? "earned" : "") :
            (cheevo.isEarned ? "earned" : "");


        const generateProgressionPoints = {
            dots: () => {
                const progressionCheevos = Object.values(watcher.CHEEVOS)
                    .filter(a => a.Type == cheevoTypes.PROGRESSION)
                    .sort((a, b) => sortBy.default(a, b));

                const winCheevos = Object.values(watcher.CHEEVOS)
                    .filter(a => a.Type == cheevoTypes.WIN);

                const progressionHtml = progressionCheevos.reduce((html, cheevo) => {
                    html += `
                            <div class="progression-point progression-point__dot  ${isEarned(cheevo)}" data-achiv-id=${cheevo.ID}></div>
                        `;
                    return html
                }, "");
                const winHtml = winCheevos?.length > 0 ? `
                        <div class="win-points win-points__dots">
                            ${winCheevos.reduce((html, cheevo) => {
                    html += `
                                <div class="progression-point progression-point__dot-win ${isEarned(cheevo)}" data-achiv-id=${cheevo.ID}></div>
                            `;
                    return html
                }, "")}
                         </div>
                        `: "";
                return progressionHtml + winHtml;
            },
            rects: () => {
                const progressionCheevos = Object.values(watcher.CHEEVOS)
                    .filter(a => a.Type == cheevoTypes.PROGRESSION)
                    .sort((a, b) => sortBy.default(a, b));

                const winCheevos = Object.values(watcher.CHEEVOS)
                    .filter(a => a.Type == cheevoTypes.WIN);

                const progressionHtml = progressionCheevos.reduce((html, cheevo) => {
                    html += `
                        <div class="rp__progression-point ${isEarned(cheevo)}" data-achiv-id=${cheevo.ID}></div>
                    `;
                    return html
                }, "");
                const winHtml = winCheevos?.length > 0 ? `
                    <div class="rp__win-points">
                        ${winCheevos.reduce((html, cheevo) => {
                    html += `
                                <div class="rp__progression-point win ${isEarned(cheevo)}" data-achiv-id=${cheevo.ID}></div>
                            `;
                    return html
                }, "")}
                     </div>
                    `: "";
                return progressionHtml + winHtml;
            }
        }

        const focusCheevo = Object.values(watcher.CHEEVOS)
            .filter(a => filterBy.progression(a))
            .sort((a, b) => sortBy.default(a, b))
            .find(a => !isEarned(a));



        progressionPointsElement.classList.remove("progression-points__dots", "progression-points__rects");
        progressionPointsElement.classList.add(`progression-points__${this.uiProps.progressionVariant}`);
        progressionPointsElement.innerHTML = generateProgressionPoints[this.uiProps.progressionVariant]();
        progressionDescriptionElement.innerHTML = focusCheevo ?
            focusCheevo.Description : watcher.GAME_DATA?.progressionAward ?
                ui.lang.gameBeatenMsg : ui.lang.noProgressionMsg;
        const focusElement = progressionPointsElement.querySelector(`[data-achiv-id="${focusCheevo?.ID}"`);
        focusElement?.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
        focusElement?.classList.add("focus");
        this.frontSide.gamePreview.src = this.uiProps.showTargetPreview && focusCheevo ?
            cheevoImageUrl(focusCheevo) :
            gameImageUrl(watcher.GAME_DATA.ImageIcon)

    }


    updateProgress({ earnedAchievementIDs }) {
        earnedAchievementIDs.length > 0 && (this.uiProps.hardMode = !!watcher.CHEEVOS[earnedAchievementIDs[0]].isHardcoreEarned);

        this.updateGameData();
        //show new achivs in statusPanel

        this.generateProgressionBlock();
        this.fillSidebarIcons();

        //push points toggle animation
        this.progresBarDelta?.classList.remove("hidden");

        setTimeout(() => this.progresBarDelta?.classList.add("hidden"), 50)
        this.initialStats && (this.initialStats.cheevosCount += earnedAchievementIDs.length);
    }
    initialStats;
    currentStats;
    deltaStats;
    updateStatistics({ userSummary: userSummary }) {
        function formatNumberWithSign(number) {
            return number == 0 ? "" : (number > 0 ? "+" : "") + number;
        }
        if (!this.initialStats) {
            this.initialStats = {
                points: userSummary.TotalPoints,
                retroPoints: userSummary.TotalTruePoints,
                softPoints: userSummary.TotalSoftcorePoints,
                rank: userSummary.Rank,
                totalRanked: userSummary.TotalRanked,
                percentile: 100 * userSummary.Rank / userSummary.TotalRanked,
                cheevosCount: 0,
            }
            this.currentStats = this.initialStats;
        }
        else {
            this.currentStats = {
                points: userSummary.TotalPoints,
                retroPoints: userSummary.TotalTruePoints,
                softPoints: userSummary.TotalSoftcorePoints,
                rank: userSummary.Rank,
                totalRanked: userSummary.TotalRanked,
                percentile: 100 * userSummary.Rank / userSummary.TotalRanked,
            }
            const dRank = this.currentStats.rank - this.initialStats.rank;
            const dPerc = (this.currentStats.percentile - this.initialStats.percentile).toFixed(3);
            const deltaStats = {
                deltaPoints: formatNumberWithSign(this.currentStats.points - this.initialStats.points),
                deltaRetroPoints: formatNumberWithSign(this.currentStats.retroPoints - this.initialStats.retroPoints),
                deltaSoftPoints: formatNumberWithSign(this.currentStats.softPoints - this.initialStats.softPoints),
                deltaRank: formatNumberWithSign(dRank),
                deltaPercentile: formatNumberWithSign(dPerc),
            }
            this.deltaStats = deltaStats;
            const statsAlert = {
                type: alertTypes.STATS, value: {
                    ...this.currentStats,
                    ...deltaStats,
                    cheevosCount: this.initialStats.cheevosCount,
                }
            };
            const queryHasStatistics = this.alertsQuery.find(alert => alert.type === alertTypes.STATS);
            !queryHasStatistics && this.addAlertsToQuery([statsAlert]);
            ui.status.addAlertsToQuery([statsAlert])
        }
    }
    alertsQuery = [];
    addAlertsToQuery(elements) {
        if (!this.uiProps.showNewAchiv) return;
        if (this.alertsQuery.length > 0) {
            this.alertsQuery = [...this.alertsQuery, ...elements];
        }
        else {
            this.alertsQuery = [...elements];
            this.startAlerts();
        }
    }
    async startAlerts() {
        const clearContainer = () => {
            this.container.classList.remove("new-game-info", "new-achiv", "new-award", "stats", "beaten", "mastered");
            this.backSide.container.classList.remove("hardcore", "beaten", "mastered", "beaten-softcore", "completed");
        }
        const glassAnimation = () => {
            const glassElement = this.section.querySelector(".status_glass-effect");
            glassElement.classList.remove("update");
            setTimeout(() => glassElement.classList.add("update"), 20);
        }
        const deltaTime = (time) => {
            const hours = ~~(time / 3600);
            const mins = ~~((time - hours * 3600) / 60);
            const timeStr = `
          ${hours > 0 ? hours == 1 ? "1 hour " : hours + " hours " : ""}
          ${hours > 0 && mins > 0 ? "and " : ""}
          ${mins > 0 ? mins == 1 ? "1 minute" : mins + " minutes" : ""}
            `;
            return timeStr;
        }
        const updateGameData = (game) => {
            const { Title,
                badges,
                ImageIcon,
                totalPoints,
                ConsoleName,
                totalRetropoints,
                NumAchievements,
                masteryRate,
                beatenRate,
            } = game;
            this.backSide.imgElement.src = gameImageUrl(ImageIcon);
            this.backSide.titleElement.innerHTML = `${Title} ${generateBadges(badges)}
            <i class="badge">${ConsoleName}</i>
            `;
            let gameInfo = `
                ${goldBadge(icons.cheevos + NumAchievements)}
                ${goldBadge(icons.points + totalPoints)}
                ${goldBadge(icons.retropoints + totalRetropoints)}
                ${goldBadge(masteryRate + "% MASTERED")}
                ${beatenRate ? goldBadge(beatenRate + "% BEATEN") : ""}
            `;
            this.backSide.descriptionElement.innerText = "";
            this.backSide.badgesElement.innerHTML = gameInfo;
            this.container.classList.add("new-game-info");
        }
        const updateAchivData = (achiv) => {
            const { isHardcoreEarned, Title, prevSrc, Points, TrueRatio, rateEarned, rateEarnedHardcore, difficulty } = achiv;
            this.backSide.imgElement.src = prevSrc;
            this.backSide.titleElement.innerHTML = Title;

            this.backSide.descriptionElement.innerText = achiv.Description;

            let earnedPoints = isHardcoreEarned ?
                `
                    ${goldBadge(icons.points + " +" + Points)}
                    ${goldBadge(icons.retropoints + " +" + TrueRatio)}
                    ${goldBadge("TOP" + rateEarnedHardcore)}
                    ${badgeElements.difficultBadge(difficulty)}
                `
                : `
                    ${goldBadge(icons.points + " +" + Points)}
                    ${goldBadge("TOP" + rateEarned)}
                    ${badgeElements.difficultBadge(difficulty)}
                `;

            let genres = achiv.genres
                ?.map(genre => goldBadge(genre))
                .join("\n") ?? "";
            this.backSide.badgesElement.innerHTML = genres + earnedPoints;

            this.backSide.container.classList.toggle("hardcore", achiv.isHardcoreEarned);
            setTimeout(() => this.container.classList.add("new-achiv"), 2000)
        }
        const updateAwardData = (game, award) => {
            const { Title,
                badges,
                ImageIcon,
                totalPoints,
                unlockData,
                totalRetropoints,
                masteryRate,
                beatenRate,
                completedRate,
                beatenRateSoftcore,
                ID,
                NumAchievements,
                TimePlayed
            } = game;
            // let award = 'mastered';
            const awardRate = award == 'mastered' ? masteryRate :
                award == 'beaten' ? beatenRate :
                    award == 'completed' ? completedRate : beatenRateSoftcore;

            const playTimeInMinutes = deltaTime(TimePlayed);
            this.backSide.imgElement.src = gameImageUrl(ImageIcon);
            this.backSide.titleElement.innerHTML = `${Title} ${generateBadges(badges)}
                ${goldBadge(`GAINED AWARD`)}
            `;
            let gameInfo = `
                ${goldBadge(`${award} IN ${playTimeInMinutes}`)}
                ${goldBadge(`TOP${awardRate}%`)}
                ${goldBadge(`${icons.cheevos}${unlockData.hardcore.count}/${NumAchievements}`)}
                ${goldBadge(`${icons.points}${unlockData.hardcore.points}/${totalPoints}`)}
                ${goldBadge(`${icons.retropoints}${unlockData.hardcore.retropoints}/${totalRetropoints}`)}
            `;
            this.backSide.badgesElement.innerHTML = gameInfo;
            this.backSide.descriptionElement.innerText = "";
            this.backSide.container.classList.add(award);
            setTimeout(() => this.container.classList.add("new-award"), 1000)
        }
        const updateStatsData = (stats) => {
            this.backSide.imgElement.src = config.userImageSrc;
            this.backSide.titleElement.innerHTML = `
                ${config.USER_NAME.toUpperCase()} statistics:
            `;
            let statsBadges = `
                ${stats.rank ? goldBadge(`Rank: ${stats.rank} ${stats.deltaRank}`) : ""}
                ${stats.percentile ? goldBadge(`TOP ${stats.percentile.toFixed(2)}% ${stats.deltaPercentile}`) : ""}
                ${goldBadge(`${icons.cheevos} +${stats.cheevosCount}`)}
                ${goldBadge(`${icons.points}${stats.points} ${stats.deltaPoints}`)}
                ${goldBadge(`${icons.retropoints}${stats.retroPoints} ${stats.deltaRetroPoints}`)}
                ${goldBadge(`${icons.points}${stats.softPoints}SP ${stats.deltaSoftPoints}`)}
            `;
            this.backSide.badgesElement.innerHTML = statsBadges;
            this.backSide.descriptionElement.innerText = "";
            this.container.classList.add("stats");
        }
        const updateAlertData = (alert) => {
            clearContainer();
            switch (alert.type) {
                case alertTypes.GAME:
                    updateGameData(alert.value);
                    break;
                case alertTypes.CHEEVO:
                    updateAchivData(alert.value);
                    break;
                case alertTypes.AWARD:
                    updateAwardData(alert.value, alert.award);
                    break;
                case alertTypes.STATS:
                    updateStatsData(alert.value);
                    break;
                default:
                    break;
            }
        }
        while (this.alertsQuery.length > 0) {
            const currentAlert = this.alertsQuery[0];
            if (!currentAlert.value) { this.alertsQuery.shift(); return; }
            const onAlertStart = () => {
                updateAlertData(currentAlert)
                this.container.classList.add("show-back");
                glassAnimation();
                setTimeout(() => {
                    this.startAutoScrollElement(this.backSide.titleElement);
                    this.startAutoScrollElement(this.backSide.badgesElement)
                }, 2000);
            }
            const onAlertFinish = () => {
                this.container.classList.remove("show-back");
                this.alertsQuery.shift();
                this.stopAutoScrollElement(this.backSide.badgesElement, true);
                this.stopAutoScrollElement(this.backSide.titleElement, true);
            }
            await delay(1000); //*waiting for previous animation ending
            onAlertStart();
            await delay(this.uiProps.newAchivDuration * 1000); //*waiting alert duration
            onAlertFinish();
        }
    }

    statsAnimationInterval;
    startStatsAnimation() {

        this.stopStatsAnimation();
        this.section.classList.remove("timer-timeout");
        // this.progressStatusText.innerText = '';
        // this.progressStatusText.className = `status__big-text`;

        const time = this.getActiveTime();
        const timeElement = this.section.querySelector(`.status__game-time`);

        if (timeElement && timeElement.innerHTML !== time) {
            timeElement.innerHTML = time;
            this.frontSide.sideBlock.classList.toggle("long-time", time.length > 6);
        }
        return;
    }
    stopStatsAnimation() {
        clearInterval(this.statsAnimationInterval);
        this.currentStatusTextIndex = 0;
    }
    changeStatsElementValues({ className, text }) {
        this.progressStatusText.innerText = text;
        this.progressStatusText.className = `status__big-text ${className}`;
    }

    autoscrollAlertInterval = {};
    startAutoScrollElement(element, toLeft = true, pause = 1000) {
        const containerID = element.className;
        this.autoscrollAlertInterval[containerID] ?
            this.stopAutoScrollElement(element) : (
                this.autoscrollAlertInterval[containerID] = {}
            );
        let refreshRateMiliSecs = 50;
        this.autoscrollAlertInterval[containerID].interval = setInterval(() => {
            if (element.clientWidth == element.scrollWidth) {
                this.stopAutoScrollElement(element, true);
                this.autoscrollAlertInterval[containerID].timeout = setTimeout(() => this.startAutoScrollElement(element, true, pause), 10 * 1000);
            }
            else if (toLeft) {
                element.scrollLeft++;
                if (
                    element.scrollWidth - element.scrollLeft <= element.clientWidth
                ) {
                    this.stopAutoScrollElement(element);
                    this.autoscrollAlertInterval[containerID].timeout = setTimeout(() => this.startAutoScrollElement(element, false, pause), 5 * 1000);
                }
            } else {
                element.scrollLeft--;
                if (element.scrollLeft <= 0) {
                    this.stopAutoScrollElement(element);
                    this.autoscrollAlertInterval[containerID].timeout = setTimeout(() => this.startAutoScrollElement(element, true, pause), pause);
                }
            }
        }, refreshRateMiliSecs);
    }
    stopAutoScrollElement(element, reset = false) {
        reset && (element.scrollLeft = 0);
        clearInterval(this.autoscrollAlertInterval[element.className].interval);
        clearTimeout(this.autoscrollAlertInterval[element.className].timeout)
    }
    convertToPercentage(inputString) {
        // Розбиваємо рядок за допомогою розділювача '/'
        const parts = inputString.split('/');

        // Перетворюємо перші дві частини у числа та рахуємо відсотки
        const result = (parseInt(parts[0], 10) / parseInt(parts[1], 10)) * 100;

        // Повертаємо результат у вигляді рядка з відсотками
        return result.toFixed(2) + '%';
    }

    fitFontSize(isDynamic = false) {
        const container = this.section.querySelector(".status__container");
        let containerHeight = config.ui['update-section']?.height ?? this.section.getBoundingClientRect().height;
        isDynamic && (containerHeight = this.section.getBoundingClientRect().height)
        const fontSize = `${(parseInt(containerHeight) - 10) / 5.5}px`;
        container.style.fontSize = fontSize;
    }
    blinkUpdate() {
        this.section.classList.remove("offline", "blink")
        if (this.uiProps.showUpdateBlink && watcher.IS_ONLINE) {
            this.section.classList.add("blink");
            setTimeout(() => this.section.classList.remove("blink", "offline"), 1000);
        }
        else if (!watcher.IS_ONLINE) {
            this.section.classList.add("offline");
        }
    }
}

