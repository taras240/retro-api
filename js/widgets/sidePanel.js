import { UI } from "../ui.js";
import { generateBadges, badgeElements } from "../components/badges.js";

import { config, ui } from "../script.js";
export class SidePanel {
    get VISIBLE() {
        return !this.section.classList.contains("hidden");
    }
    constructor() {
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
        setTimeout(() => ui.buttons.section.classList.remove("expanded"), 2000);
        // Додаємо подію для відслідковування руху миші touchmove 
        document.addEventListener("touchstart", (e) => this.touchVisibilityHandler(e));
        this.settings.addEventListener("click", (e) => {
            // UI.switchSectionVisibility(ui.settings);
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
                    () => ui.buttons.section.classList.remove("expanded"),
                    0
                );
            });
        }
    }
    generatePanel() {
        const sidePanel = document.createElement("section");
        sidePanel.id = "side_panel";
        sidePanel.classList.add("buttons-block", "expanded");
    }
}