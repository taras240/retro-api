import { fromHtml } from "../functions/html.js";
import { divHtml } from "./divContainer.js"

export const sweepEffect = (container, eventType = "game") => {
    const sweepElement = fromHtml(`
        <.sweep-effect-element.${eventType}/>
    `);
    container.appendChild(sweepElement);
    setTimeout(() => sweepElement?.remove(), 2e3);
}