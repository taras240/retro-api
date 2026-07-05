import { badgeElements } from "../components/badges.js";
import { gameCard, gameCardConfig } from "../components/constructor/gameCard.js";
import { gameProgressbar, gameProgressbarConfig } from "../components/constructor/gameProgressbar.js";
import { simpleProgressbar, simpleProgressbarConfig } from "../components/constructor/simpleProgressbar.js";
import { steamProgress, steamProgressConfig } from "../components/constructor/steamProgress.js";
import { text, textConfig } from "../components/constructor/textElement.js";
import { divHtml } from "../components/divContainer.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { inputElement, inputTypes } from "../components/inputElements.js";
import { resizerHtml } from "../components/resizer.js";
import { moveDirections } from "../enums/moveDirections.js";
import { formatText } from "../functions/formatText.js";
import { fromHtml } from "../functions/html.js";
import { moveEvent, setPosition } from "../functions/movingWidget.js";
import { getRandomID } from "../functions/randomID.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { sortBy } from "../functions/sortFilter.js";
import { ui, watcher } from "../script.js";
import { Widget } from "./widget.js";

export class Constructor extends Widget {
    widgetIcon = {
        imageSource: "../assets/img/handyman.svg",
        // iconID: "widget-id",
        iconClass: "constructor-icon",
        onChangeEvent: () => this.VISIBLE = !this.VISIBLE,
        description: ui.lang.constructorWidget,

    };
    uiDefaultValues = {
        x: '0px',
        y: '0px',
        hidden: true,
        elements: []
    }

    constructor() {
        super();
        this.addWidgetIcon();
        this.showWidgets();
        this.open();
    }
    updateWidgets() {
        if (!watcher.GAME_DATA) return;
        this.updateKeys();
        this.widgets.forEach(widget => {
            try {
                widget.update();
            }
            catch (e) {
                console.warn(e)
            }
        }
        )
    }
    removeWidgets() {
        this.widgets.forEach(widget => {
            try {
                widget.remove();
            }
            catch (e) {

                console.warn(e)
            }
        });
        this.widgets = [];
    }
    onGameChange({ gameData }) {
        this.showWidgets();
    }
    onCheevoUnlocks() {
        this.updateWidgets();
    }
    onAwardsEarned({ awardsArray }) {
        this.updateWidgets();
    }
    onStartSession({ gameData }) {
        this.updateWidgets();
    }
    onStatsUpdate({ userData }) {
        this.updateWidgets();
    }
    onStopSession() {
        this.updateWidgets();
    }
    deleteItem(index) {
        this.uiProps.elements.splice([index], 1);
        this.uiProps.elements = this.uiProps.elements;
        this.showWidgets();
        this.fillConfigItems();
    }
    fillConfigItems() {
        this.container.innerHTML = "";
        this.uiProps.elements.forEach((props, index) => {
            props.index = index;
            const item = fromHtml(`
                    <div class="constructor__item">
                        <h2 class="constructor-item__header">${props.name || props.type}</h2>
                        <p class="constructor-item__description">${props.value || ""}</p>
                        <div class="constructor-item__controls-container"></div>
                    </div>
                `);
            const deleteButton = fromHtml(buttonsHtml.delete());
            item.querySelector(".constructor-item__controls-container").append(deleteButton);
            this.container.append(item);
            item.addEventListener("click", event => {
                this.editElement(props, item);
            });
            deleteButton.addEventListener("click", event => {
                event.stopPropagation();
                this.deleteItem(index);
            })
        })
        const addItem = fromHtml(`
                        <button class="constructor__add-button">${ui.lang.addElement}</button>
                `);
        addItem.addEventListener("click", event => {
            this.uiProps.elements = [
                ...this.uiProps.elements,
                {
                    type: "text",
                }
            ];
            this.fillConfigItems();
            this.showWidgets();
        })
        this.container.append(addItem);


    }
    openConfig() {
        this.section?.remove();
        this.section = super.generateWidgetElement({
            classes: ["constructor_widget", "section"],
            id: "constructor_widget",
            title: ui.lang.constructorWidget,
            contentClasses: ["constructor-elements"]
        });
        ui.app.append(this.section);
        this.sectionID = this.section.id;
        this.container = this.section.querySelector(".constructor-elements");
        this.fillConfigItems();
        super.addEvents();
        super.applyPosition();
    }
    widgets = [];
    updateKeys() {
        const { userData, GAME_DATA: gameData, sessionData } = watcher;
        const focusCheevo = Object.values(watcher.CHEEVOS)?.sort((a, b) => sortBy.customOrder(a, b)).filter(c => !c.isEarned)?.[0] ?? {};
        const lastUnlocked = Object.values(watcher.CHEEVOS)?.sort((a, b) => sortBy.latest(a, b)).filter(c => c.isEarned)?.[0] ?? {};
        this.keys = {
            gameTitle: gameData.Title,
            consoleName: gameData.ConsoleName,
            totalCheevos: gameData.NumAchievements,
            totalPoints: gameData.totalPoints,
            totalRetropoints: gameData.totalRetropoints,
            retroRatio: gameData.retroRatio,
            masteryRate: gameData.masteryRate,
            beatenRate: gameData.beatenRate,
            unlockedCheevos: gameData.unlockData?.hardcore?.count ?? 0,
            unlockedCheevosTotal: gameData.unlockData?.softcore?.count ?? 0,
            unlockedPoints: gameData.unlockData?.hardcore?.points ?? 0,
            unlockedPointsTotal: gameData.unlockData?.softcore?.points ?? 0,
            unlockedRetropoints: gameData.unlockData?.hardcore?.retropoints ?? 0,
            unlockedCheevosRate: Math.floor(100 * (gameData.unlockData?.hardcore?.count ?? 0) / gameData.NumAchievements),
            releasedDate: gameData.Released,
            genre: gameData.Genre,
            playersCount: gameData.totalRealPlayers,
            focusCheevoTitle: focusCheevo.Title,
            focusCheevoDescription: focusCheevo.Description,
            lastUnlockedTitle: lastUnlocked.Title,
            lastUnlockedDescription: lastUnlocked.Description,
            userRATop: userData.percentile,
            userRank: userData.rank,
            userPoints: userData.points,
            userRetropoints: userData.retropoints,
            userSoftpoints: userData.softpoints,
            userName: userData.userName,
            userTrueRatio: userData.trueRatio,
            richPresence: userData.richPresence,
            sessionUnlocks: sessionData.cheevos,
            sessionUnlocksSoftcore: sessionData.cheevosSoftcore,
            sessionPoints: sessionData.points,
            sessionSoftpoints: sessionData.softpoints,
            sessionRetropoints: sessionData.retropoints,
        }
    }
    componentsInputProperties = {
        text: (props) => textConfig(props, this.keys),
        gameProgressbar: (props) => gameProgressbarConfig(props),
        simpleProgressbar: (props) => simpleProgressbarConfig(props),
        steamProgress: (props) => steamProgressConfig(props),
        gameCard: (props) => gameCardConfig(props),
    }
    components = {
        text: (props) => text(props, this),
        gameProgressbar: (props) => gameProgressbar({ props, gameData: watcher.GAME_DATA, parent: this }),
        steamProgress: (props) => steamProgress({ props, gameData: watcher.GAME_DATA }),
        gameCard: (props) => gameCard({ props, gameData: watcher.GAME_DATA, parent: this }),
        simpleProgressbar: (props) => simpleProgressbar({ props, parent: this })
    }
    showWidgets() {
        if (!this.elContainer) {
            this.elContainer = fromHtml(`<div class="constructor"></div>`);
            ui.app.append(this.elContainer);
        }
        this.removeWidgets();
        if (!watcher.GAME_DATA) return;
        this.updateKeys();


        this.uiProps.elements.forEach((props, index) => {
            const { type } = props;
            const widget = this.components[type](props);
            this.widgets.push(widget);
            const widgetElement = widget?.element;
            this.elContainer.append(widgetElement);
            widgetElement.addEventListener("mousedown", event => {
                const saveSize = () => {
                    this.uiProps.elements[index] = Object.assign(this.uiProps.elements[index], {
                        width: widgetElement.offsetWidth,
                        height: widgetElement.offsetHeight,
                    });
                    this.uiProps.elements = this.uiProps.elements;
                }
                const savePosition = () => {
                    this.uiProps.elements[index] = Object.assign(this.uiProps.elements[index], {
                        x: widgetElement.style.left,
                        y: widgetElement.style.top,
                    });
                    this.uiProps.elements = this.uiProps.elements;
                }
                if (event.target.matches(".resizer")) {
                    resizeEvent({
                        event: event,
                        section: widgetElement,
                        resizeDirection: moveDirections.bottomRight,
                        saveSize
                    })
                }
                else {
                    moveEvent(widgetElement, event, savePosition);
                }
            })
        })
    }
    editElement(itemProps = {}, item = {}) {
        const props = { ...itemProps };
        const getElementProps = (type) => {
            return this.componentsInputProperties[type](props);
        }
        const saveData = () => {
            Object.assign(itemProps, props);
            this.uiProps.elements[props.index] = itemProps;
            this.uiProps.elements = this.uiProps.elements;
            this.showWidgets();
            this.fillConfigItems();
        }
        const saveSelectedElement = (key, value) => {
            props.value = value;
            props.type = key;
            saveData();
            openElementProps(key)
        }
        const openElementProps = (key) => {
            if (!this.componentsInputProperties[key]) return;
            this.editElement(itemProps, item);
        }
        const editorItems = [
            {
                type: inputTypes.SEARCH_INPUT,
                label: ui.lang.elName,
                value: props.name ?? "",
                title: ui.lang.elName,
                classList: ["wide-input"],
                onChange: (event) => props.name = event.currentTarget.value,
            },
            {
                label: ui.lang.possibleElements,
                elements: [
                    ...Object.keys(this.components).map(key => ({
                        type: inputTypes.RADIO,
                        name: "constr__element-select",
                        label: key,
                        checked: props.type === key,
                        onChange: () => saveSelectedElement(key, props.value),
                    }))
                ]
            },
            ...getElementProps(itemProps.type),

            {
                label: "",
                elements: [
                    {
                        type: inputTypes.BUTTON,
                        label: ui.lang.saveData,
                        onClick: () => saveData(),
                    },

                ]
            },
        ]
        const editorContainer = fromHtml(`
            <div class="editor-container"></div>
        `);

        ui.settings.openSettings(editorItems)
    }

    open() {
        this.openConfig();
    }
    close() {
        this.section?.remove();
        this.VISIBLE = false;
    }
    switchVisibility() {
        this.uiProps.hidden = this.VISIBLE;
        if (this.VISIBLE) {
            this.openConfig();
        }
        else {
            this.section?.remove();
        }

    }
}