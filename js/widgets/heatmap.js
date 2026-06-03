import { config, ui, apiWorker } from "../script.js";
import { Widget } from "./widget.js";
import { generateBadges } from "../components/badges.js";
import { fromHtml } from "../functions/html.js";


export class Heatmap extends Widget {
    widgetIcon = {
        description: "heatmap",
        iconClass: "heatmap",
    };

    constructor() {
        super();
        this.generateWidget();

        this.addWidgetIcon();
        this.initializeElements();
        this.setElementsVisibility();
        this.addEvents();
        this.applyPosition();
        this.generateWidgetContent();
        this.VISIBLE = true;
    }
    initializeElements() {
        this.section = document.getElementById("heatmap");
        this.content = this.section.querySelector(".widget-content__container");
    }
    setElementsVisibility() {
    }
    addEvents() {
        super.addEvents();
    }
    generateWidget() {
        const widget = this.generateWidgetElement({ classes: ["heatmap__section", "section"], id: "heatmap", title: "**Heatmap**" });
        ui.app.appendChild(widget);
    }
    generateWidgetContent() {
        this.content.innerHTML = ``;
        const gridContainer = fromHtml(`
            <div class="heatmap__container"></div>
        `);
        const gridHeader = fromHtml(`
            <h2 class="heatmap__header">Unlocked 1245 achievements in the last year</h2>
        `)
        const pointsContainer = fromHtml(`
            <div class="heatmap__cells-grid scrollable"></div>
        `);
        const point = (data) => fromHtml(`
            <div class="heatmap__cell-container" data-title="${data}">
                <div class="heatmap__cell" style="opacity:${Math.random()}"></div>
            </div>
        `)
        const dataArray = Array.from({ length: 356 }, (_, i) => ~~(Math.random() * 50));
        const points = dataArray.map(pointData => point(pointData));

        pointsContainer.append(...points);
        gridContainer.append(gridHeader, pointsContainer);
        this.content.append(gridContainer);
    }
    close() {
        this.VISIBLE = false;
    }
}