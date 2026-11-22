import { fromHtml } from "../../functions/html.js";
import { inputTypes } from "../inputElements.js";
import { generateWidget } from "./widgetContainer.js";

export const lastUnlockedProgressbar = ({ props, parent }) => {
    const baseClass = "progressbar-last-unlocked";
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
                <span class="${baseClass}__label">${lang.unlocked}</span>
                <span class="${baseClass}__percentage">${rate}%</span>
            </div>
            <h2 class="${baseClass}__game-title"></h2>
            <div class="${baseClass}__award">
                <span class="${baseClass}__icon">★</span>
                <div class="${baseClass}__award-info">
                    <h3 class="${baseClass}__award-title"></h3>
                    <p class="${baseClass}__description"></p>
                </div>
            </div>
            <div class="${baseClass}__track"><div class="${baseClass}__value"></div></div>
            <p class="${baseClass}__count">${unlocked} / ${total} ${lang.cheevos}</p>
        </div>
    `);
    const element = generateWidget({ ...props, element: innerElement });
    const gameTitle = element.querySelector(`.${baseClass}__game-title`);
    const awardTitle = element.querySelector(`.${baseClass}__award-title`);
    const description = element.querySelector(`.${baseClass}__description`);
    gameTitle.textContent = parent.keys.gameTitle ?? "";

    const updateAward = () => {
        awardTitle.textContent = parent.keys.lastUnlockedTitle || lang.noCheevoToShow;
        description.textContent = parent.keys.lastUnlockedDescription ?? "";
    };
    updateAward();

    const update = () => {
        const { rate, unlocked, total } = getProgress();
        element.querySelector(`.${baseClass}__container`).style.setProperty("--progress-rate", `${rate}%`);
        element.querySelector(`.${baseClass}__percentage`).textContent = `${rate}%`;
        element.querySelector(`.${baseClass}__count`).textContent = `${unlocked} / ${total} ${lang.cheevos}`;
        updateAward();
    };
    const remove = () => element?.remove();
    return { element, update, remove };
};

export const lastUnlockedProgressbarConfig = (props) => [
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
