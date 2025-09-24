import { input } from "./inputElements.js";

export const dialogWindow = ({ title = "Message!", message = "", elements = [] }) => {
    const window = document.createElement("div");
    window.addEventListener("mousedown", event => event.stopPropagation());
    window.classList.add("dialog-window", "section");
    window.innerHTML = `
        <h2 class="dialog__header">${title}</h2>
        <button class="dialog-close-icon header-icon header-button close-icon" onclick="this.closest('.section').remove();"></button>
        <p>${message}</p>
        <div class="dialog__inputs-row">${elements.map(el => input(el)).join("")}</div>
    `;
    return window;
}