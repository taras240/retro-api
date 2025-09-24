import { UI } from "../ui.js";
import { alertTypes } from "../enums/alerts.js";

import { icons, signedIcons } from "../components/icons.js"

import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";
import { config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { filterBy, filterMethods, sortBy, sortMethods } from "../functions/sortFilter.js";
import { showComments } from "../components/comments.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { delay } from "../functions/delay.js";
import { formatTime } from "../functions/time.js";
import { gamePropsPopup } from "../components/gamePropsPopup.js";
import { cheevoTypes } from "../enums/cheevoTypes.js";
import { cheevoImageUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { infiniteLineScrolling } from "../functions/infiniteLineScrolling.js";
import { generateMagicLineText } from "../functions/tickerTextGenerator.js";
import { inputTypes } from "../components/inputElements.js";
import { scrollElementIntoView } from "../functions/scrollingToElement.js";
import { getHoveredEdge } from "../functions/hoveredEdges.js";
import { moveDirections } from "../enums/moveDirections.js";
export class Status extends Widget {
    widgetIcon = {
        description: "status widget (v2)",
        iconID: `side-panel__status-v2`,
        onChangeEvent: `ui.status.VISIBLE = this.checked`,
        badgeLabel: "v2",
        iconClass: "status-icon",
    };
    get contextMenuItems() {
        return [
            {
                label: ui.lang.elements,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-rp",
                        label: ui.lang.richPresence,
                        checked: this.uiProps.showRichPresence,
                        event: `onchange="ui.status.uiProps.showRichPresence = this.checked"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-ticker",
                        label: ui.lang.ticker,
                        checked: this.uiProps.showTicker,
                        event: `onchange="ui.status.uiProps.showTicker = this.checked"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-progression",
                        label: ui.lang.progression,
                        checked: this.uiProps.showProgression,
                        event: `onchange="ui.status.uiProps.showProgression = this.checked"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-progressbar",
                        label: ui.lang.progressbar,
                        checked: this.uiProps.showProgressbar,
                        event: `onchange="ui.status.uiProps.showProgressbar = this.checked"`,
                    },
                ],
            },
            {
                label: ui.lang.time,
                elements: [
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "context_show-playTime",
                        label: ui.lang.gameTime,
                        checked: this.uiProps.time == "playTime",
                        event: `onclick="ui.status.uiProps.time = 'playTime';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "context_show-sessionTime",
                        label: ui.lang.sessionGameTime,
                        checked: this.uiProps.time == "sessionTime",
                        event: `onclick="ui.status.uiProps.time = 'sessionTime';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "context_show-totalTime",
                        label: ui.lang.totalTime,
                        checked: this.uiProps.time == "totalSessionTime",
                        event: `onclick="ui.status.uiProps.time = 'totalSessionTime';"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: "context_game-time",
                        id: "context_show-timer",
                        label: ui.lang.timer,
                        checked: this.uiProps.time == "timer",
                        event: `onclick="ui.status.uiProps.time = 'timer';"`,
                    },
                    {
                        prefix: ui.lang.timer,
                        postfix: ui.lang.min,
                        type: inputTypes.NUM_INPUT,
                        id: "context-menu_stats-timer-duration",
                        label: ui.lang.timer,
                        value: ~~(this.uiProps.timerTime / 60 * 100) / 100,
                        event: `onchange="ui.status.uiProps.timerTime = this.value;"`,
                        onChange: "ui.status.uiProps.timerTime = this.value;",
                    },
                ],
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
                this.setElementsProperties();
            }
            return true;
        }
    });
    uiDefaultValues = {
        time: "playTime",
        timerTime: 30,
    }
    uiSetCallbacks = {
        time(value) {
            this.gameElements.time.innerText = this.getActiveTime();
        },
    };
    uiValuePreprocessors = {
        timerTime(value) {
            if (value <= 0) value = 1;
            if (value > 24 * 60) value = 24 * 60;
            return value * 60;
        }
    };

    ACHIV_DURATION = 15000;
    IS_HARD_MODE = true;
    getActiveTime = () => {
        let time = 0;

        switch (this.uiProps.time) {
            case ("totalSessionTime"):
                time = watcher.playTime.sessionTime;
                break;
            case ("playTime"):
                time = watcher.playTime.totalGameTime;
                break;
            case ("sessionTime"):
                time = watcher.playTime.gameTime;
                break;
            case ("timer"):
                time = this.uiProps.timerTime - watcher.playTime.gameTime;
                break;
        }

        return formatTime(time, true);
    }
    constructor() {
        super();
        this.addWidgetIcon();
        this.initializeElements();
        UI.applyPosition({ widget: this });
        this.setElementsProperties();
        this.addEvents();

    }
    initializeElements() {
        this.section = document.querySelector(".rp__section");
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
            preview: this.section.querySelector(".rp__alert-preview"),
            title: this.section.querySelector(".rp__alert-title"),
            description: this.section.querySelector(".rp__alert-description"),
            badges: this.section.querySelector(".rp__alert-badges"),

        }
        this.richPresenceElement = this.section.querySelector(".rp__rich-presence");
        this.progressionElements = {
            header: this.section.querySelector(".rp__progression-target"),
            pointsContainer: this.section.querySelector(".rp__progression-points")
        }
        this.progressbarElements = {
            container: this.section.querySelector(".rp__progressbar-container"),
            title: this.section.querySelector(".rp__progressbar-title"),
            lastCheevos: this.section.querySelector(".rp__last-cheevos"),
        }
        this.tickerElement = this.section.querySelector(".rp__ticker");
        this.ticker = infiniteLineScrolling({ container: this.tickerElement, textGenerator: generateMagicLineText });
        this.cheevosList = this.section.querySelector(".rp__target-cheevos");

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
            else if (event.target.matches(".close-icon")) {
                event.stopPropagation();
                this.close();
            }
            // Drag Section Event
            else {
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
    setElementsProperties() {
        this.cheevosList.classList.toggle("grid-list", this.LIST_TYPE == "grid");
        this.section.classList.toggle("show-ticker", this.uiProps.showTicker);
        this.section.classList.toggle("show-progression", this.uiProps.showProgression);
        this.section.classList.toggle("show-progressbar", this.uiProps.showProgressbar);
        this.richPresenceElement.classList.toggle("hidden", !this.uiProps.showRichPresence)

        this.uiProps.showTicker && watcher.GAME_DATA && this.ticker.startScrolling();
    }
    gameChangeEvent(isNewGame = false) {
        if (isNewGame && watcher.IS_WATCHING) {
            this.addAlertsToQuery([{ type: alertTypes.GAME, value: watcher.GAME_DATA }]);
        }
        this.fillGameData();
        this.uiProps.showTicker && this.ticker.startScrolling();

    }
    fillProgression = () => {
        const isEarned = (cheevo) => this.IS_HARD_MODE ?
            (cheevo.isHardcoreEarned ? "earned" : "") :
            (cheevo.isEarned ? "earned" : "");
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
        const winHtml = winCheevos.reduce((html, cheevo) => {
            html += `<div class="rp__progression-point win ${isEarned(cheevo)}" data-achiv-id=${cheevo.ID}></div>`;
            return html
        }, "");
        this.progressionElements.pointsContainer.innerHTML = progressionHtml + winHtml;
        const progressionCheevoses = Object.values(watcher.CHEEVOS)
            .filter(a => filterBy.progression(a))
            .sort((a, b) => sortBy.default(a, b));
        const focusCheevo = progressionCheevoses
            .find(a => !isEarned(a));
        const focusIndex = progressionCheevoses.findIndex(c => !isEarned(c));
        this.progressionElements.header.innerHTML = focusCheevo ?
            `${badgeElements.gold(`${focusIndex + 1}/${progressionCheevoses?.length}`)} ${focusCheevo.Description}` : watcher.GAME_DATA?.progressionAward ?
                ui.lang.gameBeatenMsg : ui.lang.noProgressionMsg;
        const focusElement = this.progressionElements.pointsContainer.querySelector(`[data-achiv-id="${focusCheevo?.ID}"`);
        focusElement?.classList.add("focus");

        scrollElementIntoView({
            container: this.progressionElements.pointsContainer,
            element: focusElement || this.progressionElements.pointsContainer.querySelector(`.rp__progression-point:last-child`),
            scrollByY: false,
            scrollByX: true
        });

    }
    fillGameData() {
        const fillGameInfoData = () => {
            const { ImageIcon, FixedTitle, badges, ConsoleName, ConsoleID, ID, NumAchievements, totalPoints, retroRatio } = watcher.GAME_DATA;
            this.gameElements.icon.setAttribute("src", gameImageUrl(ImageIcon));
            this.gameElements.title.innerHTML = `
            ${FixedTitle || "Some game name"}
            ${generateBadges(badges)}
            `;
            this.gameElements.title.setAttribute(
                "href",
                gameUrl(ID)
            );
            setTimeout(() => this.startAutoScrollElement(this.gameElements.title, true, 10 * 1000), 10 * 1000);
            this.gameElements.platform.innerHTML = signedIcons.platform(ConsoleID); //ConsoleName
            this.richPresenceElement.innerText = ui.lang.richPresence;
            this.gameElements.gameIcons.innerHTML = `
                ${signedIcons.cheevos(NumAchievements)}
                ${signedIcons.points(totalPoints)}
                ${signedIcons.retroRatio(retroRatio)}
            `

            const time = this.getActiveTime();
            this.gameElements.time.innerHTML = time;
        }
        const fillProgressbar = () => {
            const completionMsg = () => {
                switch (watcher.GAME_DATA.award) {
                    case "mastered":
                        return ui.lang.gameMasteredMsg;
                    case "completed":
                        return ui.lang.gameCompletedMsg;
                    default:
                        const unlockProgress = `${earnedCount}/${totalCheevos} ${badgeElements.gold(parseInt(100 * earnedCount / totalCheevos) + "%")}`;
                        return ui.lang.unlockProgressMsg?.replace("***", unlockProgress)

                }
            }


            const earnedCount = this.IS_HARD_MODE ? watcher.GAME_DATA?.earnedStats?.hard?.count ?? 0 :
                watcher.GAME_DATA?.earnedStats?.soft?.count ?? 0
                ;
            const totalCheevos = watcher.GAME_DATA?.NumAchievements ?? "";
            this.progressbarElements.title.innerHTML = completionMsg();

            this.progressbarElements.container.style.setProperty("--earnedRate", 100 * earnedCount / totalCheevos + "%")

            const lastCheevos = Object.values(watcher.CHEEVOS)
                .filter(a => filterBy.earned(a))
                .sort((a, b) => sortBy.latest(a, b, 1, true))
                .slice(0, 6)
                .reverse();
            this.progressbarElements.lastCheevos.innerHTML = lastCheevos.reduce((html, cheevo) => {
                html += `
                <li class="last-cheevo" data-achiv-id="${cheevo.ID}"><img class="last-cheevo__img"
                            src="${cheevoImageUrl(cheevo.BadgeName)}" alt=""></li>
            `;
                return html
            }, "")
        }
        fillGameInfoData();
        this.fillProgression();
        fillProgressbar();
        this.startAutoScrollElement(this.richPresenceElement, true, 10 * 1000);
    }
    updateProgress({ earnedAchievementIDs }) {
        const updateProgression = () => {
            const focusID = this.progressionElements.pointsContainer.querySelector(".rp__progression-point:not(.earned)")?.dataset?.achivId;
            const focusCheevo = watcher.CHEEVOS[focusID];
            this.progressionElements.header.innerHTML = focusCheevo ?
                focusCheevo.Description : watcher.GAME_DATA?.progressionAward ?
                    ui.lang.gameBeatenMsg : ui.lang.noProgressionMsg;
            if (focusID) {
                const focusElement = this.progressionElements.pointsContainer.querySelector(`[data-achiv-id="${focusID}"`);
                focusElement?.classList.add("focus");
                focusCheevo && scrollElementIntoView({
                    container: this.progressionElements.pointsContainer,
                    element: focusElement,
                    scrollByY: true,
                    scrollByX: false
                });
            }

        }
        const updateProgressBar = () => {
            const completionMsg = () => {
                switch (watcher.GAME_DATA.award) {
                    case "mastered":
                        return ui.lang.gameMasteredMsg;
                    case "completed":
                        return ui.lang.gameCompletedMsg;
                    default:
                        const unlockProgress = `${earnedCount}/${totalCheevos} ${badgeElements.gold(parseInt(100 * earnedCount / totalCheevos) + "%")}`;
                        return ui.lang.unlockProgressMsg?.replace("***", unlockProgress)

                }
            }
            const earnedCount = this.IS_HARD_MODE ? watcher.GAME_DATA?.earnedStats?.hard?.count ?? 0 :
                watcher.GAME_DATA?.earnedStats?.soft?.count ?? 0
                ;
            const totalCheevos = watcher.GAME_DATA?.NumAchievements ?? "";
            this.progressbarElements.title.innerHTML = completionMsg();

            this.progressbarElements.container.style.setProperty("--earnedRate", 100 * earnedCount / totalCheevos + "%")

            const lastCheevos = Object.values(watcher.CHEEVOS)
                .filter(a => filterBy.earned(a))
                .sort((a, b) => sortBy.latest(a, b, 1, true))
                .slice(0, 6)
                .reverse();
            this.progressbarElements.lastCheevos.innerHTML = lastCheevos.reduce((html, cheevo) => {
                html += `
                <li class="last-cheevo cheevo-popup" data-achiv-id="${cheevo.ID}"><img class="last-cheevo__img"
                            src="${cheevoImageUrl(cheevo.BadgeName)}" alt=""></li>
            `;
                return html
            }, "")
        }
        earnedAchievementIDs?.length > 0 && (this.IS_HARD_MODE = !!watcher.CHEEVOS[earnedAchievementIDs[0]].isHardcoreEarned);
        earnedAchievementIDs.forEach(id => {
            const hardClass = watcher.CHEEVOS[id]?.isHardcoreEarned ? "hardcore" : "-";
            this.section.querySelectorAll(`[data-achiv-id="${id}"]`)
                .forEach(el => el.classList.add("earned", hardClass));
            // updateProgression();
            this.fillProgression();
            updateProgressBar();
        });
        // this.gameChangeEvent();
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
        const clearContainer = () => {
            this.alertElements.container.classList.remove("hide-alert", "show-alert", "new-game", "new-achiv", "new-award", "stats", "beaten", "mastered", "hardcore", "mastered", "beaten-softcore", "completed");
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
            const { FixedTitle,
                badges,
                ImageIcon,
                totalPoints,
                ConsoleName,
                TotalRetropoints,
                NumAchievements,
                masteryRate,
                beatenRate,
            } = game;
            this.alertElements.preview.src = gameImageUrl(ImageIcon);
            this.alertElements.title.innerHTML = `${FixedTitle} ${generateBadges(badges)}
            <i class="badge">${ConsoleName}</i>
            `;
            let badgesHtml = `
                ${goldBadge(icons.cheevos + NumAchievements)}
                ${goldBadge(icons.points + totalPoints)}
                ${goldBadge(icons.retropoints + TotalRetropoints)}
                ${goldBadge(masteryRate + "% MASTERED RATE")}
                ${goldBadge(beatenRate + "% BEATEN RATE")}
            `;
            this.alertElements.description.innerText = "";
            this.alertElements.badges.innerHTML = badgesHtml;
            this.alertElements.container.classList.add("new-game");
        }
        const updateAchivData = (cheevo) => {
            const { isHardcoreEarned, Title, prevSrc, Points, TrueRatio, rateEarned, rateEarnedHardcore, difficulty } = cheevo;
            this.alertElements.preview.src = prevSrc;
            this.alertElements.title.innerHTML = `
                ${Title}`

            this.alertElements.description.innerText = cheevo.Description;

            let cheevoBadges = isHardcoreEarned ?
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

            let genres = cheevo.genres?.map(genre => goldBadge(genre))?.join("\n") ?? "";
            this.alertElements.badges.innerHTML = genres + cheevoBadges;

            this.alertElements.container.classList.toggle("hardcore", cheevo.isHardcoreEarned);
            this.alertElements.container.classList.add("new-achiv");
        }
        const updateAwardData = (game, award) => {
            const { FixedTitle,
                badges,
                ImageIcon,
                totalPoints,
                earnedStats,
                TotalRetropoints,
                masteryRate,
                beatenRate,
                completedRate,
                beatenSoftRate,
                ID,
                NumAchievements,
                TimePlayed
            } = game;
            // let award = 'mastered';
            const awardRate = award == 'mastered' ? masteryRate :
                award == 'beaten' ? beatenRate :
                    award == 'completed' ? completedRate : beatenSoftRate;

            const playTimeInMinutes = deltaTime(TimePlayed);
            this.alertElements.preview.src = gameImageUrl(ImageIcon);
            this.alertElements.title.innerHTML = `${FixedTitle} ${generateBadges(badges)}
            ${goldBadge("GAINED AWARD")}`;
            let awardBadges = `
                ${goldBadge(`${award} IN ${playTimeInMinutes}`)}
                ${goldBadge(`TOP${awardRate}%`)}
                ${goldBadge(`${icons.cheevos}${earnedStats.hard.count}/${NumAchievements}`)}
                ${goldBadge(`${icons.points}${earnedStats.hard.points}/${totalPoints}`)}
                ${goldBadge(`${icons.retropoints}${earnedStats.hard.retropoints}/${TotalRetropoints}`)}
            `;
            this.alertElements.badges.innerHTML = awardBadges;
            this.alertElements.description.innerText = "";
            this.alertElements.container.classList.add(award);
            this.alertElements.container.classList.add("new-award");
        }
        const updateStatsData = (stats) => {
            this.alertElements.preview.src = config.userImageSrc;
            this.alertElements.title.innerHTML = `
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
            this.alertElements.badges.innerHTML = statsBadges;
            this.alertElements.description.innerText = "";
            this.alertElements.container.classList.add("stats");
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
            if (!currentAlert.value) {
                this.alertsQuery.shift();
                return;
            } const onAlertStart = () => {
                updateAlertData(currentAlert)
                this.alertElements.container.classList.add("show-alert");
                // glassAnimation();
                setTimeout(() => {
                    this.startAutoScrollElement(this.alertElements.title);
                    this.startAutoScrollElement(this.alertElements.badges);
                    this.startAutoScrollElement(this.alertElements.description);
                }, 2000)


            }
            const onAlertFinish = () => {
                this.alertElements.container.classList.add("hide-alert");
                setTimeout(() => clearContainer(), 500)
                this.alertsQuery.shift();
                this.stopAutoScrollElement(this.alertElements.badges, true);
                this.stopAutoScrollElement(this.alertElements.description, true);
                this.stopAutoScrollElement(this.alertElements.title, true);
            }
            await delay(1000); //*waiting for previous animation ending
            onAlertStart();
            await delay(this.ACHIV_DURATION); //*waiting alert duration
            onAlertFinish();
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
                const time = this.getActiveTime();
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
        const containerID = element.id || element.className;
        this.autoscrollAlertInterval[containerID] ?
            this.stopAutoScrollElement(element) : (
                this.autoscrollAlertInterval[containerID] = {}
            );
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
                scrollContainer.scrollLeft--;
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
        clearInterval(this.autoscrollAlertInterval[containerID].interval);
        clearTimeout(this.autoscrollAlertInterval[containerID].timeout)
    }
    fitCheevosSize(cheevosList) {
        const ACHIV_MIN_SIZE = 36;
        const ACHIV_MAX_SIZE = 128;
        // Отримання розмірів вікна блоку досягнень
        let windowHeight, windowWidth;
        cheevosList.style.flex = "1";
        windowHeight = cheevosList.clientHeight - 2;
        windowWidth = cheevosList.clientWidth - 10;

        cheevosList.style.flex = "";
        const achivs = cheevosList.querySelectorAll(".target-achiv:not(.removed)");
        const achivsCount = achivs.length;
        // Перевірка, чи є елементи в блоці досягнень
        if (achivsCount === 0) return;
        // Початкова ширина досягнення для розрахунку
        let achivWidth = Math.floor(
            Math.sqrt((windowWidth * windowHeight) / achivsCount)
        );

        let rowsCount, colsCount;
        // Цикл для знаходження оптимального розміру досягнень
        do {
            achivWidth--;
            rowsCount = Math.floor(windowHeight / (achivWidth + 2));
            colsCount = Math.floor(windowWidth / (achivWidth + 2));
        } while (
            rowsCount * colsCount < achivsCount &&
            achivWidth > ACHIV_MIN_SIZE
        );
        achivWidth =
            achivWidth < ACHIV_MIN_SIZE
                ? ACHIV_MIN_SIZE
                : achivWidth > ACHIV_MAX_SIZE
                    ? ACHIV_MAX_SIZE
                    : achivWidth;
        cheevosList.style.setProperty("--achiv-height", achivWidth + "px");
    }
}
