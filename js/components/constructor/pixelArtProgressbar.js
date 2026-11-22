import { fromHtml } from "../../functions/html.js";
import { gameImageUrl } from "../../functions/raLinks.js";
import { inputTypes } from "../inputElements.js";
import { generateWidget } from "./widgetContainer.js";

export const pixelArtProgressbar = ({ props, gameData, parent }) => {
    const baseClass = "progressbar-pixel-art";
    const getProgress = () => {
        const { unlockedCheevos, unlockedCheevosTotal, totalCheevos } = parent.keys;
        const total = Number(totalCheevos) || 0;
        const unlocked = props.isSoftcore ? unlockedCheevosTotal : unlockedCheevos;
        const rate = total ? Math.min(100, Math.round(100 * unlocked / total)) : 0;
        return { rate, unlocked, total };
    };
    const { rate, unlocked, total } = getProgress();
    const innerElement = fromHtml(`
        <div class="${baseClass}__container" style="--progress-rate:${rate}%">
            <div class="${baseClass}__header">
                <div class="${baseClass}__preview-frame">
                    <img class="${baseClass}__preview">
                </div>
                <div class="${baseClass}__game-info">
                    <h2 class="${baseClass}__title"></h2>
                    <p class="${baseClass}__platform"></p>
                </div>
                <strong class="${baseClass}__percentage">${rate}%</strong>
            </div>
            <div class="${baseClass}__progress-info">
                <span>${lang.cheevos}</span>
                <strong class="${baseClass}__count">${unlocked} / ${total}</strong>
            </div>
            <div class="${baseClass}__track"><div class="${baseClass}__value"></div></div>
        </div>
    `);
    const element = generateWidget({ ...props, element: innerElement });
    const previewFrame = element.querySelector(`.${baseClass}__preview-frame`);
    const preview = element.querySelector(`.${baseClass}__preview`);
    preview.src = gameImageUrl(gameData.ImageIcon);
    preview.alt = parent.keys.gameTitle ?? "";
    previewFrame.hidden = !(props.showGameIcon ?? true);
    element.querySelector(`.${baseClass}__title`).textContent = parent.keys.gameTitle ?? "";
    element.querySelector(`.${baseClass}__platform`).textContent = parent.keys.consoleName ?? "";

    const update = () => {
        const { rate, unlocked, total } = getProgress();
        element.querySelector(`.${baseClass}__container`).style.setProperty("--progress-rate", `${rate}%`);
        element.querySelector(`.${baseClass}__percentage`).textContent = `${rate}%`;
        element.querySelector(`.${baseClass}__count`).textContent = `${unlocked} / ${total}`;
    };
    const remove = () => element?.remove();
    return { element, update, remove };
};

export const pixelArtProgressbarConfig = (props) => [
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
            {
                type: inputTypes.CHECKBOX,
                label: lang.hardcoreMode,
                checked: !props.isSoftcore,
                onChange: (event) => props.isSoftcore = !event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                label: lang.showIcons,
                checked: props.showGameIcon ?? true,
                onChange: (event) => props.showGameIcon = event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                label: lang.isVisible,
                checked: props.isVisible ?? true,
                onChange: (event) => props.isVisible = event.currentTarget.checked,
            },
        ],
    },
];
