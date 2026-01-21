import { ALERT_TYPES } from "../../enums/alerts.js";
import { delay } from "../../functions/delay.js";
import { cheevoImageUrl, gameImageUrl } from "../../functions/raLinks.js";
import { config, watcher } from "../../script.js";
import { badgeElements, generateBadges, goldBadge } from "../badges.js";
import { cheevoElementFull } from "../cheevo.js";
import { divHtml } from "../divContainer.js";
import { icons } from "../icons.js";

const deltaTime = (time) => {
    const hours = ~~(time / 3600);
    const mins = ~~((time - hours * 3600) / 60);
    const timeStr = `
          ${hours > 0 ? hours == 1 ? "1 hour " : hours + " hours " : ""}
          ${hours > 0 && mins > 0 ? "and " : ""}
          ${mins > 0 ? mins == 1 ? "1 minute" : mins + " minutes" : ""}
            `;
    return timeStr;
}
const alertInnerHtml = ({ imageUrl, Title, Description, Points = "" }) => {
    return `
                <div class="rp-alert__neon"></div>
                <div class="rp-alert__preview-container"></div>
                <div class="rp-alert__preview-container rp-alert__ambient"></div>
                
                <div class="rp-alert__text-container">
                    <h2 class="rp-alert__title">${Title}</h2>
                    <div class="rp-alert__description">${Description}</div>
                </div>
                <p class="rp-alert__points">${Points}</p>
    `;
}
const gameAlertElement = (gameData) => {
    const { Title,
        ImageIcon,
        totalPoints,
        ConsoleName,
        Released,
        totalRetropoints,
        NumAchievements,
        masteryRate,
        beatenRate,
        retroRatio
    } = gameData;
    const Description = `
        <p>Console: ${ConsoleName} </p>
        <p>Released:${Released}</p>
    `;
    const gameAlert = document.createElement("div");
    gameAlert.classList.add("rp__alert-content");
    gameAlert.style.setProperty("--bg-src", `url(${gameImageUrl(ImageIcon)})`);
    gameAlert.innerHTML = alertInnerHtml({ Title, Description, Points: retroRatio });
    return gameAlert;
}
const cheevoAlertElement = (cheevo) => {
    const { isEarnedHardcore, Title, Description, BadgeName, Points, TrueRatio, rateEarned, rateEarnedHardcore, difficulty } = cheevo;
    const cheevoAlert = document.createElement("div");
    cheevoAlert.classList.add("rp__alert-content");
    cheevoAlert.style.setProperty("--bg-src", `url(${cheevoImageUrl(cheevo)})`);
    cheevoAlert.innerHTML = alertInnerHtml(cheevo);
    return cheevoAlert;
}

const awardAlertElement = (game, award) => {
    const {
        badges,
        ImageIcon,
        totalPoints,
        unlockData,
        totalRetropoints,
        masteryRate,
        beatenRate,
        completedRate,
        beatenRateSoftcore,
        ID,
        NumAchievements,
        TimePlayed
    } = game;
    // let award = 'mastered';
    const playTimeInMinutes = deltaTime(TimePlayed);
    const Description = `
        <p>Award earned in ${playTimeInMinutes}</p>
        <p>Unlocked cheevos: ${unlockData.softcore.count}</p>
    `;
    const Title = `
        Game ${award}<i class="italic-text">!</i>
    `;
    const Points = unlockData.softcore.points;
    const awardAlert = document.createElement("div");
    awardAlert.classList.add("rp__alert-content");
    awardAlert.style.setProperty("--bg-src", `url(${gameImageUrl(ImageIcon)})`);
    awardAlert.innerHTML = alertInnerHtml({ Title, Description, Points });
    return awardAlert;

}
const statsAlertHtml = (stats) => {
    let badgesHtml = `
                ${stats.rank ? goldBadge(`Rank: ${stats.rank} ${stats.deltaRank}`) : ""}
                ${stats.percentile ? goldBadge(`TOP ${stats.percentile.toFixed(2)}% ${stats.deltaPercentile}`) : ""}
                ${goldBadge(`${icons.cheevos} +${stats.cheevosCount}`)}
                ${goldBadge(`${icons.points}${stats.points} ${stats.deltaPoints}`)}
                ${goldBadge(`${icons.retropoints}${stats.retroPoints} ${stats.deltaRetroPoints}`)}
                ${goldBadge(`${icons.points}${stats.softPoints}SP ${stats.deltaSoftPoints}`)}
            `;

    return alertInnerHtml({
        imageUrl: config.userImageSrc,
        title: `${config.USER_NAME.toUpperCase()} statistics:`,
        badgesHtml
    });
}

export const alertHtml = (alert) => {
    return divHtml(["rp__alert-container"]);
}
export const showAlert = (alert, alertContainer) => {
    alertContainer.classList.remove("hide-alert");
    switch (alert.type) {
        case ALERT_TYPES.GAME:
            alertContainer.appendChild(gameAlertElement(alert.value));
            alertContainer.classList.add("show-alert");
            break;
        case ALERT_TYPES.CHEEVO:
            alertContainer.appendChild(cheevoAlertElement(alert.value));
            alertContainer.classList.add("show-alert");
            break;
        case ALERT_TYPES.AWARD:
            console.log(alert)
            alertContainer.appendChild(awardAlertElement(alert.value, alert.award));
            alertContainer.classList.add("show-alert");
            break;
        // case ALERT_TYPES.STATS:
        //     container.innerHTML = statsAlertHtml(alert.value);
        //     container.className = "rp__alert-container stats-alert show-alert"
        //     break;
        default:
            break;
    }
}
export const hideAlert = async (alertContainer, animDurationMs) => {
    alertContainer.classList.remove("show-alert");
    alertContainer.classList.add("hide-alert");
    await delay(animDurationMs ?? 1000);
    alertContainer.innerHTML = "";
}
