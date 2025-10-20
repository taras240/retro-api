import { UI } from "../ui.js";
import { generateBadges } from "../components/badges.js";
import { config, ui, apiWorker, watcher } from "../script.js";
import { cheevoImageUrl, cheevoUrl, gameImageUrl } from "../functions/raLinks.js";


export class Aotw {
    get VISIBLE() {
        return !this.section.classList.contains("hidden");
    }
    set VISIBLE(value) {
        UI.switchSectionVisibility({ section: this.section, visible: value })
        this.widgetIcon && (this.widgetIcon.checked = value);
    }
    aotwObj;
    autoremove;
    constructor() {
        this.generateAotwElement().then(() => {
            this.initializeElements()
            this.addEvents();
            ui.target.showAotwEvent({ cheevo: this.aotwObj });
        })
    }
    initializeElements() {
        this.section = document.querySelector(".aotw_section");
    }
    addEvents() {
        this.section.addEventListener('mouseover', () => this.stopAutoRemove())
    }
    setValues() {
        UI.switchSectionVisibility({ section: this.section, visible: true })
    }
    stopAutoRemove() {
        this.autoremove && clearTimeout(this.autoremove);
    }
    doAnim() {
        this.section.classList.remove("show-aotw", "hide-aotw", "disposed");
        setTimeout(() => this.section.classList.add("show-aotw"), 100);
        this.autoremove = setTimeout(() => this.section.classList.add("hide-aotw"), 10 * 1000)
    }
    addGlowEffectToCard(card) {
        var marker = card.querySelector('.marker');
        let bounds;
        function addLines(e) {
            var xPos = e.offsetX;
            var yPos = e.offsetY;

            var height = card.offsetHeight;
            var width = card.offsetWidth;

            var lp = Math.abs(Math.floor(100 / width * xPos) - 100);
            var tp = Math.abs(Math.floor(100 / height * yPos) - 100);

            marker.style.backgroundPosition = `${lp}% ${tp}%`;
        }

        card.addEventListener("mouseenter", event => {
            bounds = marker.getBoundingClientRect();
            marker.classList.remove("hidden");
            marker.addEventListener("mousemove", event => {
                addLines(event);
            });
        });
        card.addEventListener("mouseleave", event => {
            card.style.transform = '';
            card.style.background = '';
            marker.classList.add("hidden")
            card.removeEventListener("mousemove", event => addLines(event))
        });
    }
    checkCheevo({ earnedAchievementIDs }) {
        earnedAchievementIDs?.forEach(id => {
            if (id == this.aotwObj.ID) {
                watcher.CHEEVOS[id].isEarned && (this.section.classList.add('earned'),
                    this.aotwObj.isEarned = true,
                    this.doAnim()
                );
                watcher.CHEEVOS[id].isHardcoreEarned && (
                    this.section.classList.add('earned', 'hardcore'),
                    this.aotwObj.isEarnedHardcore = true
                )
                config.aotw = this.aotwObj;
            }
        })

    }
    async getAotwObject() {
        const aotwObj = await apiWorker.aotw();
        this.aotwObj = aotwObj;
        return this.aotwObj;
    }
    showGameInfo() {
        ui.games.showGameInfoPopup(this.aotwObj.GameID);
    }
    async generateAotwElement() {
        const cheevo = await this.getAotwObject();
        const aotwSection = document.createElement("section");
        aotwSection.classList.add("section", "aotw_section", "disposed", "compact");
        aotwSection.classList.toggle("earned", cheevo.isEarned);
        aotwSection.classList.toggle("hardcore", cheevo.isEarnedHardcore);
        aotwSection.id = 'aotw_section';
        aotwSection.innerHTML = `
        <div class="header-container">
            <div class="header-icon q-icon icon">
            </div>
  
            <h2 class="widget-header-text">
            <a class="" target="_blanc"
                        href="${cheevoUrl(cheevo.ID)}">
            AotW</a></h2>
            <button class="header-button info-icon header-icon" onclick="ui.aotw.showGameInfo()">
            </button>
            <div class="header-button close-icon header-icon" onclick="event.target.closest('.section')?.classList.add('hide-aotw')">
            </div>
        </div>
        <div class="aotw-card" data-id="4800">
            <div class="aotw-backside aotw-side"></div>
            <div class="aotw__container aotw-side">
                <div class="progression_descriptions aotw_descriptions">
                    <p class="signed-icon" title="points">
                      <i class="progression_description-icon description-icon points-icon"></i>
                      ${cheevo.Points}
                    </p>
                    <p class="signed-icon" title="points">
                      <i class="progression_description-icon description-icon retropoints-icon"></i>
                      ${cheevo.TrueRatio}
                    </p>
                    <p class="signed-icon" title="earned by">
                      <i class="progression_description-icon description-icon trending-icon"></i>
                      ${(100 * cheevo.UnlocksHardcoreCount / cheevo.TotalPlayers).toFixed(2)}%
                    </p>
                    <p class="signed-icon" title="earned by"> 
                      <i class="progression_description-icon description-icon rarity-icon"></i>
                      ${(cheevo.TrueRatio / cheevo.Points).toFixed(2)}
                    </p>
                    ${cheevo.Type ? `
                      <div class="progression_description-icon condition ${cheevo.Type}" title="achievement type">
                      </div>` : ""}
                </div>
                <div class="progression-achiv_prev-container">
                    <img class="progression-achiv_prev-img" src="${gameImageUrl(cheevo.BadgeURL)}alt=" ">
                </div>
                <h3 class="progression_achiv-name">
                    <a class="progression_achiv-link" target="_blanc"
                        href="${cheevoUrl(cheevo.ID)}">${cheevo.Title}</a>
                </h3>
                <div class="progression-details">
                ${cheevo.Description}
                </div>
  
                <div class="marker hidden"></div>
            </div>
          
        </div>
      `;
        ui.app.appendChild(aotwSection);
    }
}