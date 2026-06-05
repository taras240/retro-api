import { UI } from "../ui.js";
import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";

import { config, ui, APIEvents, UIEvents } from "../script.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { moveDirections, sumDirections } from "../enums/moveDirections.js";
import { getHoveredEdge } from "../functions/hoveredEdges.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { resizerHtml } from "../components/resizer.js";
import { divHtml } from "../components/divContainer.js";
import { fromHtml } from "../functions/html.js";
import { getRandomID } from "../functions/randomID.js";
import { UI_EVENTS_LIST } from "../enums/UIEvents.js";

export class Widget {
    widgetIcon = {
        imageSource: "../assets/img/gamepad.svg",
        iconID: "widget-id",
        iconClass: "gamepad-icon",
        onChangeEvent: null,

    };
    uiProps = new Proxy({}, {
        get: (_, property) => {
            const defValue = this.uiDefaultValues?.[property] ?? true;
            const loader = this.uiValueLoader?.[property];
            if (loader) {
                return loader() ?? defValue;
            }
            return config.getUIProperty({ sectionID: this.sectionID, property }) ?? defValue;
        },
        set: (_, property, value) => {
            const preprocessor = this.uiValuePreprocessors[property];
            if (typeof preprocessor === 'function') {
                value = preprocessor(value, this);
            }
            const saver = this.uiValueSaver?.[property];
            if (typeof saver === 'function') {
                saver(value);
            }
            else {
                config.saveUIProperty({ sectionID: this.sectionID, property, value });
            }
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
    saveConfig() {
        this.uiProps.abc = null;
    }
    uiDefaultValues = {
        // showBadges: true,
    }
    uiSetCallbacks = {
        // fun(value){}
    };
    uiValuePreprocessors = {
    };
    uiValueLoader = {}
    uiValueSaver = {}
    get VISIBLE() {
        const hidden = this.uiProps?.hidden;
        return hidden == null ? false : !hidden;
    }
    set VISIBLE(value) {
        this.switchVisibility();
        this.widgetIcon.element && (this.widgetIcon.element.checked = this.VISIBLE);
    }

    constructor() {
        this.addAPIEvents();
        this.addUIEvents();
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
            else if (!event.target.closest("button,input,.button") && event.target.closest(".header-container")) {
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
    addAPIEvents() {
        const events = {
            gameChange: (e) => this.onGameChange(e?.detail ?? {}),
            startSession: (e) => this.onStartSession(e?.detail ?? {}),
            stopSession: () => this.onStopSession(),
            cheevoUnlocks: (e) => this.onCheevoUnlocks(e?.detail ?? {}),
            awardsEarned: (e) => this.onAwardsEarned(e?.detail ?? {}),
            statsUpdate: (e) => this.onStatsUpdate(e?.detail ?? {}),
            APIRequest: () => this.onAPIRequest(),
        };

        for (const [name, handler] of Object.entries(events)) {
            APIEvents.addEventListener(name, (e) => {
                try {
                    handler(e);
                } catch (err) {
                    console.error(`Widget ${this.sectionID} ${name} error:`, err);
                }
            });
        }
    }
    addUIEvents() {
        const events = {
            [UI_EVENTS_LIST.customOrderChanged]: (e) => this.onCustomOrderChanged(),
        };
        for (const [name, handler] of Object.entries(events)) {
            UIEvents.addEventListener(name, (e) => {
                try {
                    handler(e);
                } catch (err) {
                    console.error(`Widget ${this.sectionID} ${name} error:`, err);
                }
            });
        }
    }
    setElementsValues() { }
    onGameChange({ gameData, inNewGame, isWatching }) { }
    onCheevoUnlocks({ cheevos }) { }
    onAwardsEarned({ awardsArray }) { }
    onStartSession({ gameData }) { }
    onStatsUpdate({ userData }) { }
    onStopSession() { }
    onAPIRequest() { }
    onCustomOrderChanged() {

    }
    addWidgetIcon() {
        const isChecked = config.ui?.[this.section?.id]?.hidden === false ?? !this.VISIBLE;
        const { onChangeEvent, description, iconClass, badgeLabel } = this.widgetIcon;
        const iconID = getRandomID();
        const widgetsContainer = document.querySelector(".buttons-block__shortcuts");
        const widgetIcon = fromHtml(`
                <div class="setting-radio-group">
                    <input type="checkbox" name="${iconID}" id="${iconID}" ${isChecked ? "checked" : ""}></input>
                        <label class="side-panel_input" data-title="${description}" for="${iconID}">
                            <i class="side-panel__icon ${iconClass}"></i>
                        </label>
                        <div class="side-panel__badge">
                            ${badgeLabel ? badgeElements.black(badgeLabel) : ""}
                        </div>
                </div>
        `);
        const input = widgetIcon.querySelector("input");
        input?.addEventListener("change", event => {
            if (typeof onChangeEvent === "function") {
                onChangeEvent();
            } else {
                this.VISIBLE = event.currentTarget.checked;
            }
        })
        widgetsContainer.appendChild(widgetIcon);
        this.widgetIcon.element = input;

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
    applyPosition() {
        const { x, y, width, height, hidden } = this.uiProps;
        const setSidePanelIconValues = () => {
            if (this.widgetIcon?.element) {
                this.widgetIcon.element.checked = this.VISIBLE;
            }
        }
        const hideWidget = () => {
            this.section.classList.add("hidden", "disposed");
        }
        // Getting positions and dimensions from config.ui
        const { clientWidth, clientHeight } = ui.app;
        const xValue = parseInt(x);
        const yValue = parseInt(y);
        // Set positions and dimensions for widget if they are saved in config.ui
        x && (this.section.style.left = xValue < 0 ? 0 : xValue > (clientWidth - 10) ? `${clientWidth - 100}px` : x);
        y && (this.section.style.top = yValue < 0 ? 0 : yValue > (clientHeight - 10) ? `${clientHeight - 100}px` : y);
        width && (this.section.style.width = width);
        height && (this.section.style.height = height);

        const isHidden = hidden ?? true;
        isHidden && hideWidget();



        !this.VISIBLE && hideWidget();

        setSidePanelIconValues();
    }
    switchVisibility() {
        if (this.section.classList.contains("hidden")) {
            //set visible
            this.section.classList.remove("disposed", "hidden");
            this.uiProps.hidden = false;
        }
        else {
            //set hidden
            this.section.classList.add("hidden", "disposed");
            this.uiProps.hidden = true;
        }
    }
}