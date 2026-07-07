import { genreIcons, icons, signedIcons } from "../components/icons.js"
import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";
import { config, ui, UIEvents, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { applyFilter, applySort, cheevosFiterNames, cheevosSortNames, filterBy, filterMethods, sortBy } from "../functions/sortFilter.js";
import { showComments } from "../components/comments.js";
import { cheevoPropsPopup } from "../components/cheevoPropsPopup.js";
import { delay } from "../functions/delay.js";
import { cheevoImageUrl, cheevoUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { scrollElementIntoView } from "../functions/scrollingToElement.js";
import { inputTypes } from "../components/inputElements.js";
import { imageFilters } from "../enums/imageFilters.js";
import { formatDuration } from "../functions/time.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { CACHE_TYPES } from "../enums/cacheDataTypes.js";
import { divHtml } from "../components/divContainer.js";
import { fromHtml } from "../functions/html.js";
import { parseCurrentGameLevel } from "../functions/parseRP.js";
import { createAutoScroll } from "../functions/autosScroll.js";
import { UI_EVENTS_LIST } from "../enums/UIEvents.js";
import { saveOrder } from "../functions/customOrder.js";
import { CHEEVO_TYPES } from "../enums/cheevoTypes.js";
import { contextSetsMenu } from "../functions/settings/subsetSettings.js";
import { raapi } from "../api/index.js";
import { CheevoElement } from "../components/cheevosList/cheevoItem.js";
import { formatText } from "../functions/formatText.js";

export class Target extends Widget {
    sectionCode = "-target";
    widgetIcon = {
        description: `${ui.lang.targetSectionName}`,
        iconClass: "target-icon",
    };
    filters = {};

    get contextMenuItems() {
        return [
            ...this.cheevoMenu(event),
            {
                type: inputTypes.DIVIDER,
            },
            {
                label: ui.lang.style,
                elements: [
                    {
                        label: ui.lang.showBackground,
                        type: inputTypes.CHECKBOX,
                        checked: !this.uiProps.hideBg,
                        onChange: (event) => this.uiProps.hideBg = !event.currentTarget.checked,
                        // event: `onchange="ui.target.uiProps.hideBg = !this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.fixedSize,
                        checked: this.uiProps.isFixedSize,
                        onChange: (event) => this.uiProps.isFixedSize = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.NUM_INPUT,
                        prefix: ui.lang.cheevosCount,
                        postfix: "",
                        id: "fixed-count",
                        label: ui.lang.cheevosCount,
                        value: this.uiProps.fixedSizeCount,
                        onInput: (event) => this.uiProps.fixedSizeCount = event.currentTarget.value,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.contrastHighlight,
                        checked: this.uiProps.contrastHighlight,
                        onChange: (event) => this.uiProps.contrastHighlight = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.STEPPER,
                        label: ui.lang.fontSize,
                        initValue: this.uiProps.fontScale,
                        step: 0.05,
                        onChange: (value) => this.uiProps.fontScale = value,
                    },
                    {
                        prefix: ui.lang.cropBorder,
                        postfix: "px",
                        type: inputTypes.NUM_INPUT,
                        id: "crop-offset",
                        label: ui.lang.cropBorder,
                        value: this.uiProps.cropOffset,
                        onInput: (event) => this.uiProps.cropOffset = event.currentTarget.value,
                    },
                ]
            },
            {
                label: ui.lang.autoscroll,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.autoscroll,
                        checked: this.uiProps.autoscroll,
                        onChange: (event) => this.uiProps.autoscroll = event.currentTarget.checked
                    },
                    {
                        prefix: ui.lang.scrollSpeed,
                        postfix: "px/s",
                        type: inputTypes.NUM_INPUT,
                        id: "menu_scroll-speed",
                        hint: ui.lang.scrollSpeed,
                        value: this.uiProps.scrollSpeed,
                        onInput: (event) => this.uiProps.scrollSpeed = event.currentTarget.value,
                    },
                    {
                        prefix: ui.lang.scrollPauseDuration,
                        postfix: "sec",
                        type: inputTypes.NUM_INPUT,
                        id: "menu_scroll-pause-dur",
                        hint: ui.lang.scrollPauseDuration,
                        value: this.uiProps.scrollPauseDuration,
                        onInput: (event) => this.uiProps.scrollPauseDuration = event.currentTarget.value,
                    },
                ]
            },
            {
                label: ui.lang.overlay,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showOverlay,
                        checked: this.uiProps.showPrevOverlay,
                        onChange: (event) => this.uiProps.showPrevOverlay = event.currentTarget.checked,
                    },
                    ...Object.values(imageFilters).map(filterName => ({
                        type: inputTypes.RADIO,
                        name: `${this.sectionID}-preview-filter`,
                        id: `${this.sectionID}-preview-filter-${filterName}`,
                        label: filterName,
                        checked: this.uiProps.lockedPreviewFilter === filterName,
                        onChange: () => this.uiProps.lockedPreviewFilter = filterName,
                    }))]
            },
            {
                label: ui.lang.elements,
                elements: [
                    {
                        label: ui.lang.showHeader,
                        type: inputTypes.CHECKBOX,
                        checked: this.uiProps.showHeader,
                        onChange: (event) => this.uiProps.showHeader = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showGenreBadges,
                        checked: this.uiProps.showGenre,
                        onChange: (event) => this.uiProps.showGenre = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showLevel,
                        checked: this.uiProps.showLevel,
                        onChange: (event) => this.uiProps.showLevel = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showEvents,
                        checked: this.uiProps.showEvents,
                        onChange: (event) => this.uiProps.showEvents = event.currentTarget.checked,
                    },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     id: "show-difficult",
                    //     label: ui.lang.showDifficult,
                    //     checked: this.uiProps.showDifficult,
                    //     event: `onchange="ui.target.uiProps.showDifficult = this.checked"`,
                    // },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showCheevoUnlockRateBar,
                        checked: this.uiProps.showCheevoUnlockRateBar,
                        onChange: (event) => this.uiProps.showCheevoUnlockRateBar = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        label: ui.lang.showPins,
                        checked: this.uiProps.showPins,
                        onChange: (event) => this.uiProps.showPins = event.currentTarget.checked,
                    },
                ]
            },
            {
                type: inputTypes.DIVIDER,
            },
            this.contextSortMenu(),
            this.contextFilterMenu(),
            this.contextMultiGameMenu(),
            contextSetsMenu({
                isChecked: (setID) => !this.uiProps.hiddenSets.includes(setID),
                onChange: (setID) => this.updateHiddenSets(setID),
            }),
        ];
    }
    cheevoMenu = (event) => {
        const cheevoElement = event?.target.closest(".target-achiv");
        if (!cheevoElement) return [];
        const cheevoID = cheevoElement.dataset.achivId;
        return [
            {
                label: ui.lang.openComments,
                type: inputTypes.BUTTON,
                onClick: () => showComments(cheevoID, 2),
            }
        ]
    }
    contextSortMenu = () => ({
        label: ui.lang.sort,
        elements: [
            ...Object.values(cheevosSortNames).map(sortName => ({
                type: inputTypes.RADIO,
                name: `${this.sectionID}-sort`,
                id: `${this.sectionID}-sort-${sortName}`,
                label: ui.lang[sortName],
                checked: this.uiProps.sortName === sortName,
                onChange: () => this.uiProps.sortName = sortName,
            })),
            {
                type: inputTypes.CHECKBOX,
                label: ui.lang.reverse,
                checked: this.uiProps.reverseSort == -1,
                onChange: (event) => this.uiProps.reverseSort = event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                label: ui.lang.strictMode,
                checked: this.uiProps.strictSort,
                onChange: (event) => this.uiProps.strictSort = event.currentTarget.checked,
            },
        ],
    })
    contextFilterMenu = () => ({
        label: ui.lang.filter,
        elements: [
            ...Object.values(cheevosFiterNames).map(filterName => ({
                type: inputTypes.STATEBOX,
                name: `${this.sectionID}-filter`,
                id: `${this.sectionID}-filter-${filterName}`,
                label: ui.lang[filterName],
                value: filterName,
                property: "filterName",
                state: `${this.uiProps.filters[filterName]?.state ?? 0}`,
                onChange: (stateData) => this.uiProps.filters = (stateData),
            })),
            {
                type: inputTypes.CHECKBOX,
                label: ui.lang.hideFiltered,
                checked: this.uiProps.hideFiltered,
                onChange: (event) => this.uiProps.hideFiltered = event.currentTarget.checked,
            },

        ],
    })
    contextMultiGameMenu = () => watcher.GAME_DATA?.groups?.length > 1 ? {
        label: ui.lang.multigame,
        elements: [
            {
                type: inputTypes.RADIO,
                name: `${this.sectionID}-mgame`,
                id: `${this.sectionID}-mgame-all`,
                label: ui.lang.all,
                checked: !this.uiProps.mGameSelection,
                onChange: () => this.uiProps.mGameSelection = "",
            },
            ...watcher?.GAME_DATA?.groups?.map(mGameName => ({
                type: inputTypes.RADIO,
                name: `${this.sectionID}-mgame`,
                id: `${this.sectionID}-mgame-${mGameName}`,
                label: mGameName,
                checked: this.uiProps.mGameSelection === mGameName,
                onChange: () => this.uiProps.mGameSelection = mGameName,
            })) ?? []
        ]
    } : "";
    contextSetsMenu_ = () => watcher.GAME_DATA?.visibleSubsets?.length ? {
        label: ui.lang.subsets,
        elements: [
            (() => {
                const setID = watcher.GAME_DATA.ID;
                let setName = "Main";
                Object.entries(watcher.GAME_DATA.availableSubsets).forEach(([name, id]) => {
                    if (id == setID) setName = name;
                })
                return {
                    type: inputTypes.CHECKBOX,
                    name: `${this.sectionID}-set`,
                    label: setName,
                    checked: !this.uiProps.hiddenSets.includes(setID),
                    onChange: () => this.updateHiddenSets(setID),
                }
            })(),
            ...watcher.GAME_DATA.visibleSubsets.map(setID => {
                const sets = watcher.GAME_DATA.availableSubsets;
                const setName = Object.keys(sets).find(name => sets[name] === setID);
                return {
                    type: inputTypes.CHECKBOX,
                    name: `${this.sectionID}-set`,
                    label: setName,
                    checked: !this.uiProps.hiddenSets.includes(setID),
                    onChange: () => this.updateHiddenSets(setID),
                }

            })
        ]
    } : "";

    uiDefaultValues = {
        isFixedSize: false,
        fixedSizeCount: 2,
        showHeader: true,
        hideBg: false,
        showCheevoUnlockRateBar: false,
        autoscroll: false,
        showDifficult: true,
        showLevel: true,
        showGenre: true,
        hidePassedLevels: false,
        highlightPassedLevels: false,
        showEvents: false,
        reverseSort: 1,
        strictSort: false,
        sortName: cheevosSortNames.DEFAULT,
        filters: {},
        hideFiltered: false,
        lockedPreviewFilter: imageFilters.OPACITY,
        showPrevOverlay: true,
        contrastHighlight: false,
        mGameSelection: "",
        showPins: false,
        hiddenSets: [],
        scrollSpeed: 20,
        scrollPauseDuration: 15,
        fontScale: 1.0,
        cropOffset: 0,
    }
    uiSetCallbacks = {
        autoscroll(value) {
            value ? this.startAutoScroll() : this.stopAutoScroll();
        },
        showLevel(value) {
            this.container.querySelectorAll(".target-achiv").forEach(el => el.classList.toggle("show-level", value))
        },
        showGenre(value) {
            this.container.querySelectorAll(".target-achiv").forEach(el => el.classList.toggle("show-genre", value))
        },
        reverseSort(value) {
            this.applySort();
        },
        sortName() {
            this.applySort();
        },
        strictSort() {
            this.applySort();
        },
        filters() {
            this.applyFilter();
        },
        hideFiltered() {
            this.filterByGenre(this.genreFilter, true)
        },
        lockedPreviewFilter() {
            // this.section.dataset.previewFilter = value;
            this.setElementsValues();
        },
        showPrevOverlay() {
            this.setElementsValues();
        },
        contrastHighlight() {
            this.setElementsValues();
        },
        mGameSelection() {
            this.setMGameSelection();
        },
        hiddenSets() {
            this.setSubsetSelection();
        },
        scrollSpeed(value) {
            value = value < 10 ? 10 : value;
            this.autoscroll?.setSpeed(value);
        },
        scrollPauseDuration(value) {
            value = value < 0 ? 0 : value;
            this.autoscroll?.stop();
            this.autoscroll = null;
            this.startAutoScroll();
        },
        cropOffset(value) {
            this.section.style.setProperty("--crop-offset", `${value}px`);
        }

    };
    uiValuePreprocessors = {
        newAchivDuration(value) {
            return (value <= 5 || value > 60) ? 5 : value;
        },
        fixedSizeCount(value) {
            return (value < 1) ? 1 : ~~value
        },
        reverseSort(value) {
            return value ? -1 : 1;
        },
        filters({ filterName, state, }, parent) {
            const filters = parent.uiProps.filters;
            state === 0 ?
                delete filters[filterName] :
                filters[filterName] = { filterName, state };
            return filters;
        },
        scrollSpeed(value) {
            return (value <= 10) ? 10 : value;
        },
        scrollPauseDuration(value) {
            return value < 0 ? 0 : value;
        },
        cropOffset(value) {
            return (value && value > 0 && value <= 10) ? value : 0;
        },
    };
    get isDisplayOrderChanged() {
        return this.__isDisplayOrderChanged;
    }
    set isDisplayOrderChanged(value) {
        this.__isDisplayOrderChanged = value;
        this.section.classList.toggle("has-unsaved-order", value);
    }
    updateHiddenSets(setID) {
        let hiddenIDArray = this.uiProps.hiddenSets;
        if (!hiddenIDArray?.length) hiddenIDArray = [];

        if (hiddenIDArray.includes(setID)) {
            hiddenIDArray = hiddenIDArray.filter(id => parseInt(id) !== parseInt(setID));
        }
        else {
            hiddenIDArray.push(setID);
        }

        this.uiProps.hiddenSets = hiddenIDArray;

    }
    constructor(id) {
        super();
        this.ID = id || "";
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        this.setValues();
        this.showAotwEvent()
    }
    initializeElements() {
        this.sectionID = this.section.id;
        this.header = this.section.querySelector(".header-container");
        this.container = this.section.querySelector(".target-container");
        this.pinnedContainer = this.section.querySelector(".target__pinned-list")
        this.searchInput = this.section.querySelector("#target__searchbar");

        // this.moveToTopCheckbox = document.querySelector("#target-move-to-top");
    }
    generateWidget() {
        const widgetID = "target_section" + this.ID;
        const headerElementsHtml = `
            ${buttonsHtml.togglePins()}
            ${buttonsHtml.filter(widgetID)}
            ${buttonsHtml.sort(widgetID)}
            ${buttonsHtml.saveData({ className: "save-order-button", hint: ui.lang.saveAsCustomOrder, id: `${widgetID}-save-order` })}
            ${buttonsHtml.tweek()}
            <input type="search" name="" id="target__searchbar" class="text-input target__search-bar" data-title="${ui.lang.targetSearchHint}" placeholder="${ui.lang.search}">
        `;
        const contentHtml = `
            ${divHtml(["target__pinned-list"])}
            ${divHtml(["target-container", "content-container", "flex-main-list"])}
        `
        const widgetData = {
            classes: ["target_section", "section", "compact-header"],
            id: widgetID,
            title: ui.lang.targetSectionName,
            headerElementsHtml,
            contentHtml,
        };

        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
        this.section = widget;
    }
    addEvents() {
        let ctrlPressed = false;
        let currentWord = null;
        const getWordFromPoint = (event) => {
            let node, offset;
            if (document.caretPositionFromPoint) {
                const pos = document.caretPositionFromPoint(event.clientX, event.clientY);
                node = pos.offsetNode;
                offset = pos.offset;
            } else if (document.caretRangeFromPoint) {
                const range = document.caretRangeFromPoint(event.clientX, event.clientY);
                node = range.startContainer;
                offset = range.startOffset;
            }

            if (node?.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;

                let start = offset;
                while (start > 0 && /[^.,:"'\s]/.test(text[start - 1])) start--;

                let end = offset;
                while (end < text.length && /[^.,:"'\s]/.test(text[end])) end++;

                return text.slice(start, end);
            }
        }
        super.addEvents();

        window.addEventListener("keydown", (event) => {
            if (event.key === "Control") {
                ctrlPressed = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "Control") {
                ctrlPressed = false;
                currentWord = null;
                this.container.querySelectorAll(".list-item__text")?.forEach(el => el.dataset.title = "");
                // removeHighlight();
            }
        });

        this.container.addEventListener("mousemove", (event) => {
            if (ctrlPressed && event.target.closest(".list-item__text")) {
                const descrElement = event.target.closest(".list-item__text");
                const word = getWordFromPoint(event);

                if (word !== currentWord && descrElement.textContent.includes(word)) {
                    currentWord = word;
                    descrElement.dataset.title = formatText(ui.lang.quickSearchHint, { query: word });
                    // highlightWord(word);
                }
            }
        });
        this.section.querySelector(`#${this.sectionID}-save-order`)?.addEventListener("click", event => {
            this.saveAsCustomOrder();
        });
        this.section.querySelector(`#${this.sectionID}-filter-button`)?.addEventListener("click", event => {
            ui.showContextmenu({ event, menuItems: this.contextFilterMenu().elements, sectionCode: this.SECTION_NAME })
        });
        this.section.querySelector(`#${this.sectionID}-sort-button`)?.addEventListener("click", event => {
            ui.showContextmenu({ event, menuItems: this.contextSortMenu().elements, sectionCode: this.SECTION_NAME })
        });
        this.header.querySelector(".toggle-pins")?.addEventListener("click", () => {
            this.uiProps.showPins = !this.uiProps.showPins;
        })
        this.container.addEventListener("click", (event) => {
            if (ctrlPressed && currentWord && event.target.closest(".list-item__text")) {
                event.stopPropagation();
                if (this.searchInput.value === currentWord) {
                    this.searchInput.value = "";
                }
                else {
                    this.searchInput.value = currentWord;
                }
                this.searchInput.dispatchEvent(new Event("input"));
                // console.log({ currentWord });
            }
            else if (event.target.closest(".comments-button")) {
                const cheevoID = event.target.closest(".target-achiv")?.dataset.achivId;
                cheevoID && showComments(cheevoID, 2);
            }
            // else if (event.target.matches(".edit-cheevo-button")) {
            //     const cheevoID = event.target.dataset.cheevoId;
            //     const cheevo = watcher.CHEEVOS[cheevoID];
            //     cheevo && cheevoPropsPopup().open(cheevo);
            // }
            else if (event.target.matches(".pin-cheevo")) {
                const cheevo = event.target.closest(".target-achiv");
                this.toggleCheevoPin(cheevo);
            }
            else if (event.target.matches(".delete-from-target")) {
                const cheevo = event.target.closest(".target-achiv");
                this.deleteFromTarget(cheevo);
            }
            else if (event.target.matches(".target-genre-badge")) {
                const genre = event.target.dataset.genre;
                this.filterByGenre(genre)
            }
        });
        this.pinnedContainer.addEventListener("click", (event) => {
            if (event.target.closest(".comments-button")) {
                const cheevoID = event.target.closest(".target-achiv")?.dataset.achivId;
                cheevoID && showComments(cheevoID, 2);
            }
            // else if (event.target.matches(".edit-cheevo-button")) {
            //     const cheevoID = event.target.dataset.cheevoId;
            //     const cheevo = watcher.CHEEVOS[cheevoID];
            //     cheevo && cheevoPropsPopup().open(cheevo);
            // }
            else if (event.target.matches(".pin-cheevo")) {
                const cheevo = event.target.closest(".target-achiv");
                this.toggleCheevoPin(cheevo);
            }
            else if (event.target.matches(".delete-from-target")) {
                const cheevo = event.target.closest(".target-achiv");
                this.deleteFromPinned(cheevo);
            }
        });
        const dragElements = (container, onDragEnd, pull) => {
            new Sortable(container, {
                group: {
                    name: "cheevos", pull, put: true, push: "false"
                },
                animation: 100,
                forceFallback: ui.isCEF,
                chosenClass: "dragged",
                onAdd: function (evt) {
                    const element = evt.item;
                    const cheevoID = element.dataset.achivId;
                    element.remove();
                    onDragEnd && onDragEnd(cheevoID);
                },
                onUpdate: () => {
                    if (pull) {
                        this.isDisplayOrderChanged = true;
                    } //main container doesn't save order
                    else {
                        const pinnedIDs = [...container.querySelectorAll(".target-achiv")]?.map(elem => +elem.dataset.achivId);
                        this.savePinnedData(pinnedIDs);
                        this.fillPinnedItems(pinnedIDs);
                        this.markPinned();
                    }
                },
                onStart: (evt) => {
                },
                // onEnd: () => ui.addEvents(),
            });

        }
        dragElements(this.container, (id) => {
            this.pushCheevo(id);
            this.section.querySelector(".achiv-block")?.remove();
        }, "clone")
        dragElements(this.pinnedContainer, (id) => {
            const dragToPinned = (cheevoID) => {
                cheevoID = Number(cheevoID);
                const pinnedIDs = config.gamesDB[watcher.GAME_DATA.ID]?.pinned ?? [];
                const isPinned = pinnedIDs.includes(cheevoID);
                if (isPinned) {
                    return;
                };
                pinnedIDs.push(cheevoID);
                this.savePinnedData(pinnedIDs);
                this.fillPinnedItems(pinnedIDs);
                this.markPinned();
            }
            this.section.querySelector(".achiv-block")?.remove();
            dragToPinned(id);
        }, false)
        this.searchInput?.addEventListener("input", (event) => this.searchInputEvent(event));
    }
    searchInputEvent(event) {
        event.stopPropagation();
        this.container.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        const clearPrevQuery = () => {
            this.container.querySelectorAll('span.badge.highlight-badge').forEach(el =>
                el.replaceWith(el.innerText)
            )
        }
        const markQuery = (query) => {
            const regex = new RegExp(`(${query})`, 'gi');
            [...this.container.querySelectorAll('.target-achiv')].reverse().forEach(cheevo => {
                const description = cheevo.querySelector('.list-item__text');
                const title = cheevo.querySelector('.target__cheevo-header a');
                if (title.innerText.match(regex)) {
                    this.moveToTop(description.closest('.target-achiv'));
                    title.innerHTML = title.innerHTML.replace(regex, (g1) => `<span class="badge highlight-badge">${g1}</span>`)

                }
                if (description.innerText.match(regex)) {
                    this.moveToTop(description.closest('.target-achiv'));
                    description.innerHTML = description.innerHTML.replace(regex, (g1) => `<span class="badge highlight-badge">${g1}</span>`)
                }
            })
        }
        clearPrevQuery();

        const query = event.target.value;
        if (query && (query.length > 2 || /\d+/.test(query))) {
            markQuery(query);
        }
        else {
            this.applySort();
        }
    }
    setElementsValues() {
        this.section.style.setProperty("--font-size", `${this.uiProps.fontScale}em`);
        this.section.classList.toggle("show-events", this.uiProps.showEvents);
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);
        this.section.classList.toggle("hide-bg", this.uiProps.hideBg);
        this.section.classList.toggle("fixed-size", this.uiProps.isFixedSize);
        this.section.classList.toggle("show-progression-bar", this.uiProps.showCheevoUnlockRateBar);
        this.section.classList.toggle("show-overlay", this.uiProps.showPrevOverlay);
        this.container.style.setProperty("--max-count", this.uiProps.fixedSizeCount);
        this.section.dataset.previewFilter = this.uiProps.lockedPreviewFilter;
        this.section.classList.toggle("contrast-highlight", this.uiProps.contrastHighlight);
        this.section.classList.toggle("show-pins", this.uiProps.showPins);
        this.section.style.setProperty("--crop-offset", `${this.uiProps.cropOffset}px`);
    }
    setValues() {
        this.applyPosition();
        this.setElementsValues();
        this.startAutoScroll();
    }
    saveAsCustomOrder() {
        const items = this.container.querySelectorAll("li.target-achiv");
        const gameData = watcher.GAME_DATA;
        saveOrder({ gameData, items, config });
        this.isDisplayOrderChanged = false;
        UIEvents.dispatchEvent(new CustomEvent(UI_EVENTS_LIST.customOrderChanged, {}));
        this.onCustomOrderChanged({});
    }
    onCustomOrderChanged() {
        const cheevos = watcher.CHEEVOS;
        const gameID = watcher.GAME_DATA.ID;
        this.container.querySelectorAll("li.target-achiv").forEach((cheevo, index) => {
            const cheevoID = cheevo.dataset.achivId;
            cheevo.dataset.customOrder = cheevos[cheevoID].customOrder;
        })
        if (this.uiProps.sortName === cheevosSortNames.CUSTOM_ORDER) {
            this.applySorting();
        }

    }
    onGameChange({ isNewGame }) {
        // if (true || isNewGame) {
        //     this.filters = this.uiProps.filters
        // }
        this.genreFilter = "";
        this.isDisplayOrderChanged = false;
        this.fillItems();
        this.fillPinnedItems();
        this.markPinned();
    }
    onStatsUpdate({ userData }) {
        const { richPresence } = userData;
        const gameData = watcher.GAME_DATA;
        const currentLevel = parseCurrentGameLevel(richPresence, gameData);
        this.highlightCurrentLevel(currentLevel);
    }
    async onCheevoUnlocks({ cheevos }) {
        const animElement = () => {
            const animContainer = document.createElement("div");
            animContainer.classList.add("target-unlock-anim");
            animContainer.innerHTML = `
                <div class="lines"></div>
                <div class="lock"></div>
            `;
            return animContainer;
        }
        const scrollPosition = this.container.scrollTop;
        for (let cheevo of cheevos) {
            const cheevoID = cheevo.ID;
            const cheevoElement = this.container.querySelector(`.target-achiv[data-achiv-id='${cheevoID}']`);
            if (cheevoElement) {
                const animEl = animElement();
                await scrollElementIntoView({ container: this.container, element: cheevoElement, scrollByX: false })
                // cheevoElement.scrollIntoView({ behavior: ui.isCEF ? "auto" : "smooth", block: "center", });
                await delay(600);
                cheevoElement.classList.add("earned", "show-hard-anim");
                cheevoElement.classList.toggle("hardcore", cheevo?.isEarnedHardcore);
                cheevo.isEarnedHardcore && (cheevoElement.dataset.DateEarnedHardcore = cheevo.DateEarnedHardcore);
                cheevoElement.dataset.DateEarned = cheevo.DateEarned;
                cheevoElement.appendChild(animEl);
                setTimeout(() => {
                    cheevoElement.classList.remove("show-hard-anim");
                    animEl?.remove();
                }, 2000);
                await delay(2100);
            }
        };
        this.container.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
        });
        this.applyFilter();
        this.applySort();
        this.genreFilter && this.filterByGenre(this.genreFilter, true);
    }
    autoscroll;
    startAutoScroll() {
        this.autoscroll ??= createAutoScroll(this.container, {
            speed: this.uiProps.scrollSpeed,
            pauseOnEndMs: this.uiProps.scrollPauseDuration * 1e3,
        });
        this.uiProps.autoscroll && this.autoscroll.start();
    }
    stopAutoScroll() {
        this.autoscroll?.stop();
    }
    isAchievementInTargetSection({ ID, targetContainer = this.container }) {
        const targetAchievements = [
            ...targetContainer.querySelectorAll(".target-achiv"),
        ].filter((el) => el.dataset.achivId == ID);

        return targetAchievements.length > 0;
    }
    getCheevoElement(cheevoID) {
        const achievement = watcher.CHEEVOS[cheevoID];
        const targetElement = CheevoElement(achievement, this.uiProps);
        return targetElement;
    }
    pushCheevo(cheevoID) {
        if (this.isAchievementInTargetSection({ ID: cheevoID })) {
            return;
        }
        const targetElement = this.getCheevoElement(cheevoID);

        this.container.appendChild(targetElement);

        // for one element adding only
        if (!this.isDynamicAdding) {
            this.applyFilter();
            this.applySort();
        }
    }
    markPinned() {
        const gameID = watcher.GAME_DATA?.ID;
        const pinnedIDs = config.gamesDB[gameID]?.pinned ?? [];
        this.section.querySelectorAll(".target-achiv")
            .forEach(cheevoElement => {
                const cheevoID = +cheevoElement.dataset.achivId;
                const isPinned = pinnedIDs.includes(cheevoID);
                cheevoElement.classList.toggle("pinned", isPinned)
            });

    }
    refreshCheevo(id) {
        this.container.querySelector(`.target-achiv[data-achiv-id="${id}"]`)?.remove();
        this.pushCheevo(id);
    }
    moveToTop(element) {
        this.container.prepend(element);
        this.applyFilter();
    }

    applyFilter() {
        applyFilter({
            container: this.container,
            itemClassName: ".target-achiv",
            filters: this.uiProps.filters,
            isHide: this.uiProps.hideFiltered,
        });
    }
    filterByGenre(genre, isUpdate = false) {
        const clearGenreFilter = () => {
            this.container.querySelectorAll(".hidden").forEach(el => el.classList.remove("hidden"))
        }
        clearGenreFilter();

        if ((!isUpdate && this.genreFilter === genre) || !genre) {
            this.genreFilter = "";
            this.applyFilter();
        }
        else {
            this.genreFilter = genre;
            applyFilter({
                container: this.container,
                itemClassName: ".target-achiv",
                filters: {
                    ...this.uiProps.filters,
                    genre: {
                        filterName: filterMethods.genre,
                        state: 1,
                        genre: genre,
                    }
                },
                isHide: this.uiProps.hideFiltered,
            });
        }
    }
    setSubsetSelection() {
        if (!watcher.GAME_DATA.visibleSubsets?.length) return;
        const cheevos = this.container.querySelectorAll(".target-achiv");
        const hiddenIDArray = this.uiProps.hiddenSets;
        const isHidden = (cheevo) => hiddenIDArray.includes(parseInt(cheevo.dataset.setID));
        cheevos.forEach((cheevo) => cheevo.classList.toggle("hidden-set", isHidden(cheevo)))
    }
    setMGameSelection() {
        const cheevos = this.container.querySelectorAll(".target-achiv");

        if (this.uiProps.mGameSelection && !watcher.GAME_DATA.groups?.includes(this.uiProps.mGameSelection)) {
            this.uiProps.mGameSelection = "";
            return;
        }
        else {
            const isHidden = (cheevo) => this.uiProps.mGameSelection && (this.uiProps.mGameSelection !== cheevo.dataset.group);
            cheevos.forEach((cheevo) => cheevo.classList.toggle("hidden-group", isHidden(cheevo)))
        }
    }
    applySort(props = { animation: 500 }) {
        applySort({
            container: this.container,
            itemClassName: ".target-achiv",
            sortMethod: sortBy[this.uiProps.sortName],
            reverse: this.uiProps.reverseSort,
            strictMode: this.uiProps.strictSort,
            animationDuration: this.IS_GROUPING ? 0 : props.animation
        });
    }
    highlightCurrentLevel(currentLevel) {

        [...this.container.querySelectorAll('.target-achiv')].forEach(cheevo => {
            cheevo.classList.remove("highlight");
            cheevo.classList.remove("passed");
            const cheevoLevel = cheevo.dataset.level;
            cheevoLevel == currentLevel && cheevo.classList.add("highlight");
            //set highlight
            if (!Number.isInteger(currentLevel)) {
                const mainLevel = parseInt(currentLevel);
                cheevo.dataset.level == mainLevel && cheevo.classList.add("highlight");
            }

            //set passed
            if (!Number.isInteger(+cheevoLevel)) {
                cheevoLevel < currentLevel && cheevo.classList.add("passed");
            }
            else {
                cheevoLevel < parseInt(currentLevel) && cheevo.classList.add("passed");
            }
        });

    }
    deleteFromPinned(button) {
        const element = button.closest(".target-achiv");
        element?.classList.add('removing');

        setTimeout(() => element?.remove(), 0);

    }
    deleteFromTarget(button) {
        const element = button.closest(".target-achiv");
        element?.classList.add('removing');

        setTimeout(() => element?.remove(), 0);
    }
    clearEarned() {
        this.container.querySelectorAll(".target-achiv").forEach((achievement) => {
            if (achievement.classList.contains("hardcore")) {
                achievement.remove();
            }
        });
    }
    clearAllAchivements() {
        this.container.innerHTML = "";
    }
    pushToPins(cheevoID) {
        if (!watcher.CHEEVOS[cheevoID]) return;
        const pinnedCheevoElement = this.getCheevoElement(cheevoID);
        this.pinnedContainer.appendChild(pinnedCheevoElement);
    }
    fillPinnedItems(pinnedIDs) {
        this.pinnedContainer.innerHTML = "";
        const gameID = watcher.GAME_DATA?.ID;
        pinnedIDs ??= config.gamesDB[gameID]?.pinned ?? [];
        pinnedIDs.forEach(cheevoID => {
            // const cheevo = watcher.CHEEVOS[cheevoID];
            this.pushToPins(cheevoID);
        })

    }
    toggleCheevoPin(cheevoElement) {
        const gameID = watcher.GAME_DATA?.ID;
        let pinnedIDs = config.gamesDB[gameID]?.pinned ?? [];
        const cheevoID = Number(cheevoElement.dataset?.achivId ?? -1);
        const isPinned = pinnedIDs.includes(cheevoID);
        if (isPinned) {
            pinnedIDs = pinnedIDs.filter(id => id !== cheevoID);
            this.pinnedContainer.querySelectorAll(`.target-achiv[data-achiv-id="${cheevoID}"]`).forEach(pin => {
                pin.remove()
            })
        }
        else {
            pinnedIDs.push(cheevoID);
            this.pushToPins(cheevoID);
        }
        this.savePinnedData(pinnedIDs, gameID);

        this.markPinned();


    }
    fillItems() {
        this.isDynamicAdding = true;
        this.clearAllAchivements();
        Object.keys(watcher.CHEEVOS).forEach(id => {
            this.pushCheevo(id)
        });
        this.applyFilter();
        this.applySort();
        this.setMGameSelection();
        this.setSubsetSelection();
        this.isDynamicAdding = false;

        // config.aotw && this.container.querySelector(`.target-achiv[data-achiv-id='${config.aotw?.ID}']`)?.classList.add("target__aotw");

    }

    async showAotwEvent() {
        const cheevo = await raapi.getAotW({});

        if (!cheevo || cheevo.wasShown) return;
        const rarity = 100 * cheevo.UnlocksHardcoreCount / cheevo.TotalPlayers;
        this.section.querySelector(`.target__aotw-container`)?.remove();
        this.container.querySelector(`.target-achiv[data-achiv-id='${cheevo.ID}']`)?.classList.add("target__aotw")
        const aotwElement = document.createElement("div");
        aotwElement.classList.add("target__aotw-container", "target__aotw", "show-difficult", "show-level");
        const hideAotwButton = fromHtml(`
                <button class="description-icon target__hide-aotw"></button>
        `);
        hideAotwButton.addEventListener("click", () => this.hideAotw());

        const aotwPreview = fromHtml(`
            <div class="prev">
                <img class="prev-img" src="${gameImageUrl(cheevo.BadgeURL)}">
            </div>
        `);
        const aotwDetails = fromHtml(`
            <div class="target__cheevo-details">
                <h3 class="target__cheevo-header">
                    <a target="_blanc" href="${cheevoUrl(cheevo)}">
                    ${cheevo.Title}
                    </a>
                    in
                    <a target="_blanc" href="${gameUrl(cheevo.GameID)}">
                    ${cheevo.GameTitle}
                    </a>
                </h3>
                <div class="list-item__text">
                ${badgeElements.black("AotW Event")}
                    ${cheevo.Description}
                </div>
                <div class="icons-row-list">
                    ${icons.cheevoType(cheevo?.Type)}
                    ${signedIcons.points(cheevo.Points)}
                    ${signedIcons.retropoints(cheevo.TrueRatio)}
                    ${signedIcons.rarity(rarity.toFixed(2) + "%")}
                    ${signedIcons.retroRatio((cheevo.TrueRatio / Math.max(1, cheevo.Points)).toFixed(2))}
                </div>
            </div>
        `)
        aotwElement.append(
            hideAotwButton,
            aotwPreview,
            aotwDetails
        );
        this.section.querySelector(".target__aotw-container")?.remove();
        this.header.after(aotwElement);
    }
    async hideAotw() {
        this.section.querySelector(`.target__aotw-container`)?.remove();
        const aotwData = await raapi.getAotW({});
        config.cache.push({
            dataType: CACHE_TYPES.AOTW,
            data: {
                ...aotwData,
                wasShown: true
            }
        })
    }
    savePinnedData(pinnedIDs, gameID) {
        gameID ??= watcher.GAME_DATA.ID;
        if (!config.gamesDB[gameID]) {
            config.gamesDB[gameID] = {};
        }
        config.gamesDB[gameID].pinned = pinnedIDs;
        config.writeConfiguration();
    }
}