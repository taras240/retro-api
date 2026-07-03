import { fromHtml } from "../functions/html.js";

export function hintElement(content) {
  let popup = fromHtml(`
    <div class="popup hint hint-popup">
      ${content}
    </div>
  `);
  return popup;
}