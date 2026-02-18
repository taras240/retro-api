import { fromHtml } from "../functions/html.js";
import { input, inputElement } from "./inputElements.js";

export const dialogWindow = ({ title = "Message!", message = "", elements = [] }) => {
    const window = fromHtml(`
        <div class="dialog-window section">
            <h2 class="dialog__header">${title}</h2>
            <button class="dialog-close-icon header-icon header-button close-icon" onclick="this.closest('.section').remove();"></button>
            <p>${message}</p>
        </div>`)
    window.addEventListener("mousedown", event => event.stopPropagation());

    const inputs = elements.map(el => inputElement(el));
    const dialogInputsContainer = fromHtml(`<div class="dialog__inputs-row"></div>`);
    dialogInputsContainer.append(...inputs);
    window.append(dialogInputsContainer);
    return window;
}