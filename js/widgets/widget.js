import { UI } from "../ui.js";
import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";

import { config, ui, apiWorker } from "../script.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { moveDirections, sumDirections } from "../enums/moveDirections.js";
import { getHoveredEdge } from "../functions/hoveredEdges.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { resizerHtml } from "../components/resizer.js";
import { divHtml } from "../components/divContainer.js";

export class Widget {
    widgetIcon = {
        imageSource: "../assets/img/gamepad.svg",
        iconID: "widget-id",
        iconClass: "gamepad-icon",
        onChangeEvent: "",

    };
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
        // showBadges: true,
    }
    uiSetCallbacks = {
        // fun(value){}
    };
    uiValuePreprocessors = {
    };
    get VISIBLE() {
        return !this.section.classList.contains("hidden") && !!config.ui[this.section?.id];;
    }
    set VISIBLE(value) {
        UI.switchSectionVisibility({ section: this.section, visible: value })
        this.widgetIcon.element && (this.widgetIcon.element.checked = value);
    }

    constructor() {

    }
    addEvents() {
        this.section.addEventListener('mousedown', (event) => {
            const hoveredEdge = getHoveredEdge(event, this.section);
            if (event.button !== 0) return

            if (event.target.matches(".close-icon")) {
                this.close();
            }
            else if (event.target.matches(".tweak-button")) {
                this.contextMenuItems && ui.settings.openSettings(this.contextMenuItems);
            }
            else if (event.target.matches(".resizer") || hoveredEdge) {
                this.section.classList.add("resized");
                resizeEvent({
                    event: event,
                    section: this.section,
                    resizeDirection: event.target.matches(".resizer") ?
                        moveDirections.bottomRight :
                        hoveredEdge,
                    callback: this.resizeCallback
                })
            }
            // Drag Section Event
            else if (event.target.closest(".header-container")) {
                moveEvent(this.section, event);
            }

        });
        this.section.addEventListener('mousemove', (event) => {
            this.section.classList.remove(...Object.values(moveDirections).map(dir => "hover-" + dir), "resize-hover", "grab-hover");
            let hoveredEdge = getHoveredEdge(event, this.section);
            if (hoveredEdge) {
                this.section.classList.add(`hover-${hoveredEdge}`, "resize-hover");
            }
            else if (event.target.closest(".header-container")) {
                this.section.classList.add("grab-hover")
            }
        })
        this.section.addEventListener('mouseleave', (event) => {
            this.section.classList.remove(...Object.values(moveDirections).map(dir => "hover-" + dir), "resize-hover");
        })
        Array.isArray(this.contextMenuItems) && this.section.addEventListener("contextmenu", (event) => {
            ui.showContextmenu({
                event: event,
                menuItems: this.contextMenuItems,
                sectionCode: this.CLONE_NUMBER || "",
            });
        });

    }
    addWidgetIcon() {
        const isChecked = config.ui?.[this.section?.id]?.hidden === false ?? !this.VISIBLE;
        const { iconID, onChangeEvent, description, iconClass, badgeLabel } = this.widgetIcon;

        const widgetsContainer = document.querySelector(".buttons-block__shortcuts");
        const widgetIcon = document.createElement("div");
        widgetIcon.classList.add("setting-radio-group");
        widgetIcon.innerHTML = `
            <input type="checkbox" name="${iconID}" id="${iconID}" onchange="${onChangeEvent}" ${isChecked ? "checked" : ""}></input>
            <label class="side-panel_input" data-title="${description}" for="${iconID}">
                    <i class="side-panel__icon ${iconClass}"></i>
            </label>
            <div class="side-panel__badge">
                ${badgeLabel ? badgeElements.black(badgeLabel) : ""}
            </div>`;
        widgetsContainer.appendChild(widgetIcon);

        this.widgetIcon.element = document.getElementById(iconID);

    }
    generateWidgetElement({ classes, id, title, headerElementsHtml, contentClasses = ["widget-content__container"], contentHtml }) {
        contentHtml ??= divHtml(contentClasses);
        const widget = document.createElement("section");
        widget.classList.add(...classes);
        widget.id = id;
        widget.innerHTML = `
            <div class="header-container">
                <div class="header-icon ${this.widgetIcon.iconClass}"></div>
                <h2 class="widget-header-text">${title}</h2>
                ${headerElementsHtml ?? ""}
                ${buttonsHtml.close()}
            </div>
            ${contentHtml}
            ${resizerHtml()}`;
        return widget;
    }
    open() {
    }
    close() {
        this.VISIBLE = false;
    }
}