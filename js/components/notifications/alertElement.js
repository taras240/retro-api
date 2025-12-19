import { alertTypes } from "../../enums/alerts.js";
import { gameAwardTypes } from "../../enums/gameAwards.js";
import { signedIcons } from "../icons.js";

export const alertHtml = ({ imageUrl, title, titleUrl, meta, icons = [], badge = "", alertType }) => {

    const alertBadges = {
        [alertTypes.CHEEVO]: { title: "unlocked", color: "gold" },
        [alertTypes.GAME]: { title: "launched", color: "lime" },
        [gameAwardTypes.BEATEN]: { title: "beaten", color: "orange" },
        [gameAwardTypes.BEATEN_SOFTCORE]: { title: "beaten*", color: "darkorange" },
        [gameAwardTypes.MASTERED]: { title: "mastered", color: "violet" },
        [gameAwardTypes.COMPLETED]: { title: "completed", color: "yellow" },
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