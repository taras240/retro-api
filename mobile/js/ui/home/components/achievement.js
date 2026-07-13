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
export function recentCheevoElement(cheevo, gameData) {
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
    gameData ??= { ID: GameID }
    const unlockClass = (HardcoreAchieved || DateEarned) ? 'unlocked' : 'locked';
    const element = fromHtml(`
                    <div class="list-item achievement ${unlockClass}">
                        <div class="ach-icon">
                            <img class="ach-img" src="${cheevoImageUrl({ BadgeName })}"/>
                        </div>
                        <div class="item-meta">
                            <div class="ach-name">${Title}</div>
                            <div class="ach-desc">${Description}</div>
                            <div class="game-stats__text cheevo-stats__unlocked">${getDeltaTime(DateEarned)}</div>

                        </div>
                        <div class="ach-points">${Points}</div>
                    </div>
                `);
    element.addEventListener("click", (event) => {
        event.stopPropagation();
        ui.showAchivDetails(cheevo.ID, gameData?.ID);
        console.log(cheevo);
    })
    return element;
}

export function recentCheevosElements({ lastAchievements }) {
    return lastAchievements.map(cheevo => recentCheevoElement(cheevo));
}
const getDeltaTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
    const time = date.getTime();
    const now = Date.now();
    const deltaMin = Math.round((now - date) / 6e4);

    if (deltaMin < 2) return "just now";
    if (deltaMin < 60) return deltaMin + " minutes ago";
    const deltaH = Math.round(deltaMin / 60);
    if (deltaH < 24) return deltaH + " hours ago";

    const deltaDays = Math.round(deltaH / 24);
    if (deltaDays < 2) return "yesterday";
    if (deltaDays < 7) return deltaDays + " days ago";

    const deltaWeeks = Math(deltaDays / 7);
    if (deltaWeeks < 2) return "last week";

    if (deltaWeeks < 5) return "few weeks ago";
}