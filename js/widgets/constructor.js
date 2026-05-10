import { badgeElements } from "../components/badges.js";
import { divHtml } from "../components/divContainer.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { inputElement, inputTypes } from "../components/inputElements.js";
import { resizerHtml } from "../components/resizer.js";
import { formatText } from "../functions/formatText.js";
import { fromHtml } from "../functions/html.js";
import { moveEvent, setPosition } from "../functions/movingWidget.js";
import { getRandomID } from "../functions/randomID.js";
import { sortBy } from "../functions/sortFilter.js";
import { ui, watcher } from "../script.js";
import { Widget } from "./widget.js";

export class Constructor extends Widget {
    widgetIcon = {
        imageSource: "../assets/img/handyman.svg",
        // iconID: "widget-id",
        iconClass: "constructor-icon",
        onChangeEvent: () => this.VISIBLE = !this.VISIBLE,

    };
    // get VISIBLE() {
    //     return !this.uiProps.hidden;
    // }
    // set VISIBLE(value) {
    //     this.uiProps.hidden = !value;
    //     if (value) this.open();
    //     else this.close();
    // }
    uiDefaultValues = {
        x: '600px',
        y: '400px',
        hidden: true,
        elements: []
    }

    constructor() {
        super();
        this.addWidgetIcon();
        this.showElements();
        this.open();
    }

    onGameChange({ gameData }) {
        this.showElements();
    }
    onCheevoUnlocks() {
        this.showElements();
    }
    onAwardsEarned({ awardsArray }) {
        this.showElements();
    }
    onStartSession({ gameData }) {
        this.showElements();
    }
    onStatsUpdate({ userData }) {
        this.showElements();
    }
    onStopSession() {
        this.showElements();
    }
    fillConfigItems() {
        this.container.innerHTML = "";
        this.uiProps.elements.forEach((props, index) => {
            props.index = index;
            const item = fromHtml(`
                    <div class="constructor__item">
                        <h2 class="constructor-item__header">${props.name || "Name"}</h2>
                        <p class="constructor-item__description">${props.value || "???"}</p>
                    </div>
                `);
            this.container.append(item);
            item.addEventListener("click", event => {
                this.editElement(props, item);
            })
        })
        const addItem = fromHtml(`
                        <button class="constructor__add-button">[+]</button>
                `);
        addItem.addEventListener("click", event => {
            this.uiProps.elements = [
                ...this.uiProps.elements,
                {
                    type: "text",
                }
            ];
            this.fillConfigItems();
            this.showElements();
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
    showElements() {
        if (!this.elContainer) {
            this.elContainer = fromHtml(`<div class="constructor"></div>`);
            ui.app.append(this.elContainer);
        }
        this.elContainer.innerHTML = "";
        // const gameData = watcher.GAME_DATA ?? {};
        const focusCheevo = Object.values(watcher.CHEEVOS)?.sort((a, b) => sortBy.customOrder(a, b)).filter(c => !c.isEarned)?.[0] ?? {};
        const lastUnlocked = Object.values(watcher.CHEEVOS)?.sort((a, b) => sortBy.latest(a, b)).filter(c => c.isEarned)?.[0] ?? {};
        const { userData, GAME_DATA: gameData, sessionData } = watcher;
        const {
        } = watcher.userData;
        if (!gameData) return;
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
        this.fnKeys = {
            progressbar: (value, total) => `
                <div class="progressbar-container">
                    <div class="progressbar-value" style="--progress-rate:${100 * value / total}%"></div>
                </div>
            `,
            badge: (value) => badgeElements.customBadge(value)
        }
        this.fnDescriptions = [
            "badge(value)",
            "progressbar(value,total)",
        ]


        this.uiProps.elements.forEach(({ id, x, y, value, fontColor, bgColor, fontSize, isBold, width, height, zIndex }, index) => {
            if (!value) return;
            const formattedText = formatText(value.replace(/\s/g, "&nbsp;"), this.keys, this.fnKeys);
            const element = fromHtml(`
                <div 
                    class="constructor-element" 
                    id="${id || getRandomID()}" 
                    style=" 
                            left:${x || 0};
                            top:${y || 0};
                            --color:${fontColor || "white"};
                            --bg-color:${bgColor || "transparent"};
                            font-size: ${fontSize || 16}px;
                            font-weight:${isBold ? "bold" : "normal"};
                            width:${width ? width + "px" : "fit-content"};
                            height:${height ? height + "px" : "auto"};
                            z-index:${zIndex ? zIndex : 0}
                        ">
                    ${formattedText}
                </div>
            `);
            this.elContainer.append(element);
            element.addEventListener("mousedown", event => {
                const savePosition = () => {
                    this.uiProps.elements[index] = Object.assign(this.uiProps.elements[index], {
                        x: element.style.left,
                        y: element.style.top,
                    });
                    this.uiProps.elements = this.uiProps.elements;
                }
                moveEvent(element, event, savePosition);
            })
        })
    }
    editElement(itemProps = {}, item = {}) {
        const props = { ...itemProps };
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
                type: inputTypes.SEARCH_INPUT,
                label: ui.lang.elValue,
                value: props.value ?? "",
                title: ui.lang.elValue,
                classList: ["wide-input"],
                onChange: (event) => props.value = event.currentTarget.value,
            },
            {
                label: "Possible Keys",
                elements: [{
                    type: inputTypes.TEXT,
                    value: ui.lang.constructorKeysHint,
                },
                {
                    type: inputTypes.TEXT,
                    value: Object.keys(this.keys).join(" | "),
                },
                ]
            },
            {
                label: "Possible Functions",
                elements: [
                    {
                        type: inputTypes.TEXT,
                        value: this.fnDescriptions.join(" | "),
                    },
                ]
            },
            {
                label: ui.lang.style,
                elements: [
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.width,
                        value: props.width,
                        title: ui.lang.width,
                        onChange: (event) => props.width = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.height,
                        value: props.height,
                        title: ui.lang.height,
                        onChange: (event) => props.height = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.fontSize,
                        value: props.fontSize,
                        title: ui.lang.fontSize,
                        onChange: (event) => props.fontSize = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.COLOR,
                        label: ui.lang.color,
                        value: props.fontColor || "white",
                        onChange: (event) => props.fontColor = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.COLOR,
                        label: ui.lang.bgColor,
                        value: props.bgColor || "transparent",
                        onChange: (event) => props.bgColor = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.bold,
                        id: "constr-is-bold",
                        checked: props.isBold,
                        onChange: (event) => props.isBold = event.currentTarget.checked,
                        // hint: ui.lang.ignoreSubsetsHint,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        label: ui.lang.zIndex,
                        value: props.zIndex ?? 0,
                        title: ui.lang.zIndex,
                        onChange: (event) => props.zIndex = event.currentTarget.value,
                    },
                ]
            },
            {
                label: "",
                elements: [
                    {
                        type: inputTypes.BUTTON,
                        label: ui.lang.delete,
                        onClick: (event) => {
                            this.uiProps.elements.splice([props.index], 1);
                            this.uiProps.elements = this.uiProps.elements;
                            this.showElements();
                            this.fillConfigItems();
                            event.target.closest(".section")?.remove();
                        },
                    },
                    {
                        type: inputTypes.BUTTON,
                        label: ui.lang.saveData,
                        onClick: () => {
                            Object.assign(itemProps, props);
                            this.uiProps.elements[props.index] = itemProps;
                            this.uiProps.elements = this.uiProps.elements;
                            this.showElements();
                            this.fillConfigItems();
                        },
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