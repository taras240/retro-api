import { fromHtml } from "../../../../../js/functions/html.js";
import { cheevoImageUrl } from "../../../../../js/functions/raLinks.js";
import { ui } from "../../../main.js"
import { svgIcons } from "../../components/svgIcons.js"

/* cheevo
    {
    "ID": 307869,
    "GameID": 3490,
    "GameTitle": "Bangai-O",
    "Title": "The Planet Dan Star",
    "Description": "Clear Level-01.",
    "Points": 1,
    "Type": "progression",
    "BadgeName": "340584",
    "IsAwarded": "1",
    "DateAwarded": "Mon Jun 10 2024 21:54:55 GMT+0300 (за східноєвропейським літнім часом)",
    "HardcoreAchieved": 1
    }
  */
export function recentCheevoHtml(cheevo, gameData = {}) {
    const {
        Title,
        Description,
        ID,
        GameID,
        HardcoreAchieved,
        IsAwarded,
        DateEarned,
        BadgeName,
        Points,
        DateEarnedHardcore
    } = cheevo;
    const unlockClass = (HardcoreAchieved || DateEarned) ? 'unlocked' : 'locked';
    const element = fromHtml(`
                    <div class="achievement ${unlockClass}">
                        <div class="ach-icon">
                            <img class="ach-img" src="${cheevoImageUrl({ BadgeName })}"/>
                        </div>
                        <div class="ach-info">
                            <div class="ach-name">${Title}</div>
                            <div class="ach-desc">${Description}</div>
                        </div>
                        <div class="ach-points">${Points}</div>
                    </div>
                `);
    // element.addEventListener("click", (event) => {
    //     event.stopPropagation();
    //     ui.showAchivDetails(cheevo.ID, gameData.ID);
    //     console.log(gameData);
    // })
    return `
                    <div class="achievement ${unlockClass}" onclick="ui.showAchivDetails(${ID}, ${GameID}); event.stopPropagation()">
                        <div class="ach-icon">
                            <img class="ach-img" src="${cheevoImageUrl({ BadgeName })}"/>
                        </div>
                        <div class="ach-info">
                            <div class="ach-name">${Title}</div>
                            <div class="ach-desc">${Description}</div>
                        </div>
                        <div class="ach-points">${Points}</div>
                    </div>
                `;
    return `
        <li class="user-info__cheevo-container">
            <div class="user-info__cheevo-title-container" 
                onclick="ui.showAchivDetails(${ID}, ${GameID}); event.stopPropagation()">
                <div class="user-info__cheevo-preview-container">
                    <img class="user-info__cheevo-preview ${HardcoreAchieved || (ui.isSoftmode && IsAwarded) ? "earned" : ""}"
                        src="${cheevoImageUrl({ BadgeName })}">
                </div>
                <div class="user-info__cheevo-descriptions">
                    <h2 class="user-info__cheevo-title">${Title}</h2>
                    <p class="user-info__cheevo-description">${Description}</p>
                    <div class="user-info__cheevo-stats-container">
                        <p class="user-info__cheevo-stats-text points">
                        ${svgIcons.points} ${Points} Points</p>
                        <p class="game-stats__text cheevo-stats__unlocked">${getDeltaTime(DateEarned)}</p>
                    </div>
                </div>
            </div>
        </li>`
}

export function recentCheevosListHtml({ lastAchievements }) {
    return lastAchievements.reduce((elements, achievement) => {
        const achievementHtml = recentCheevoHtml(achievement);
        elements += achievementHtml;
        return elements;
    }, "");
}
const getDeltaTime = (dateString) => {
    const date = new Date(dateString);
    const time = date.getTime();
    const now = Date.now();
    const deltaMin = Math.round((now - date) / 6e4);

    if (deltaMin < 2) return "just now";
    if (deltaMin < 60) return deltaMin + " minutes ago";
    const deltaH = Math.round(deltaMin / 60);
    if (deltaH < 24) return deltaH + " hours ago";
    else return date.toLocaleString();

    const deltaDays = Math.round(deltaH / 24);
    if (deltaDays < 2) return "yesterday";
    if (deltaDays < 7) return deltaDays + " days ago";

    const deltaWeeks = Math(deltaDays / 7);
    if (deltaWeeks < 2) return "last week";

    if (deltaWeeks < 5) return "few weeks ago";
}