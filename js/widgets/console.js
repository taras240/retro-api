import { Widget } from "./widget.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { fromHtml } from "../functions/html.js";
import { subscribeToConsole } from "../functions/consoleCapture.js";

export class ConsoleWidget extends Widget {
    widgetTitle = lang.consoleSectionName;
    widgetIcon = {
        description: "Console",
        iconClass: "terminal-icon",
    };

    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        this.applyPosition();
        this.unsubscribeFromConsole = subscribeToConsole((entry) => this.addEntry(entry));
    }

    generateWidget() {
        const widget = fromHtml(`
            <section#console_section.console_section.section>
                <.header-container.console-header>
                    <.header-icon.terminal-icon/>
                    <h2.widget-header-text>${this.widgetTitle}</h2>
                    <button.console__clear.clear-icon data-title="${lang.clearAll}"/>
                    ${buttonsHtml.close()}
                </>
                <.console-container.content-container>
                    <div.console__output.scrollable/>
                </>
                <.resizer/>
            </section>
        `);
        ui.app.append(widget);
    }

    initializeElements() {
        this.section = document.querySelector("#console_section");
        this.sectionID = this.section.id;
        this.output = this.section.querySelector(".console__output");
    }

    addEvents() {
        super.addEvents();
        this.section.querySelector(".console__clear").addEventListener("click", () => {
            this.output.replaceChildren();
        });
    }

    addEntry(entry) {
        const level = entry.startsWith("[ERROR]") ? "error" : entry.startsWith("[WARN]") ? "warn" : "log";
        const line = document.createElement("div");
        line.classList.add("console__entry", `console__entry--${level}`);
        const time = new Date().toLocaleTimeString();
        line.textContent = `[${time}] ${entry}`;
        this.output.append(line);
        this.output.scrollTop = this.output.scrollHeight;
    }
}
