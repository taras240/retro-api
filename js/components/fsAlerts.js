import { configData, ui } from "../script.js";
import { ALERT_TYPES } from "../enums/alerts.js";
import { badgeElements } from "./badges.js";
import { delay } from "../functions/delay.js";
import { cheevoImageUrl, gameImageUrl } from "../functions/raLinks.js";
import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";

let fsAlerts = [];
function pushFSAlerts(alertsArray) {
    alertsArray.forEach(alert => {
        fsAlerts.push(alert);
        if (fsAlerts.length === 1) {
            showFSAlert();
        }
    });
}
async function showFSAlert() {
    const { fsAlertDuration, fsNewCheevo, fsNewAward } = configData;
    const { app } = ui;
    const casualBadge = () => badgeElements.default(ui.lang.casual);
    const awardAlert = (gameData, awardName) => {
        const { ImageIcon, Title } = gameData;
        const { MASTERED, COMPLETED, BEATEN, BEATEN_SOFTCORE } = GAME_AWARD_TYPES;
        const awardTitles = {
            [MASTERED]: ui.lang.masteryUnlocked,
            [COMPLETED]: `${ui.lang.masteryUnlocked} ${casualBadge()}`,
            [BEATEN]: ui.lang.gameBeaten,
            [BEATEN_SOFTCORE]: `${ui.lang.gameBeaten} ${casualBadge()}`,
        }
        app.querySelectorAll(".fs-alert__container").forEach(el => el.remove());
        const alertElement = document.createElement('div');
        alertElement.className = "fs-alert__container";
        alertElement.innerHTML = `
            <div class="fs-alert__main-content">
                <div class="fs-alert__border fs-alert__border-top"></div>
                <div class="fs-alert__header">${awardTitles[awardName]}</div>
                <div class="fs-alert__sub-border "></div>
                <div class="fs-alert__image-container">
                    <div class="fs-alert__light"></div>
                    <img src="${gameImageUrl(ImageIcon)}" alt="" class="fs-alert__image">
                    <div class="fs-alert__blick"></div>
                </div>
                <div class="fs-alert__description">${Title}</div>
                <div class="fs-alert__border fs-alert__border-botton"></div>
            </div>
        `;
        return alertElement;
    }
    const cheevoAlert = ({ isEarnedHardcore, Title, BadgeName, Points, TrueRatio, rateEarned, rateEarnedHardcore, difficulty, Description }) => {
        app.querySelectorAll(".fs-alert__container").forEach(el => el.remove());

        const alertElement = document.createElement('div');
        alertElement.className = "fs-alert__container";

        const alertHeader = isEarnedHardcore ?
            ui.lang.achievementUnlocked :
            `${ui.lang.achievementUnlocked} ${casualBadge()}`;

        alertElement.innerHTML = `
            <div class="fs-alert__main-content">
                <div class="fs-alert__border fs-alert__border-top"></div>
                <div class="fs-alert__header">${alertHeader}</div>
                <div class="fs-alert__sub-border"></div>
                <div class="fs-alert__image-container">
                    <div class="fs-alert__light"></div>
                    <img src="${cheevoImageUrl({ BadgeName })}" alt="" class="fs-alert__image">
                    <div class="fs-alert__blick"></div>
                </div>
                <div class="fs-alert__title">
                    ${Title}
                </div>
                <div class="fs-alert__border fs-alert__border-botton"></div>
                <div class="fs-alert__description">
                    ${Description}
                </div>
            </div>
        `;
        return alertElement;
    }

    while (fsAlerts.length > 0) {
        alert = fsAlerts[0];
        if ((alert.type === ALERT_TYPES.CHEEVO && !fsNewCheevo) || (alert.type === ALERT_TYPES.AWARD && !fsNewAward)) {
            fsAlerts.shift();
            continue;
        }
        let alertElement;
        switch (alert.type) {
            case ALERT_TYPES.AWARD:
                alertElement = awardAlert(alert.value, alert.award);
                break;
            case ALERT_TYPES.CHEEVO:
                alertElement = cheevoAlert(alert.value);
                break;
        }

        app.appendChild(alertElement);
        await delay(fsAlertDuration * 1000)
            .then(async () => {
                alertElement?.classList.add("hide-fs-alert");
                await delay(1000);
            })
            .then(() => {
                alertElement?.remove();
                fsAlerts.shift();
            });
    };
}
export { pushFSAlerts }