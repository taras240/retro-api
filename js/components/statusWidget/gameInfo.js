import { divHtml } from "../divContainer.js";
import { gameInfoIconsHtml } from "./gameInfoIcons.js";
import { progressBarHtml } from "./progressBar.js";
import { progressionBarHtml } from "./progressionBar.js";


const gameInfoContent = (game, theme) => {
    return `
        <div class="rp__preview-container">
            <img class="rp__game-image" src="" alt="" srcset="">
            <button class="status__watch-button" id="rp__watch-button"></button>
        </div>
        <div class="rp__game-info">
            <a class="rp__game-title" target="_blank"></a>
            <div class="rp__game-info-grid">
                
                    
                  <div class="rp__game-info-content">
                  ${progressBarHtml()}
                    <!--${gameInfoIconsHtml()}-->
                    </div>
                <div class="rp__game-time"></div>
            </div>
        </div>
    `;
}

/* <p class="rp__game-platform"></p>
<div class="icons-row-list rp__game-icons"></div> */
export const gameInfoHtml = (gameData, theme) => {
    return divHtml(["rp__game-container"], gameInfoContent(gameData, theme))
}