import { UI, GameGenres, generateBadges, generateGenres } from "../../ui.js";
import { config, ui, apiWorker } from "../../script.js";
import { cheevoTypes } from "../enums/cheevoTypes.js";

export class Progression {
    get VISIBLE() {
        return !this.section.classList.contains("hidden");
    }
    set VISIBLE(value) {
        UI.switchSectionVisibility({ section: this.section, visible: value })
        this.widgetIcon && (this.widgetIcon.checked = value);
    }
    constructor() {
        this.initializeElements();
        this.addEvents();
        UI.applyPosition({ widget: this });

    }
    initializeElements() {
        this.section = document.querySelector("#progression_section");
        this.widgetIcon = document.querySelector("#open-progression-button");
        this.header = this.section.querySelector(".header-container");
        this.notEarnedList = this.section.querySelector("#not-earned_progression-list");
        this.earnedList = this.section.querySelector("#earned_progression-list");
        this.resizer = this.section.querySelector("#progression-resizer")
    }
    addEvents() {
        this.resizer.addEventListener("mousedown", event => {
            event.stopPropagation();
            this.section.classList.add("resized");
            UI.resizeEvent({
                event: event,
                section: this.section,
            });
        });
        this.header.addEventListener("mousedown", (e) => {
            UI.moveEvent(this.section, e);
        });
    }
    fillCards() {
        this.notEarnedList.innerHTML = '';
        this.earnedList.innerHTML = '';
        Object.values(ui.ACHIEVEMENTS)
            .filter(achiv => UI.filterBy.progression(achiv))
            .sort((a, b) => -1 * UI.sortBy.id(a, b))
            .sort((a, b) => -1 * UI.sortBy.default(a, b))
            .forEach(achiv => {
                if (achiv.type === cheevoTypes.PROGRESSION || achiv.type === cheevoTypes.WIN) {
                    const achivElement = this.generateCard(achiv);
                    this.addGlowEffectToCard(achivElement);
                    achiv.isHardcoreEarned ? this.earnedList.prepend(achivElement) :
                        this.notEarnedList.appendChild(achivElement);
                }
            })
        // const lastCard = this.earnedList.lastChild;
        // lastCard ? this.addGlowEffectToCard(lastCard) : "";
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

            // cards.forEach(function (card) {
            //   card.addEventListener("mousemove", function (e) {
            //     var l = e.offsetX;
            //     var t = e.offsetY;
            //     var h = card.offsetHeight;
            //     var w = card.offsetWidth;
            //     var lp = Math.abs(Math.floor(100 / w * l) - 100);
            //     var tp = Math.abs(Math.floor(100 / h * t) - 100);
            //     var bg = `background-position: ${lp}% ${tp}%;`;
            //     var newStyle = `.card.active:before { ${bg} }`;

            //     cards.forEach(function (card) {
            //       card.classList.remove("active");
            //     });

            //     card.classList.add("active");
            //     style.innerHTML = newStyle;
            //   });

            //   card.addEventListener("mouseout", function () {
            //     cards.forEach(function (card) {
            //       card.classList.remove("active");
            //     });
            //   });
            // });
        }
        function rotateToMouse(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const leftX = mouseX - bounds.x;
            const topY = mouseY - bounds.y;
            const center = {
                x: leftX - bounds.width / 2,
                y: topY - bounds.height / 2
            }
            const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
            // scale3d(1.07, 1.07, 1.07)
            // card.style.transform = `

            //   rotate3d(
            //     ${center.y / 100},
            //     ${-center.x / 100},
            //     0,
            //     ${Math.log(distance) * 2}deg
            //   )
            // `;
            marker.style.backgroundImage = `
        radial-gradient(
        circle at
        ${center.x * 2 + bounds.width / 2}px
        ${center.y * 2 + bounds.height / 2}px,
        rgba(255, 255, 255, 0.15) ,
        #0000000f
        )`;
        }

        card.addEventListener("mouseenter", event => {
            bounds = card.getBoundingClientRect();
            marker.classList.remove("hidden");
            card.addEventListener("mousemove", event => {
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
    generateCard({ Title, ID, prevSrc, Points, TrueRatio, NumAwardedHardcore, totalPlayers, type, Description }) {
        const achivElement = document.createElement("li");
        achivElement.classList.add("horizon-list_item", "progression-achiv", type == "win_condition" ? "trophy" : "f");

        achivElement.dataset.id = ID;

        achivElement.innerHTML = `
      <div class="progression-achiv_container">
          <div class="progression_descriptions">
              <p class="progression-description-text" title="points"><i
                      class="description-icon points-icon"></i>${Points}
  
              </p>
              <p class="progression-description-text" title="points"><i
                      class="description-icon retropoints-icon"></i>${TrueRatio}
  
              </p>
              <p class="progression-description-text" title="earned by"><i
                      class="description-icon trending-icon"></i>${~~(NumAwardedHardcore / totalPlayers * 100)}%</p>
              <div class="description-icon condition ${type}" title="achievement type">
          </div>
          </div> 
          <div class="progression-achiv_prev-container">
              <img class="progression-achiv_prev-img" src="${prevSrc}"  alt=" ">
          </div>
          <h3 class="progression_achiv-name">
              <a class="progression_achiv-link" progression="_blanc" href="https://retroachievements.org/achievement/56855">${Title}</a>
          </h3>
          <div class="progression-details">
              ${Description}
          </div>
             
          <div class="marker hidden" style="position: absolute;"></div>
        </div>       
        `;// <div class="progression_achiv-number">4 / 6</div>
        return achivElement;
    }
    updateEarnedCards({ gameIDArray }) {
        gameIDArray?.forEach(gameID => {
            this.notEarnedList.querySelectorAll(".progression-achiv").forEach(element => {
                if (element.dataset.id == gameID) {
                    element.classList.add("removed");
                    setTimeout(() => {
                        element.classList.remove("removed");
                        this.earnedList.appendChild(element);
                        element.classList.add("added");
                    }, 500);
                }
            })
        })
    }
    close() {
        ui.buttons.progression.click();
    }

}