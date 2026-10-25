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
export function retroBannerAlert(data, lang) {
    const status = getStatus(data, lang);
    const heading = data.title || "";
    const meta = data.meta || "";
    const platform = data.details?.platform || "";
    const background = data.backgroundImageUrl
        ? `<img class="retro-banner__background" src="${data.backgroundImageUrl}" alt="">`
        : "";

    return fromHtml(`
        <li.alerts-popup.skin-retro-banner style="--alert-color:${data.badge.color}">
            ${background}
            <.retro-banner__shade/>
            <.retro-banner__content>
                <.retro-banner__body>
                    <img.retro-banner__image src="${data.imageUrl}" alt="">
                    <.retro-banner__text>
                        <h3.retro-banner__header>${status}</h2>
                        <h2.retro-banner__title>${heading}</h3>
                        ${meta ? `<p.retro-banner__meta>${meta}</p>` : ""}
                    </>
                </>
            </>
        </li>
    `);
}
