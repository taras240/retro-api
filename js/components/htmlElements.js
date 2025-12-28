import { ui } from "../script.js";

const editPropsButtons = (isGame, ID, onClick) => `
    <button 
        class="${isGame ? "game-props-button" : "edit-cheevo-button"} header-button header-icon edit-icon"
        data-title="${ui.lang.editPropsHint}" 
        ${!isGame ? `data-cheevo-id="${ID}"` : ""} 
        onclick="${onClick}">
    </button>
`
export const buttonsHtml = {
    comments: (onClick, classes = []) => `<button class="comments-button header-button header-icon chat-icon ${classes.join(" ")}" data-title="${ui.lang.showCommentsHint}" onclick="${onClick}"></button>`,

    editGameProps: (onClick) => editPropsButtons(true),
    editCheevoProps: (cheevoID, onClick) => editPropsButtons(false, cheevoID, onClick),

    tweek: (onClick) => `<button class="header-button header-icon tweak-button tweak-icon" data-title="${ui.lang.widgetConfigHint}" onclick="${onClick}"></button>`,

    removeFromTarget: () => `<button class="header-button header-icon  delete-icon delete-from-target" data-title="${ui.lang.removeFromTargetHint}"></button>`,
    pin: () => `<button class="header-button header-icon bookmark-icon pin-cheevo" data-title="**add/remove pin"></button>`,
    togglePins: () => `<button class="header-button header-icon pins-icon toggle-pins" data-title="**toggle pins"></button>`,
    close: (onClick) => `<button class="header-icon header-button close-icon" onclick="${onClick}" data-title="${ui.lang.close}"></button>`,

    sort: (sectionID, onClick) => `<button class="header-button header-icon sort-icon" id="${sectionID}-sort-button" data-title="${ui.lang.sort}"></button>`,

    filter: (sectionID, onClick) => `<button class="header-button header-icon filter-icon" id="${sectionID}-filter-button" data-title="${ui.lang.filter}"></button>`,

    external: (sectionID, onclick) => `<button class="header-button header-icon external-icon" id="${sectionID}-external_window-button" data-title="Open in external window"></button>`,

    reload: (onClick) => `<button class="header-button header-icon update-icon" data-title="${ui.lang.forceReloadHint}" onclick="${onClick}"></button>`,
    fulscreen: (onClick) => `
        <button class="header-button header-icon fullscreen-button fullscreen-icon" data-title="${ui.lang.fullscreen}" onclick="${onClick}"></button>
    `
}