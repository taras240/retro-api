import { getRandomID } from "../functions/randomID.js";

const editPropsButtons = (isGame, ID, onClick) => `
    <button 
        class="${isGame ? "game-props-button" : "edit-cheevo-button"} header-button header-icon edit-icon"
        data-title="${lang.editPropsHint}" 
        ${!isGame ? `data-cheevo-id="${ID}"` : ""} 
        onclick="${onClick}"
    />`

export const buttonsHtml = {
    link: ({ classes = [], hint }) => `<button class="header-button header-icon link-icon ${classes.join(" ")}" data-title="${hint ?? ""}"/>`,
    comments: (onClick, classes = []) => `<button class="comments-button header-button header-icon chat-icon ${classes.join(" ")}" data-title="${lang.showCommentsHint}" onclick="${onClick}"/>`,
    editButton: ({ onClick, ID }) => `<button 
        class="header-button header-icon edit-icon"
        data-title="${lang.edit}" 
        ${`data-id="${ID}"`} 
        ${onClick ? `onclick="${onClick}"` : ""}>
    </button>`,
    exportButton: ({ }) => `<button class="header-icon header-button export-icon" data-title="${lang.export}"/>`,
    saveData: ({ hint, id, className }) => `<button id="${id || getRandomID()}" class="header-icon header-button save-icon ${className ?? ""}" data-title="${hint ?? lang.saveData}"/>`,
    editGameProps: (onClick) => editPropsButtons(true),
    editCheevoProps: (cheevoID, onClick) => editPropsButtons(false, cheevoID, onClick),

    tweek: (onClick) => `<button class="header-button header-icon tweak-button tweak-icon" data-title="${lang.widgetConfigHint}" onclick="${onClick}"/>`,

    removeFromTarget: () => `<button class="header-button header-icon  delete-icon delete-from-target" data-title="${lang.removeFromTargetHint}"/>`,
    pin: () => `<button class="header-button header-icon bookmark-icon pin-cheevo" data-title="${lang.addPin}"/>`,
    togglePins: () => `<button class="header-button header-icon pins-icon toggle-pins" data-title="${lang.togglePins}"/>`,
    close: (onClick) => `<button class="header-icon header-button close-icon" onclick="${onClick}" data-title="${lang.close}"/>`,
    delete: () => `<button class="header-icon header-button delete-icon" data-title="${lang.delete}"/>`,

    sort: (sectionID, onClick) => `<button class="header-button header-icon sort-icon" id="${sectionID}-sort-button" data-title="${lang.sort}"/>`,

    filter: (sectionID, onClick) => `<button class="header-button header-icon filter-icon" id="${sectionID}-filter-button" data-title="${lang.filter}"/>`,

    external: (sectionID, onclick) => `<button class="header-button header-icon external-icon" id="${sectionID}-external_window-button" data-title="Open in external window"/>`,

    reload: ({ hint } = {}) => `<button class="header-button header-icon update-icon" data-title="${hint ?? lang.forceReloadHint}"/>`,
    fulscreen: (onClick) => `
        <button class="header-button header-icon fullscreen-button fullscreen-icon" data-title="${lang.fullscreen}" onclick="${onClick}"/>
    `,
    reset: (action) => `<button class="header-icon header-button reset-icon" data-action="${action}" data-title="${lang.reset}"/>`,
    next: (action) => `<button class="header-icon header-button next-icon" data-action="${action}" data-title="${lang.next}"/>`,
    prev: (action) => `<button class="header-icon header-button prev-icon" data-action="${action}" data-title="${lang.prev}"/>`,
}