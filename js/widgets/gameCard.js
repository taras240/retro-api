import { UI } from "../ui.js";
import { config, ui, watcher } from "../script.js";
import { Widget } from "./widget.js";
import { generateBadges, badgeElements } from "../components/badges.js";
import { signedIcons } from "../components/icons.js"

import { showComments } from "../components/comments.js";
import { generateContextMenu } from "../components/contextMenu.js";
import { moveEvent } from "../functions/movingWidget.js";
import { resizeEvent } from "../functions/resizingWidget.js";
import { formatDate, formatDateTime, secondsToBadgeString } from "../functions/time.js";
import { gamePropsPopup } from "../components/gamePropsPopup.js";
import { DIFFICULTY_NAMES } from "../enums/difficulty.js";
import { gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { inputTypes } from "../components/inputElements.js";
import { buttonsHtml } from "../components/htmlElements.js";
import { completionMsg } from "../components/statusWidget/progressBar.js";
import { progressTypes } from "../enums/progressBar.js";
import { getCheevosCount, getPointsCount, getRetropointsCount } from "../functions/gameProperties.js";
const PREVIEW_SIZE = {
    cover: "cover",
    contain: "contain"
}
export class GameCard extends Widget {
    widgetIcon = {
        description: "game info widget",
        iconID: `side-panel__gamecard`,
        onChangeEvent: `ui.gameCard.VISIBLE = this.checked`,
        iconClass: "game-info-icon",
    };
    previewTypes = {
        boxart: "0",
        ingame: "1",
        titleScreen: "2",
    }
    uiDefaultValues = {
        showHeader: false,
        showBadges: true,
        previewType: this.previewTypes.boxart,
        showTitle: true,
        showIcons: true,
        showCheevosProgress: false,
        showRetropointsProgress: false,
        showPointsProgress: false,
        previewSize: PREVIEW_SIZE.contain,
        //properties below are disabled :(
        // showCompletion: true,
        // showDeveloper: true,
        // showGenre: true,
        // showPlayers: true,
        // showPoints: true,
        // showPublisher: true,
        // showReleased: true,
        // showAchievements: true,
        // showPlatform: true,
    }
    uiSetCallbacks = {
    };
    uiValuePreprocessors = {
    };

    get contextMenuItems() {
        return [
            {
                label: ui.lang.previewType,
                elements: [
                    ...Object.keys(this.previewTypes).map(previewKey => ({
                        type: inputTypes.RADIO,
                        name: `game-card_preview-type`,
                        id: `game-card_preview-${previewKey}`,
                        label: ui.lang[previewKey],
                        checked: this.uiProps.previewType === this.previewTypes[previewKey],
                        onChange: () => this.uiProps.previewType = this.previewTypes[previewKey],
                    })),
                ]
            },
            {
                label: ui.lang.previewSize,
                elements: [
                    ...Object.keys(PREVIEW_SIZE).map(previewKey => ({
                        type: inputTypes.RADIO,
                        name: `game-card_preview-size`,
                        id: `game-card_preview-size-${previewKey}`,
                        label: previewKey,
                        checked: this.uiProps.previewSize === PREVIEW_SIZE[previewKey],
                        onChange: () => this.uiProps.previewSize = PREVIEW_SIZE[previewKey],
                    })),
                ]
            },
            {
                label: ui.lang.showHeader,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-header",
                checked: this.uiProps.showHeader,
                onChange: (event) => this.uiProps.showHeader = event.currentTarget.checked,
            },
            {
                label: ui.lang.showTitle,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-title",
                checked: this.uiProps.showTitle,
                onChange: (event) => this.uiProps.showTitle = event.currentTarget.checked,
            },
            {
                label: ui.lang.showIcons,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-icons",
                event: `onchange="ui.gameCard.uiProps.showIcons = this.checked"`,
                checked: this.uiProps.showIcons,
            },
            {
                label: ui.lang.showTitleBadges,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-badges",
                checked: this.uiProps.showBadges,
                onChange: (event) => this.uiProps.showBadges = event.currentTarget.checked,
            },
            {
                label: ui.lang.showCheevosProgress,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-count-pr",
                checked: this.uiProps.showCheevosProgress,
                onChange: (event) => this.uiProps.showCheevosProgress = event.currentTarget.checked,
            },
            {
                label: ui.lang.showPointsProgress,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-points-pr",
                checked: this.uiProps.showPointsProgress,
                onChange: (event) => this.uiProps.showPointsProgress = event.currentTarget.checked,
            },
            {
                label: ui.lang.showRetropointsProgress,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-rp-pr",
                checked: this.uiProps.showRetropointsProgress,
                onChange: (event) => this.uiProps.showRetropointsProgress = event.currentTarget.checked,
            },
        ]
    }

    constructor() {
        super();
        this.generateWidget();
        this.addWidgetIcon();
        this.initializeElements();
        this.addEvents();

        UI.applyPosition({ widget: this });
    }
    generateWidget() {
        const innerContentHtml = `
            <div class="game-card_image-container">
                <div class="game-card__icons-container"></div>
                <img id="game-card-image" class="game-card_image" src="" onerror="this.src='./assets/img/missable.svg';" alt=" " />
            </div>
            <div class="hor-line-decorate"></div>
            <div class="game-card__description">
                <h2 class="game-card__title-container">
                    <span class="game-card__progression-award"></span>
                    <span class="game-card__award"></span>
                    <a id="game-card-header" href="#" target="_blank"> </a>
                </h2>
                <div class="game-card__info game-card__genres-container"></div>
                <div class="game-card__info game-card__progress-container game-card__progress-count"></div>
                <div class="game-card__info game-card__progress-container game-card__progress-points"></div>
                <div class="game-card__info game-card__progress-container game-card__progress-retropoints"></div>
            </div>
        `
        const headerElementsHtml = `
            ${buttonsHtml.comments()}
            ${buttonsHtml.editGameProps()}
            ${buttonsHtml.tweek()}
        `;

        const widgetData = {
            classes: ["game-card_section", "section"],
            id: "game_section",
            title: ui.lang.gameCard,
            headerElementsHtml: headerElementsHtml,
            contentClasses: ["game-card_container", "content-container"],
        };

        const widget = this.generateWidgetElement(widgetData);
        widget.querySelector(".content-container").innerHTML = innerContentHtml;

        ui.app.appendChild(widget);

    }
    initializeElements() {
        this.section = document.querySelector(".game-card_section");
        this.sectionID = this.section.id;
        this.header = document.querySelector("#game-card-header");
        this.descriptions = document.querySelector(".game-card__description");
        this.preview = document.querySelector("#game-card-image");
        this.iconsContainer = this.section.querySelector(".game-card__icons-container");
        this.badgesContainer = this.section.querySelector(".game-card__genres-container");
        this.progressCountContainer = this.section.querySelector(".game-card__progress-count");
        this.progressPointsContainer = this.section.querySelector(".game-card__progress-points");
        this.progressRetropointsContainer = this.section.querySelector(".game-card__progress-retropoints");

    }
    setElementsValues() {
        const boxArtHasLeftMargin = (ConsoleID) => [4, 5, 6, 18, 78].includes(ConsoleID);
        const { award, progressionAward, ConsoleID } = watcher.GAME_DATA;
        this.badgesContainer.classList.toggle("hidden", !this.uiProps.showBadges);
        this.section.dataset.award = award;
        this.section.dataset.progressionAward = progressionAward;
        // this.section.classList.toggle("left-margin-preview", boxArtHasLeftMargin(ConsoleID));
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);
        this.section.classList.toggle("progress-count-hidden", !this.uiProps.showCheevosProgress);
        this.section.classList.toggle("progress-points-hidden", !this.uiProps.showPointsProgress);
        this.section.classList.toggle("progress-rp-hidden", !this.uiProps.showRetropointsProgress);
        this.section.classList.toggle("title-hidden", !this.uiProps.showTitle);
        this.iconsContainer?.classList.toggle("hidden", !this.uiProps.showIcons);
        let previewSrc;
        switch (this.uiProps.previewType) {
            case this.previewTypes.ingame:
                previewSrc = gameImageUrl(watcher?.GAME_DATA?.ImageIngame);
                break;
            case this.previewTypes.titleScreen:
                previewSrc = gameImageUrl(watcher?.GAME_DATA?.ImageTitle);
                break;
            default:
                previewSrc = gameImageUrl(watcher?.GAME_DATA?.ImageBoxArt);
                break;
        }
        this.preview.src = previewSrc;
        this.preview.dataset.size = this.uiProps.previewSize;
        this.section.querySelector(".game-card_image-container")?.style.setProperty("--preview-bg", `url(${previewSrc})`);
    }
    addEvents() {
        super.addEvents();
        this.section.querySelector(".comments-button").addEventListener("click", (event) => {
            const gameID = watcher.GAME_DATA?.ID;
            gameID && showComments(gameID, 1);
        })
        this.section.querySelector(".game-props-button").addEventListener("click", (event) => {
            event.stopPropagation();
            gamePropsPopup().open(watcher.GAME_DATA);
        });
        this.section.addEventListener("mousedown", event => {
            if (event.button !== 0 || event.target.closest(".resizer, button") || this.section.classList.contains("resized")) return;
            moveEvent(this.section, event);
        })
    }
    updateProgress({ earnedAchievementIDs }) {
        this.updateProgressData();
    }
    updateProgressData() {
        const gameData = watcher.GAME_DATA;
        const isHardMode = watcher.IS_HARD_MODE;

        this.progressCountContainer.innerHTML = completionMsg(gameData, progressTypes.cheevos, isHardMode);
        this.progressPointsContainer.innerHTML = completionMsg(gameData, progressTypes.points, isHardMode);
        this.progressRetropointsContainer.innerHTML = completionMsg(gameData, progressTypes.retropoints, isHardMode);
    }
    async gameChangeEvent(isNewGame) {
        const {
            Title,
            ID,
            ImageBoxArt,
            Genre,
            totalRetropoints,
            NumAchievements,
            totalPoints,
            badges,
            retroRatio,
            ConsoleName,
            ConsoleID,
            Developer,
            Publisher,
            Released,
            gameDifficulty,
            masteryDifficulty,
            timeToBeat,
            timeToMaster
        } = watcher.GAME_DATA;
        const gameData = watcher.GAME_DATA;
        const fillInfoValues = async () => {
            const generateInfoBadges = () => {
                const infoBadges = [];
                Developer && infoBadges.push(`dev: ${Developer}`);
                Publisher && infoBadges.push(`Pub: ${Publisher}`);
                Released && infoBadges.push(`${formatDate(Released)}`);
                return infoBadges;
            }
            const infoBadges = generateInfoBadges();
            this.setElementsValues();
            this.header.innerHTML = `${Title.replaceAll(/\,\s*the$/gi, "")}`;
            this.header.href = gameUrl(ID);
            this.preview.alt = `${Title} boxart`;
            const hltb = `HLTB: 
                    ${timeToBeat ?
                    secondsToBadgeString(timeToBeat) + " | " : ""} 
                    ${timeToMaster ?
                    secondsToBadgeString(timeToMaster) : "-"}`;

            const badgesArray = [
                ConsoleName,
                ...badges,
                ...(Genre ? Genre.split(",") : []),
                ...infoBadges,
                DIFFICULTY_NAMES[gameDifficulty],
                hltb,

            ]
            this.badgesContainer.innerHTML = generateBadges(badgesArray, "selection");
            this.updateProgressData();
        }
        const generateIcons = () => {
            const cheevosCount = getCheevosCount(gameData);
            const pointsCount = getPointsCount(gameData);
            const retropointsCount = getRetropointsCount(gameData);
            const retroRatio = (retropointsCount / pointsCount).toFixed(2);
            this.iconsContainer.innerHTML = `
                ${badgeElements.black(signedIcons.cheevos(cheevosCount))}
                ${badgeElements.black(signedIcons.points(pointsCount))}
                ${badgeElements.black(signedIcons.retropoints(retropointsCount))}
                ${badgeElements.black(signedIcons.retroRatio(retroRatio))}
            `;
        }
        fillInfoValues();
        generateIcons();
    }
}
