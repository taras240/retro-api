import { UI } from "../ui.js";
import { config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
export class Note extends Widget {
    widgetIcon = {
        description: "notes widget",
        iconID: `side-panel__note`,
        onChangeEvent: `ui.note.VISIBLE = this.checked`,
        iconClass: "note-icon",
    };
    AUTOSAVE_INTERVAL_MILISECS = 2000;
    get notesTabs() {
        return [
            {
                type: "radio",
                name: "note__tabs",
                id: "notes__main-tab",
                label: ui.lang.mainNote,
                checked: this.CURRENT_TAB === 'main',
                onChange: `ui.note.CURRENT_TAB = 'main'`,
            },
            {
                type: "radio",
                name: "note__tabs",
                id: "notes__game-tab",
                label: ui.lang.gameNote,
                checked: this.CURRENT_TAB === 'game',
                onChange: `ui.note.CURRENT_TAB = 'game'`,
            },
        ]
    }
    get NOTES_VALUE() {
        return config._cfg.ui?.note_section?.notes ?? "";
    }
    set NOTES_VALUE(value) {
        config._cfg.ui.note_section.notes = value;
        config.writeConfiguration();
    }
    get GAME_NOTES_VALUE() {
        const gameID = watcher.GAME_DATA?.ID ?? 0;
        return config.gamesDB[gameID]?.notes ?? "";
    }
    set GAME_NOTES_VALUE(value) {
        const gameID = watcher.GAME_DATA?.ID ?? 0;
        config.gamesDB[gameID].notes = value;
        config.writeConfiguration();
    }
    get CURRENT_TAB() {
        return config._cfg.ui?.note_section?.currentTab ?? "main";
    }
    set CURRENT_TAB(value) {
        config._cfg.ui.note_section.currentTab = value;
        config.writeConfiguration();
        this.switchActiveTab();
    }
    constructor() {
        super();
        this.addWidgetIcon();
        if (!config._cfg.ui.note_section) {
            config._cfg.ui.note_section = {};
        }
        this.initializeElements();
        this.generateTabs();
        this.addEvents();
        this.setValues();
        UI.applyPosition({ widget: this });

    }
    initializeElements() {
        this.section = document.querySelector("#note_section");

        this.header = this.section.querySelector(".header-container");
        this.resizer = this.section.querySelector("#note-resizer");
        this.textarea = this.section.querySelector(".note-textaria");
    }
    generateTabs() {
        const tabsHtml = this.notesTabs.reduce((tabsHtml, tab) => {
            const tabHtml = `
          <div class="checkbox-input_container" onmousedown="event.stopPropagation()">
            <input  onchange="${tab.onChange}" type="radio" id="${tab.id}" ${tab.checked ? "checked" : ""} name="${tab.name}">
            <label class="radio-tab" for="${tab.id}">${tab.label}</label>
          </div>
        `;
            tabsHtml += tabHtml;
            return tabsHtml;
        }, '');

        document.querySelector(".note__tabs-container").innerHTML = tabsHtml;

    }
    addEvents() {
        super.addEvents();
        this.delayedSave = {};
        this.textarea.addEventListener("input", this.textInputHandler)
    }
    textInputHandler(event) {
        const gameID = watcher.GAME_DATA?.ID ?? 0;
        const noteID = ui.note.CURRENT_TAB == "main" ? 'main' : gameID;
        const noteText = ui.note.textarea.value;

        clearTimeout(ui.note.delayedSave[noteID]);

        ui.note.delayedSave[noteID] = setTimeout(() => {
            ui.note.saveNoteValue({ id: noteID, value: noteText })
        },
            ui.note.AUTOSAVE_INTERVAL_MILISECS);

    }
    saveNoteValue({ id, value }) {
        switch (id) {
            case "main":
                this.NOTES_VALUE = value;
                break;
            default:
                this.GAME_NOTES_VALUE = value;
        }
    }
    setValues() {
        this.switchActiveTab();
    }
    switchActiveTab() {
        switch (this.CURRENT_TAB) {
            case 'main':
                this.textarea.value = this.NOTES_VALUE;
                break;
            case 'game':
                this.textarea.value = this.GAME_NOTES_VALUE;
                break;
        }
    }
    updateGame() {
        if (this.CURRENT_TAB === 'game') {
            this.textarea.value = this.GAME_NOTES_VALUE;
        }
    }
    async copyNoteText() {
        const selectedText = this.textarea.value.substring(this.textarea.selectionStart, this.textarea.selectionEnd)
        const text = selectedText ? selectedText : this.textarea.value;
        try {
            await navigator.clipboard.writeText(text);
            this.textInputHandler();
        } catch (err) {
            console.error(err);
        }
    }
    async pasteTextToNote() {
        try {
            const text = await navigator.clipboard.readText();
            this.textarea.value += text;
            this.textInputHandler();
        } catch (err) {
            console.error(err);
        }
    }
    clearTextNote() {
        this.textarea.value = '';
        this.textInputHandler();
    }
}