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
import { difficultyNames } from "../enums/difficulty.js";
import { hltbHeaders } from "../enums/hltb.js";
import { gameImageUrl, gameUrl } from "../functions/raLinks.js";
import { inputTypes } from "../components/inputElements.js";
import { buttonsHtml } from "../components/htmlElements.js";

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
        previewType: this.previewTypes.boxart
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
                        event: `onchange="ui.gameCard.uiProps.previewType = '${this.previewTypes[previewKey]}';"`
                    })),
                ]
            },
            {
                label: ui.lang.showHeader,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-header",
                event: `onchange="ui.gameCard.uiProps.showHeader = this.checked"`,
                checked: this.uiProps.showHeader,
            },
            {
                label: ui.lang.showTitleBadges,
                type: inputTypes.CHECKBOX,
                id: "game-card_show-badges",
                event: `onchange="ui.gameCard.uiProps.showBadges = this.checked"`,
                checked: this.uiProps.showBadges,
            },

            // {
            //     label: ui.lang.platform,
            //     type: "checkbox",
            //     name: "context_show-platform",
            //     id: "context_show-platform",
            //     event: `onchange="ui.gameCard.SHOW_PLATFORM = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_PLATFORM,
            // },
            // {
            //     label: ui.lang.developer,
            //     type: "checkbox",
            //     name: "context_show-developer",
            //     id: "context_show-developer",
            //     event: `onchange="ui.gameCard.SHOW_DEVELOPER = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_DEVELOPER
            // },
            // {
            //     label: ui.lang.publisher,
            //     type: "checkbox",
            //     name: "context_show-publisher",
            //     id: "context_show-publisher",
            //     event: `onchange="ui.gameCard.SHOW_PUBLISHER = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_PUBLISHER,
            // },
            // {
            //     label: ui.lang.genre,
            //     type: "checkbox",
            //     name: "context_show-genre",
            //     id: "context_show-genre",
            //     event: `onchange="ui.gameCard.SHOW_GENRE = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_GENRE,
            // },
            // {
            //     label: ui.lang.released,
            //     type: "checkbox",
            //     name: "context_show-released",
            //     id: "context_show-released",
            //     event: `onchange="ui.gameCard.SHOW_RELEASED = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_RELEASED,
            // },
            // {
            //     label: ui.lang.points,
            //     type: "checkbox",
            //     name: "context_show-points",
            //     id: "context_show-points",
            //     event: `onchange="ui.gameCard.SHOW_POINTS = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_POINTS,
            // },
            // {
            //     label: ui.lang.players,
            //     type: "checkbox",
            //     name: "context_show-players",
            //     id: "context_show-players",
            //     event: `onchange="ui.gameCard.SHOW_PLAYERS = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_PLAYERS,
            // },
            // {
            //     label: ui.lang.completion,
            //     type: "checkbox",
            //     name: "context_show-completion",
            //     id: "context_show-completion",
            //     event: `onchange="ui.gameCard.SHOW_COMPLETION = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_COMPLETION,
            // },
            // {
            //     label: ui.lang.cheevos,
            //     type: "checkbox",
            //     name: "context_show-achievements",
            //     id: "context_show-achievements",
            //     event: `onchange="ui.gameCard.SHOW_CHEEVOS = this.parentNode.querySelector('input').checked"`,
            //     checked: this.SHOW_CHEEVOS,
            // },
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
    }
    setElementsValues() {
        const boxArtHasLeftMargin = (ConsoleID) => [4, 5, 6, 18, 78].includes(ConsoleID);
        const { award, progressionAward, ConsoleID } = watcher.GAME_DATA;
        this.badgesContainer.classList.toggle("hidden", !this.uiProps.showBadges);
        this.section.dataset.award = award;
        this.section.dataset.progressionAward = progressionAward;
        this.section.classList.toggle("left-margin-preview", boxArtHasLeftMargin(ConsoleID));
        this.section.classList.toggle("compact-header", !this.uiProps.showHeader);

        switch (this.uiProps.previewType) {
            case this.previewTypes.ingame:
                this.preview.src = gameImageUrl(watcher?.GAME_DATA?.ImageIngame);
                break;
            case this.previewTypes.titleScreen:
                this.preview.src = gameImageUrl(watcher?.GAME_DATA?.ImageTitle);
                break;
            default:
                this.preview.src = gameImageUrl(watcher?.GAME_DATA?.ImageBoxArt);
                break;
        }
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

    async gameChangeEvent(isNewGame) {
        const {
            FixedTitle,
            ID,
            ImageBoxArt,
            Genre,
            TotalRetropoints,
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
            this.header.innerHTML = `${FixedTitle.replaceAll(/\,\s*the$/gi, "")}`;
            this.header.href = gameUrl(ID);
            this.preview.alt = `${FixedTitle} boxart`;
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
                difficultyNames[gameDifficulty],
                hltb,

            ]
            this.badgesContainer.innerHTML = generateBadges(badgesArray, "selection")
            // `
            //     ${badgeElements.selection(ConsoleName)}
            //     ${badges ? generateBadges(badges, "selection") : ""} 
            //     ${Genre ? generateBadges(Genre.split(","), "selection") : ""} 
            //     ${infoBadges.map(prop => badgeElements.selection(prop)).join(" ")}
            //     ${gameDifficulty ? badgeElements.selection(difficultyNames[gameDifficulty]) : ""}
            //     ${masteryDifficulty !== gameDifficulty ?
            //         badgeElements.selection("mastery " + difficultyNames[masteryDifficulty]) : ""}
            //     ${badgeElements.selection(`HLTB: 
            //         ${timeToBeat ?
            //                 secondsToBadgeString(timeToBeat) + " | " : ""} 
            //         ${timeToMaster ?
            //                 secondsToBadgeString(timeToMaster) : "-"}`)}`;

        }
        const generateIcons = () => {
            this.iconsContainer.innerHTML = `
                ${badgeElements.black(signedIcons.cheevos(NumAchievements))}
                ${badgeElements.black(signedIcons.points(totalPoints))}
                ${badgeElements.black(signedIcons.retropoints(TotalRetropoints))}
                ${badgeElements.black(signedIcons.retroRatio(retroRatio))}
            `;
        }
        fillInfoValues();
        generateIcons();
    }
}
