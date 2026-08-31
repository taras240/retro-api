import { Widget } from "./widget.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { resizerHtml } from "../components/resizer.js";
import { fromHtml } from "../functions/html.js";


export class ModalWindow extends Widget {
    widgetIcon = {
        iconClass: "info-icon",
    };
    constructor(windowData) {
        super();
        this.generateModalElement(windowData);
        this.initializeElements();
        this.addEvents();
        this.applyPosition();
        this.switchVisibility();
    }
    generateModalElement({ id, classList = [], title, content }) {
        this.close(id);
        const widget = fromHtml(`
            <section#${id} class="popup-section section ${classList.join(" ")}">
                <.header-container>
                    <.header-icon.${this.widgetIcon.iconClass}/>
                    <h2.widget-header-text>${title}</h2>
                    ${buttonsHtml.close()}
                </>
                <.${"widget-content__container"}>
                    ${content}
                </>
                ${resizerHtml}
            </section>
        `);

        this.section = widget;
        ui.app.appendChild(widget);
        this.section = widget;
    }
    initializeElements() {
        this.sectionID = this.section.id;
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
    switchVisibility() {
        this.section.classList.remove("disposed", "hidden");
    }
    close() {
        this.section?.remove();
    }
}