import { ui } from "../../../main.js";
const formatStatsLine = (...stats) => [...new Set(stats.filter(v => v))].join(" | ");
export function dailyProgressHtml(userInfo, recentUnlocks) {
    const progressItem = (label, ...values) => {
        const formattedStats = formatStatsLine(...values);
        if (formattedStats) {
            return `
                <li class="daily__item-container">
                    <p class="daily__item">
                        ${label}
                        <span class="daily__value">
                            ${formattedStats}
                        </span>
                    </p>
                </li>
            `
        }
        return ""
    }
    const nowDay = new Date().toLocaleDateString();
    const dailyUnlocks = recentUnlocks.filter(c => new Date(c.Date).toLocaleDateString() == nowDay);
    const unlocksProgress = dailyUnlocks.length;
    const progress = dailyUnlocks.reduce((acc, c) => {
        if (c.HardcoreMode === 1) {
            acc.hardcorePoints += c.Points;
            acc.retroPoints += c.TrueRatio;
            acc.countHardcore++;
        }
        else {
            acc.countCasual++;
            acc.casualPoints += c.Points;
        }
        return acc;
    }, { countHardcore: 0, hardcorePoints: 0, retroPoints: 0, countCasual: 0, casualPoints: 0 });
    if (unlocksProgress) {
        return `
            <div class="daily__container">
                <h2 class="daily__header">Daily progress</h2>
                <ul class="daily__progress-list">
                    ${progressItem("Unlocks", progress.countHardcore, progress.countCasual)}
                    ${progressItem("Points", progress.hardcorePoints, progress.casualPoints)}
                    ${progressItem("Retropoints", progress.retroPoints)}
                </ul>
            </div>
        `;
    }
    return "";
}