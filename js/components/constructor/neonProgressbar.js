import { fromHtml } from "../../functions/html.js";
import { cheevoImageUrl, gameImageUrl } from "../../functions/raLinks.js";
import { inputTypes } from "../inputElements.js";
import { generateWidget } from "./widgetContainer.js";

export const neonProgressbar = ({ props, gameData, parent }) => {
    const baseClass = "progressbar-neon";
    const showIcons = () => props.showIcons ?? props.showGameIcon ?? false;
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
                <img class="${baseClass}__game-icon">
                <div class="${baseClass}__game-info">
                    <h2 class="${baseClass}__title"></h2>
                    <p class="${baseClass}__presence"></p>
                </div>
                <span class="${baseClass}__percentage">${rate}%</span>
            </div>
            <div class="${baseClass}__track"><div class="${baseClass}__value"></div></div>
            <p class="${baseClass}__count">${unlocked} / ${total} ${lang.cheevos}</p>
            <div class="${baseClass}__achievement ${baseClass}__focus-achievement" hidden>
                <span class="${baseClass}__achievement-label">${lang.focusCheevo}</span>
                <div class="${baseClass}__achievement-body">
                    <img class="${baseClass}__achievement-icon" hidden>
                    <div class="${baseClass}__achievement-info">
                    <strong class="${baseClass}__achievement-title"></strong>
                    <p class="${baseClass}__achievement-description"></p>
                    </div>
                </div>
            </div>
            <div class="${baseClass}__achievement ${baseClass}__last-achievement" hidden>
                <span class="${baseClass}__achievement-label">${lang.lastUnlocked ?? lang.lastUnlockedCheevoPreview}</span>
                <div class="${baseClass}__achievement-body">
                    <img class="${baseClass}__achievement-icon" hidden>
                    <div class="${baseClass}__achievement-info">
                    <strong class="${baseClass}__achievement-title"></strong>
                    <p class="${baseClass}__achievement-description"></p>
                    </div>
                </div>
            </div>
        </div>
    `);
    const element = generateWidget({ ...props, element: innerElement });
    const title = element.querySelector(`.${baseClass}__title`);
    const presence = element.querySelector(`.${baseClass}__presence`);
    const gameIcon = element.querySelector(`.${baseClass}__game-icon`);
    const focusAchievement = element.querySelector(`.${baseClass}__focus-achievement`);
    const lastAchievement = element.querySelector(`.${baseClass}__last-achievement`);
    gameIcon.src = gameImageUrl(gameData.ImageIcon);
    gameIcon.alt = parent.keys.gameTitle ?? "";
    gameIcon.hidden = !showIcons();
    title.textContent = parent.keys.gameTitle ?? "";
    presence.textContent = parent.keys.richPresence || lang.richPresence;

    const updateAchievement = (container, achievementTitle, description, badgeName, isVisible) => {
        container.hidden = !isVisible;
        container.querySelector(`.${baseClass}__achievement-title`).textContent = achievementTitle || lang.noCheevoToShow;
        container.querySelector(`.${baseClass}__achievement-description`).textContent = description ?? "";
        const icon = container.querySelector(`.${baseClass}__achievement-icon`);
        icon.hidden = !showIcons() || !isVisible || !badgeName;
        if (showIcons() && isVisible && badgeName) {
            icon.src = cheevoImageUrl({ BadgeName: badgeName });
        } else {
            icon.removeAttribute("src");
        }
    };
    const updateAchievements = () => {
        updateAchievement(
            focusAchievement,
            parent.keys.focusCheevoTitle,
            parent.keys.focusCheevoDescription,
            parent.keys.focusCheevoBadgeName,
            props.showFocusAchievement
        );
        updateAchievement(
            lastAchievement,
            parent.keys.lastUnlockedTitle,
            parent.keys.lastUnlockedDescription,
            parent.keys.lastUnlockedBadgeName,
            props.showLastUnlockedAchievement
        );
    };
    updateAchievements();

    const update = () => {
        const { rate, unlocked, total } = getProgress();
        element.querySelector(`.${baseClass}__container`).style.setProperty("--progress-rate", `${rate}%`);
        element.querySelector(`.${baseClass}__percentage`).textContent = `${rate}%`;
        element.querySelector(`.${baseClass}__count`).textContent = `${unlocked} / ${total} ${lang.cheevos}`;
        gameIcon.hidden = !showIcons();
        presence.textContent = parent.keys.richPresence || lang.richPresence;
        updateAchievements();
    };
    const remove = () => element?.remove();
    return { element, update, remove };
};

export const neonProgressbarConfig = (props, onOptionChange = () => { }) => [
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
                label: lang.showIcons,
                checked: props.showIcons ?? props.showGameIcon ?? false,
                onChange: (event) => {
                    props.showIcons = event.currentTarget.checked;
                    onOptionChange("showIcons", props.showIcons);
                },
            },
            {
                type: inputTypes.CHECKBOX,
                label: lang.focusCheevoPreview,
                checked: props.showFocusAchievement ?? false,
                onChange: (event) => {
                    props.showFocusAchievement = event.currentTarget.checked;
                    onOptionChange("showFocusAchievement", props.showFocusAchievement);
                },
            },
            {
                type: inputTypes.CHECKBOX,
                label: lang.lastUnlocked ?? lang.lastUnlockedCheevoPreview,
                checked: props.showLastUnlockedAchievement ?? false,
                onChange: (event) => {
                    props.showLastUnlockedAchievement = event.currentTarget.checked;
                    onOptionChange("showLastUnlockedAchievement", props.showLastUnlockedAchievement);
                },
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
