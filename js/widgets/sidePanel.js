import { UI } from "../ui.js";
import { generateBadges, badgeElements } from "../components/badges.js";

import { config, ui } from "../script.js";
import { fromHtml } from "../functions/html.js";
export class SidePanel {
    get VISIBLE() {
        return !this.section.classList.contains("hidden");
    }
    constructor() {
        this.generatePanel();
        this.initializeElements();
        this.addEvents();
        this.setValues();
    }
    initializeElements() {
        this.section = document.querySelector("#side_panel");
        this.header = this.section.querySelector("#buttons-header_container");
        this.settings = this.section.querySelector("#open-settings-button");
        this.achievements = this.section.querySelector("#open-achivs-button");
        // this.about = this.section.querySelector("#open-about-button");
        this.gameCard = this.section.querySelector("#open-game-card-button");
        this.target = this.section.querySelector("#open-target-button");
        this.status = this.section.querySelector("#open-status-button");
        this.awards = this.section.querySelector("#open-awards-button");
        this.games = this.section.querySelector("#open-games-button");
        this.progression = this.section.querySelector("#open-progression-button");
        this.userImage = this.section.querySelector("#side-panel-user-image");
        this.note = this.section.querySelector("#open-note-button");
        this.notifications = this.section.querySelector("#open-notifications-button");
        this.user = this.section.querySelector("#open-user-button");
        this.stats = this.section.querySelector("#open-stats-button");
    }
    addEvents() {
        // Отримуємо посилання на панель
        this.sidePanel = document.querySelector("#side_panel");
        setTimeout(() => this.section.classList.remove("expanded"), 2000);
        // Додаємо подію для відслідковування руху миші touchmove 
        document.addEventListener("touchstart", (e) => this.touchVisibilityHandler(e));
        this.settings.addEventListener("click", (e) => {
            const settingsWidget = document.querySelector("#settings_section");
            settingsWidget ? settingsWidget.remove() : ui.settings.openSettings();
        });
    }
    setValues() {
        this.userImage.src = config.userImageSrc;
    }
    show() {
        this.section.classList.add("expanded");
        this.autoHideTimeout = setTimeout(() => this.section.classList.remove("expanded"), 500)
        this.section.addEventListener("mousemove", () => {
            this.autoHideTimeout && clearTimeout(this.autoHideTimeout);
        })
        this.section.addEventListener("mouseleave", () => {
            setTimeout(
                () => this.section.classList.remove("expanded"),
                200
            );
        });
    }
    touchVisibilityHandler(e) {
        const xPos = e.touches[0].clientX;
        if (xPos < 50) {
            // Якщо так, показуємо панель
            this.section.classList.add("expanded");
            this.section.addEventListener("blur", (e) => {
                setTimeout(
                    () => this.section.classList.remove("expanded"),
                    0
                );
            });
        }
    }
    generatePanel() {
        const logginButton = fromHtml(`
                    <button class="side-panel_login login-icon"
                        data-title="login window">
                        <img id="side-panel-user-image" src="" onerror="this.src='./assets/img/account.svg';" alt="">
                    </button>
            `);
        logginButton.addEventListener("click", () => ui.showLogin())
        const widgetsContainer = fromHtml(`
                <div class="buttons-block__shortcuts"></div>
            `);
        const tools = fromHtml(`
                <div class="buttons-block_tools">
                    <div class="setting-radio-group ">
                        <a class="side-panel_input side-panel_link" data-title="go to discord channel"
                            href="https://discord.gg/apzc6kCAbH" target="_blank">
                            <i class="side-panel__icon discord-icon"></i>
                        </a>
                    </div>
                    <div class="setting-radio-group ">
                        <input type="checkbox" name="open-settings-button" id="open-settings-button">
                        </input>
                        <label class="side-panel_input " data-title="settings" for="open-settings-button">
                            <i class="side-panel__icon settings-icon"></i>
                        </label>
                    </div>
                </div>
            `);
        const sidePanel = fromHtml(`
            <section id="side_panel" class="buttons-block expanded"></section>
            `);
        sidePanel.append(logginButton, widgetsContainer, tools);
        ui.app.append(sidePanel);
    }
}