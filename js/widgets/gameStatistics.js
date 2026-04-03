import { UI, generateGenres } from "../ui.js";
import { config, ui, apiWorker } from "../script.js";
import { Widget } from "./widget.js";
import { generateBadges } from "../components/badges.js";


export class GameStatistics extends Widget {
    widgetIcon = {
        description: "game statistics",
        iconClass: "game-stats",
        badgeLabel: "new",
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
    }
    initializeElements() {
        this.section = document.getElementById("game-statistics");
        this.content = this.section.querySelector(".content-container");
    }
    setElementsVisibility() {
    }
    addEvents() {
        super.addEvents();
    }
    generateWidget() {
        const widget = this.generateWidgetElement({ classes: ["game-statistics__section", "section"], id: "game-statistics", title: "**Game Stats**" });
        ui.app.appendChild(widget);
    }
    generateWidgetContent() {
        this.content.innerHTML = `
        Some Content`;
    }
    close() {
        this.VISIBLE = false;
    }
}