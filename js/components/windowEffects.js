import { divHtml } from "./divContainer.js"

export const sweepEffect = (container) => {
    const sweepElement = document.createElement("div");
    sweepElement.classList.add("sweep-effect-element");
    container.appendChild(sweepElement);
    setTimeout(() => sweepElement?.remove(), 10000);
}