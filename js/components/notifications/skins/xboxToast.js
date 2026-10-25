import { ALERT_TYPES } from "../../../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../../../enums/gameAwards.js";
import { fromHtml } from "../../../functions/html.js";

const getStatus = (data, lang) => {
    if (data.type === ALERT_TYPES.CHEEVO) return lang.alertAchievementUnlocked;
    if (data.type === ALERT_TYPES.GAME) return lang.alertGameLaunched;

    if (data.type === ALERT_TYPES.AWARD) {
        switch (data.award) {
            case GAME_AWARD_TYPES.MASTERED:
                return lang.alertGameMastered;
            case GAME_AWARD_TYPES.COMPLETED:
                return lang.alertGameCompleted;
            case GAME_AWARD_TYPES.BEATEN:
                return lang.alertGameBeaten;
            case GAME_AWARD_TYPES.BEATEN_SOFTCORE:
                return lang.alertGameBeatenSoftcore;
            default:
                console.warn("Unknown game award type for Xbox toast:", data.award);
                return lang.alertGameActivity;
        }
    }

    console.warn("Unknown alert type for Xbox toast:", data.type);
    return lang.alertGameActivity;
};

export function xboxToastAlert(data, lang) {
    const status = getStatus(data, lang);
    const activityIcon = data.type === ALERT_TYPES.GAME
        ? ""
        : `<img src="./assets/img/xbox-toast-trophy.svg" alt="">`;
    const isAchievement = data.type === ALERT_TYPES.CHEEVO;
    const isAward = data.type === ALERT_TYPES.AWARD;
    const rate = isAchievement
        ? data.details.unlockRate
        : isAward && data.details.playerCount > 0 && data.details.unlockedCount != null
            ? `${(100 * data.details.unlockedCount / data.details.playerCount).toFixed(1)}%`
            : null;
    const points = isAchievement
        ? data.details.points
        : isAward
            ? data.details.pointsEarned
            : null;
    const pointsText = points === undefined || points === null || points === ""
        ? ""
        : `<span class="xbox-toast__points"><span>${lang.points}:</span> ${points}</span>`;
    const background = data.backgroundImageUrl
        ? `<img class="xbox-toast__background" src="${data.backgroundImageUrl}" alt="">`
        : "";

    return fromHtml(`
        <li.alerts-popup.skin-xbox-toast>
            ${background}
            <.xbox-toast__shade/>
            <.xbox-toast__content>
                <.xbox-toast__heading>
                    ${activityIcon ? `<span class="xbox-toast__trophy">${activityIcon}</span>` : ""}
                    <span class="xbox-toast__status">${status}</span>
                </>
                <.xbox-toast__body>
                    <.xbox-toast__badge>
                        <img class="xbox-toast__image" src="${data.imageUrl}" alt="">
                        ${rate ? `<span class="xbox-toast__rate">${rate}</span>` : ""}
                    </>
                    <.xbox-toast__text>
                        <a class="xbox-toast__title" href="${data.titleUrl}" target="_blank">${data.title}</a>
                        ${data.meta ? `<p class="xbox-toast__description">${data.meta}</p>` : ""}
                    </>
                </>
            </>
        </li>
    `);
}
