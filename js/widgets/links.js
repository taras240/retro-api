import { UI } from "../ui.js";
import { config, ui } from "../script.js";
import { Widget } from "./widget.js";
export class Links extends Widget {
    widgetIcon = {
        description: "links widget",
        iconID: `side-panel__links`,
        onChangeEvent: `ui.links.VISIBLE = this.checked`,
        iconClass: "link-icon",
    };
    links = [
        {
            name: "RetroAchievements",
            url: "https://retroachievements.org",
            // iconUrl: "https://static.retroachievements.org/assets/images/ra-icon.webp"
        },
        {
            name: "RA API docs",
            url: "https://api-docs.retroachievements.org",
        },
        {
            name: "ROM Patcher",
            url: "https://www.marcrobledo.com/RomPatcher.js/",
        },
        {
            name: "WoWRoMs",
            url: "https://wowroms.com/en/",
        },
        {
            name: "Emu-Land",
            url: "https://www.emu-land.net/en/",
        },
        {
            name: "GitHub [Project]",
            url: "https://github.com/taras240/retro-api",
        },
        {
            name: "Discord [Project]",
            url: "https://discord.gg/apzc6kCAbH",
        },


    ]
    constructor() {
        super();
        this.generateWidget();
        this.initializeElements();
        this.addWidgetIcon();

        this.addEvents();
        this.generateWidgetContent();

        UI.applyPosition({ widget: this });

    }
    generateWidget() {
        const widgetData = {
            classes: ["links_section", "section"],
            id: "links_section",
            title: ui.lang.linksSectionName,
            contentClasses: ["links-container", "content-container", "flex-main-list"],
        };

        const widget = this.generateWidgetElement(widgetData);
        ui.app.appendChild(widget);
    }
    initializeElements() {
        this.section = document.querySelector("#links_section");
    }
    addEvents() {
        super.addEvents();
    }
    generateWidgetContent() {
        const linksContainer = this.section.querySelector(".links-container");
        const linksHtml = this.links.map(({ name, url, iconUrl }) =>
            `<li class="links__link-item">
                <a class="signed-icon links__link-container" href="${url}" target="_blank">
                    ${iconUrl ? `<img class="links__link-image" src="${iconUrl}" alt="${name}">` : " "}
                    <span class="links__link-title">${name}</span>
                </a>
            </li> `).join("");
        linksContainer.innerHTML = `<ul class="flex-main-list links-list">${linksHtml}</ul>`;
    }
}