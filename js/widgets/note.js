import { UI } from "../ui.js";
import { config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { fromHtml } from "../functions/html.js";
export class Note extends Widget {
    widgetIcon = {
        description: "notes widget",
        iconID: `side-panel__note`,
        onChangeEvent: `ui.note.VISIBLE = this.checked`,
        iconClass: "note-icon",
    };
    AUTOSAVE_INTERVAL_MS = 1000;
    get notesTabs() {
        return [
            {
                type: "radio",
                name: "note__tabs",
                id: "notes__main-tab",
                label: ui.lang.mainNote,
                checked: this.uiProps.currentTab === 'main',
                onChange: () => this.uiProps.currentTab = 'main',
            },
            {
                type: "radio",
                name: "note__tabs",
                id: "notes__game-tab",
                label: ui.lang.gameNote,
                checked: this.uiProps.currentTab === 'game',
                onChange: () => this.uiProps.currentTab = 'game',
            },
        ]
    }
    uiDefaultValues = {
        currentTab: "main",
        gameNotes: "",
        notes: ""
    }
    uiSetCallbacks = {
        currentTab(value) {
            this.switchActiveTab(value);
        }
    };
    uiValuePreprocessors = {

    };
    uiValueLoader = {
        gameNotes() {
            const gameID = watcher.GAME_DATA?.ID ?? 0;
            return config.gamesDB[gameID]?.notes ?? "";
        }
    }
    uiValueSaver = {
        gameNotes(note) {
            const gameID = watcher.GAME_DATA?.ID ?? 0;
            config.gamesDB[gameID].notes = note;
            config.writeConfiguration();
        }
    }

    constructor() {
        super();
        this.addWidgetIcon();
        this.initializeElements();
        this.generateTabs();
        this.addEvents();
        this.setValues();
        UI.applyPosition({ widget: this });

    }
    initializeElements() {
        this.section = document.querySelector("#note_section");
        this.sectionID = this.section.id;
        this.header = this.section.querySelector(".header-container");
        this.resizer = this.section.querySelector("#note-resizer");
        this.textarea = this.section.querySelector(".note-textaria");
    }
    generateTabs() {
        const tabElement = ({ onChange, label, name, id, checked }) => {
            const element = fromHtml(`
                    <div class="checkbox-input_container">
                        <input type="radio" id="${id}" ${checked ? "checked" : ""} name="${name}">
                        <label class="radio-tab" for="${id}">${label}</label>
                    </div>
                `);
            element.addEventListener("mousedown", e => e.stopPropagation());
            element.querySelector("input")?.addEventListener("change", event => onChange(event));
            return element;
        }
        this.section.querySelector(".note__tabs-container").append(...this.notesTabs.map(tab => tabElement(tab)));

    }
    addEvents() {
        super.addEvents();
        this.delayedSave = {};
        this.textarea.addEventListener("input", (event) => this.textInputHandler(event))
    }
    setElementsValues() { }
    gameChangeEvent({ gameData }) {
        this.updateGame();
    }
    textInputHandler(event) {
        const gameID = watcher.GAME_DATA?.ID ?? 0;
        const noteID = this.uiProps.currentTab == "main" ? 'main' : gameID;
        const noteText = this.textarea.value;

        clearTimeout(this.delayedSave[noteID]);

        this.delayedSave[noteID] = setTimeout(() => {
            this.saveNoteValue({ id: noteID, value: noteText })
        },
            this.AUTOSAVE_INTERVAL_MS);

    }
    saveNoteValue({ id, value }) {
        switch (id) {
            case "main":
                this.uiProps.notes = value;
                break;
            default:
                this.uiProps.gameNotes = value;
        }
    }
    setValues() {
        this.switchActiveTab();
    }
    switchActiveTab() {
        switch (this.uiProps.currentTab) {
            case 'main':
                this.textarea.value = this.uiProps.notes;
                break;
            case 'game':
                this.textarea.value = this.uiProps.gameNotes;
                break;
        }
    }
    updateGame() {
        if (this.uiProps.currentTab === 'game') {
            this.textarea.value = this.uiProps.gameNotes;
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