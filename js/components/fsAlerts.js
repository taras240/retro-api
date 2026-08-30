import { ALERT_TYPES } from "../enums/alerts.js";
import { badgeElements } from "./badges.js";
import { delay } from "../functions/delay.js";
import { cheevoImageUrl, gameImageUrl } from "../functions/raLinks.js";
import { GAME_AWARD_TYPES } from "../enums/gameAwards.js";
import { fromHtml } from "../functions/html.js";

let fsAlerts = [];
function pushFSAlerts(alertsArray) {
    alertsArray.forEach(alert => {
        fsAlerts.push(alert);
        if (fsAlerts.length === 1) {
            showFSAlert();
        }
    });
}
function FSAlertElement({ header, iconUrl, title, description, isCheevo }) {
    return fromHtml(`
            <.fs-alert__container>
                <.fs-alert__main-content>
                    <.fs-alert__border.fs-alert__border-top/>
                    <.fs-alert__header>${header}</>
                    <.fs-alert__sub-border/>
                    <.fs-alert__image-container>
                        <.fs-alert__light/>
                        <img.fs-alert__image src="${iconUrl}">
                        <.fs-alert__blick/>
                    </>
                    <.fs-alert__title>
                        ${title}
                    </>
                    <.fs-alert__border.fs-alert__border-botton/>
                    <.fs-alert__description>
                        ${description || ""}
                    </>
                </>
            </>
        `);
}
async function showFSAlert() {
    const { fsAlertDuration, fsNewCheevo, fsNewAward } = configData;
    const { app } = ui;
    const casualBadge = () => badgeElements.default(lang.casual);
    const awardAlert = (gameData, awardName) => {
        const { ImageIcon, Title } = gameData;
        const { MASTERED, COMPLETED, BEATEN, BEATEN_SOFTCORE } = GAME_AWARD_TYPES;
        const awardTitles = {
            [MASTERED]: lang.masteryUnlocked,
            [COMPLETED]: `${lang.masteryUnlocked} ${casualBadge()}`,
            [BEATEN]: lang.gameBeaten,
            [BEATEN_SOFTCORE]: `${lang.gameBeaten} ${casualBadge()}`,
        }
        app.querySelectorAll(".fs-alert__container").forEach(el => el.remove());
        const alertElement = FSAlertElement({
            header: awardTitles[awardName],
            iconUrl: gameImageUrl(ImageIcon),
            title: Title,
        })
        return alertElement;
    }
    const cheevoAlert = ({ isEarnedHardcore, Title, BadgeName, Points, TrueRatio, rateEarned, rateEarnedHardcore, difficulty, Description }) => {
        app.querySelectorAll(".fs-alert__container").forEach(el => el.remove());

        const alertHeader = isEarnedHardcore ?
            lang.achievementUnlocked :
            `${lang.achievementUnlocked} ${casualBadge()}`;

        const alertElement = FSAlertElement({
            header: alertHeader,
            iconUrl: cheevoImageUrl({ BadgeName }),
            title: Title,
            description: Description,
        })
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