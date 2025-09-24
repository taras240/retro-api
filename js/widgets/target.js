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
                        id: "context_hide-target-bg",
                        checked: !this.uiProps.hideBg,
                        event: `onchange="ui.target.uiProps.hideBg = !this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context_fixed-count-switcher",
                        label: ui.lang.fixedSize,
                        checked: this.uiProps.isFixedSize,
                        event: `onchange="ui.target.uiProps.isFixedSize = this.checked;"`,
                    },
                    {
                        prefix: ui.lang.cheevosCount,
                        postfix: "",
                        type: inputTypes.NUM_INPUT,
                        id: "context-fixed-count",
                        label: ui.lang.cheevosCount,
                        value: this.uiProps.fixedSizeCount,
                        event: `onchange="ui.target.uiProps.fixedSizeCount = this.value;"`,
                        onChange: `ui.target.uiProps.fixedSizeCount = this.value;`,
                    },


                    {
                        type: inputTypes.CHECKBOX,
                        id: "context_autoscroll-target",
                        label: ui.lang.autoscroll,
                        checked: this.uiProps.autoscroll,
                        event: `onchange="ui.target.uiProps.autoscroll = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context_contrast-highlight-target",
                        label: ui.lang.contrastHighlight,
                        checked: this.uiProps.contrastHighlight,
                        event: `onchange="ui.target.uiProps.contrastHighlight = this.checked;"`,
                    },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     name: "context-hide-unearned",
                    //     id: "context-hide-unearned",
                    //     label: ui.lang.showOverlay,
                    //     checked: this.SHOW_PREV_OVERLAY,
                    //     event: `onchange="ui.target.SHOW_PREV_OVERLAY = this.checked"`,
                    // },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     name: "context-show-border",
                    //     id: "context-show-border",
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
                        id: "context-show-overlay",
                        label: ui.lang.showOverlay,
                        checked: this.uiProps.showPrevOverlay,
                        event: `onchange="ui.target.uiProps.showPrevOverlay = this.checked"`,
                    },
                    ...Object.values(imageFilters).map(filterName => ({
                        type: inputTypes.RADIO,
                        name: `${this.sectionID}-context-preview-filter`,
                        id: `${this.sectionID}-context-preview-filter-${filterName}`,
                        label: filterName,
                        checked: this.uiProps.lockedPreviewFilter === filterName,
                        event: `onchange="ui.target.uiProps.lockedPreviewFilter = '${filterName}';"`
                    }))]
            },
            {
                label: ui.lang.elements,
                elements: [
                    {
                        label: ui.lang.showHeader,
                        type: inputTypes.CHECKBOX,
                        id: "context_hide-target-header",
                        checked: this.uiProps.showHeader,
                        event: `onchange="ui.target.uiProps.showHeader = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-genre-badge",
                        label: ui.lang.showGenreBadges,
                        checked: this.uiProps.showGenre,
                        event: `onchange="ui.target.uiProps.showGenre = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-level",
                        label: ui.lang.showLevel,
                        checked: this.uiProps.showLevel,
                        event: `onchange="ui.target.uiProps.showLevel = this.checked"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-show-events-checkbox",
                        label: ui.lang.showEvents,
                        checked: this.uiProps.showEvents,
                        event: `onchange="ui.target.uiProps.showEvents = this.checked"`,
                    },
                    // {
                    //     type: inputTypes.CHECKBOX,
                    //     id: "context-show-difficult",
                    //     label: ui.lang.showDifficult,
                    //     checked: this.uiProps.showDifficult,
                    //     event: `onchange="ui.target.uiProps.showDifficult = this.checked"`,
                    // },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context_progression-bar",
                        label: ui.lang.showCheevoUnlockRateBar,
                        checked: this.uiProps.showCheevoUnlockRateBar,
                        event: `onchange="ui.target.uiProps.showCheevoUnlockRateBar = this.checked;"`,
                    },
                ]
            },
            this.contextSortMenu(),
            this.contextFilterMenu(),
            {
                label: ui.lang.level_test,
                elements: [
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-hide-passed-levels",
                        label: ui.lang.hidePassedLevels,
                        checked: this.uiProps.hidePassedLevels,
                        event: `onchange="ui.target.uiProps.hidePassedLevels = this.checked;"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-highlight-passed",
                        label: ui.lang.highLightPassedLevels,
                        checked: this.uiProps.highlightPassedLevels,
                        event: `onchange="ui.target.uiProps.highlightPassedLevels = this.checked;"`,
                    },

                ],
            },
            {
                label: ui.lang.data,
                elements: [
                    {
                        type: inputTypes.BUTTON,
                        id: "context-fill",
                        label: ui.lang.fillAll,
                        event: `onclick="ui.target.fillItems()"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-autofill",
                        label: ui.lang.autofill,
                        checked: this.uiProps.autoFillTarget,
                        event: `onchange="ui.target.uiProps.autoFillTarget = this.checked;"`,
                    },
                    {
                        type: inputTypes.BUTTON,
                        id: "context-clear-all",
                        label: ui.lang.clearAll,
                        event: `onclick="ui.target.clearAllAchivements();"`,
                    },
                    {
                        type: inputTypes.CHECKBOX,
                        id: "context-autoclear",
                        label: ui.lang.autoclearEarned,
                        checked: this.uiProps.autoClearTarget,
                        event: `onchange="ui.target.uiProps.autoClearTarget = this.checked;"`,
                    },
                    {
                        prefix: ui.lang.clearDelay,
                        postfix: "sec",
                        type: inputTypes.NUM_INPUT,
                        id: "context-autoclear-delay",
                        label: ui.lang.clearDelay,
                        value: this.uiProps.autoClearTargetTime,
                        event: `onchange="ui.target.uiProps.autoClearTargetTime = this.value;"`,
                        onChange: "ui.target.uiProps.autoClearTargetTime = this.value;"
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
                name: `${this.sectionID}-context-sort`,
                id: `${this.sectionID}-context-sort-${sortName}`,
                label: ui.lang[sortName],
                checked: this.uiProps.sortName === sortName,
                event: `onchange="ui.target.uiProps.sortName = '${sortName}';"`
            })),
            {
                type: inputTypes.CHECKBOX,
                id: "context-reverse-sort",
                label: ui.lang.reverse,
                checked: this.uiProps.reverseSort == -1,
                event: `onchange="ui.target.uiProps.reverseSort = this.checked"`,
            },
            {
                type: inputTypes.CHECKBOX,
                id: "context-strict-sort",
                label: ui.lang.strictMode,
                checked: this.uiProps.strictSort,
                event: `onchange="ui.target.uiProps.strictSort = this.checked"`,
            },
        ],
    })
    contextFilterMenu = () => ({
        label: ui.lang.filter,
        elements: [
            ...Object.values(cheevosFiterNames).map(filterName => ({
                type: inputTypes.STATEBOX,
                name: `${this.sectionID}-context-filter`,
                id: `${this.sectionID}-context-filter-${filterName}`,
                label: ui.lang[filterName],
                value: filterName,
                state: `${this.uiProps.filters[filterName]?.state ?? 0}`,
                event: `ui.target.uiProps.filters = ({ state, filterName })`,
            })),
            {
                type: inputTypes.CHECKBOX,
                id: "context-hide-filtered",
                label: ui.lang.hideFiltered,
                checked: this.uiProps.hideFiltered,
                event: `onchange="ui.target.uiProps.hideFiltered = this.checked;"`,
            },

        ],
    })


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

    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();
        this.setValues();
        this.showAotwEvent({ cheevo: config.aotw })
    }
    initializeElements() {
        this.section = document.querySelector("#target_section");
        this.sectionID = this.section.id;
        this.header = document.querySelector(".target-header_container");
        this.container = document.querySelector(".target-container");

        this.searchInput = this.section.querySelector("#target__searchbar");

        // this.moveToTopCheckbox = document.querySelector("#target-move-to-top");
    }
    generateWidget() {
        const widgetID = "target_section";
        const headerElementsHtml = `
            ${buttonsHtml.filter(widgetID)}
            ${buttonsHtml.sort(widgetID)}
            ${buttonsHtml.tweek()}
            <input type="search" name="" id="target__searchbar" class="text-input target__search-bar" placeholder="${ui.lang.search}">
            ${buttonsHtml.external(widgetID)}
        `;

        const widgetData = {
            classes: ["target_section", "section", "compact-header"],
            id: widgetID,
            title: ui.lang.targetSectionName,
            headerElementsHtml: headerElementsHtml,
            contentClasses: ["target-container", "content-container", "flex-main-list"],
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
            else if (event.target.matches(".delete-from-target")) {
                const cheevo = event.target.closest(".target-achiv");
                ui.target.deleteFromTarget(cheevo);
            }
        });
        const dragElements = (container, onDragEnd) => {
            new Sortable(container, {
                group: {
                    name: "cheevos", pull: false
                },
                animation: 100,
                chosenClass: "dragged",
                onAdd: function (evt) {
                    const itemEl = evt.item;
                    const id = itemEl.dataset.achivId;
                    onDragEnd && onDragEnd(id);
                },
                onEnd: () => ui.addEvents(),
            });
        }
        dragElements(this.container, (id) => {
            ui.target.pushCheevo(id);
            this.section.querySelector(".achiv-block")?.remove();
        })
        this.searchInput?.addEventListener("input", this.searchInputEvent)
    }
    searchInputEvent(event) {
        event.stopPropagation();
        const clearPrevQuery = () => {
            [...ui.target.container.querySelectorAll('.target-achiv')].forEach(target => {
                const id = target.dataset.achivId;
                const description = target.querySelector(".achiv-description");
                const header = target.querySelector('.target__cheevo-header a');
                description && (description.innerText = watcher.CHEEVOS[id]?.Description);
                header && (header.innerText = watcher.CHEEVOS[id]?.Title);
            })
        }
        const markQuery = (query) => {
            const regex = new RegExp(`(${query})`, 'gi');
            [...ui.target.container.querySelectorAll('.target-achiv')].reverse().forEach(cheevo => {
                const description = cheevo.querySelector('.achiv-description');
                const title = cheevo.querySelector('.target__cheevo-header a');
                if (title.innerText.match(regex)) {
                    ui.target.moveToTop(description.closest('.target-achiv'));
                    title.innerHTML = title.innerHTML.replace(regex, (g1) => `<span class="badge highlight-badge">${g1}</span>`)

                }
                if (description.innerText.match(regex)) {
                    ui.target.moveToTop(description.closest('.target-achiv'));
                    description.innerHTML = description.innerHTML.replace(regex, (g1) => `<span class="badge highlight-badge">${g1}</span>`)
                }
            })
        }
        clearPrevQuery();
        ui.target.applySort();
        const query = event.target.value;
        if (query && (query.length > 2 || /\d+/.test(query))) {
            markQuery(query);
            const firstHighlight = document.querySelector('.badge.highlight-badge');
            if (firstHighlight) {
                firstHighlight.scrollIntoView({ behavior: ui.isCEF ? "auto" : "smooth", block: "center", });
            }
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
        this.uiProps.autoClearTarget && this.clearEarned();
        this.uiProps.autoFillTarget && this.fillItems();
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
                cheevoElement.classList.toggle("hardcore", cheevo?.isHardcoreEarned);
                cheevo.isHardcoreEarned && (cheevoElement.dataset.DateEarnedHardcore = cheevo.DateEarnedHardcore);
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
    pushCheevo(cheevoID) {
        // if achiv already exist in target - return
        if (this.isAchievementInTargetSection({ ID: cheevoID })) {
            return;
        }
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
            targetElement.classList.toggle("hardcore", achievement.isHardcoreEarned);
            targetElement.classList.toggle("rare", achievement.difficulty > 7);
        }
        const setDataToElement = () => {
            targetElement.dataset.Type = achievement.Type;
            targetElement.dataset.Points = achievement.Points;
            targetElement.dataset.TrueRatio = achievement.TrueRatio;
            targetElement.dataset.difficulty = achievement.difficulty;
            targetElement.dataset.DisplayOrder = achievement.DisplayOrder;
            targetElement.dataset.genres = achievement.genres?.join(",");
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
                ${buttonsHtml.removeFromTarget()}
            </div>
            <div class="prev">
                <div class="prev-bg"></div>
                <img
                    class="prev-img"
                    src="${achievement.prevSrc}"
                    alt="${achievement.Title}"
                />
                <div class="prev-lock-overlay"></div>
                <div class="target__cheevo-progression-container">
                    <div class="target__cheevo-progression">
                </div>
            </div>
            </div>
            <div class="target__cheevo-details">
                <h3 class="target__cheevo-header">
                    ${level ? badgeElements.cheevoLevel(level, true) : ""}
                    ${achievement.genres.length > 0 ? achievement.genres?.map(genre => badgeElements.buttonGenreBadge(genre, `ui.target.filterByGenre('${genre}')`)).join("") : ""
                }<a target="_blanc" data-title="${ui.lang.goToRAHint}" href="${cheevoUrl(cheevoID)}">
                        ${achievement.Title} ${achievement.genres?.map(genre => genreIcons[genre]).join("")}
                    </a>
                </h3>
                <p class="achiv-description">${achievement.Description}</p>
                <div class="target-other-descriptions icons-row-list">
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
        this.container.appendChild(targetElement);
        // for one element adding only
        if (!this.isDynamicAdding) {
            this.applyFilter();
            this.applySort();
        }
        // if adding earned element
        this.delayedRemove();
    }
    refreshCheevo(id) {
        this.container.querySelector(`.target-achiv[data-achiv-id="${id}"]`)?.remove();
        this.pushCheevo(id);
    }
    moveToTop(element) {
        if (this.uiProps.reverseSort == 1) {
            this.container.prepend(element);
        } else {
            this.container.append(element);
        }
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
        this.isDynamicAdding = false;

        config.aotw && this.container.querySelector(`.target-achiv[data-achiv-id='${config.aotw?.ID}']`)?.classList.add("target__aotw");

    }

    async showAotwEvent({ cheevo }) {
        if (!cheevo) {
            const aotwObj = await apiWorker.getAotW();
            config.aotw = aotwObj;
            cheevo = config.aotw;
        }
        if (!cheevo || cheevo.wasShown) return;
        const rarity = 100 * cheevo.UnlocksHardcoreCount / cheevo.TotalPlayers;
        this.section.querySelector(`.target__aotw-container`)?.remove();
        this.container.querySelector(`.target-achiv[data-achiv-id='${cheevo.ID}']`)?.classList.add("target__aotw")
        const aotwElement = document.createElement("div");
        aotwElement.classList.add("target__aotw-container", "target__aotw", "show-difficult", "show-level");
        aotwElement.innerHTML = `
        <button class="description-icon close-icon target__hide-aotw" 
          onclick=></button>
        <div class="prev">
          <img class="prev-img" src="${gameImageUrl(cheevo.BadgeURL)}" alt=" ">
        </div>
        <div class="target__cheevo-details">
          <h3 class="target__cheevo-header">
            <a target="_blanc" href="${cheevoUrl(cheevo.ID)}">
              ${cheevo.Title}
            </a>
            in
            <a target="_blanc" href="${gameUrl(cheevo.GameID)}">
              ${cheevo.GameTitle}
            </a>
          </h3>
          <div class="achiv-description">
          ${badgeElements.black("AotW Event")}
            ${cheevo.Description}
          </div>
          <div class="target-other-descriptions  icons-row-list">
            ${icons.cheevoType(cheevo?.Type)}
            ${signedIcons.points(cheevo.Points)}
            ${signedIcons.retropoints(cheevo.TrueRatio)}
            ${signedIcons.rarity(rarity.toFixed(2) + "%")}
            ${signedIcons.retroRatio((cheevo.TrueRatio / Math.max(1, cheevo.Points)).toFixed(2))}
          </div>
        </div>
      `;
        this.section.querySelector(".target__aotw-container")?.remove();
        this.section.insertBefore(aotwElement, this.container);
    }
    hideAotw() {
        this.section.querySelector(`.target__aotw-container`)?.remove();
        config.aotw = { ...config?.aotw, wasShown: true };
    }

}