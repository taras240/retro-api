import { UI } from "../ui.js";
import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";
import { config, ui, apiWorker } from "../script.js";
import { Widget } from "./widget.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { inputTypes } from "../components/inputElements.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { normalizeUserData } from "../functions/api/userDataNormalization.js";

export class UserStatistic extends Widget {
    widgetIcon = {
        description: "user statistics widget",
        iconID: `side-panel__stats`,
        onChangeEvent: `ui.stats.VISIBLE = this.checked`,
        iconClass: "stats-icon",
    };
    get contextMenuItems() {
        return [
            {
                label: ui.lang.showStats,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-points",
                        id: "show-points",
                        label: ui.lang.points,
                        checked: this.uiProps.showHP,
                        onChange: (event) => this.uiProps.showHP = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-retropoints",
                        id: "show-retropoints",
                        label: ui.lang.retropoints,
                        checked: this.uiProps.showRP,
                        onChange: (event) => this.uiProps.showRP = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-softpoints",
                        id: "show-softpoints",
                        label: ui.lang.softpoints,
                        checked: this.uiProps.showSP,
                        onChange: (event) => this.uiProps.showSP = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-rank",
                        id: "show-rank",
                        label: ui.lang.rank,
                        checked: this.uiProps.showRank,
                        onChange: (event) => this.uiProps.showRank = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-percentile",
                        id: "show-percentile",
                        label: ui.lang.percentile,
                        checked: this.uiProps.showPercentile,
                        onChange: (event) => this.uiProps.showPercentile = event.currentTarget.checked,
                    },

                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-true-ratio",
                        id: "show-true-ratio",
                        label: ui.lang.trueRatio,
                        checked: this.uiProps.showTrueRatio,
                        onChange: (event) => this.uiProps.showTrueRatio = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-completion-chart",
                        id: "show-completion-chart",
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
                        name: "show-header",
                        id: "show-header",
                        label: ui.lang.showHeader,
                        checked: this.uiProps.showHeader,
                        onChange: (event) => this.uiProps.showHeader = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "show-bg",
                        id: "show-bg",
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
                name: "show-session-progress",
                id: "show-session-progress",
                label: ui.lang.showSessionProgress,
                checked: this.uiProps.showSessionProgress,
                onChange: (event) => this.uiProps.showSessionProgress = event.currentTarget.checked,
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
    }
    uiSetCallbacks = {
        completionChart() {
            this.setElementsValues();
            this.updateChart();
        },
    }
    saveProppertySetting(property, value) {
        if (!config.ui.stats_section) {
            config.ui.stats_section = {};
        }
        config.ui.stats_section[property] = value;
        config.writeConfiguration();
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
        UI.applyPosition({ widget: this });
    }
    generateWidget() {
        const headerElementsHtml = `
            ${buttonsHtml.tweek()}
            <button class=" header-button header-icon update-icon" id="" title="${ui.lang.forceReloadHint}"
            onclick="ui.stats.updateStats({})"></button>
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
        this.softpointsElement = this.section.querySelector('#stats_softpoints');
        this.trueRatioElement = this.section.querySelector('#stats_true-ratio');
        this.completionElement = this.section.querySelector(".stats__chart-container");

        this.masteredCountElement = this.section.querySelector('#stats_mastered-count');
        this.beatenCountElement = this.section.querySelector('#stats_beaten-count');
        this.playedCountElement = this.section.querySelector('#stats_played-count');

        this.resizer = this.section.querySelector(".resizer");
    }

    setElementsValues() {
        this.pointsElement.closest("li").classList.toggle("hidden", !this.uiProps.showHP);
        this.retropointsElement.closest("li").classList.toggle("hidden", !this.uiProps.showRP);
        this.softpointsElement.closest("li").classList.toggle("hidden", !this.uiProps.showSP);
        this.rankElement.closest("li").classList.toggle("hidden", !this.uiProps.showRank);
        this.rankRateElement.closest("li").classList.toggle("hidden", !this.uiProps.showPercentile);
        this.trueRatioElement.closest("li").classList.toggle("hidden", !this.uiProps.showTrueRatio);
        this.completionElement.classList.toggle("hidden", !this.uiProps.completionChart);
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);
        this.section.classList.toggle("hide-bg", !this.uiProps.showBG);
        this.container.classList.toggle("show-session-progress", this.uiProps.showSessionProgress);
        this.container.classList.toggle("list-mode", this.uiProps.listMode)

    }
    addEvents() {
        super.addEvents();
        // this.section.addEventListener("mousedown", event => {
        //     if (event.button !== 0 || event.target.closest(".resizer, button")) return;
        //     moveEvent(this.section, event);
        // })
    }
    initialSetStats({ userData }) {
        this.initialData = userData;
        if (userData) {
            this.userData = userData;
            this.initialUserData = userData;
            this.rankElement.innerText = userData.rank;
            this.rankRateElement.innerText = userData.percentile + '%';
            this.pointsElement.innerText = userData.points;
            this.softpointsElement.innerText = userData.softpoints;
            this.retropointsElement.innerText = userData.retropoints;
            this.trueRatioElement.innerText = userData.trueRatio.toFixed(2);
        }
        setTimeout(() => this.updateChart(), 1000);
    }
    async onStatsUpdate({ userData }) {
        this.updateStats({ userData });
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
            if (!userData.rank) return;
            this.initialData = userData;
            this.userData = userData;
        }
        const setValue = (element, property) => {
            let delta = 0;
            let sessionDelta = 0;
            let value = 0;
            let oldValue = 0;
            switch (property) {
                case "rankRate":
                    value = userData.percentile;
                    oldValue = this.userData.percentile;
                    delta = +(value - oldValue).toFixed(2);
                    sessionDelta = -(value - this.initialData.percentile).toFixed(2);
                    value += "%";
                    break;
                case "trueRatio":
                    value = userData.trueRatio.toFixed(2);
                    oldValue = this.userData.trueRatio.toFixed(2);
                    delta = +(value - oldValue).toFixed(2);
                    sessionDelta = +(value - this.initialData.trueRatio).toFixed(2);
                    break;
                case "rank":
                    delta = userData.rank - this.userData.rank;
                    sessionDelta = this.initialData.rank - userData.rank;
                    value = userData.rank;
                    break;
                default:
                    delta = userData[property] - this.userData[property];
                    sessionDelta = userData[property] - this.initialData[property];
                    value = userData[property];
            }
            const isDeltaPositive = delta >= 0;
            const isSessionNegativeDelta = sessionDelta < 0;

            element.classList.toggle('negative', !isDeltaPositive);
            element.dataset.delta = `${isDeltaPositive ? "+" : ""}${delta}`;
            const deltaText = !!sessionDelta ?
                !isSessionNegativeDelta ?
                    `▴${sessionDelta}` : `▾${-1 * sessionDelta}` : "";
            element.innerHTML = value + ` <span class="session-progress ${isSessionNegativeDelta ? "negative" : ""}">${deltaText}</span>`;
            const delay = 0;
            element.classList.add("delta");
            setTimeout(() => {
                element.classList.remove("delta");
            }, delay);
        }
        setValue(this.rankRateElement, "rankRate");
        setValue(this.rankElement, "rank");
        setValue(this.pointsElement, "points");
        setValue(this.softpointsElement, "softpoints");
        setValue(this.retropointsElement, "retropoints");
        setValue(this.trueRatioElement, "trueRatio");
        this.userData = { ...this.userData, ...userData };
    }
    async updateChart() {
        const AWARD_KINDS = [
            { kind: 'mastered', cssVar: '--m', legendClass: 'mastered' },
            { kind: 'completed', cssVar: '--c', legendClass: 'completed' },
            { kind: 'beaten-hardcore', cssVar: '--b', legendClass: 'beaten' },
            { kind: 'beaten-softcore', cssVar: '--b-s', legendClass: 'beaten-soft' },
        ];

        if (!this.uiProps.completionChart) return;
        const completionData = await apiWorker.completionProgress();
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
        points: { label: ui.lang.points, id: "stats_points", },
        retropoints: { label: ui.lang.retropoints, id: "stats_retropoints", },
        trueRatio: { label: ui.lang.trueRatio, id: "stats_true-ratio", },
        softpoints: { label: ui.lang.softpoints, id: "stats_softpoints", }
    }
    generateStatsElements() {
        const statusHtml = Object.values(this.statusProperties)
            .reduce((html, stat) => {
                const elHtml = `
          <li class="stats__stat-container">
              <h2 class="stats__title">${stat.label}</h2>
              <p id="${stat.id}" class="stats__value ${stat.class}"></p>
          </li>
          `;
                html += elHtml;
                return html;
            }, '');
        const pieChartHtml = `
            <li class="stats__stat-container stats__chart-container">
            
            <div class="round-stat__container ">
                <div class="circle">
                <div class="round-stat__total" id="sector"></div>
                </div>
                <div class="round-stat__legend">
                    <div class="legend__award legend__mastered">mastered: <span class="legend__value-mastered">0%</span></div>
                    <div class="legend__award legend__completed">completed: <span class="legend__value-completed">0%</div>
                    <div class="legend__award legend__beaten">beaten: <span class="legend__value-beaten">0%</div>
                    <div class="legend__award legend__beaten-soft">beaten soft: <span class="legend__value-beaten-soft">0%</div>
                    <div class="legend__award legend__started">in progress: <span class="legend__value-progress">0%</div>
                </div>
            </div>
            </li>
        `;
        this.container.innerHTML = statusHtml + pieChartHtml;
    }
}
