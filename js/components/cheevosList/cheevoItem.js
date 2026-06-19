import { fromHtml } from "../../functions/html.js";
import { cheevoImageUrl, cheevoUrl } from "../../functions/raLinks.js";
import { secondsToBadgeString } from "../../functions/time.js";
import { ui } from "../../script.js";
import { badgeElements } from "../badges.js";
import { buttonsHtml } from "../htmlElements.js";
import { genreIcons, icons, signedIcons } from "../icons.js";

const getLevelLabel = ({ level, zone }) => {
    const subLevel = level?.toString()?.split(".")[1];

    if (zone) {
        return subLevel ? `${zone} - ${subLevel}` : zone;
    }

    return level?.toString()?.replace(".", "-");
};

const buildGenresBadges = (genres = []) => genres.map(genre => badgeElements.buttonGenreBadge(genre)).join("");

const buildGenreIcons = (genres = []) => genres.map(genre => genreIcons[genre]).join("");

const buildIconsRow = achievement => [
    icons.cheevoType(achievement.Type),
    signedIcons.points(achievement.Points),
    signedIcons.retropoints(achievement.TrueRatio),
    achievement.timeToUnlock ? signedIcons.time(secondsToBadgeString(achievement.timeToUnlock, true)) : "",
    signedIcons.rarity(achievement.rateEarnedHardcore),
    signedIcons.retroRatio(achievement.retroRatio),
    badgeElements.difficultBadge(achievement.difficulty),
].join("");

const applyClasses = (element, achievement, uiProps) => {
    element.classList.add("border", "overlay", "show-difficult");
    element.classList.toggle("show-level", uiProps.showLevel);
    element.classList.toggle("show-genre", uiProps.showGenre);
    element.classList.toggle("earned", achievement.isEarned);
    element.classList.toggle("hardcore", achievement.isEarnedHardcore);
    element.classList.toggle("rare", achievement.trend <= 3);
};

const applyDataAttributes = (element, achievement) => {
    const attributes = {
        Type: achievement.Type,
        Points: achievement.Points,
        TrueRatio: achievement.TrueRatio,
        difficulty: achievement.difficulty,
        DisplayOrder: achievement.DisplayOrder,
        customOrder: achievement.customOrder,
        genres: achievement.genres?.join(","),
        group: achievement.group,
        setID: achievement.gameID,
        NumAwardedHardcore: achievement.NumAwardedHardcore,
        achivId: achievement.ID,
        timeToUnlock: achievement.timeToUnlock,
    };

    Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            element.dataset[key] = value;
        }
    });

    if (achievement.DateEarnedHardcore) {
        element.dataset.DateEarnedHardcore = achievement.DateEarnedHardcore;
    }

    if (achievement.DateEarned) {
        element.dataset.DateEarned = achievement.DateEarned;
    }

    if (achievement.level) {
        element.dataset.level = achievement.level;
    }

    const progression = achievement.totalPlayers ? (100 * achievement.NumAwardedHardcore / achievement.totalPlayers) : 0;
    element.style.setProperty("--progression", `${progression}%`);
};

export function CheevoElement(achievement, uiProps) {
    const level = getLevelLabel(achievement);
    const levelBadgeHtml = level ? badgeElements.cheevoLevel(level, true) : "";
    const genresBadgesHtml = buildGenresBadges(achievement.genres);

    const cheevoElement = fromHtml(`
        <li class="target-achiv main-column-item right-bg-icon">
            <div class="target__cheevo-bg"></div>
            <div class="target__buttons-container">
                ${buttonsHtml.comments()}
                ${buttonsHtml.pin()}
            </div>
            <div class="prev">
                <div class="prev-bg"></div>
                <img class="prev-img" src="${cheevoImageUrl(achievement)}" />
                <div class="prev-lock-overlay"></div>
                <div class="box-inner-shadow"></div>
                <div class="target__cheevo-progression-container">
                    <div class="target__cheevo-progression"></div>
                </div>
            </div>
            <div class="target__cheevo-details">
                <h3 class="target__cheevo-header">
                    <a target="_blanc" data-title="${ui.lang.goToRAHint}" href="${cheevoUrl(achievement)}">
                        ${achievement.Title}
                    </a>
                    ${levelBadgeHtml}${genresBadgesHtml}
                </h3>
                <p class="list-item__text">${achievement.Description}</p>
                <div class="icons-row-list">
                    ${buildIconsRow(achievement)}
                </div>
            </div>
        </li>
    `);

    applyClasses(cheevoElement, achievement, uiProps);
    applyDataAttributes(cheevoElement, achievement);

    return cheevoElement;
}
