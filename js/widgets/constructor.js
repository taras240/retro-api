import { badgeElements } from "../components/badges.js";
import { gameCard, gameCardConfig, neonGameCard, pixelGameCard } from "../components/constructor/gameCard.js";
import { gameProgressbar, gameProgressbarConfig } from "../components/constructor/gameProgressbar.js";
import { simpleProgressbar, simpleProgressbarConfig } from "../components/constructor/simpleProgressbar.js";
import { steamProgress, steamProgressConfig } from "../components/constructor/steamProgress.js";
import { achievementProgressbar, achievementProgressbarConfig } from "../components/constructor/achievementProgressbar.js";
import { richPresenceProgressbar, richPresenceProgressbarConfig } from "../components/constructor/richPresenceProgressbar.js";
import { titleProgressbar, titleProgressbarConfig } from "../components/constructor/titleProgressbar.js";
import { neonProgressbar, neonProgressbarConfig } from "../components/constructor/neonProgressbar.js";
import { pixelProgressbar, pixelProgressbarConfig } from "../components/constructor/pixelProgressbar.js";
import { pixelArtProgressbar, pixelArtProgressbarConfig } from "../components/constructor/pixelArtProgressbar.js";
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
import { Widget } from "./widget.js";

export class Constructor extends Widget {
    widgetIcon = {
        imageSource: "../assets/img/handyman.svg",
        // iconID: "widget-id",
        iconClass: "constructor-icon",
        onChangeEvent: () => this.VISIBLE = !this.VISIBLE,
        description: lang.constructorWidget,

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
        this.container.replaceChildren();
        this.uiProps.elements.forEach((props, index) => {
            props.index = index;
            const item = fromHtml(`
                    <.constructor__item>
                        <h2.constructor-item__header>${props.name || props.type}</h2>
                        <p.constructor-item__description>${props.value || ""}</p>
                        <.constructor-item__controls-container/>
                    </>
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
                        <button.constructor__add-button>${lang.addElement}</button>
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
            classList: ["constructor_widget", "section"],
            id: "constructor_widget",
            title: lang.constructorWidget,
            contentClassList: ["constructor-elements"]
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
            focusCheevoBadgeName: focusCheevo.BadgeName,
            lastUnlockedTitle: lastUnlocked.Title,
            lastUnlockedDescription: lastUnlocked.Description,
            lastUnlockedBadgeName: lastUnlocked.BadgeName,
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
    updateProgressbarOption(props, key, value) {
        const elementProps = this.uiProps.elements[props.index];
        if (!elementProps) return;
        elementProps[key] = value;
        this.uiProps.elements = this.uiProps.elements;
        this.widgets[props.index]?.update();
    }
    componentsInputProperties = {
        text: (props) => textConfig(props, this.keys),
        gameProgressbar: (props) => gameProgressbarConfig(props),
        simpleProgressbar: (props) => simpleProgressbarConfig(props),
        titleProgressbar: (props) => titleProgressbarConfig(props),
        richPresenceProgressbar: (props) => richPresenceProgressbarConfig(props),
        achievementProgressbar: (props) => achievementProgressbarConfig(props),
        neonProgressbar: (props) => neonProgressbarConfig(
            props,
            (key, value) => this.updateProgressbarOption(props, key, value)
        ),
        pixelProgressbar: (props) => pixelProgressbarConfig(
            props,
            (key, value) => this.updateProgressbarOption(props, key, value)
        ),
        pixelProgressbar2: (props) => pixelArtProgressbarConfig(props),
        steamProgress: (props) => steamProgressConfig(props),
        gameCard: (props) => gameCardConfig(props),
        neonGameCard: (props) => gameCardConfig(props, { showProgressToggle: true }),
        pixelGameCard: (props) => gameCardConfig(props, { showProgressToggle: true }),
    }
    components = {
        text: (props) => text(props, this),
        gameProgressbar: (props) => gameProgressbar({ props, gameData: watcher.GAME_DATA, parent: this }),
        titleProgressbar: (props) => titleProgressbar({ props, parent: this }),
        richPresenceProgressbar: (props) => richPresenceProgressbar({ props, parent: this }),
        achievementProgressbar: (props) => achievementProgressbar({ props, parent: this }),
        neonProgressbar: (props) => neonProgressbar({ props, gameData: watcher.GAME_DATA, parent: this }),
        pixelProgressbar: (props) => pixelProgressbar({ props, gameData: watcher.GAME_DATA, parent: this }),
        pixelProgressbar2: (props) => pixelArtProgressbar({ props, gameData: watcher.GAME_DATA, parent: this }),
        steamProgress: (props) => steamProgress({ props, gameData: watcher.GAME_DATA }),
        gameCard: (props) => gameCard({ props, gameData: watcher.GAME_DATA, parent: this }),
        neonGameCard: (props) => neonGameCard({ props, gameData: watcher.GAME_DATA, parent: this }),
        pixelGameCard: (props) => pixelGameCard({ props, gameData: watcher.GAME_DATA, parent: this }),
        simpleProgressbar: (props) => simpleProgressbar({ props, parent: this })
    }
    showWidgets() {
        if (!this.elContainer) {
            this.elContainer = fromHtml(`<.constructor/>`);
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
                label: lang.title,
                type: inputTypes.CONTAINER,
                elements: [
                    {
                        type: inputTypes.SEARCH_INPUT,
                        label: lang.elName,
                        value: props.name ?? "",
                        title: lang.elName,
                        classList: ["wide-input"],
                        onChange: (event) => props.name = event.currentTarget.value,
                    },
                ]
            },
            {
                label: lang.possibleElements,
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
                        label: lang.saveData,
                        onClick: () => saveData(),
                    },

                ]
            },
        ]
        const editorContainer = fromHtml(`
            <.editor-container"/>
        `);

        ui.settings.openSettings({ settings: editorItems })
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