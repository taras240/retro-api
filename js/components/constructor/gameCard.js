import { fromHtml } from "../../functions/html.js";
import { gameImageUrl } from "../../functions/raLinks.js";
import { formatDuration } from "../../functions/time.js";
import { inputTypes } from "../inputElements.js";
import { generateWidget } from "./widgetContainer.js";


export function gameCard({ props, gameData, parent, variant = "" }) {
    const { unlockedCheevos, unlockedCheevosTotal, totalCheevos, totalPoints, unlockedPointsTotal, unlockedPoints } = parent?.keys;
    const { isSoftcore, gridSize, hideGameData } = props
    const baseClass = "constr-game-card";
    const { ImageIcon, Title, ConsoleName, TimePlayed, Achievements: cheevos } = gameData;
    const unlockRate = Math.floor(unlockedCheevos / totalCheevos * 100);
    const InnerElement = () => fromHtml(`
        <div class="${baseClass}${variant ? ` ${baseClass}--${variant}` : ""}">
        <div class="boxart">
            <img class="game__image game__image_bg" src="${gameImageUrl(gameData.ImageBoxArt)}">
            <img class="game__image" src="${gameImageUrl(gameData.ImageBoxArt)}">
        </div>

        <div class="card-header">
            <div class="game-title">${gameData.Title}</div>
            <!--<div class="game-subtitle">${gameData.Developer} · ${new Date(gameData.Released).getFullYear()}</div>
            <div class="tags">
            <span class="tag tag-purple">Action RPG</span>
            <span class="tag tag-purple">Metroidvania</span>
            <span class="tag tag-green">Класика</span>
            </div>-->
        </div>

        <div class="divider"></div>

        <div class="info-table">
            <div class="label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4m8-2h.01M16 12h.01"/></svg>
                ${lang.platform}
                <span class="value">${gameData.ConsoleName}</span>
            </div>
            <div class="label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                ${lang.developer}
                <span class="value">${gameData.Developer}</span>
            </div>
            <div class="label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${lang.releaseYear}
                <span class="value">${new Date(gameData.Released).getFullYear()}</span>
            </div>
        </div>

        <div class="divider"></div>

        <div class="progress-section" style="--unlock-rate: ${unlockRate}%">
            <div class="progress-meta">
            ${lang.cheevos}
            <span>${unlockedCheevos} / ${totalCheevos}</span>
            </div>
            <div class="progress-track">
            <div class="progress-fill"></div>
            </div>
            <div class="progress-foot">
            <span>${unlockRate}% ${lang.unlocked}</span>
            <span>${formatDuration(gameData.TimePlayed, false)}</span>
            </div>
        </div>

        </div>
    `)
    const element = generateWidget({ ...props, element: InnerElement() });
    const update = () => { };
    const remove = () => {
        element?.remove();
    };
    return { element, update, remove };
}

export const neonGameCard = (params) => gameCard({ ...params, variant: "neon" });
export const pixelGameCard = (params) => gameCard({ ...params, variant: "pixel" });

export const gameCardConfig = (props) => [
    {
        label: lang.props,
        elements: [
            {
                type: inputTypes.NUM_INPUT,
                label: lang.fontSize,
                value: props.fontSize,
                title: lang.fontSize,
                onChange: (event) => props.fontSize = event.currentTarget.value,
            },
            // {
            //     type: inputTypes.RADIO,
            //     label: lang.points,
            //     name: "constr-progress-type",
            //     checked: props.progressType === "points",
            //     onChange: () => props.progressType = "points",
            // },
            // {
            //     type: inputTypes.RADIO,
            //     label: lang.cheevos,
            //     name: "constr-progress-type",
            //     checked: !props.progressType || props.progressType === "cheevos",
            //     onChange: () => props.progressType = "cheevos",
            // },
            // {
            //     type: inputTypes.CHECKBOX,
            //     label: lang.hardcoreMode,
            //     id: "constr-is-soft",
            //     checked: !props.isSoftcore,
            //     onChange: (event) => props.isSoftcore = !event.currentTarget.checked,
            //     // hint: lang.ignoreSubsetsHint,
            // },
            {
                type: inputTypes.CHECKBOX,
                label: lang.isVisible,
                id: "constr-is-visible",
                checked: props.isVisible ?? true,
                onChange: (event) => props.isVisible = event.currentTarget.checked,
            },
        ]
    }
]