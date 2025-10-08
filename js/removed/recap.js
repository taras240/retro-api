import { UI, GameGenres, generateBadges, generateGenres, icons, badgeElements, signedIcons } from "../../ui.js";
import { config, ui, apiWorker } from "../../script.js";

export class Recap {

    constructor() {

    }
    addEvents() {
        const section = document.querySelector("#recap_2024");
        section.addEventListener("mousedown", (e) => {
            UI.moveEvent(section, e);
        });
    }
    setValues() {
        const section = document.querySelector("#recap_2024");
        const values = config.ui[section.id] || { x: 0, y: 0 };
        section.style.left = values.x;
        section.style.top = values.y;
    }
    cardHtml({ prefix, value, postfix }) {
        return `
            <div class="recap__card">
                <div class="recap__card-title">
                    ${prefix}
                </div>
                <div class="recap__card-value">
                    ${value}
                </div>
                <div class="recap__card-description">${postfix ?? ""}</div>
            </div>
        `;
    }
    async getData() {
        async function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function getCheevos() {
            let cheevosArr = [];

            let fromDate = (offsetDate) => ~~(new Date(offsetDate ?? "2024-01-01").getTime() / 1000);

            const apiUrl = (date) => `https://retroachievements.org/API/API_GetAchievementsEarnedBetween.php?y=${config.API_KEY}&u=${config.USER_NAME}&f=${fromDate(date)}&t=1735603200`;

            const getOffsetCheevos = (date) => {
                return fetch(apiUrl(date))
                    .then(r => r.json());
            }
            let cheevos = [];
            let offsetDate = null;
            do {
                cheevos = await getOffsetCheevos(offsetDate);
                cheevosArr = cheevosArr.concat(cheevos);
                offsetDate = cheevos[cheevos.length - 1].Date;
                await delay(200);
            } while (cheevos.length === 500);
            const uniqueArray = Array.from(
                new Map(cheevosArr.map(item => [JSON.stringify(item), item])).values()
            );
            return uniqueArray;
        }
        async function getAwards() {
            const awards = await apiWorker.getUserAwards({});
            return awards.VisibleUserAwards.filter(a => new Date(a.AwardedAt).getFullYear() === 2024);

        }
        function cheevosCount(arr) {
            return arr.filter(cheevo => cheevo.HardcoreMode === 1).length;
        }
        function cheevosCountSoft(arr) {
            return arr.filter(cheevo => cheevo.HardcoreMode === 0).length;
        }
        function points(arr) {
            return arr.reduce((acc, cheevo) => acc + (cheevo.HardcoreMode === 1 ? cheevo.Points : 0), 0);
        }
        function softPoints(arr) {
            return arr.reduce((acc, cheevo) => acc + (cheevo.HardcoreMode === 0 ? cheevo.Points : 0), 0);
        }
        function retropoints(arr) {
            return arr.reduce((acc, cheevo) => acc + (cheevo.HardcoreMode === 1 ? cheevo.TrueRatio : 0), 0);
        }
        function gamesPlayed(arr) {
            return new Set(arr.map(item => item.GameID)).size;
        }

        function masteredCount(arr) {
            return arr.filter(a => a.AwardType === "Mastery/Completion" && a.AwardDataExtra === 1).length;
        }
        function completedCount(arr) {
            return arr.filter(a => a.AwardType === "Mastery/Completion" && a.AwardDataExtra === 0).length;
        }

        function beatenCount(arr) {
            return arr.filter(a => a.AwardType === "Game Beaten" && a.AwardDataExtra === 1).length;
        }
        function beatenSoftCount(arr) {
            return arr.filter(a => a.AwardType === "Game Beaten" && a.AwardDataExtra === 0).length;
        }
        let data = {};
        if (config._cfg.recap2024) {
            return config._cfg.recap2024;
        }
        else {
            // const cheevosArr = await fetch("cheevos.json")
            //     .then(r => r.json());
            const cheevosArr = await getCheevos();
            const awards = await getAwards();

            const data = {
                "cheevosCount": cheevosCount(cheevosArr),
                "cheevosCountSoft": cheevosCountSoft(cheevosArr),
                "points": points(cheevosArr),
                "softPoints": softPoints(cheevosArr),
                "retropoints": retropoints(cheevosArr),
                "gamesPlayed": gamesPlayed(cheevosArr),
                // "unlockStreak": 12,
                "masteredCount": masteredCount(awards),
                "beatenCount": beatenCount(awards),
                "beatenSoftCount": beatenSoftCount(awards),
                "completedCount": completedCount(awards),
            }
            config._cfg.recap2024 = data;
            config.writeConfiguration();
            return data;
        }
    }
    async genContent() {
        const container = document.createElement("section");
        container.className = "recap__container";
        container.id = "recap_2024";
        const data = await this.getData();
        const makeStatisticsArray = (data) => {
            const statsObject = (prefix, postfix, value) => ({
                prefix: prefix,
                postfix: postfix,
                value: value
            })
            const arr = [
                statsObject("Played", "games", data.gamesPlayed),

                statsObject("Unlocked", "cheevos", data.cheevosCount),
                statsObject("Unlocked (soft)", "cheevos", data.cheevosCountSoft),

                statsObject("Earned", "points", data.points),
                statsObject("Earned", "softpoints", data.softPoints),
                statsObject("Earned", "retropoints", data.retropoints),

                statsObject("Mastered", "games", data.masteredCount),
                statsObject("Completed", "games", data.completedCount),
                statsObject("Beaten", "games", data.beatenCount),
                statsObject("Beaten (Soft)", "games", data.beatenSoftCount),
            ];

            return arr;
        }
        const statisticsArray = makeStatisticsArray(data);
        const contentHtml = statisticsArray.reduce((res, prop) => {
            prop.value > 0 && (res += this.cardHtml(prop));
            return res;
        }, "");
        container.innerHTML = `
            <div class="recap__header-container">
                <div class="recap__header-title"> 2024 User Statistics</div>
                <button class="header-button header-icon close-icon" onclick="ui.recap.close()">
        </button>
            </div>
            <div class="recap__content">${contentHtml}</div>
        `;
        ui.app.appendChild(container);
        this.addEvents();
        this.setValues();
    }
    open() {
        const section = document.querySelector("#recap_2024");
        section ? this.close() : this.genContent();
    }
    close() {
        document.querySelector(".recap__container").remove();
    }
}