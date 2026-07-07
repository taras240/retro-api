import { fromHtml } from "../../../js/functions/html.js";
import { apiWorker, config, ui } from "../main.js"
import { recentCheevoHtml } from "./home/components/achievement.js";

export class Unlocks {

    constructor() {
        this.update();
    }
    getSectionElement() {
        const section = fromHtml(`
            <div class="section unlocks__section">
                <div class="section__header-title">Recent Unlocks</div>
                <div class="section__control-container"></div>
                <ul class="game-achivs__container list"></ul>
            </div>
        `);
        return section;
    }
    async update() {
        ui.showLoader();
        const lastUnlocks = await apiWorker.getLastUnlocks({ count: 20 });
        const section = this.getSectionElement();
        const unlocksList = lastUnlocks.map(c => fromHtml(recentCheevoHtml(c)));
        section.querySelector("ul")?.append(...unlocksList);
        ui.content.innerHTML = "";
        ui.content.append(section);
        ui.removeLoader();
    }
}