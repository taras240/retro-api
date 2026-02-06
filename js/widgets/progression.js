import { UI } from "../ui.js";
import { config, ui, apiWorker, watcher } from "../script.js";
import { generateBadges, badgeElements } from "../components/badges.js";

import { Widget } from "./widget.js";
import { formatDateTime } from "../functions/time.js";
import { CHEEVO_TYPES } from "../enums/cheevoTypes.js";
import { inputTypes } from "../components/inputElements.js";
import { filterBy, sortBy } from "../functions/sortFilter.js";
export class Progression extends Widget {
    widgetIcon = {
        description: "progression widget",
        iconID: `side-panel__progression`,
        onChangeEvent: `ui.progression.VISIBLE = this.checked`,
        iconClass: "progression",
    };
    get contextMenuItems() {
        return [
            {
                label: ui.lang.elements,
                elements: [
                    {
                        label: ui.lang.showHeader,
                        type: inputTypes.CHECKBOX,
                        id: "show-header",
                        checked: this.uiProps.showHeader,
                        onChange: (event) => this.uiProps.showHeader = event.currentTarget.checked,
                    },
                    {
                        label: ui.lang.showBackground,
                        type: inputTypes.CHECKBOX,
                        id: "show-bg",
                        checked: this.uiProps.showBG,
                        onChange: (event) => this.uiProps.showBG = event.currentTarget.checked,
                    },]
            },
            {
                label: ui.lang.style,
                elements: [
                    {
                        label: ui.lang.showSubLevels,
                        type: inputTypes.CHECKBOX,
                        id: "show-sublevels",
                        checked: this.uiProps.showSublevels,
                        onChange: (event) => this.uiProps.showSublevels = event.currentTarget.checked,
                    },
                    {
                        label: ui.lang.showAllDesc,
                        type: inputTypes.CHECKBOX,
                        id: "show-all-descr",
                        checked: this.uiProps.showAllDescriptions,
                        onChange: (event) => this.uiProps.showAllDescriptions = event.currentTarget.checked,
                    },

                ]
            },

        ];
    }
    uiDefaultValues = {
        showBG: true,
        showHeader: false,
        hardMode: true,
        showSublevels: true,
        showAllDescriptions: false,

    }
    uiSetCallbacks = {

    };
    uiValuePreprocessors = {

    };

    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.setElementsValues();
        this.addEvents();
        UI.applyPosition({ widget: this });
        this.generateProgression();
    }
    initializeElements() {
        this.section = document.querySelector("#progression_section");
        this.sectionID = this.section.id;
        this.header = this.section.querySelector(".header-container");
        this.resizer = this.section.querySelector("#progression-resizer")
    }
    setElementsValues() {
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);
        this.section.classList.toggle("hide-bg", !this.uiProps.showBG);
        this.section.classList.toggle("show-all-descriptions", this.uiProps.showAllDescriptions);
        this.section.classList.toggle("show-sublevels", this.uiProps.showSublevels);
    }
    addEvents() {
        super.addEvents();
    }
    update({ earnedAchievementIDs }) {
        earnedAchievementIDs[0] && (this.uiProps.hardMode = watcher.CHEEVOS[earnedAchievementIDs[0]].isEarnedHardcore);
        this.generateProgression();
    }
    generateWidget() {
        const widgetData = {
            classes: ["progression_section", "section", "compact-header"],
            id: "progression_section",
            title: ui.lang.progressionSectionName,
            contentClasses: ["progression__list", "content-container"],
        }
        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
    }
    generateProgression() {
        const listContainer = this.section.querySelector(".progression__list");
        function generatePoint(cheevo, cheevosArray) {
            const pointLevel = cheevo.level;
            const nextLevel = cheevosArray
                ?.find(c => c.level > pointLevel)
                ?.level ?? pointLevel + 1;
            const subCheevos = pointLevel != null ? Object.values(watcher.CHEEVOS)
                .filter(c =>
                    c.level && ![CHEEVO_TYPES.PROGRESSION, CHEEVO_TYPES.WIN].includes(c.Type) && c.level >= pointLevel && c.level < nextLevel
                ) : [];

            const point = `
                <li class="progression__item ${focusID === cheevo.ID ? "focus" : ""} ${cheevo.Type}-cheevo">
                    <p class="cheevo-date">${formatDateTime(cheevo.DateEarnedHardcore || cheevo.DateEarned, { year: "2-digit" })}</p>
                    <div class="mark ${cheevo.isEarned ? "earned" : ""} ${cheevo.isEarnedHardcore ? "hardcore" : ""}"></div>
                    <div class="cheevo-container">
                        <h3 class="cheevo-title" data-achiv-id="${cheevo.ID}">${cheevo.Title}</h3>
                        <p class="cheevo-description">
                            ${cheevo.Description}</p>
                        <div class="subcheevos-container">
                            ${subCheevos?.reduce((html, cheevo) => {
                html += `<h3 class="progression__subcheevo ${cheevo.isEarned ? "earned" : ""} ${cheevo.isEarnedHardcore ? "hardcore" : ""}" data-achiv-id="${cheevo.ID}">${cheevo.Title}</h3>`;
                return html;
            }, "")}
                        </div>
                    </div>
                </li>
            `
            return point;
        }
        // function formatDate(dateString) {
        //     if (!dateString) return "";
        //     const [date, time] = dateString.split(', ');

        //     let [day, month, year] = date.split('.');

        //     year = year.slice(2);

        //     return `${day}.${month}.${year} ${time}`;
        // }

        const cheevos = Object.values(watcher.CHEEVOS)
            ?.filter(c => filterBy.progression(c))
            .sort((a, b) => sortBy.progression(a, b));

        const focusID = cheevos.find(c => this.uiProps.hardMode ? !c.isEarnedHardcore : !c.isEarned)?.ID;

        listContainer.innerHTML = cheevos?.reduce((html, cheevo) => {
            html += generatePoint(cheevo, cheevos);
            return html;
        }, "") ?? "";
        this.scrollToFocus();
    }
    scrollToFocus() {
        const focusElement = this.section?.querySelector(".focus") || this.section?.querySelector(".win_condition-cheevo");
        focusElement?.scrollIntoView({ behavior: "auto", block: "center" });
    }
}