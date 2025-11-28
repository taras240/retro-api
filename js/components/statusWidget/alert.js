import { alertTypes } from "../../enums/alerts.js";
import { cheevoImageUrl, gameImageUrl } from "../../functions/raLinks.js";
import { config, watcher } from "../../script.js";
import { badgeElements, generateBadges, goldBadge } from "../badges.js";
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
const alertInnerHtml = ({ imageUrl, title, description, badgesHtml }) => {
    return `
        <div class="rp__alert-preview-container">
            <img class="rp__alert-preview" src="${imageUrl}" alt="">
        </div>
        <div class="rp__alert-info-grid">
            <h3 class="rp__alert-title">
                ${title ?? ""}
            </h3>
            <div class="rp__alert-description">${description ?? ""}</div>
            <div class="rp__alert-badges">${badgesHtml ?? ""}</div>
        </div>
    `;
}
const gameAlertHtml = (gameData) => {
    const { FixedTitle,
        badges,
        ImageIcon,
        totalPoints,
        ConsoleName,
        TotalRetropoints,
        NumAchievements,
        masteryRate,
        beatenRate,
    } = gameData;

    const badgesHtml = `
                ${badgeElements.black(icons.cheevos + NumAchievements)}
                ${badgeElements.black(icons.points + totalPoints)}
                ${badgeElements.black(icons.retropoints + TotalRetropoints)}
                ${badgeElements.black(icons.masteryAward + masteryRate + "%")}
                ${badgeElements.black(icons.progressionAward + beatenRate + "%")}
            `;
    const title = `${FixedTitle} ${generateBadges(badges)}<i class="badge">${ConsoleName}</i>`;

    return alertInnerHtml({ title, badgesHtml, imageUrl: gameImageUrl(ImageIcon) });
}
const cheevoAlertHtml = (cheevo) => {
    const { isHardcoreEarned, Title, Description, BadgeName, Points, TrueRatio, rateEarned, rateEarnedHardcore, difficulty } = cheevo;

    let cheevoBadges = isHardcoreEarned ?
        `
                    ${goldBadge(icons.points + " +" + Points)}
                    ${goldBadge(icons.retropoints + " +" + TrueRatio)}
                    ${goldBadge("TOP" + rateEarnedHardcore)}
                    ${badgeElements.difficultBadge(difficulty)}
                `
        : `
                    ${goldBadge(icons.points + " +" + Points)}
                    ${goldBadge("TOP" + rateEarned)}
                    ${badgeElements.difficultBadge(difficulty)}
                `;

    let genres = cheevo.genres?.map(genre => goldBadge(genre))?.join("\n") ?? "";

    return alertInnerHtml({
        imageUrl: cheevoImageUrl(BadgeName),
        title: Title,
        description: Description,
        badgesHtml: genres + cheevoBadges
    });
}

const awardAlertHtml = (game, award) => {
    const { FixedTitle,
        badges,
        ImageIcon,
        totalPoints,
        earnedStats,
        TotalRetropoints,
        masteryRate,
        beatenRate,
        completedRate,
        beatenSoftRate,
        ID,
        NumAchievements,
        TimePlayed
    } = game;
    // let award = 'mastered';
    const awardRate = award == 'mastered' ? masteryRate :
        award == 'beaten' ? beatenRate :
            award == 'completed' ? completedRate : beatenSoftRate;

    const playTimeInMinutes = deltaTime(TimePlayed);

    let badgesHtml = `
                ${goldBadge(`${award} IN ${playTimeInMinutes}`)}
                ${goldBadge(`TOP${awardRate}%`)}
                ${goldBadge(`${icons.cheevos}${earnedStats.hard.count}/${NumAchievements}`)}
                ${goldBadge(`${icons.points}${earnedStats.hard.points}/${totalPoints}`)}
                ${goldBadge(`${icons.retropoints}${earnedStats.hard.retropoints}/${TotalRetropoints}`)}
            `;
    const title = `${FixedTitle} ${generateBadges(badges)} ${goldBadge("GAINED AWARD")}`;
    return alertInnerHtml({
        imageUrl: gameImageUrl(ImageIcon),
        title,
        badgesHtml
    });
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
export const updateAlertContainer = (alert, container) => {
    switch (alert.type) {
        case alertTypes.GAME:
            // container.innerHTML = gameAlertHtml(alert.value);
            // container.className = "rp__alert-container game-alert show-alert"
            break;
        case alertTypes.CHEEVO:
            container.innerHTML = cheevoAlertHtml(alert.value);
            container.className = "rp__alert-container cheevo-alert show-alert"
            break;
        case alertTypes.AWARD:
            container.innerHTML = awardAlertHtml(alert.value, alert.award);
            container.className = "rp__alert-container award-alert show-alert"
            break;
        case alertTypes.STATS:
            container.innerHTML = statsAlertHtml(alert.value);
            container.className = "rp__alert-container stats-alert show-alert"
            break;
        default:
            break;
    }
}
