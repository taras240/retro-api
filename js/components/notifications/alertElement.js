import { ALERT_TYPES } from "../../enums/alerts.js";
import { GAME_AWARD_TYPES } from "../../enums/gameAwards.js";
import { signedIcons } from "../icons.js";

export const alertHtml = ({ imageUrl, title, titleUrl, meta, icons = [], badge = "", alertType }) => {

    const alertBadges = {
        [ALERT_TYPES.CHEEVO]: { title: "unlocked", color: "gold" },
        [ALERT_TYPES.GAME]: { title: "launched", color: "lime" },
        [GAME_AWARD_TYPES.BEATEN]: { title: "beaten", color: "orange" },
        [GAME_AWARD_TYPES.BEATEN_SOFTCORE]: { title: "beaten*", color: "darkorange" },
        [GAME_AWARD_TYPES.MASTERED]: { title: "mastered", color: "violet" },
        [GAME_AWARD_TYPES.COMPLETED]: { title: "completed", color: "yellow" },
    }

    return `
            <div class="media-item">
                <div class="media-item__award" style="--alert-color:${alertBadges[alertType].color}">
                    <p class="media-item__award-name" >
                            ${alertBadges[alertType]?.title ?? ""}
                    </p>
                </div>
                <div class="media-item__preview">
                    <img
                    class="media-item__image"
                    src="${imageUrl}"
                    alt=""
                    >
                </div>

                <div class="media-item__content">
                    <h3 class="media-item__title">
                        ${badge ? badge : ""} 
                    <a
                        class="media-item__link"
                        target="_blank"
                        href="${titleUrl}"
                    >
                        ${title}
                    </a>
                    </h3>

                    <p class="media-item__meta">
                        ${meta}
                    </p>
                    <div class="media-item__stats icons-row-list">
                        ${icons.map(icon => signedIcons[icon.type]?.(icon.value)).join("")}
                    </div>
                </div>
            </div>
        `;
}