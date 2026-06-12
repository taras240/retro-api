import { UI } from "../ui.js";
import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";
import { config, ui, apiWorker } from "../script.js";
import { Widget } from "./widget.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { inputTypes } from "../components/inputElements.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { normalizeUserData } from "../functions/api/userDataNormalization.js";
import { applySort, sortBy } from "../functions/sortFilter.js";
import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { animateValue } from "../functions/animations/valueAnimation.js";
import { fromHtml } from "../functions/html.js";


export class UserStatistic extends Widget {
    widgetIcon = {
        description: "user statistics widget",
        iconClass: "stats-icon",
    };
    get contextMenuItems() {
        return [
            {
                label: ui.lang.showStats,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.points,
                        checked: this.uiProps.showHP,
                        onChange: (event) => this.uiProps.showHP = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.retropoints,
                        checked: this.uiProps.showRP,
                        onChange: (event) => this.uiProps.showRP = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.softpoints,
                        checked: this.uiProps.showSP,
                        onChange: (event) => this.uiProps.showSP = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.rank,
                        checked: this.uiProps.showRank,
                        onChange: (event) => this.uiProps.showRank = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.percentile,
                        checked: this.uiProps.showPercentile,
                        onChange: (event) => this.uiProps.showPercentile = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.unlocks,
                        checked: this.uiProps.showUnlocksHardcore,
                        onChange: (event) => this.uiProps.showUnlocksHardcore = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.unlocksTotal,
                        checked: this.uiProps.showUnlocksSoftcore,
                        onChange: (event) => this.uiProps.showUnlocksSoftcore = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.trueRatio,
                        checked: this.uiProps.showTrueRatio,
                        onChange: (event) => this.uiProps.showTrueRatio = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.played,
                        checked: this.uiProps.showTotalGames,
                        onChange: (event) => this.uiProps.showTotalGames = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.mastered,
                        checked: this.uiProps.showMastered,
                        onChange: (event) => this.uiProps.showMastered = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.completed,
                        checked: this.uiProps.showCompleted,
                        onChange: (event) => this.uiProps.showCompleted = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.beaten,
                        checked: this.uiProps.showBeaten,
                        onChange: (event) => this.uiProps.showBeaten = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.beatenSoftcore,
                        checked: this.uiProps.showBeatenSoftcore,
                        onChange: (event) => this.uiProps.showBeatenSoftcore = event.currentTarget.checked,
                    },

                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.completionChart,
                        checked: this.uiProps.completionChart,
                        onChange: (event) => this.uiProps.completionChart = event.currentTarget.checked,
                    },
                ]
            },
            {
                label: ui.lang.style,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showHeader,
                        checked: this.uiProps.showHeader,
                        onChange: (event) => this.uiProps.showHeader = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showBackground,
                        checked: this.uiProps.showBG,
                        onChange: (event) => this.uiProps.showBG = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: `list-type`,
                        id: `list-type-list`,
                        label: "List",
                        checked: this.uiProps.listMode,
                        onChange: (event) => this.uiProps.listMode = true,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: `list-type`,
                        id: `list-type-grid`,
                        label: "Grid",
                        checked: !this.uiProps.listMode,
                        onChange: (event) => this.uiProps.listMode = false,
                    }

                ]
            },
            {
                type: inputTypes.CHECKBOX,
                label: ui.lang.showSessionProgress,
                checked: this.uiProps.showSessionProgress,
                onChange: (event) => this.uiProps.showSessionProgress = event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                label: ui.lang.showSeparator,
                checked: this.uiProps.showSeparator,
                onChange: (event) => this.uiProps.showSeparator = event.currentTarget.checked,
            }


        ];
    }

    uiDefaultValues = {
        listMode: false,
        completionChart: false,
        showSessionProgress: true,
        showTrueRatio: true,
        showPercentile: true,
        showRank: true,
        showSP: false,
        showRP: true,
        showHP: true,
        showHeader: false,
        showBG: true,
        showUnlocksSoftcore: false,
        showUnlocksHardcore: false,
        showMastered: false,
        showCompleted: false,
        showBeatenSoftcore: false,
        showBeaten: false,
        showTotalGames: false,
        showSeparator: true,
    }
    uiSetCallbacks = {
        showSeparator() {
            this.updateStats({ userData: this.userData });
        },
        completionChart(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
        showUnlocksSoftcore(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
        showUnlocksHardcore(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
        showMastered(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
        showCompleted(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
        showBeaten(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
        showBeatenSoftcore(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
        showTotalGames(isShow) {
            this.setElementsValues();
            if (isShow) {
                this.updateCompletionStats();
            }
        },
    }
    initialUserSummary;
    userSummary;
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.setElementsValues();

        this.addEvents();
        this.applyPosition();

        this.applyDisplayOrder();
    }
    generateWidget() {
        const headerElementsHtml = `
            ${buttonsHtml.tweek()}
            ${buttonsHtml.reload({ hint: ui.lang.update })}
        `;

        const widgetData = {
            classes: ["section", "stats_section", "compact-header"],
            id: "stats_section",
            title: ui.lang.statisticsSectionName,
            headerElementsHtml: headerElementsHtml,
            contentClasses: ["stats-container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
    }
    initializeElements() {
        this.section = document.querySelector("#stats_section");
        this.sectionID = this.section.id;
        this.header = this.section.querySelector(".header-container");
        this.container = this.section.querySelector(".stats-container");

        this.generateStatsElements();

        this.rankRateElement = this.section.querySelector('#stats_rank-rate');
        this.rankElement = this.section.querySelector('#stats_rank');
        this.pointsElement = this.section.querySelector('#stats_points');
        this.retropointsElement = this.section.querySelector('#stats_retropoints');
        this.softcoreUnlocksElement = this.section.querySelector('#stats_cheevos-softcore');
        this.hardcoreUnlocksElement = this.section.querySelector('#stats_cheevos-hardcore');
        this.softpointsElement = this.section.querySelector('#stats_softpoints');
        this.trueRatioElement = this.section.querySelector('#stats_true-ratio');
        this.completionElement = this.section.querySelector(".stats__chart-container");
        this.masteredElement = this.section.querySelector('#stats_mastered');
        this.beatenElement = this.section.querySelector('#stats_beaten');
        this.beatenSoftElement = this.section.querySelector('#stats_beaten-softcore');
        this.completedElement = this.section.querySelector('#stats_completed');
        this.playedElement = this.section.querySelector('#stats_played');

        this.resizer = this.section.querySelector(".resizer");
    }

    setElementsValues() {
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);
        this.section.classList.toggle("hide-bg", !this.uiProps.showBG);
        this.container.classList.toggle("show-session-progress", this.uiProps.showSessionProgress);
        this.container.classList.toggle("list-mode", this.uiProps.listMode);

        [
            [this.pointsElement, this.uiProps.showHP],
            [this.retropointsElement, this.uiProps.showRP],
            [this.softpointsElement, this.uiProps.showSP],
            [this.rankElement, this.uiProps.showRank],
            [this.rankRateElement, this.uiProps.showPercentile],
            [this.trueRatioElement, this.uiProps.showTrueRatio],
            [this.softcoreUnlocksElement, this.uiProps.showUnlocksSoftcore],
            [this.hardcoreUnlocksElement, this.uiProps.showUnlocksHardcore],
            [this.masteredElement, this.uiProps.showMastered],
            [this.completedElement, this.uiProps.showCompleted],
            [this.beatenElement, this.uiProps.showBeaten],
            [this.beatenSoftElement, this.uiProps.showBeatenSoftcore],
            [this.playedElement, this.uiProps.showTotalGames],
        ].forEach(([element, visible]) => {
            element?.closest("li")?.classList.toggle("hidden", !visible);
        });

        this.completionElement.classList.toggle("hidden", !this.uiProps.completionChart);
    }
    addEvents() {
        super.addEvents();
        this.header.addEventListener("click", (event) => {
            if (event.target.matches(".update-icon")) {
                event.stopPropagation();
                this.updateStats({});
            }
        })
        new Sortable(this.container, {

            group: {
                name: "stats", pull: false, push: false,
            },
            animation: 100,
            forceFallback: ui.isCEF,
            chosenClass: "dragged",
            onEnd: () => this.saveDisplayOrder(),
        });
    }
    saveDisplayOrder() {
        const stats = [...this.container.querySelectorAll("li")];
        const displayOrder = stats.reduce((acc, { id }, index) => {
            acc[id] = index;
            return acc;
        }, {});
        this.uiProps.displayOrder = displayOrder;
    }
    applyDisplayOrder() {
        applySort({
            container: this.container,
            itemClassName: ".stats__stat-container",
            sortMethod: sortBy.default,
            reverse: 1,
            animationDuration: 0
        });
    }
    hasCompletionPropery() {
        const {
            completionChart,
            showUnlocksHardcore,
            showUnlocksSoftcore,
            showMastered,
            showCompleted,
            showBeatenSoftcore,
            showBeaten,
            showTotalGames
        } = this.uiProps;
        return completionChart || showUnlocksHardcore || showUnlocksSoftcore || showMastered || showCompleted || showBeaten || showBeatenSoftcore || showTotalGames;
    }
    async updateCompletionStats() {
        if (!this.hasCompletionPropery()) return;
        const completionData = await apiWorker.completionProgress();
        this.updateChart(completionData);
        const getCheevosCount = (completionData) => {
            const gamesArray = completionData?.Results ?? [];
            const unlocksData = gamesArray.reduce((unlocksData, game) => {
                const { NumAwardedHardcore, NumAwarded } = game;
                unlocksData.softcoreUnlocks += NumAwarded;
                unlocksData.hardcoreUnlocks += NumAwardedHardcore;
                return unlocksData;
            }, { softcoreUnlocks: 0, hardcoreUnlocks: 0 });
            return unlocksData;
        }
        const getAwardsCount = (completionData) => {
            const AWARD_KINDS = [
                'mastered',
                'completed',
                'beaten-hardcore',
                'beaten-softcore',
            ];
            const gamesArray = completionData?.Results ?? [];
            const awardsData = AWARD_KINDS.reduce((acc, kind) => {
                const count = gamesArray.filter(g => g.HighestAwardKind === kind).length;
                acc[kind] = count;
                return acc;
            }, {});
            awardsData.played = gamesArray.length;
            return awardsData;

        }
        const unlocksData = getCheevosCount(completionData);
        const awardsData = getAwardsCount(completionData);
        const completionStats = { ...unlocksData, ...awardsData };
        Object.assign(this.initialData, completionStats);
        Object.assign(this.userData, completionStats);
        this.updateStats({ userData: completionStats });
    }
    async onStatsUpdate({ userData }) {
        this.updateStats({ userData });
    }

    onCheevoUnlocks({ cheevos = [] }) {
        const { softcoreUnlocks = 0, hardcoreUnlocks = 0 } = this.userData || {};
        const unlocksData = cheevos.reduce((acc, cheevo) => {
            if (cheevo.isEarned) acc.softcoreUnlocks++;
            if (cheevo.isEarnedHardcore) acc.hardcoreUnlocks++;
            return acc;
        }, { softcoreUnlocks, hardcoreUnlocks });
        this.updateStats({ userData: unlocksData });
    }
    onGameChange({ gameData, isWatching }) {
        if (!this.userData?.played || !isWatching) return;
        const isFirstPlayed = gameData.TimePlayed < 30;
        if (isFirstPlayed) {
            const completionData = {
                played: this.userData.played + 1
            }
            this.updateStats({ userData: completionData });
        }
    }
    onAwardsEarned({ awardsData }) {
        if (!awardsData?.length || !Object.hasOwn(this.userData, "mastered")) return;
        const completionData = { ...this.userData };

        awardsData.forEach(({ award }) => {
            switch (award) {
                case GAME_AWARD_TYPES.MASTERED:
                    completionData.mastered++;
                    break;
                case GAME_AWARD_TYPES.COMPLETED:
                    completionData.completed++;
                    break;
                case GAME_AWARD_TYPES.BEATEN:
                    completionData["beaten-hardcore"]++;
                    break;
                case GAME_AWARD_TYPES.BEATEN_SOFTCORE:
                    completionData["beaten-softcore"]++;
                    break;
            }
        })
        this.updateStats({ userData: completionData });
    }
    async updateStats({ userData }) {
        if (!userData) {
            const userSummary = await apiWorker.getUserSummary({ gamesCount: "0", achievesCount: 0 });
            userData = {
                ...this.userData,
                ...normalizeUserData({ userSummary })
            };
        };
        if (!this.initialData) {
            if (!Object.hasOwn(userData, "rank")) return;
            this.initialData = userData;
            this.userData = userData;
            setTimeout(() => this.updateCompletionStats(), 4e3);
        }
        const setValue = (element, property) => {
            if (!Object.hasOwn(this.userData, property) || !Object.hasOwn(userData, property)) return;
            const animationProps = {
                separator: this.uiProps.showSeparator ? "," : "",
            };
            let delta = 0;
            let sessionDelta = 0;
            let value = 0;
            let oldValue = 0;
            switch (property) {
                case "percentile":
                    value = userData.percentile;
                    oldValue = this.userData.percentile;
                    delta = +(value - oldValue).toFixed(2);
                    sessionDelta = -(value - this.initialData.percentile).toFixed(2);
                    animationProps.decimals = 2;
                    animationProps.suffix = "%";
                    break;
                case "trueRatio":
                    value = userData.trueRatio.toFixed(2);
                    oldValue = this.userData.trueRatio.toFixed(2);
                    delta = +(value - oldValue).toFixed(2);
                    sessionDelta = +(value - this.initialData.trueRatio).toFixed(2);
                    animationProps.decimals = 2;
                    break;
                case "rank":
                    oldValue = this.userData.rank;
                    delta = userData.rank - oldValue;
                    sessionDelta = this.initialData.rank - userData.rank;
                    value = userData.rank;
                    break;
                default:
                    oldValue = this.userData[property]
                    delta = userData[property] - oldValue;
                    sessionDelta = userData[property] - this.initialData[property];
                    value = userData[property];
            }
            const isDeltaPositive = delta >= 0;
            const isSessionNegativeDelta = sessionDelta < 0;

            element.classList.toggle('negative', !isDeltaPositive);
            element.dataset.delta = `${isDeltaPositive ? "+" : ""}${delta}`;

            animateValue(element, value, 1000, animationProps);
            const deltaElement = element.parentElement.querySelector(".session-progress");
            animateValue(deltaElement, Math.abs(sessionDelta), 1000, animationProps);
            deltaElement?.classList.toggle("negative", isSessionNegativeDelta);
            deltaElement?.classList.toggle("hidden", sessionDelta == 0);
        }
        setValue(this.rankRateElement, "percentile");
        setValue(this.rankElement, "rank");
        setValue(this.hardcoreUnlocksElement, "hardcoreUnlocks");
        setValue(this.softcoreUnlocksElement, "softcoreUnlocks");
        setValue(this.pointsElement, "points");
        setValue(this.softpointsElement, "softpoints");
        setValue(this.retropointsElement, "retropoints");
        setValue(this.trueRatioElement, "trueRatio");
        setValue(this.masteredElement, "mastered");
        setValue(this.completedElement, "completed");
        setValue(this.beatenElement, "beaten-hardcore");
        setValue(this.beatenSoftElement, "beaten-softcore");
        setValue(this.playedElement, "played");

        this.userData = { ...this.userData, ...userData };
    }
    async updateChart(completionData = {}) {
        const AWARD_KINDS = [
            { kind: 'mastered', cssVar: '--m', legendClass: 'mastered' },
            { kind: 'completed', cssVar: '--c', legendClass: 'completed' },
            { kind: 'beaten-hardcore', cssVar: '--b', legendClass: 'beaten' },
            { kind: 'beaten-softcore', cssVar: '--b-s', legendClass: 'beaten-soft' },
        ];
        const allGames = completionData?.Results ?? [];
        const allGamesCount = allGames.length;

        if (!allGamesCount) return;

        const rates = AWARD_KINDS.reduce((acc, { kind, cssVar, legendClass }) => {
            const rate = allGames.filter(g => g.HighestAwardKind === kind).length / allGamesCount * 100;
            acc[legendClass] = { rate, cssVar };
            return acc;
        }, {});

        const chartContainer = this.section.querySelector(".stats__chart-container");
        const totalRated = Object.values(rates).reduce((sum, { rate }) => sum + rate, 0);

        Object.entries(rates).forEach(([legendClass, { cssVar, rate }]) => {
            chartContainer.style.setProperty(cssVar, rate + '%');
            chartContainer.querySelector(`.legend__${legendClass}`)?.classList.toggle("hidden", !rate);
            chartContainer.querySelector(`.legend__value-${legendClass}`).innerText = rate.toFixed(2) + '%';
        });

        this.section.querySelector('.legend__value-progress').innerText =
            (100 - totalRated).toFixed(2) + '%';

    }
    statusProperties = {
        percentile: { label: ui.lang.top, id: "stats_rank-rate", class: 'stats__rank-value' },
        rank: { label: ui.lang.rank, id: "stats_rank", class: 'stats__rank-value' },
        unlocks: { label: ui.lang.cheevos, id: "stats_cheevos-hardcore", },
        unlocksSoftcore: { label: ui.lang.cheevos, id: "stats_cheevos-softcore", },
        points: { label: ui.lang.points, id: "stats_points", },
        retropoints: { label: ui.lang.retropoints, id: "stats_retropoints", },
        trueRatio: { label: ui.lang.trueRatio, id: "stats_true-ratio", },
        softpoints: { label: ui.lang.softpoints, id: "stats_softpoints", },
        mastered: { label: ui.lang.mastered, id: "stats_mastered" },
        completed: { label: ui.lang.completed, id: "stats_completed" },
        beaten: { label: ui.lang.beaten, id: "stats_beaten" },
        beatenSoftcore: { label: ui.lang.beatenSoftcore, id: "stats_beaten-softcore" },
        played: { label: ui.lang.played, id: "stats_played" },
    }
    generateStatsElements() {
        const order = this.uiProps.displayOrder ?? {};
        const statusHtml = Object.values(this.statusProperties)
            .reduce((html, stat) => {
                const elHtml = `
                    <li 
                        class="stats__stat-container" 
                        id="${stat.id}-container" 
                        data--display-order="${order[`${stat.id}-container`] ?? 0}">
                            <h2 class="stats__title">${stat.label}</h2>
                            <p id="${stat.id}" class="stats__value ${stat.class}"></p>
                            <p class="session-progress"></p>
                    </li>
                `;
                html += elHtml;
                return html;
            }, '');
        const pieChartHtml = `
            <li class="stats__stat-container stats__chart-container" id="stats_completion-chart" data--display-order="${order[`stats_completion-chart`] ?? 0}">
            
            <div class="round-stat__container ">
                <div class="circle">
                <div class="round-stat__total" id="sector"></div>
                </div>
                <div class="round-stat__legend">
                    <div class="legend__award legend__mastered">${ui.lang.mastered}: <span class="legend__value-mastered"></span></div>
                    <div class="legend__award legend__completed">${ui.lang.completed}: <span class="legend__value-completed"></div>
                    <div class="legend__award legend__beaten">${ui.lang.beaten}: <span class="legend__value-beaten"></div>
                    <div class="legend__award legend__beaten-soft">${ui.lang.beatenSoftcore}: <span class="legend__value-beaten-soft"></div>
                    <div class="legend__award legend__started">${ui.lang.inProgress}: <span class="legend__value-progress"></div>
                </div>
            </div>
            </li>
        `;
        this.container.innerHTML = statusHtml + pieChartHtml;
    }
}
