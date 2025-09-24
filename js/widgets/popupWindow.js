import { UI } from "../ui.js";
import { icons, signedIcons } from "../components/icons.js"
import { apiWorker, config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { generateBadges, badgeElements } from "../components/badges.js";
import { buttonsHtml } from "../components/htmlElements.js";


export class PopupWindow extends Widget {
    widgetIcon = {
        iconClass: "info-icon",
    };
    constructor(popupData) {
        super();
        this.generatePopupElement(popupData);
        this.initializeElements();
        this.addEvents();
        this.VISIBLE = true;
        UI.applyPosition({ widget: this });
    }
    generatePopupElement({ id, classList = [], title, content }) {
        this.close(id);
        const widget = document.createElement("section");
        widget.classList.add("popup-section", "section", ...classList);
        widget.id = id;
        widget.innerHTML = `
            <div class="header-container">
                <div class="header-icon ${this.widgetIcon.iconClass}"></div>
                <h2 class="widget-header-text">${title}</h2>
                ${buttonsHtml.close()}
            </div>
            <div class="${"widget-content__container"}">
                ${content}
            </div>
            <div class="resizer"></div>`;
        this.section = widget;
        ui.app.appendChild(widget);
    }
    initializeElements() {
    }
    addEvents() {
        super.addEvents();
        this.section.addEventListener("click", (event) => {
            if (event.target.matches(".comment__copy-button")) {
                const text = event.target.parentElement?.innerText;
                navigator.clipboard.writeText(text || "");
                // ui.showNotification({ text: "Copied to clipboard", type: "success" });
            }
            else if (event.target.matches(".comment__note-button")) {
                const text = event.target.parentElement?.innerText;
                const gameID = watcher.GAME_DATA?.ID || "main";
                let noteText = config.gamesDB[gameID]?.notes ?? "";
                noteText += "\n-----------------\n" + text + "\n-----------------\n";
                ui.note.saveNoteValue({ id: gameID, value: noteText.trim() });
                ui.note.switchActiveTab();
                ui.note.switchActiveTab();
                // ui.showNotification({ text: "Copied to clipboard", type: "success" });
            }
        });
    }
    close(id) {
        id ? document.querySelector(`#${id}`)?.remove() : super.close();
    }
}