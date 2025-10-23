import { UI } from "../ui.js";
import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";
import { config, ui, apiWorker } from "../script.js";
import { Widget } from "./widget.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { inputTypes } from "../components/inputElements.js";
import { buttonsHtml } from "../components/htmlElements.js";

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
                        name: "context_show-points",
                        id: "context_show-points",
                        label: ui.lang.points,
                        checked: this.uiProps.showHP,
                        event: `onchange="ui.stats.uiProps.showHP = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-retropoints",
                        id: "context_show-retropoints",
                        label: ui.lang.retropoints,
                        checked: this.uiProps.showRP,
                        event: `onchange="ui.stats.uiProps.showRP = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-softpoints",
                        id: "context_show-softpoints",
                        label: ui.lang.softpoints,
                        checked: this.uiProps.showSP,
                        event: `onchange="ui.stats.uiProps.showSP = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-rank",
                        id: "context_show-rank",
                        label: ui.lang.rank,
                        checked: this.uiProps.showRank,
                        event: `onchange="ui.stats.uiProps.showRank = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-percentile",
                        id: "context_show-percentile",
                        label: ui.lang.percentile,
                        checked: this.uiProps.showPercentile,
                        event: `onchange="ui.stats.uiProps.showPercentile = this.checked;"`,
                    },

                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-true-ratio",
                        id: "context_show-true-ratio",
                        label: ui.lang.trueRatio,
                        checked: this.uiProps.showTrueRatio,
                        event: `onchange="ui.stats.uiProps.showTrueRatio = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-completion-chart",
                        id: "context_show-completion-chart",
                        label: ui.lang.completionChart,
                        checked: this.uiProps.completionChart,
                        event: `onchange="ui.stats.uiProps.completionChart = this.checked;"`,
                    },
                ]
            },
            {
                label: ui.lang.style,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-header",
                        id: "context_show-header",
                        label: ui.lang.showHeader,
                        checked: this.uiProps.showHeader,
                        event: `onchange="ui.stats.uiProps.showHeader = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        name: "context_show-bg",
                        id: "context_show-bg",
                        label: ui.lang.showBackground,
                        checked: this.uiProps.showBG,
                        event: `onchange="ui.stats.uiProps.showBG = this.checked;"`,
                    },
                    {
                        type: inputTypes.RADIO,
                        name: `context_list-type`,
                        id: `context_list-type-list`,
                        label: "List",
                        checked: this.uiProps.listMode,
                        event: `onchange="ui.stats.uiProps.listMode = true;"`
                    },
                    {
                        type: inputTypes.RADIO,
                        name: `context_list-type`,
                        id: `context_list-type-grid`,
                        label: "Grid",
                        checked: !this.uiProps.listMode,
                        event: `onchange="ui.stats.uiProps.listMode = false;"`
                    }

                ]
            },
            {
                type: inputTypes.CHECKBOX,
                name: "context_show-session-progress",
                id: "context_show-session-progress",
                label: ui.lang.showSessionProgress,
                checked: this.uiProps.showSessionProgress,
                event: `onchange="ui.stats.uiProps.showSessionProgress = this.checked;"`,
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
    initialSetStats({ userSummary, completionProgress }) {
        this.initialData = {
            Rank: userSummary.Rank,
            rankRate: +(100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2),
            TotalPoints: userSummary.TotalPoints,
            TotalSoftcorePoints: userSummary.TotalSoftcorePoints,
            TotalTruePoints: userSummary.TotalTruePoints,
            trueRatio: +(userSummary.TotalTruePoints / userSummary.TotalPoints).toFixed(2),

        }
        if (userSummary) {
            this.userSummary = userSummary;
            this.initialUserSummary = userSummary;
            this.rankElement.innerText = userSummary.Rank;
            this.rankRateElement.innerText = (100 * userSummary.Rank / userSummary.TotalRanked).toFixed(2) + '%';
            this.pointsElement.innerText = userSummary.TotalPoints;
            this.softpointsElement.innerText = userSummary.TotalSoftcorePoints;
            this.retropointsElement.innerText = userSummary.TotalTruePoints;
            this.trueRatioElement.innerText = (userSummary.TotalTruePoints / userSummary.TotalPoints).toFixed(2);
        }
        if (completionProgress) {
        }
        setTimeout(() => this.updateChart(), 1000);
    }
    async updateStats({ currentUserSummary }) {
        if (!currentUserSummary) {
            currentUserSummary = await apiWorker.getUserSummary({ gamesCount: "0", achievesCount: 0 });
        };

        const setValue = (element, property) => {

            let delta = 0;
            let sessionDelta = 0;
            let value = 0;
            let oldValue = 0;
            switch (property) {
                case "rankRate":
                    value = (100 * currentUserSummary.Rank / currentUserSummary.TotalRanked).toFixed(2);
                    oldValue = (100 * this.userSummary.Rank / this.userSummary.TotalRanked).toFixed(2);
                    delta = +(value - oldValue).toFixed(2);
                    sessionDelta = -(value - this.initialData.rankRate).toFixed(2)
                    value += "%";
                    break;
                case "trueRatio":
                    value = (currentUserSummary.TotalTruePoints / currentUserSummary.TotalPoints).toFixed(2);
                    oldValue = (this.userSummary.TotalTruePoints / this.userSummary.TotalPoints).toFixed(2);
                    delta = +(value - oldValue).toFixed(2);
                    sessionDelta = +(value - this.initialData.trueRatio).toFixed(2)
                    break;
                case "Rank":
                    delta = currentUserSummary[property] - this.userSummary[property];
                    sessionDelta = this.initialData[property] - currentUserSummary[property];
                    value = currentUserSummary[property];
                    break;
                default:
                    delta = currentUserSummary[property] - this.userSummary[property];
                    sessionDelta = currentUserSummary[property] - this.initialData[property];
                    value = currentUserSummary[property];
            }
            if (delta == 0) return;
            const isNegativeDelta = delta < 0;

            const isSessionNegativeDelta = sessionDelta < 0;

            element.classList.add("delta");
            element.classList.toggle('negative', isNegativeDelta);
            element.dataset.delta = `${isNegativeDelta || delta == 0 ? "" : "+"}${delta}`;
            const delay = 0;
            setTimeout(() => {
                const deltaText = sessionDelta == 0 ?
                    "" : !isSessionNegativeDelta ?
                        `▴${sessionDelta}` : `▾${-1 * sessionDelta}`
                element.innerHTML = value + ` <span class="session-progress ${isSessionNegativeDelta ? "negative" : ""}">${deltaText}</span>`;
                element.classList.remove("delta");
            }, delay)
        }
        setValue(this.rankRateElement, "rankRate");
        setValue(this.rankElement, "Rank");
        setValue(this.pointsElement, "TotalPoints");
        setValue(this.softpointsElement, "TotalSoftcorePoints");
        setValue(this.retropointsElement, "TotalTruePoints");
        setValue(this.trueRatioElement, "trueRatio");

        this.userSummary = currentUserSummary;
    }
    async updateChart() {
        if (!this.uiProps.completionChart) return;
        const chartContainer = this.section.querySelector(".stats__chart-container");
        const completionData = await apiWorker.completionProgress();//"beaten-hardcore"
        const allGames = completionData?.Results ?? [];
        const allGamesCount = allGames.length;
        const masteryRate = allGames.filter(g => g.HighestAwardKind === 'mastered').length / allGamesCount * 100;
        const completionRate = allGames.filter(g => g.HighestAwardKind === 'completed').length / allGamesCount * 100;
        const beatenRate = allGames.filter(g => g.HighestAwardKind === 'beaten-hardcore').length / allGamesCount * 100;
        const beatenSoftRate = allGames.filter(g => g.HighestAwardKind === 'beaten-softcore').length / allGamesCount * 100;

        chartContainer.style.setProperty('--m', masteryRate + '%');
        chartContainer.style.setProperty('--c', completionRate + '%');
        chartContainer.style.setProperty('--b', beatenRate + '%');
        chartContainer.style.setProperty('--b-s', beatenSoftRate + '%');

        this.section.querySelector('.legend__value-mastered').innerText = masteryRate.toFixed(2) + '%';
        this.section.querySelector('.legend__value-completed').innerText = completionRate.toFixed(2) + '%';
        this.section.querySelector('.legend__value-beaten').innerText = beatenRate.toFixed(2) + '%';
        this.section.querySelector('.legend__value-beaten-soft').innerText = beatenSoftRate.toFixed(2) + '%';
        this.section.querySelector('.legend__value-progress').innerText = (100 - masteryRate - completionRate - beatenRate - beatenSoftRate).toFixed(2) + '%';

    }
    statusProperties = {
        percentile: { label: ui.lang.percentile, id: "stats_rank-rate", class: 'stats__rank-value' },
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
