import { UI } from "../ui.js";
import { genreIcons, icons, signedIcons } from "../components/icons.js"
import { generateBadges, badgeElements, goldBadge } from "../components/badges.js";
import { apiWorker, config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { applyFilter, applySort, cheevosFiterNames, cheevosSortNames, filterBy, filterMethods, sortBy, sortMethods } from "../functions/sortFilter.js";
import { showComments } from "../components/comments.js";
import { cheevoPropsPopup } from "../components/cheevoPropsPopup.js";
import { delay } from "../functions/delay.js";
import { cheevoImageUrl, cheevoUrl, gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { scrollElementIntoView } from "../functions/scrollingToElement.js";
import { inputTypes } from "../components/inputElements.js";
import { imageFilters } from "../enums/imageFilters.js";
import { secondsToBadgeString } from "../functions/time.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { CACHE_TYPES } from "../enums/cacheDataTypes.js";
import { divHtml } from "../components/divContainer.js";
import { fromHtml } from "../functions/html.js";

export class Target extends Widget {
    sectionCode = "-target";
    widgetIcon = {
        description: "target widget",
        iconID: "side-panel__target",
        onChangeEvent: `ui.target.VISIBLE = this.checked`,
        iconClass: "target-icon",
    };
    filters = {};
    externalWindow;

    get contextMenuItems() {
        return [

            {
                label: ui.lang.style,
                elements: [
                    {
                        label: ui.lang.showBackground,
                        type: inputTypes.CHECKBOX,
                        id: "hide-target-bg",
                        checked: !this.uiProps.hideBg,
                        onChange: (event) => this.uiProps.hideBg = !event.currentTarget.checked,
                        // event: `onchange="ui.target.uiProps.hideBg = !this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "fixed-count-switcher",
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
                        id: "autoscroll-target",
                        label: ui.lang.autoscroll,
                        checked: this.uiProps.autoscroll,
                        onChange: (event) => this.uiProps.autoscroll = event.currentTarget.checked
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "contrast-highlight-target",
                        label: ui.lang.contrastHighlight,
                        checked: this.uiProps.contrastHighlight,
                        onChange: (event) => this.uiProps.contrastHighlight = event.currentTarget.checked,
                    },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     name: "hide-unearned",
                    //     id: "hide-unearned",
                    //     label: ui.lang.showOverlay,
                    //     checked: this.SHOW_PREV_OVERLAY,
                    //     event: `onchange="ui.target.SHOW_PREV_OVERLAY = this.checked"`,
                    // },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     name: "show-border",
                    //     id: "show-border",
                    //     label: ui.lang.showImageBorder,
                    //     checked: this.SHOW_PREV_BORDER,
                    //     event: `onchange="ui.target.SHOW_PREV_BORDER = this.checked"`,
                    // },
                ]
            },
            {
                label: ui.lang.overlay,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-overlay",
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
                        id: "hide-target-header",
                        checked: this.uiProps.showHeader,
                        onChange: (event) => this.uiProps.showHeader = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-genre-badge",
                        label: ui.lang.showGenreBadges,
                        checked: this.uiProps.showGenre,
                        onChange: (event) => this.uiProps.showGenre = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-level",
                        label: ui.lang.showLevel,
                        checked: this.uiProps.showLevel,
                        onChange: (event) => this.uiProps.showLevel = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-events-checkbox",
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
                        id: "progression-bar",
                        label: ui.lang.showCheevoUnlockRateBar,
                        checked: this.uiProps.showCheevoUnlockRateBar,
                        onChange: (event) => this.uiProps.showCheevoUnlockRateBar = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "show-pins",
                        label: ui.lang.showPins,
                        checked: this.uiProps.showPins,
                        onChange: (event) => this.uiProps.showPins = event.currentTarget.checked,
                    },
                ]
            },
            this.contextSortMenu(),
            this.contextFilterMenu(),
            this.contextMultiGameMenu(),
            this.contextSetsMenu(),
            {
                label: ui.lang.level_test,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "hide-passed-levels",
                        label: ui.lang.hidePassedLevels,
                        checked: this.uiProps.hidePassedLevels,
                        onChange: (event) => this.uiProps.hidePassedLevels = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "highlight-passed",
                        label: ui.lang.highLightPassedLevels,
                        checked: this.uiProps.highlightPassedLevels,
                        onChange: (event) => this.uiProps.highlightPassedLevels = event.currentTarget.checked,
                    },

                ],
            },
            {
                label: ui.lang.data,
                elements: [
                    {
                        type: inputTypes.BUTTON,
                        id: "fill",
                        label: ui.lang.fillAll,
                        onClick: () => this.fillItems(),
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "autofill",
                        label: ui.lang.autofill,
                        checked: this.uiProps.autoFillTarget,
                        onChange: (event) => this.uiProps.autoFillTarget = event.currentTarget.checked,
                    },
                    {
                        type: inputTypes.BUTTON,
                        id: "clear-all",
                        label: ui.lang.clearAll,
                        onClick: () => this.clearAllAchivements(),
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "autoclear",
                        label: ui.lang.autoclearEarned,
                        checked: this.uiProps.autoClearTarget,
                        onChange: (event) => this.uiProps.autoClearTarget = event.currentTarget.checked,
                    },
                    {
                        prefix: ui.lang.clearDelay,
                        postfix: "sec",
                        type: inputTypes.NUM_INPUT,
                        id: "autoclear-delay",
                        label: ui.lang.clearDelay,
                        value: this.uiProps.autoClearTargetTime,
                        onChange: (event) => this.uiProps.autoClearTargetTime = event.currentTarget.value,
                    },
                ],
            },
        ];
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
                id: "reverse-sort",
                label: ui.lang.reverse,
                checked: this.uiProps.reverseSort == -1,
                onChange: (event) => this.uiProps.reverseSort = event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                id: "strict-sort",
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
                id: "hide-filtered",
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
    contextSetsMenu = () => watcher.GAME_DATA?.visibleSubsets?.length ? {
        label: ui.lang.subsets,
        elements: [
            (() => {
                const setID = watcher.GAME_DATA.ID;
                const setName = "Main";
                return {
                    type: inputTypes.CHECKBOX,
                    name: `${this.sectionID}-set`,
                    id: `${this.sectionID}-set-${setID}`,
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
                    id: `${this.sectionID}-set-${setID}`,
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
        autoClearTarget: false,
        autoFillTarget: true,
        autoClearTargetTime: 5,
        autoscroll: false,
        showDifficult: true,
        showLevel: true,
        showGenre: true,
        hidePassedLevels: false,
        highlightPassedLevels: true,
        showEvents: false,
        reverseSort: 1,
        strictSort: false,
        sortName: sortMethods.default,
        filters: {},
        hideFiltered: false,
        lockedPreviewFilter: imageFilters.OPACITY,
        showPrevOverlay: true,
        contrastHighlight: false,
        mGameSelection: "",
        showPins: false,
        hiddenSets: [],
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
        }

    };
    uiValuePreprocessors = {
        newAchivDuration(value) {
            return (value <= 5 || value > 60) ? 5 : value;
        },
        fixedSizeCount(value) {
            return (value < 1) ? 1 : ~~value
        },
        autoClearTargetTime(value) {
            return value < 0 ? 0 : +value;
        },
        reverseSort(value) {
            return value ? -1 : 1;
        },
        filters({ filterName, state }) {
            const filters = ui.target.uiProps.filters; //!        fix
            state === 0 ?
                delete filters[filterName] :
                filters[filterName] = { filterName, state };
            return filters;
        }
    };
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
    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        this.setValues();
        this.showAotwEvent()
    }
    initializeElements() {
        this.section = document.querySelector("#target_section");
        this.sectionID = this.section.id;
        this.header = this.section.querySelector(".header-container");
        this.container = this.section.querySelector(".target-container");
        this.pinnedContainer = this.section.querySelector(".target__pinned-list")
        this.searchInput = this.section.querySelector("#target__searchbar");

        // this.moveToTopCheckbox = document.querySelector("#target-move-to-top");
    }
    generateWidget() {
        const widgetID = "target_section";
        const headerElementsHtml = `
        ${buttonsHtml.togglePins()}
            ${buttonsHtml.filter(widgetID)}
            ${buttonsHtml.sort(widgetID)}
            ${buttonsHtml.tweek()}
            <input type="search" name="" id="target__searchbar" class="text-input target__search-bar" placeholder="${ui.lang.search}">
            ${buttonsHtml.external(widgetID)}
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
    }
    toggleExternalWindow() {
        const debounce = (fn, delay = 250) => {
            this.externalUpdateTimer && clearTimeout(this.externalUpdateTimer);
            this.externalUpdateTimer = setTimeout(() => fn.apply(this), delay);
        }
        const addObserver = () => {
            const observer = new MutationObserver(mutations => {
                debounce(() => this.updateExternalWindow());
            });

            observer.observe(this.container, {
                childList: true,      // слухати зміни у дочірніх елементах (додавання/видалення)
                characterData: true,  // слухати зміну тексту
                subtree: true,         // слухати ще й вкладені вузли
                attributes: true
            });
            return observer;
        }
        if (this.externalWindow) {
            this.externalWindow.close();
            delete this.externalWindow;
            this.containerObserver?.disconnect();
            this.externalUpdateTimer && clearTimeout(externalUpdateTimer);
        }
        else {
            this.externalUpdateTimer;
            this.externalWindow = window.open(
                "",
                "Target",
                `width=${this.section.offsetWidth},
                height=${this.section.offsetHeight}`
            );

            this.externalWindow.document.write(`
            <html>
              <head>
                <title>Target Window</title>
              </head>
              <body></body>
            </html>
            `);
            this.externalWindow.document.close();

            // Копіюємо стилі з основного вікна
            [...document.querySelectorAll('link[rel="stylesheet"], style')].forEach(node => {
                this.externalWindow.document.head.appendChild(node.cloneNode(true));
            });

            const targetBody = this.externalWindow.document.body;

            const styles = getComputedStyle(document.body);

            for (let i = 0; i < styles.length; i++) {
                const prop = styles[i];
                if (prop.startsWith("--")) {
                    const value = styles.getPropertyValue(prop);
                    targetBody.style.setProperty(prop, value);
                }
            }

            targetBody.innerHTML = `
                <section style='height: 100%; display: flex'>
                    ${this.container.outerHTML}
                </section>`;
            this.containerObserver = addObserver();
        }
    }
    updateExternalWindow() {
        if (!this.externalWindow) return;
        const targetBody = this.externalWindow.document.body;
        targetBody.innerHTML = `
                <section style='height: 100%; display: flex'>
                    ${this.container.outerHTML}
                </section>`;
    }
    addEvents() {
        super.addEvents();
        // this.section.addEventListener("drop", (event) => {
        //   console.log(event);
        // })
        this.section.querySelector(`#${this.sectionID}-filter-button`)?.addEventListener("click", event => {
            ui.showContextmenu({ event, menuItems: this.contextFilterMenu().elements, sectionCode: this.SECTION_NAME })
        });
        this.section.querySelector(`#${this.sectionID}-sort-button`)?.addEventListener("click", event => {
            ui.showContextmenu({ event, menuItems: this.contextSortMenu().elements, sectionCode: this.SECTION_NAME })
        });
        this.section.querySelector(`#${this.sectionID}-external_window-button`).addEventListener("click", event => {
            ui.target.toggleExternalWindow();
        });
        this.header.querySelector(".toggle-pins")?.addEventListener("click", () => {
            this.uiProps.showPins = !this.uiProps.showPins;
        })
        this.container.addEventListener("click", (event) => {
            if (event.target.closest(".comments-button")) {
                const cheevoID = event.target.closest(".target-achiv")?.dataset.achivId;
                cheevoID && showComments(cheevoID, 2);
            }
            else if (event.target.matches(".edit-cheevo-button")) {
                const cheevoID = event.target.dataset.cheevoId;
                const cheevo = watcher.CHEEVOS[cheevoID];
                cheevo && cheevoPropsPopup().open(cheevo);
            }
            else if (event.target.matches(".pin-cheevo")) {
                const cheevo = event.target.closest(".target-achiv");
                ui.target.toggleCheevoPin(cheevo);
            }
            else if (event.target.matches(".delete-from-target")) {
                const cheevo = event.target.closest(".target-achiv");
                ui.target.deleteFromTarget(cheevo);
            }
        });
        this.pinnedContainer.addEventListener("click", (event) => {
            if (event.target.closest(".comments-button")) {
                const cheevoID = event.target.closest(".target-achiv")?.dataset.achivId;
                cheevoID && showComments(cheevoID, 2);
            }
            else if (event.target.matches(".edit-cheevo-button")) {
                const cheevoID = event.target.dataset.cheevoId;
                const cheevo = watcher.CHEEVOS[cheevoID];
                cheevo && cheevoPropsPopup().open(cheevo);
            }
            else if (event.target.matches(".pin-cheevo")) {
                const cheevo = event.target.closest(".target-achiv");
                ui.target.toggleCheevoPin(cheevo);
            }
            else if (event.target.matches(".delete-from-target")) {
                const cheevo = event.target.closest(".target-achiv");
                ui.target.deleteFromPinned(cheevo);
            }
        });
        const dragElements = (container, onDragEnd, pull) => {
            new Sortable(container, {
                group: {
                    name: "cheevos", pull, put: true, push: "false"
                },
                animation: 100,
                chosenClass: "dragged",
                onAdd: function (evt) {
                    const element = evt.item;
                    const cheevoID = element.dataset.achivId;
                    element.remove();
                    onDragEnd && onDragEnd(cheevoID);
                },
                onUpdate: () => {
                    if (pull) return; //main container doesn't save order
                    const pinnedIDs = [...container.querySelectorAll(".target-achiv")]?.map(elem => +elem.dataset.achivId);
                    ui.target.savePinnedData(pinnedIDs);
                    ui.target.fillPinnedItems(pinnedIDs);
                    ui.target.markPinned();
                },
                onStart: (evt) => {
                },
                onEnd: () => ui.addEvents(),
            });

        }
        dragElements(this.container, (id) => {
            ui.target.pushCheevo(id);
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
                ui.target.savePinnedData(pinnedIDs);
                ui.target.fillPinnedItems(pinnedIDs);
                ui.target.markPinned();
            }
            this.section.querySelector(".achiv-block")?.remove();
            dragToPinned(id);
        }, false)
        this.searchInput?.addEventListener("input", (event) => this.searchInputEvent(event))
    }
    searchInputEvent(event) {
        event.stopPropagation();
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
        this.section.classList.toggle("show-events", this.uiProps.showEvents);
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);
        this.section.classList.toggle("hide-bg", this.uiProps.hideBg);
        this.section.classList.toggle("hide-passed", this.uiProps.hidePassedLevels);
        this.section.classList.toggle("highlight-passed", this.uiProps.highlightPassedLevels);
        this.section.classList.toggle("fixed-size", this.uiProps.isFixedSize);
        this.section.classList.toggle("show-progression-bar", this.uiProps.showCheevoUnlockRateBar);
        this.section.classList.toggle("show-overlay", this.uiProps.showPrevOverlay);
        this.container.style.setProperty("--max-count", this.uiProps.fixedSizeCount);
        this.section.dataset.previewFilter = this.uiProps.lockedPreviewFilter;
        this.section.classList.toggle("contrast-highlight", this.uiProps.contrastHighlight);
        this.section.classList.toggle("show-pins", this.uiProps.showPins);
    }
    setValues() {
        UI.applyPosition({ widget: this });
        this.setElementsValues();
        this.startAutoScroll();
    }
    gameChangeEvent(isNewGame) {
        // if (true || isNewGame) {
        //     this.filters = this.uiProps.filters
        // }
        this.genreFilter = "";
        this.uiProps.autoFillTarget && this.fillItems();
        this.uiProps.autoClearTarget && this.clearEarned();
        this.fillPinnedItems();
        this.markPinned();
    }
    async updateEarnedAchieves({ earnedAchievementIDs }) {
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
        for (let cheevoID of earnedAchievementIDs) {
            const cheevo = watcher.CHEEVOS[cheevoID];
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
    autoscrollInterval;
    startAutoScroll(toBottom = true) {
        this.stopAutoScroll();
        let refreshRateMiliSecs = 50;

        let scrollContainer = this.container;
        let speedInPixels = 1;
        const pauseOnEndMilisecs = 2000;
        // Часовий інтервал для прокручування вниз
        if (this.uiProps.autoscroll) {
            this.autoscrollInterval = setInterval(() => {
                if (scrollContainer.scrollHeight - scrollContainer.clientHeight <= 10) {
                    this.stopAutoScroll();
                }
                if (toBottom) {
                    scrollContainer.scrollTop += speedInPixels;
                    if (
                        scrollContainer.scrollTop + scrollContainer.clientHeight >=
                        scrollContainer.scrollHeight
                    ) {
                        this.stopAutoScroll();
                        setTimeout(() => this.startAutoScroll(false), pauseOnEndMilisecs);
                    }
                } else {
                    scrollContainer.scrollTop -= speedInPixels;
                    if (scrollContainer.scrollTop === 0) {
                        this.stopAutoScroll();
                        setTimeout(() => this.startAutoScroll(true), pauseOnEndMilisecs);
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
        clearInterval(this.autoscrollInterval);
    }
    isAchievementInTargetSection({ ID, targetContainer = this.container }) {
        const targetAchievements = [
            ...targetContainer.querySelectorAll(".target-achiv"),
        ].filter((el) => el.dataset.achivId == ID);

        return targetAchievements.length > 0;
    }
    getCheevoElement(cheevoID) {
        const achievement = watcher.CHEEVOS[cheevoID];
        const targetElement = document.createElement("li");

        const setClassesToElement = () => {
            targetElement.classList.add("target-achiv", "main-column-item", "right-bg-icon");
            targetElement.classList.add("border");
            targetElement.classList.add("overlay");
            targetElement.classList.add("show-difficult");//this.uiProps.showDifficult
            targetElement.classList.toggle("show-level", this.uiProps.showLevel);
            targetElement.classList.toggle("show-genre", this.uiProps.showGenre);
            targetElement.classList.toggle("earned", achievement.isEarned);
            targetElement.classList.toggle("hardcore", achievement.isEarnedHardcore);
            targetElement.classList.toggle("rare", achievement.difficulty > 7);
        }
        const setDataToElement = () => {
            targetElement.dataset.Type = achievement.Type;
            targetElement.dataset.Points = achievement.Points;
            targetElement.dataset.TrueRatio = achievement.TrueRatio;
            targetElement.dataset.difficulty = achievement.difficulty;
            targetElement.dataset.DisplayOrder = achievement.DisplayOrder;
            targetElement.dataset.genres = achievement.genres?.join(",");
            targetElement.dataset.group = achievement.group;
            targetElement.dataset.setID = achievement.gameID;
            achievement.DateEarnedHardcore && (targetElement.dataset.DateEarnedHardcore = achievement.DateEarnedHardcore);
            achievement.DateEarned && (targetElement.dataset.DateEarned = achievement.DateEarned);

            targetElement.dataset.NumAwardedHardcore = achievement.NumAwardedHardcore;
            targetElement.dataset.achivId = cheevoID;
            achievement.level && (targetElement.dataset.level = achievement.level);

            targetElement.style.setProperty("--progression", 100 * achievement.NumAwardedHardcore / achievement.totalPlayers + "%")
            targetElement.dataset.timeToUnlock = achievement.timeToUnlock;
        }
        const setElementHtml = () => {
            const subLevel = achievement.level?.toString()?.split(".")[1];
            const level = achievement.zone ? subLevel ? `${achievement.zone} [${subLevel}]` : achievement.zone : achievement.level?.toString()?.replace(".", "-");
            targetElement.innerHTML = `
            <div class="target__cheevo-bg"></div>
            <div class="target__buttons-container">
                ${buttonsHtml.editCheevoProps(achievement.ID)}
                ${buttonsHtml.comments()}
                ${buttonsHtml.pin()}
            </div>
            <div class="prev">
                <div class="prev-bg"></div>
                <img
                    class="prev-img"
                    src="${achievement.prevSrc}"
                    alt="${achievement.Title}"
                />
                <div class="prev-lock-overlay"></div>
                <div class="box-inner-shadow"></div>
                <div class="target__cheevo-progression-container">
                    <div class="target__cheevo-progression">
                </div>
            </div>
            </div>
            <div class="target__cheevo-details">
                <h3 class="target__cheevo-header">
                    ${level ? badgeElements.cheevoLevel(level, true) : ""}
                    ${achievement.genres.length > 0 ? achievement.genres?.map(genre => badgeElements.buttonGenreBadge(genre, `ui.target.filterByGenre('${genre}')`)).join("") : ""
                }<a target="_blanc" data-title="${ui.lang.goToRAHint}" href="${cheevoUrl(achievement)}">
                        ${achievement.Title} ${achievement.genres?.map(genre => genreIcons[genre]).join("")}
                    </a>
                </h3>
                <p class="list-item__text">${achievement.Description}</p>
                <div class="icons-row-list">
                    ${icons.cheevoType(achievement.Type)}
                    ${signedIcons.points(achievement.Points)}
                    ${signedIcons.retropoints(achievement.TrueRatio)}
                    ${signedIcons.time(secondsToBadgeString(achievement.timeToUnlock))}
                    ${signedIcons.rarity(achievement.rateEarnedHardcore)}
                    ${signedIcons.retroRatio(achievement.retroRatio)}
                    ${badgeElements.difficultBadge(achievement.difficulty)}
                </div>
            </div>
            `;
        }

        setClassesToElement();
        setDataToElement();
        setElementHtml();
        return targetElement;
    }
    pushCheevo(cheevoID) {

        // if achiv already exist in target - return
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
        // if adding earned element
        this.delayedRemove();

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
    delayedRemove() {
        if (this.uiProps.autoClearTarget) {
            this.container.querySelectorAll(".earned").forEach((element) => {
                setTimeout(() => element.remove(), this.uiProps.autoClearTargetTime * 1000);
            });
        }
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
        const cheevoID = +cheevoElement.dataset?.achivId ?? -1;
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
        const addHeaderBadges = (genres = []) => {
            const badgesContainer = document.createElement("div");
            badgesContainer.classList.add("target__badges-container")
            const badgesHtml = genres
                .map(genre =>
                    badgeElements.selection(genre, `ui.target.filterByGenre('${genre}')`))
                .join("");
            badgesContainer.innerHTML = badgesHtml;
            this.section.insertBefore(badgesContainer, this.container);

        }

        this.isDynamicAdding = true;
        this.clearAllAchivements();
        Object.keys(watcher.CHEEVOS).forEach(id => {
            this.pushCheevo(id)
        });
        // addHeaderBadges(watcher.GAME_DATA.cheevoGenres);
        this.applyFilter();
        this.applySort();
        this.setMGameSelection();
        this.setSubsetSelection();
        this.isDynamicAdding = false;

        // config.aotw && this.container.querySelector(`.target-achiv[data-achiv-id='${config.aotw?.ID}']`)?.classList.add("target__aotw");

    }

    async showAotwEvent() {
        const cheevo = await apiWorker.aotw();

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
            aotwDetails);
        this.section.querySelector(".target__aotw-container")?.remove();
        this.header.after(aotwElement);
    }
    async hideAotw() {
        this.section.querySelector(`.target__aotw-container`)?.remove();
        const aotw = await apiWorker.aotw();
        apiWorker.cache.push({
            dataType: CACHE_TYPES.AOTW,
            data: {
                ...aotw,
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