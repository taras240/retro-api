import { fromHtml } from "../../functions/html.js";
import { inputTypes } from "../inputElements.js";
import { generateWidget } from "./widgetContainer.js";

export const achievementProgressbar = ({ props, parent }) => {
    const baseClass = "progressbar-achievements";
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
            <h2 class="${baseClass}__title"></h2>
            <div class="${baseClass}__stats">
                <strong class="${baseClass}__unlocked">${unlocked}</strong>
                <span class="${baseClass}__separator">/</span>
                <span class="${baseClass}__total">${total}</span>
                <span class="${baseClass}__label">${lang.cheevos}</span>
            </div>
            <div class="${baseClass}__track"><div class="${baseClass}__value"></div></div>
            <div class="${baseClass}__footer">
                <span>${lang.unlocked}</span>
                <strong class="${baseClass}__percentage">${rate}%</strong>
            </div>
        </div>
    `);
    const element = generateWidget({ ...props, element: innerElement });
    element.querySelector(`.${baseClass}__title`).textContent = parent.keys.gameTitle ?? "";

    const update = () => {
        const { rate, unlocked, total } = getProgress();
        element.querySelector(`.${baseClass}__container`).style.setProperty("--progress-rate", `${rate}%`);
        element.querySelector(`.${baseClass}__unlocked`).textContent = unlocked;
        element.querySelector(`.${baseClass}__total`).textContent = total;
        element.querySelector(`.${baseClass}__percentage`).textContent = `${rate}%`;
    };
    const remove = () => element?.remove();
    return { element, update, remove };
};

export const achievementProgressbarConfig = (props) => [
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
                id: "constr-is-soft",
                checked: !props.isSoftcore,
                onChange: (event) => props.isSoftcore = !event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                label: lang.isVisible,
                id: "constr-is-visible",
                checked: props.isVisible ?? true,
                onChange: (event) => props.isVisible = event.currentTarget.checked,
            },
        ],
    },
];
