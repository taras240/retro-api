import { badgeElements } from "../components/badges.js";
import { divHtml } from "../components/divContainer.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { inputElement, inputTypes } from "../components/inputElements.js";
import { resizerHtml } from "../components/resizer.js";
import { moveDirections } from "../enums/moveDirections.js";
import { formatText } from "../functions/formatText.js";
import { fromHtml } from "../functions/html.js";
import { moveEvent, setPosition } from "../functions/movingWidget.js";
import { gameImageUrl } from "../functions/raLinks.js";
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
    // get VISIBLE() {
    //     return !this.uiProps.hidden;
    // }
    // set VISIBLE(value) {
    //     this.uiProps.hidden = !value;
    //     if (value) this.open();
    //     else this.close();
    // }
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
    showWidgets() {
        if (!this.elContainer) {
            this.elContainer = fromHtml(`<div class="constructor"></div>`);
            ui.app.append(this.elContainer);
        }
        this.removeWidgets();
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
            text: (props) => {
                const { value } = props;
                const formattedText = () => formatText(value?.replace(/\s/g, "&nbsp;") ?? "text", this.keys);
                const InnerElement = () => fromHtml(`<p class="cnst__text">${formattedText()}</p>`);
                const element = generateWidget({ ...props, element: InnerElement() });
                const update = () => {
                    element.querySelector(".cnst__text").innerHTML = formattedText();
                }
                const remove = () => {
                    element?.remove();
                }
                return { element, update, remove };
            },
            gameProgressbar: (props) => {
                const { isSoftcore, progressType } = props
                const baseClass = "progressbar-1";
                const { ImageIcon, Title } = watcher.GAME_DATA;
                const { unlockedCheevos, unlockedCheevosTotal, totalCheevos, totalPoints, unlockedPointsTotal, unlockedPoints } = this.keys;
                const previewSrc = gameImageUrl(ImageIcon);
                const getProps = () => {
                    let unlockedRate, unlockedMsg, unlocked;
                    switch (progressType) {
                        case "points":
                            unlocked = isSoftcore ? unlockedPointsTotal : unlockedPoints;
                            unlockedRate = Math.round(100 * unlocked / totalPoints);
                            unlockedMsg = `Earned ${unlocked} of ${totalPoints} points`;
                            break;
                        default:
                            unlocked = isSoftcore ? unlockedCheevosTotal : unlockedCheevos;
                            unlockedRate = Math.round(100 * unlocked / totalCheevos);
                            unlockedMsg = `Unlocked ${unlocked} of ${totalCheevos} achievements`;
                            break;
                    }
                    return { unlockedRate, unlockedMsg };
                }
                const { unlockedRate, unlockedMsg } = getProps();
                const InnerElement = () => fromHtml(`
                    <div class="${baseClass}__container" style="--progress-rate:${unlockedRate}%">
                        <div class="${baseClass}__preview-container">
                            <img class="${baseClass}__preview" src="${previewSrc}"/>
                        </div>
                        <div class="${baseClass}__data-container">
                            <div class="${baseClass}__title-container">
                                <h2 class="${baseClass}__title">${Title}</h2>
                                <p class="${baseClass}__award-status">${unlockedRate}%</p>
                            </div>
                            <div class="${baseClass}__progressbar-container">
                                <div class="${baseClass}__progressbar-value"></div>
                            </div>
                            <p class="${baseClass}__progress">${unlockedMsg}</p>
                        </div>
                    </div>
                `);
                const element = generateWidget({ ...props, element: InnerElement() });
                const update = () => {
                    const { unlockedRate, unlockedMsg } = getProps();
                    element.querySelector(`.${baseClass}__container`)?.style.setProperty("--progress-rate", `${unlockedRate}%`);
                    element.querySelector(`.${baseClass}__award-status`).innerText = `${unlockedRate}%`;
                    element.querySelector(`.${baseClass}__progress`).innerText = unlockedMsg;
                }
                const remove = () => {
                    element?.remove();
                }
                return { element, update, remove }
            },
            simpleProgressbar: (props) => {
                const { isSoftcore, progressType } = props;
                const baseClass = "progressbar-smpl";
                const { unlockedCheevos, unlockedCheevosTotal, totalCheevos, totalPoints, unlockedPointsTotal, unlockedPoints } = this.keys;
                const getProps = () => {
                    let unlockedRate, unlocked;
                    switch (progressType) {
                        case "points":
                            unlocked = isSoftcore ? unlockedPointsTotal : unlockedPoints;
                            unlockedRate = Math.round(100 * unlocked / totalPoints);
                            break;
                        default:
                            unlocked = isSoftcore ? unlockedCheevosTotal : unlockedCheevos;
                            unlockedRate = Math.round(100 * unlocked / totalCheevos);
                            break;
                    }
                    return { unlockedRate };
                }
                const { unlockedRate } = getProps();
                const InnerElement = () => fromHtml(`
                    <div class="${baseClass}__container" style="--progress-rate:${unlockedRate}%">
                            <div class="${baseClass}__progressbar-container">
                                <div class="${baseClass}__progressbar-percentage">${unlockedRate}%</div>
                                <div class="${baseClass}__progressbar-value">
                                    <div class="${baseClass}__progressbar-percentage">${unlockedRate}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                const element = generateWidget({ ...props, element: InnerElement() });
                const update = () => {
                    const { unlockedRate } = getProps();
                    element.querySelector(`.${baseClass}__container`)?.style.setProperty("--progress-rate", `${unlockedRate}%`);
                    element.querySelectorAll(`.${baseClass}__progressbar-percentage`).forEach(el => el.innerText = `${unlockedRate}%`);
                }
                const remove = () => {
                    element?.remove();
                }
                return { element, update, remove }
            }
        }
        this.fnProps = {
            text: (props) => [
                {
                    type: inputTypes.SEARCH_INPUT,
                    label: ui.lang.elValue,
                    value: props.value ?? "",
                    title: ui.lang.elValue,
                    classList: ["wide-input"],
                    onChange: (event) => props.value = event.currentTarget.value,
                },
                {
                    label: ui.lang.possibleValues,
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
                    label: ui.lang.style,
                    elements: [
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
                            value: props.fontColor,
                            onChange: (event) => props.fontColor = event.currentTarget.value,
                        },
                        {
                            type: inputTypes.COLOR,
                            label: ui.lang.bgColor,
                            value: props.bgColor,
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
                        {
                            type: inputTypes.CHECKBOX,
                            label: ui.lang.isVisible,
                            id: "constr-is-visible",
                            checked: props.isVisible ?? true,
                            onChange: (event) => props.isVisible = event.currentTarget.checked,
                            // hint: ui.lang.ignoreSubsetsHint,
                        },
                    ]
                }
            ],
            gameProgressbar: (props) => [
                {
                    label: ui.lang.props,
                    elements: [
                        {
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.fontSize,
                            value: props.fontSize,
                            title: ui.lang.fontSize,
                            onChange: (event) => props.fontSize = event.currentTarget.value,
                        },
                        {
                            type: inputTypes.RADIO,
                            label: ui.lang.points,
                            name: "constr-progress-type",
                            checked: props.progressType === "points",
                            onChange: () => props.progressType = "points",
                        },
                        {
                            type: inputTypes.RADIO,
                            label: ui.lang.cheevos,
                            name: "constr-progress-type",
                            checked: !props.progressType || props.progressType === "cheevos",
                            onChange: () => props.progressType = "cheevos",
                        },
                        {
                            type: inputTypes.CHECKBOX,
                            label: ui.lang.hardcoreMode,
                            id: "constr-is-soft",
                            checked: !props.isSoftcore,
                            onChange: (event) => props.isSoftcore = !event.currentTarget.checked,
                            // hint: ui.lang.ignoreSubsetsHint,
                        },
                        {
                            type: inputTypes.CHECKBOX,
                            label: ui.lang.isVisible,
                            id: "constr-is-visible",
                            checked: props.isVisible ?? true,
                            onChange: (event) => props.isVisible = event.currentTarget.checked,
                            // hint: ui.lang.ignoreSubsetsHint,
                        },
                        // {
                        //     type: inputTypes.NUM_INPUT,
                        //     label: 'unlocked',
                        //     value: "unlockedCheevos",
                        //     onChange: (event) => console.log(event.target.value),
                        // },
                        // {
                        //     type: inputTypes.NUM_INPUT,
                        //     label: "total count",
                        //     value: "totalCheevos",
                        //     onChange: (event) => console.log(event.target.value),
                        // },
                    ]
                }
            ],
            simpleProgressbar: (props) => [
                {
                    label: ui.lang.props,
                    elements: [
                        {
                            type: inputTypes.NUM_INPUT,
                            label: ui.lang.fontSize,
                            value: props.fontSize,
                            title: ui.lang.fontSize,
                            onChange: (event) => props.fontSize = event.currentTarget.value,
                        },
                        {
                            type: inputTypes.RADIO,
                            label: ui.lang.points,
                            name: "constr-progress-type",
                            checked: props.progressType === "points",
                            onChange: () => props.progressType = "points",
                        },
                        {
                            type: inputTypes.RADIO,
                            label: ui.lang.cheevos,
                            name: "constr-progress-type",
                            checked: !props.progressType || props.progressType === "cheevos",
                            onChange: () => props.progressType = "cheevos",
                        },
                        {
                            type: inputTypes.CHECKBOX,
                            label: ui.lang.hardcoreMode,
                            id: "constr-is-soft",
                            checked: !props.isSoftcore,
                            onChange: (event) => props.isSoftcore = !event.currentTarget.checked,
                            // hint: ui.lang.ignoreSubsetsHint,
                        },
                        {
                            type: inputTypes.CHECKBOX,
                            label: ui.lang.isVisible,
                            id: "constr-is-visible",
                            checked: props.isVisible ?? true,
                            onChange: (event) => props.isVisible = event.currentTarget.checked,
                        },
                    ]
                }
            ],
        }
        const generateWidget = (props) => {
            const { type, id, x, y, value, fontColor, bgColor, fontSize, isBold, width, height, zIndex, isVisible = true, element } = props;
            const widget = fromHtml(`
                <div 
                    class="constructor-element" 
                    id="${id || getRandomID()}" 
                    style=" 
                            left:${x || 0};
                            top:${y || 0};
                            ${fontColor ? `--font-color:${fontColor}` : ""};
                            ${bgColor ? `--main-color:${bgColor}` : ""};
                            font-size: ${fontSize || 16}px;
                            font-weight:${isBold ? "bold" : "normal"};
                            width:${width ? width + "px" : "fit-content"};
                            height:${height ? height + "px" : "auto"};
                            z-index:${zIndex ? zIndex : 0};
                            display:${isVisible ? "inline-block" : "none"}
                        ">
                    <div class="resizer"></div>
                </div>
            `);
            widget.prepend(element);
            return widget;
        }

        this.uiProps.elements.forEach((props, index) => {
            const { type } = props;
            const widget = this.fnKeys[type](props);
            this.widgets.push(widget);
            const widgetElement = widget?.element;
            console.log(this.widgets);
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
            return this.fnProps[type](props);
        }
        const saveData = () => {
            Object.assign(itemProps, props);
            this.uiProps.elements[props.index] = itemProps;
            this.uiProps.elements = this.uiProps.elements;
            this.showWidgets();
            this.fillConfigItems();
            console.log(props);
        }
        const saveSelectedElement = (key, value) => {
            props.value = value;
            props.type = key;
            saveData();
            openElementProps(key)
        }
        const openElementProps = (key) => {
            if (!this.fnProps[key]) return;
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
                    ...Object.keys(this.fnKeys).map(key => ({
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