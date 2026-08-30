import { divHtml } from "../divContainer.js";
import { gameInfoIconsHtml } from "./gameInfoIcons.js";
import { progressBarHtml } from "./progressBar.js";
import { progressionBarHtml } from "./progressionBar.js";


const gameInfoContent = (game, theme) => {
    return `
        <.rp__game-container>
            <.rp__preview-container>
                <img.rp__game-image src="" alt="GAME" srcset="">
                <button#rp__watch-button.status__watch-button/>
            </>
            <.rp__game-info>
                <a.rp__game-title target="_blank"/>
                <.rp__game-info-grid>
                    <.rp__game-info-content"/>
                    <.rp__game-time">
                        <span.rp__time-mark"/>
                        <span.rp__time-hours"/>
                        <span.rp__time-minutes"/>
                        <span.rp__time-seconds"/>
                    </>
                </>
            </>
        </>
    `;
}

export const gameInfoHtml = (gameData, theme) => {
    return gameInfoContent(gameData, theme)
}