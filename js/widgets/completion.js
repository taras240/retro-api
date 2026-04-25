import { buttonsHtml } from "../components/htmlElements.js";
import { ui } from "../script.js";
import { Widget } from "./widget.js";

export class Completion extends Widget {
    get VISIBLE() {
        return true;
    }
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
    }
    generateWidget() {
        const containerHtml = `
            <ul class="platform-list" id="completion-list"></ul>
        `
        const widgetID = "completion_section";
        const headerElementsHtml = `
            ${buttonsHtml.reload()}
            ${buttonsHtml.fulscreen()}
        `;

        const widgetData = {
            classes: ["games_setion", "section"],
            id: widgetID,
            title: `Completion Progress`,
            headerElementsHtml: headerElementsHtml,
            contentClasses: ["games_container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        const contentContainer = widget.querySelector(".games_container");
        contentContainer.innerHTML = containerHtml;
        ui.app.appendChild(widget);
    }
}