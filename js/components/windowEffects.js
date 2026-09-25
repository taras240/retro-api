import { fromHtml } from "../functions/html.js";

export const sweepEffect = (container, eventType = "game") => {
    const animDuration_MS = 1500;
    const sweepElement = fromHtml(`
        <.sweep-effect-element.${eventType}/>
    `);
    container.appendChild(sweepElement);
    container.style.setProperty("--sweep-anim-duration", `${animDuration_MS}ms`)
    // container.classList.add("sweep-effect-container");
    setTimeout(() => {
        sweepElement?.remove();
        container.classList.remove("sweep-effect-container");
    }, animDuration_MS + 500);
}