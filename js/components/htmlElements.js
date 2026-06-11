import { getRandomID } from "../functions/randomID.js";
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
    link: ({ classes = [], hint }) => `<button class="header-button header-icon link-icon ${classes.join(" ")}" data-title="${hint ?? ""}"></button>`,
    comments: (onClick, classes = []) => `<button class="comments-button header-button header-icon chat-icon ${classes.join(" ")}" data-title="${ui.lang.showCommentsHint}" onclick="${onClick}"></button>`,
    editButton: ({ onClick, ID }) => `<button 
        class="header-button header-icon edit-icon"
        data-title="${ui.lang.edit}" 
        ${`data-id="${ID}"`} 
        ${onClick ? `onclick="${onClick}"` : ""}>
    </button>`,
    exportButton: ({ }) => `<button class="header-icon header-button export-icon" data-title="${ui.lang.export}"/>`,
    saveData: ({ hint, id, className }) => `<button id="${id || getRandomID()}" class="header-icon header-button save-icon ${className ?? ""}" data-title="${hint ?? ui.lang.saveData}"></button>`,
    editGameProps: (onClick) => editPropsButtons(true),
    editCheevoProps: (cheevoID, onClick) => editPropsButtons(false, cheevoID, onClick),

    tweek: (onClick) => `<button class="header-button header-icon tweak-button tweak-icon" data-title="${ui.lang.widgetConfigHint}" onclick="${onClick}"></button>`,

    removeFromTarget: () => `<button class="header-button header-icon  delete-icon delete-from-target" data-title="${ui.lang.removeFromTargetHint}"></button>`,
    pin: () => `<button class="header-button header-icon bookmark-icon pin-cheevo" data-title="${ui.lang.addPin}"></button>`,
    togglePins: () => `<button class="header-button header-icon pins-icon toggle-pins" data-title="${ui.lang.togglePins}"></button>`,
    close: (onClick) => `<button class="header-icon header-button close-icon" onclick="${onClick}" data-title="${ui.lang.close}"></button>`,
    delete: () => `<button class="header-icon header-button delete-icon" data-title="${ui.lang.delete}"></button>`,
    sort: (sectionID, onClick) => `<button class="header-button header-icon sort-icon" id="${sectionID}-sort-button" data-title="${ui.lang.sort}"></button>`,

    filter: (sectionID, onClick) => `<button class="header-button header-icon filter-icon" id="${sectionID}-filter-button" data-title="${ui.lang.filter}"></button>`,

    external: (sectionID, onclick) => `<button class="header-button header-icon external-icon" id="${sectionID}-external_window-button" data-title="Open in external window"></button>`,

    reload: (onClick) => `<button class="header-button header-icon update-icon" data-title="${ui.lang.forceReloadHint}" onclick="${onClick}"></button>`,
    fulscreen: (onClick) => `
        <button class="header-button header-icon fullscreen-button fullscreen-icon" data-title="${ui.lang.fullscreen}" onclick="${onClick}"></button>
    `
}