import { fromHtml } from "../../functions/html.js";
import { inputTypes } from "../inputElements.js";
import { generateWidget } from "./widgetContainer.js";

export const pixelProgressbar = ({ props, parent }) => {
    const baseClass = "progressbar-pixel";
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
                <h2 class="${baseClass}__title"></h2>
                <span class="${baseClass}__percentage">${rate}%</span>
            </div>
            <div class="${baseClass}__track"><div class="${baseClass}__value"></div></div>
            <div class="${baseClass}__footer">
                <span class="${baseClass}__platform"></span>
                <strong class="${baseClass}__count">${unlocked} / ${total}</strong>
            </div>
            <div class="${baseClass}__achievement ${baseClass}__focus-achievement" hidden>
                <span class="${baseClass}__achievement-label">${lang.focusCheevo}</span>
                <strong class="${baseClass}__achievement-title"></strong>
                <p class="${baseClass}__achievement-description"></p>
            </div>
            <div class="${baseClass}__achievement ${baseClass}__last-achievement" hidden>
                <span class="${baseClass}__achievement-label">${lang.lastUnlocked}</span>
                <strong class="${baseClass}__achievement-title"></strong>
                <p class="${baseClass}__achievement-description"></p>
            </div>
        </div>
    `);
    const element = generateWidget({ ...props, element: innerElement });
    element.querySelector(`.${baseClass}__title`).textContent = parent.keys.gameTitle ?? "";
    element.querySelector(`.${baseClass}__platform`).textContent = parent.keys.consoleName ?? "";
    const focusAchievement = element.querySelector(`.${baseClass}__focus-achievement`);
    const lastAchievement = element.querySelector(`.${baseClass}__last-achievement`);
    const updateAchievement = (container, title, description, isVisible) => {
        container.hidden = !isVisible;
        container.querySelector(`.${baseClass}__achievement-title`).textContent = title || lang.noCheevoToShow;
        container.querySelector(`.${baseClass}__achievement-description`).textContent = description ?? "";
    };
    const updateAchievements = () => {
        updateAchievement(
            focusAchievement,
            parent.keys.focusCheevoTitle,
            parent.keys.focusCheevoDescription,
            props.showFocusAchievement
        );
        updateAchievement(
            lastAchievement,
            parent.keys.lastUnlockedTitle,
            parent.keys.lastUnlockedDescription,
            props.showLastUnlockedAchievement
        );
    };
    updateAchievements();

    const update = () => {
        const { rate, unlocked, total } = getProgress();
        element.querySelector(`.${baseClass}__container`).style.setProperty("--progress-rate", `${rate}%`);
        element.querySelector(`.${baseClass}__percentage`).textContent = `${rate}%`;
        element.querySelector(`.${baseClass}__count`).textContent = `${unlocked} / ${total}`;
        updateAchievements();
    };
    const remove = () => element?.remove();
    return { element, update, remove };
};

export const pixelProgressbarConfig = (props) => [
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
                label: lang.focusCheevoPreview,
                checked: props.showFocusAchievement ?? false,
                onChange: (event) => props.showFocusAchievement = event.currentTarget.checked,
            },
            {
                type: inputTypes.CHECKBOX,
                label: lang.lastUnlocked,
                checked: props.showLastUnlockedAchievement ?? false,
                onChange: (event) => props.showLastUnlockedAchievement = event.currentTarget.checked,
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
