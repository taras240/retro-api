import { UI } from "../ui.js";
import { config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { applyFilter, applySort, cheevosFiterNames, cheevosSortNames, filterBy, filterMethods, sortBy, sortMethods } from "../functions/sortFilter.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { delay } from "../functions/delay.js";
import cheevoGrouping from "../enums/cheevoGrouping.js";
import { scrollElementIntoView } from "../functions/scrollingToElement.js";
import { inputTypes } from "../components/inputElements.js";
import { overlayNames, overlayTypes } from "../enums/cheevoOverlay.js";
import { imageFilters } from "../enums/imageFilters.js";
import { generateContextMenu } from "../components/contextMenu.js";
import { buttonsHtml } from "../components/htmlElements.js";
export class AchievementsBlock extends Widget {
    widgetIcon = {
        description: "cheevos widget",
        iconClass: "achievements-icon",
    };
    filters = {};
    get contextMenuItems() {
        return [
            {
                label: ui.lang.style,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-load-anim",
                        label: ui.lang.showLoadAnimation,
                        checked: this.uiProps.showLoadAnimation,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.showLoadAnimation = this.checked"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-mario",
                        label: ui.lang.unlockAnimation,
                        checked: this.uiProps.showMario,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.showMario = this.checked"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context_autoscroll-achieves",
                        label: ui.lang.autoscroll,
                        checked: this.uiProps.autoscroll,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.autoscroll = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context_stretch-achieves",
                        label: ui.lang.stretch,
                        checked: this.uiProps.stretchAchievements,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.stretchAchievements = this.checked;"`,
                    },
                    {
                        prefix: ui.lang.minSize,
                        postfix: "px",
                        type: inputTypes.NUM_INPUT,
                        id: "context-menu_min-size",
                        label: ui.lang.minSize,
                        value: this.uiProps.ACHIV_MIN_SIZE,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.ACHIV_MIN_SIZE = this.value;"`,
                        onChange: `ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.ACHIV_MIN_SIZE = this.value;`,
                    },
                    {
                        prefix: ui.lang.maxSize,
                        postfix: "px",
                        type: inputTypes.NUM_INPUT,
                        id: "context-menu_max-size",
                        label: ui.lang.maxSize,
                        value: this.uiProps.ACHIV_MAX_SIZE,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.ACHIV_MAX_SIZE = this.value;"`,
                        onChange: `ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.ACHIV_MAX_SIZE = this.value;`,
                    },

                ]
            },
            {
                label: ui.lang.elements,
                elements: [
                    {
                        label: ui.lang.showHeader,
                        type: inputTypes.CHECKBOX,
                        id: "context_hide-achivs-header",
                        checked: this.uiProps.showHeader,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.showHeader = this.checked;"`,
                    },
                    {
                        label: ui.lang.showBackground,
                        type: inputTypes.CHECKBOX,
                        id: "context_show-bg",
                        checked: this.uiProps.bgVisibility,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.bgVisibility = this.checked;"`,
                    },]
            },
            {
                label: ui.lang.overlay,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-hide-unearned",
                        label: ui.lang.showOverlay,
                        checked: this.uiProps.showPrevOverlay,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.showPrevOverlay = this.checked"`,
                    },
                    ...Object.values(imageFilters).map(filterName => ({
                        type: inputTypes.RADIO,
                        name: `${this.sectionID}-context-preview-filter`,
                        id: `${this.sectionID}-context-preview-filter-${filterName}`,
                        label: filterName,
                        checked: this.uiProps.lockedPreviewFilter === filterName,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.lockedPreviewFilter = '${filterName}';"`
                    })),
                    // ...Object.keys(overlayTypes).reduce((items, overlayType) => {
                    //     const item = {
                    //         type: inputTypes.RADIO,
                    //         name: "context-achieves-overlay",
                    //         id: `context-achieves-overlay-${overlayType}`,
                    //         label: `${overlayTypes[overlayType].name}`,
                    //         checked: this.uiProps.overlayType == overlayType,
                    //         event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.overlayType = '${overlayType}'"`,
                    //     }
                    //     items.push(item);
                    //     return items;
                    // }, []),
                ]
            },
            this.contextSortMenu(),
            this.contextFilterMenu(),
            {
                label: ui.lang.groupBy,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-grouping",
                        label: ui.lang.groupElements,
                        checked: this.uiProps.isGrouping,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.isGrouping = this.checked;"`,
                    },
                    ...Object.values(cheevoGrouping).map(groupName => ({
                        type: inputTypes.RADIO,
                        name: `${this.sectionID}-context-group`,
                        id: `${this.sectionID}-context-group-${groupName}`,
                        label: ui.lang[groupName],
                        value: groupName,
                        checked: this.uiProps.groupBy === groupName,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.groupBy = '${groupName}';"`,
                    })),
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-grouping-title",
                        label: ui.lang.showCheevosGroupTitle,
                        checked: this.uiProps.showGroupHeader,
                        event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.showGroupHeader = this.checked;"`,
                    },
                ]


            }

        ];
    }
    contextSortMenu = () => {
        return {
            label: ui.lang.sort,
            elements: [
                ...Object.values(cheevosSortNames).map(sortName => ({
                    type: inputTypes.RADIO,
                    name: `${this.sectionID}-context-sort`,
                    id: `${this.sectionID}-context-sort-${sortName}`,
                    label: ui.lang[sortName],
                    checked: this.uiProps.sortName === sortName,
                    event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.sortName = '${sortName}';"`
                })),
                {
                    type: inputTypes.CHECKBOX,
                    id: "context-reverse-sort",
                    label: ui.lang.reverse,
                    checked: this.uiProps.reverseSort == -1,
                    event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.reverseSort = this.checked"`,
                },
                {
                    type: inputTypes.CHECKBOX,
                    id: "context-strict-sort",
                    label: ui.lang.strictMode,
                    checked: this.uiProps.strictSort,
                    event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.strictSort = this.checked"`,
                },
            ],
        };
    }
    contextFilterMenu = () => {
        return {
            label: ui.lang.filter,
            elements: [
                ...Object.values(cheevosFiterNames).map(filterName => ({
                    type: inputTypes.STATEBOX,
                    name: `${this.sectionID}-context-filter`,
                    id: `${this.sectionID}-context-filter-${filterName}`,
                    label: ui.lang[filterName],
                    value: filterName,
                    state: `${this.uiProps.filters[filterName]?.state ?? 0}`,
                    event: `ui.achievementsBlock[${this.CLONE_NUMBER}].setFilter({ state, filterName })`,
                })),
                {
                    type: inputTypes.CHECKBOX,
                    id: "context-hide-filtered",
                    label: ui.lang.hideFiltered,
                    checked: this.uiProps.hideFiltered,
                    event: `onchange="ui.achievementsBlock[${this.CLONE_NUMBER}].uiProps.hideFiltered = this.checked;"`,
                },
            ],
        }
    }
    uiDefaultValues = {
        showHeader: true,
        overlayType: overlayNames.BORDER,
        ACHIV_MIN_SIZE: 60,
        ACHIV_MAX_SIZE: 128,
        stretchAchievements: false,
        isGrouping: false,
        groupBy: cheevoGrouping.UNLOCK_STATUS,
        autoscroll: true,
        showPrevOverlay: true,
        showMario: true,
        showLoadAnimation: false,
        showGroupHeader: true,
        sortName: sortMethods.latest,
        reverseSort: 1, //-1 reverse, 1 normal
        strictSort: false,
        filterBy: filterMethods.all,
        hideFiltered: false,
        reverseFilter: false,
        lockedPreviewFilter: imageFilters.GRAYSCALE,
    }
    uiSetCallbacks = {
        ACHIV_MIN_SIZE(value) {
            this.fitSizeVertically();
        },
        ACHIV_MAX_SIZE(value) {
            this.fitSizeVertically();
        },
        isGrouping(value) {
            this.groupCheevos();
        },
        groupBy() {
            this.groupCheevos();
        },
        showGroupHeader(value) {
            this.groupCheevos();
        },
        autoscroll(value) {
            value ? this.startAutoScroll() : this.stopAutoScroll();
        },
        showPrevOverlay(value) {
            this.container.querySelectorAll(".achiv-block").forEach(el => el.classList.toggle("overlay", value));
        },
        sortName(value) {
            this.applySorting();
        },
        reverseSort() {
            this.applySorting();
        },
        strictSort() {
            this.applySorting();
        },
        filterBy(value) {
            this.applyFiltering();
        },
        hideFiltered(value) {
            this.applyFiltering();
        },
        lockedPreviewFilter() {
            this.setElementsValues();
        }

    };
    uiValuePreprocessors = {
        ACHIV_MIN_SIZE(value) {
            return (value <= 10) ? 10 : value;
        },
        ACHIV_MAX_SIZE(value) {
            return (value <= 20) ? 20 : value;
        },
        reverseSort(value) {
            return value ? -1 : 1;
        },
    };



    get SECTION_NAME() {
        if (this.CLONE_NUMBER === 0) {
            return `achievements_section`;
        } else {
            return `achievements_section-${this.CLONE_NUMBER}`;
        }
    }
    get CLONE_NUMBER() {
        return this._cloneNumber;
    }
    set CLONE_NUMBER(widget) {
        if (widget?.length) {
            this._cloneNumber = widget.length;
        } else (this._cloneNumber = 0);

        this.widgetIcon = {
            ...this.widgetIcon,
            iconID: `side-panel__cheevos-${this.CLONE_NUMBER}`,
            onChangeEvent: `ui.achievementsBlock[${this.CLONE_NUMBER}].VISIBLE = this.checked`,
        };
    }

    constructor(isClone = false) {
        super();
        this.CLONE_NUMBER = ui.achievementsBlock;
        this.isClone = isClone;
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        this.setValues();
    }

    initializeElements() {
        this.section = this.generateNewWidget({});
        this.sectionID = this.section.id;
        document.querySelector(".wrapper").appendChild(this.section);

        this.container = this.section.querySelector(`.achievements-container`); //Контейнер  з досягненнями
        this.resizer = this.section.querySelector(
            `#achivs-resizer${this.CLONE_NUMBER}`
        ); // Ресайзер блока досягнень
        this.resizeCallback = () => this.fitSizeVertically(true)
    }
    addEvents() {
        super.addEvents();
        this.section.querySelector(`#${this.SECTION_NAME}-filter-button`).addEventListener("click", event => {
            ui.showContextmenu({ event, menuItems: this.contextFilterMenu().elements, sectionCode: this.SECTION_NAME })
        });
        this.section.querySelector(`#${this.SECTION_NAME}-sort-button`).addEventListener("click", event => {
            ui.showContextmenu({ event, menuItems: this.contextSortMenu().elements, sectionCode: this.SECTION_NAME })
        });
        // this.resizer.addEventListener("mousedown", (event) => {
        //     event.stopPropagation();
        //     this.section.classList.add("resized");
        //     this.stopAutoScroll();
        //     resizeEvent({
        //         event: event,
        //         section: this.section,
        //         callback: () => {
        //             this.fitSizeVertically(true);
        //         },
        //     });
        // });
        // this.resizer.addEventListener("mouseup", () => {
        //     this.startAutoScroll();
        // });
        new Sortable(this.container, {
            group: {
                name: "cheevos", pull: "clone", push: "false",
            },
            animation: 100,
            chosenClass: "dragged",
            onEnd: () => ui.addEvents(),
        });
    }
    setElementsValues() {
        this.section.classList.toggle("hide-bg", !this.uiProps.bgVisibility);
        this.section.classList.toggle("compact", !this.uiProps.showHeader);
        // this.section.dataset.overlay = this.uiProps.overlayType;
        this.container.style.alignContent = this.uiProps.stretchAchievements ? "space-around" : "start";
        this.container.style.justifyContent = this.uiProps.stretchAchievements ? "space-around" : "center";
        this.section.dataset.previewFilter = this.uiProps.lockedPreviewFilter;

    }
    setValues() {
        UI.applyPosition({ widget: this });
        this.setElementsValues();

        if (config.ui[this.SECTION_NAME]) {
            this.section.style.top = config.ui[this.SECTION_NAME].y ?? "0px";
            this.section.style.left = config.ui[this.SECTION_NAME].x ?? "0px";
            this.section.style.height =
                config.ui[this.SECTION_NAME].height ?? "600px";
            this.section.style.width = config.ui[this.SECTION_NAME].width ?? "350px";
        }
        if (this.uiProps.autoscroll) {
            this.startAutoScroll();
        }
        this.filters = config.getUIProperty(
            { sectionID: this.section.id, property: "filters" }
        ) ?? {};
    }


    // Розбирає отримані досягнення гри та відображає їх на сторінці
    parseGameAchievements(achivs) {
        const clearAchievementsSection = () => {
            this.container.innerHTML = "";
        }
        const addAchievementsToContainer = (achievementsObject) => {
            Object.values(achievementsObject.Achievements).forEach((achievement) => {
                const achivElement = this.generateAchievement(achievement);
                this.container.appendChild(achivElement);
            });
            this.groupCheevos();
        }
        // Очистити вміст розділу досягнень
        clearAchievementsSection();

        // Відсортувати досягнення та відобразити їх
        addAchievementsToContainer(achivs);

        // Підгонка розміру досягнень
        this.fitSizeVertically();

        this.applyFiltering();
        this.applySorting({ animation: 0 });
        this.uiProps.showLoadAnimation && this.doLoadAnimation();
        this.startAutoScroll();
    }

    generateAchievement(achievement) {
        //------- Achievement-----------
        function setClasses(widget) {
            achivElement.classList.add("achiv-block");
            achivElement.classList.toggle("start-load-anim", widget.uiProps.showLoadAnimation);
            achivElement.classList.toggle("overlay", widget.uiProps.showPrevOverlay);
            achivElement.classList.toggle("earned", achievement.isEarned);
            achivElement.classList.toggle("hardcore", achievement.isHardcoreEarned);
            achivElement.classList.toggle("rare", achievement.difficulty > 7);
        }
        function setData() {
            achivElement.dataset.achivId = achievement.ID;
            achivElement.dataset.Points = achievement.Points;
            achivElement.dataset.TrueRatio = achievement.TrueRatio;
            achievement.TrueRatio > 50 && (achivElement.dataset.rarity = "normal");
            achievement.TrueRatio > 150 && (achivElement.dataset.rarity = "rare");
            achievement.TrueRatio > 300 && (achivElement.dataset.rarity = "mythycal");
            achivElement.dataset.DisplayOrder = achievement.DisplayOrder;
            achivElement.dataset.Type = achievement.Type;
            achivElement.dataset.difficulty = achievement.difficulty;
            achievement.level && (achivElement.dataset.level = achievement.level);

            achivElement.dataset.NumAwardedHardcore = achievement.NumAwardedHardcore;
            achievement.DateEarnedHardcore && (achivElement.dataset.DateEarnedHardcore = achievement.DateEarnedHardcore);
            achievement.DateEarned && (achivElement.dataset.DateEarned = achievement.DateEarned);
            achivElement.dataset.timeToUnlock = achievement.timeToUnlock;

        }
        function setHtmlCode() {
            achivElement.innerHTML = `
        <div class="preview-container">
          <img class="achiv-preview" src="${achievement.prevSrc}"  alt="${achievement.Title} icon"/>
          <div class="prev-lock-overlay"></div>
        </div>
        `;
        }

        const achivElement = document.createElement("li");
        setClasses(this);
        setData();
        setHtmlCode();

        return achivElement;
    }

    // async moveToTop(element) {
    //     if (this.container.offsetHeight < this.container.scrollHeight) {
    //         // this.applySorting();
    //         return;
    //     }
    //     const toEnd = this.REVERSE_SORT === -1;
    //     const dur = 1000;

    //     this.container.style.setProperty("--duration", `${dur}ms`);

    //     const targetElement = element;
    //     const firstElement = this.container.querySelector(".achiv-block");
    //     const lastElement = this.container.querySelector(".achiv-block:last-of-type");

    //     const shrinkElement = document.createElement("li");
    //     const growElement = document.createElement("li");

    //     shrinkElement.classList.add("shrink-element");
    //     growElement.classList.add("grow-element")

    //     const targetPos = {
    //         xPos: toEnd ? lastElement.offsetLeft : firstElement.offsetLeft,
    //         yPos: toEnd ? lastElement.offsetTop : firstElement.offsetTop
    //     }
    //     const curPos = {
    //         xPos: targetElement.offsetLeft,
    //         yPos: targetElement.offsetTop
    //     }

    //     targetElement.style.left = curPos.xPos + 'px';
    //     targetElement.style.top = curPos.yPos + 'px';
    //     targetElement.classList.add("move");
    //     toEnd ? this.container.append(growElement) : this.container.prepend(growElement);
    //     this.container.insertBefore(shrinkElement, targetElement);

    //     await delay(50);//waiting for frame
    //     targetElement.style.left = targetPos.xPos + 'px';
    //     targetElement.style.top = targetPos.yPos + 'px';

    //     await delay(dur + 100);//waiting for animation end
    //     growElement.remove();
    //     shrinkElement.remove();
    //     targetElement.classList.remove("move");
    //     targetElement.style.left = 'auto';
    //     targetElement.style.top = 'auto';
    //     toEnd ? this.container.append(targetElement) : this.container.prepend(targetElement);
    //     this.applyFiltering();
    // }
    // Автопідбір розміру значків ачівментсів
    fitSizeVertically(isLoadDynamic = false) {
        // Отримання посилання на блок досягнень та його дочірні елементи
        const { section, container, sectionID } = this;

        let windowHeight, windowWidth;
        container.style.flex = "1";

        if (isLoadDynamic || !config.getUIProperty({ sectionID, property: "height" })) {
            windowHeight = container.clientHeight;
            windowWidth = container.clientWidth;
        } else {
            windowHeight = parseInt(config.ui[this.SECTION_NAME].height) - section.querySelector(".header-container").clientHeight;
            windowWidth = parseInt(config.ui[this.SECTION_NAME].width);
        }
        container.style.flex = "";
        const achivs = container.querySelectorAll(".achiv-block:not(.removed)");
        const achivsCount = achivs.length;
        // Перевірка, чи є елементи в блоці досягнень
        if (achivsCount === 0) return;
        // Початкова ширина досягнення для розрахунку
        let achivWidth = Math.floor(
            Math.sqrt((windowWidth * windowHeight) / achivsCount)
        );
        do {
            achivWidth--;
            this.section.style.setProperty("--achiv-height", achivWidth + "px");
            section.offsetHeight;
        }
        while (container.scrollHeight > container.offsetHeight && achivWidth > this.uiProps.ACHIV_MIN_SIZE)

        achivWidth =
            achivWidth < this.uiProps.ACHIV_MIN_SIZE
                ? this.uiProps.ACHIV_MIN_SIZE
                : achivWidth > this.uiProps.ACHIV_MAX_SIZE
                    ? this.uiProps.ACHIV_MAX_SIZE
                    : achivWidth;
        // console.log(container.scrollHeight, container.offsetHeight);
        if (container.scrollHeight > container.offsetHeight + 2) {
            const margin = 1;
            const cheevosInRowCount = ~~(container.offsetWidth / (+achivWidth + 1));
            const roundedSize = container.offsetWidth / cheevosInRowCount - (cheevosInRowCount - 1) * margin;
            // console.log(cheevosInRowCount, roundedSize, achivWidth);
            achivWidth = (roundedSize - achivWidth < achivWidth) ? ~~roundedSize : achivWidth;
        }


        this.section.style.setProperty("--achiv-height", achivWidth + "px");
    }
    autoscrollInterval = {};
    async updateEarnedAchieves({ earnedAchievementIDs }) {
        await delay(100);
        this.stopAutoScroll();
        for (let cheevoID of earnedAchievementIDs) {
            const cheevo = watcher.CHEEVOS[cheevoID];
            const cheevoElement = this.container.querySelector(`.achiv-block[data-achiv-id="${cheevoID}"]`);
            if (!this.uiProps.showMario) {
                cheevoElement.classList.add("earned");
                cheevoElement.classList.toggle("hardcore", cheevo.isHardcoreEarned);
            }
            else {
                await scrollElementIntoView({ container: this.container, element: cheevoElement, scrollByX: false });
                // cheevoElement.scrollIntoView({ behavior: ui.isCEF ? "auto" : "smooth", block: "center", });
                // await delay(1200);
                await this.marioAction(cheevoElement, cheevo);
            }
            await delay(100);
            // if (this.SORT_NAME == sortMethods.latest && !this.IS_GROUPING) {
            //     await this.moveToTop(cheevoElement);
            // }
            cheevo.DateEarnedHardcore && (cheevoElement.dataset.DateEarnedHardcore = cheevo.DateEarnedHardcore);
            cheevoElement.dataset.DateEarned = cheevo.DateEarned;
        };
        this.container.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        await delay(500);
        this.applyFiltering();
        await this.applySorting();
        await delay(2000);
        this.startAutoScroll();
    }
    async marioAction(cheevoElement, cheevo) {
        const isHardcore = cheevo.isHardcoreEarned;
        const mario = document.createElement("div");
        mario.classList.add("mario__container", "stand");
        this.container.appendChild(mario);

        const marioSize = mario.getBoundingClientRect().width;
        const targetElementDimensions = cheevoElement?.getBoundingClientRect();
        const targetPos = {
            xPos: targetElementDimensions.left,
            yPos: targetElementDimensions.top + marioSize,
        }
        const jumpHeight = marioSize * 2;
        const toLeft = targetElementDimensions.left > window.innerWidth / 2;
        const startPos = {
            xPos: toLeft ? window.innerWidth + marioSize : - marioSize,
            yPos: targetPos.yPos + jumpHeight,
        }
        const frameDuration = 70;
        const g = 10;
        let dx = 20;
        let dy = Math.sqrt(2 * g * jumpHeight);

        mario.style.top = startPos.yPos + 'px';
        mario.style.left = startPos.xPos + 'px';


        const walkToTarget = async () => {
            let XPos = startPos.xPos;

            mario.classList.remove("stand");
            mario.classList.add("walk");
            mario.classList.toggle("to-left", toLeft)
            mario.style.setProperty('--frame-duration', `${frameDuration}ms`);

            while (XPos !== targetPos.xPos) {
                if (toLeft) {
                    XPos -= dx;
                    XPos < targetPos.xPos && (XPos = targetPos.xPos);
                }
                else {
                    XPos += dx;
                    XPos > targetPos.xPos && (XPos = targetPos.xPos);
                }
                mario.style.left = XPos + 'px';
                await delay(frameDuration);
            }
            mario.classList.remove("walk");
            mario.classList.add("stand");
            await delay(500);
        }
        const jump = async () => {
            mario.classList.remove("stand");
            mario.classList.add("jump");
            let YPos = startPos.yPos;
            while (~~dy > 0) {
                YPos -= dy;
                dy -= g;
                if (YPos < targetPos.yPos) {
                    YPos = targetPos.yPos - 2;
                    mario.style.top = YPos + 'px';
                }
                else {
                    mario.style.top = YPos + 'px';
                    await delay(frameDuration);
                }
            }
            collisionWithTarget();
            dy = 0;
            while (YPos < startPos.yPos) {
                YPos += dy;
                dy += g;
                YPos > startPos.yPos && (YPos = startPos.yPos);
                mario.style.top = YPos + 'px';
                await delay(frameDuration);
            }
            mario.classList.remove("jump");
            mario.classList.add("stand");
            await delay(500);
            mario.classList.toggle("to-left", !toLeft);
            await delay(500);
        }
        const collisionWithTarget = () => {
            const coin = document.createElement("div");
            coin.classList.add("coin__container");

            const coins = isHardcore ? cheevo.TrueRatio + "RP" : cheevo.Points + "SP";
            coin.innerHTML = `
                <div class='coins__points'>+${coins}</div>
                <div class='coins__coin'></div>
            `;
            this.section.appendChild(coin);
            this.section.classList.add("focus");
            coin.style.top = targetElementDimensions.top - targetElementDimensions.height / 2 + "px";
            coin.style.left = targetPos.xPos + "px";
            cheevoElement?.classList.add("earned", "mario-dumb");
            cheevoElement?.classList.toggle("hardcore", isHardcore);
            setTimeout(() => cheevoElement?.classList.remove("mario-dumb"), 500);
            setTimeout(() => {
                coin.remove();
                this.section.classList.remove("focus")
            }, 5000);

        }
        const walkAway = async () => {
            let XPos = mario.getBoundingClientRect().left;
            mario.style.setProperty('--frame-duration', `${frameDuration * 0.75}ms`);
            mario.className = `mario__container walk ${!toLeft ? 'to-left' : ''} `;
            while (XPos !== startPos.xPos) {
                if (toLeft) {
                    XPos += dx;
                    XPos > startPos.xPos && (XPos = startPos.xPos)
                }
                else {
                    XPos -= dx;
                    XPos < startPos.xPos && (XPos = startPos.xPos)
                }
                mario.style.left = XPos + 'px';
                await delay(frameDuration * 0.75);
            }
        }

        await walkToTarget();
        await jump();
        await walkAway();

        mario.remove();
        await delay(100);
        return;
    }

    startAutoScroll(toBottom = true) {
        clearTimeout(this.autoscrollInterval.timeout);
        clearInterval(this.autoscrollInterval.interval);

        let refreshRateMiliSecs = 50;

        let scrollContainer = this.container;
        let speedInPixels = 1;
        const pauseOnEndMilisecs = 15 * 1000;
        // Часовий інтервал для прокручування вниз
        if (this.uiProps.autoscroll) {
            this.autoscrollInterval.interval = setInterval(() => {
                if (scrollContainer.scrollHeight - scrollContainer.clientHeight <= 10) {
                    this.stopAutoScroll();
                }
                if (toBottom) {
                    scrollContainer.scrollTop += speedInPixels;
                    if (
                        scrollContainer.scrollTop + scrollContainer.clientHeight >=
                        scrollContainer.scrollHeight
                    ) {
                        clearInterval(this.autoscrollInterval.interval);
                        this.autoscrollInterval.timeout = setTimeout(() => this.startAutoScroll(false), pauseOnEndMilisecs);
                    }
                } else {
                    scrollContainer.scrollTop -= speedInPixels;
                    if (scrollContainer.scrollTop === 0) {
                        clearInterval(this.autoscrollInterval.interval);
                        this.autoscrollInterval.timeout = setTimeout(() => this.startAutoScroll(true), pauseOnEndMilisecs);
                    }
                }
            }, refreshRateMiliSecs);
            // Припиняємо прокручування при наведенні миші на контейнер
            scrollContainer.addEventListener("mouseenter", () => {
                speedInPixels = 0; // Зупиняємо інтервал прокрутки
            });

            // Відновлюємо прокрутку при відведенні миші від контейнера
            scrollContainer.addEventListener("mouseleave", () => {
                speedInPixels = 1;
            });
        }
    }
    stopAutoScroll() {
        clearInterval(this.autoscrollInterval.interval);
        clearTimeout(this.autoscrollInterval.timeout);
    }
    isAllEarnedAchievesVisible() {
        let isVisible = true;

        this.container.querySelectorAll(".earned").forEach(achiv => {
            !this.isAchieveVisible(achiv) && (isVisible = false);
        })
        return isVisible;
    }
    isAchieveVisible(achiv) {
        let isVisible = true;

        const top = this.container.getBoundingClientRect().top;
        const height = this.container.getBoundingClientRect().height;

        const achivTopPos = achiv.getBoundingClientRect().top - top;
        const achivBottomPos = achiv.getBoundingClientRect().top - top + achiv.getBoundingClientRect().height;
        if (achivTopPos < 0 || achivBottomPos > height) {
            isVisible = false;
        }
        return isVisible;
    }
    highlightCurrentLevel(currentLevel) {
        [...this.container.querySelectorAll(".achiv-block")].forEach(cheevo => {
            cheevo.classList.remove("highlight");

            cheevo.dataset.level == currentLevel && cheevo.classList.add("highlight");

            if (!Number.isInteger(currentLevel)) {
                const mainLevel = parseInt(currentLevel);
                cheevo.dataset.level == mainLevel && cheevo.classList.add("highlight");
            }


        })
    }
    async applySorting(props = { animation: 500 }) {
        await applySort({
            container: this.container,
            itemClassName: ".achiv-block",
            sortMethod: sortBy[this.uiProps.sortName],
            reverse: this.uiProps.reverseSort,
            strictMode: this.uiProps.strictSort,
            animationDuration: this.uiProps.isGrouping ? 0 : props.animation
        });
        this.groupCheevos();
    }
    applyFiltering() {
        applyFilter({
            container: this.container,
            itemClassName: ".achiv-block",
            filters: this.filters,
            isHide: this.uiProps.hideFiltered,
        });
        this.groupCheevos();
        // this.fitSizeVertically()
    }
    setFilter({ filterName, state, type, event }) {
        // console.log(filterName, state, event)
        state === 0 ?
            delete this.filters[filterName] :
            this.filters[filterName] = { filterName, state };
        config.saveUIProperty({ sectionID: this.section.id, property: "filters", value: this.filters });
        this.applyFiltering();
    }
    doLoadAnimation() {
        const list = this.container;
        const cheevos = list.querySelectorAll(".achiv-block");
        function showAnimation() {
            const startPosition = list.scrollHeight;
            list.style.setProperty("--top-position", -startPosition + 'px');
            let index = 0;
            [...cheevos].reverse().forEach(async (cheevo) => {
                const animDelayMs = 100 * index + 200;
                !cheevo.classList.contains("removed") && index++;
                const animDuration = animDelayMs + 1000;
                cheevo.style.setProperty("--load-delay", animDelayMs + "ms");
                cheevo.classList.add("start-load-anim");
                await delay(50);
                cheevo.classList.add("show-load-anim");
                await delay(animDuration + 500);
                cheevo.classList.remove("show-load-anim", "start-load-anim");

            })
        }
        const delay = (time) => new Promise(res => setTimeout(res, time));

        setTimeout(() => showAnimation(), 0);
    }
    generateNewWidget({ }) {
        const newWidget = document.createElement("section");
        newWidget.id = `${this.SECTION_NAME}`;
        newWidget.classList.add("achivs", "section");
        newWidget.style.width = config.ui.achievements_section?.width ?? 350 + "px";
        newWidget.style.height =
            config.ui.achievements_section?.height ?? 650 + "px";
        newWidget.innerHTML = `
        <div class="header-container achievements-header_container">
          <div class="header-icon achievements-icon">
          </div>
          <h2 class="widget-header-text achivs-header-text">${ui.lang.cheevosSectionName}${this.CLONE_NUMBER === 0 ? "" : " ~"
            }</h2>
            ${buttonsHtml.filter(this.SECTION_NAME)}
            ${buttonsHtml.sort(this.SECTION_NAME)}
            ${buttonsHtml.tweek()}
            ${buttonsHtml.close()}
        </div>
        <ul class="achievements-container content-container"></ul>
        <div class="resizer"></div>
      `;
        return newWidget;
    }
    groupCheevos() {
        const createGroupElement = (title, filter, cheevos, ...props) => {
            const groupCheevos = [...cheevos].filter(c => filter(c.dataset, ...props));
            if (groupCheevos.length === 0) return;
            const group = document.createElement("div");
            group.classList.add("cheevos__group");
            group.classList.toggle("compact", !this.uiProps.showGroupHeader);
            group.innerHTML = `
                <div class="cheevos__group-header"><h3 class="cheevos__group-title">${title}</h3></div>
                <div class="cheevos__group-container"></div>
                </div>
            `;
            this.container.appendChild(group);

            groupCheevos.forEach(c => group
                .querySelector(".cheevos__group-container")
                .appendChild(c))
        }
        const removeGroups = (cheevos) => {
            cheevos.forEach(c => this.container.appendChild(c));
            this.fitSizeVertically();
        }
        const cheevos = this.container.querySelectorAll(".achiv-block");
        this.container.innerHTML = "";
        if (!this.uiProps.isGrouping) {
            removeGroups(cheevos);
            return;
        }
        switch (this.uiProps.groupBy) {
            case ("unlock_status"):
            case (cheevoGrouping.UNLOCK_STATUS):
                createGroupElement(ui.lang.earned, filterBy.earned, cheevos);
                createGroupElement(ui.lang.earnedSoftcore, filterBy.earnedSoftcore, cheevos);
                createGroupElement(ui.lang.locked, filterBy.notEarned, cheevos);
                break;
            case (cheevoGrouping.TYPE):
                createGroupElement(ui.lang.progression, filterBy.progression, cheevos);
                createGroupElement(ui.lang.missable, filterBy.missable, cheevos);
                createGroupElement(ui.lang.other, filterBy.typeless, cheevos);
                break;
            case (cheevoGrouping.LEVEL):

                const levels = [...cheevos]
                    .map(({ dataset }) => Number(dataset.level))
                    .filter(n => !Number.isNaN(n));

                const maxLevel = Math.max(0, ...levels);
                const minLevel = Math.min(0, ...levels);
                const { zones } = watcher.GAME_DATA;
                const isNamedLevels = zones?.length > 2;
                for (let level = minLevel; level <= maxLevel; level++) {
                    createGroupElement(`Level: ${isNamedLevels ? zones[level - 1] : level}`, filterBy.level, cheevos, { targetLevel: level })
                }
                createGroupElement(ui.lang.other, filterBy.leveless, cheevos);
                break;
            default: break;
        }

        this.fitSizeVertically();
    }
}
