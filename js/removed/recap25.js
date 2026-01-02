
import { buttonsHtml } from "../components/htmlElements.js";
import { RAPlatforms } from "../enums/RAPlatforms.js";
import { delay } from "../functions/delay.js";
import { gamesFromJson } from "../functions/gamesJson.js";
import { getGenres } from "../functions/genreIDtoGenre.js";
import { moveEvent } from "../functions/movingWidget.js";
import { cheevoImageUrl } from "../functions/raLinks.js";
import { config, ui, apiWorker, configData } from "../script.js";

export class Recap {
    widgetIcon = {
        description: "2025 review",
        iconID: `side-panel__recap`,
        onChangeEvent: `ui.recap.open()`,
        iconClass: "side-panel_text-icon",
    };
    constructor() {
        this.addWidgetIcon()
    }
    addWidgetIcon() {
        const { iconID, onChangeEvent, description, iconClass } = this.widgetIcon;

        const widgetsContainer = document.querySelector(".buttons-block__shortcuts");
        const widgetIcon = document.createElement("div");
        widgetIcon.classList.add("setting-radio-group");
        widgetIcon.innerHTML = `
                <button id="${iconID}" class="${iconClass}" data-title="${description}" onclick="${onChangeEvent}"}>25</button>
                `;
        widgetsContainer.appendChild(widgetIcon);
        this.widgetIcon.element = document.getElementById(iconID);
    }
    addEvents() {
        const section = document.querySelector("#recap_2025");
        section.addEventListener("mousedown", (event) => {
            event.stopPropagation();

            if (event.target.matches(".recap__page-control")) {
                const isLeft = event.target.matches(".recap__page-control_left");
                const pages = [...section.querySelectorAll(".recap__content-container")];
                const indicators = [...section.querySelectorAll(".recap__indicator")]
                let curPage = pages.findIndex(p => p.classList.contains("focus"));

                pages.forEach(p => p.classList.remove("focus"));
                indicators.forEach(i => i.classList.remove("active"));
                if (isLeft) {
                    curPage = (curPage - 1 + pages.length) % pages.length;
                } else {
                    curPage = (curPage + 1) % pages.length;
                }

                pages[curPage].classList.add("focus");
                indicators[curPage].classList.add("active");
            }
            else if (event.target.matches(".close-icon")) {
                this.close();
            }
            else {
                moveEvent(section, event);
            }
        });
    }
    setValues() {
        const section = document.querySelector("#recap_2025");
        const rect = section.getBoundingClientRect();

        const defPos = {
            x: (window.innerWidth - rect.width) / 2 + "px",
            y: (window.innerHeight - rect.height) / 2 + "px",
        };
        const values = config.ui[section.id] || defPos;
        section.style.left = values.x;
        section.style.top = values.y;

        section.querySelector(".recap__content-container")?.classList.add("focus");
    }
    cardHtml({ title, value }) {
        return `
                <div class="recap__card">
                    <div class="recap__card-header">${title}</div>
                    <div class="recap__card-content">${value}</div>
                </div>
        `;
    }
    cheevosListHtml({ title, cheevosArray }) {
        return `
            <div class="recap__card recap__card_wide">
                    <div class="recap__card-header">${title}</div>
                    <div class="recap__card-content">
                        <ul class="recap__cheevos-list">
                            ${cheevosArray.map(cheevo => `
                                    <li class="recap__cheevo-container" data-title="${cheevo.Description}">
                                        <div class="recap__cheevo-preview">
                                            <img src="${cheevoImageUrl(cheevo)}" alt=""
                                                class="cheevo-icon">
                                        </div>
                                        <div class="recap__cheevo-content">
                                            <h2 class="recap__cheevo-title">${cheevo.Title}</h2>
                                            <p class="recap__cheevo-text">${cheevo.GameTitle}</p>
                                            <p class="recap__cheevo-text">Unlocked ${new Date(cheevo.Date).toLocaleDateString()}</p>
                                            <div class="recap__cheevo-ratio">${(cheevo.TrueRatio / cheevo.Points).toFixed(2)}</div>
                                        </div>
                                    </li>
                                `).join("")}
                        </ul>
                    </div>
                </div>
        `
    }
    async getData(forceUpdate = false) {

        async function getCheevos() {
            let cheevosArr = [];

            let fromDate = (offsetDate) => ~~(new Date(offsetDate ?? "2025-01-01").getTime() / 1000);

            const apiUrl = (date) => `https://retroachievements.org/API/API_GetAchievementsEarnedBetween.php?y=${config.API_KEY}&u=${configData.targetUser || config.USER_NAME}&f=${fromDate(date)}&t=${Math.floor(Date.now() / 1000)}`;

            const getOffsetCheevos = (date) => {
                return fetch(apiUrl(date))
                    .then(r => r.json());
            }
            let cheevos = [];
            let offsetDate = null;
            do {
                cheevos = await getOffsetCheevos(offsetDate);
                cheevosArr = cheevosArr.concat(cheevos);
                offsetDate = cheevos[cheevos.length - 1]?.Date;
                await delay(200);
            } while (cheevos.length === 500);
            const uniqueArray = Array.from(
                new Map(cheevosArr.map(item => [JSON.stringify(item), item])).values()
            );
            return uniqueArray;
        }
        async function getAwards() {
            const awards = await apiWorker.getUserAwards({});
            return awards.VisibleUserAwards?.filter(a => new Date(a.AwardedAt).getFullYear() === 2025) || [];
        }
        async function getCompletion() {
            const fromDate = new Date("2025-01-01T00:00:00");
            const toDate = new Date("2025-12-31T23:59:59");

            const count = 500;
            let offset = 0;

            let completionArr = [];
            let previousLastId = null;

            while (true) {
                const resp = await apiWorker.getUserCompelitionProgress({ count, offset });
                const games = resp?.Results ?? [];
                if (!games || games.length === 0) break;

                completionArr.push(...games);

                const lastId = games.at(-1).ID;
                if (lastId === previousLastId) break;
                previousLastId = lastId;

                const lastAwardDate = new Date(games.at(-1).MostRecentAwardedDate);

                if (lastAwardDate < fromDate) break;

                offset += count;

                await delay(200);
            }

            return completionArr.filter(game => {
                const date = new Date(game.MostRecentAwardedDate);
                return date >= fromDate && date <= toDate;
            });
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
        function rareCheevos(cheevosArray, count) {
            const sortedArray = cheevosArray.filter(c => c.Points > 0).sort((a, b) =>
                b.TrueRatio / b.Points - a.TrueRatio / a.Points
            );
            return sortedArray?.slice(0, count) ?? [];
        }
        function gamesPlayed(arr) {
            return new Set(arr.map(item => item.GameID)).size;
        }
        function gamingStreak(arr) {
            const dates = [...new Set(arr.map(cheevo => cheevo.Date.split(" ")[0]))]
                .sort()
                .map(d => new Date(d));

            let streak = 1;
            let max = 1;

            for (let i = 1; i < dates.length; i++) {
                const diff = (dates[i] - dates[i - 1]) / 86400000;
                if (diff === 1) streak++;
                else if (diff > 1) streak = 1;
                max = Math.max(max, streak);
            }
            return max;
        }
        function masteredCount(arr) {
            return arr.filter(a => a.AwardType === "Mastery/Completion" && a.AwardDataExtra === 1).length;
        }
        function completedCount(arr) {
            return arr.filter(a => a.AwardType === "Mastery/Completion" && a.AwardDataExtra === 0).length;
        }
        function beatenStreak(awards) {
            const beatenArr = awards.filter(({ AwardType, AwardDataExtra }) => AwardType === "Game Beaten" && AwardDataExtra == 1);

            const dates = beatenArr.map(({ AwardedAt }) => AwardedAt)
                .map(d => new Date(d))
                .sort((d1, d2) => d1 - d2);

            let streak = 1;
            let max = 1;

            for (let i = 1; i < dates.length; i++) {
                const prev = dates[i - 1];
                const curr = dates[i];

                const diffMs = curr - prev;
                const diffDays = Math.floor(diffMs / 86400000);


                const nextDay = diffDays === 1;

                if (diffMs <= 86400000 || nextDay) {
                    streak++;
                } else {
                    streak = 1;
                }

                max = Math.max(max, streak);
            }
            return max;
        }
        function masteredStreak(awards) {
            const masteredArr = awards.filter(({ AwardType, AwardDataExtra }) => AwardType === "Mastery/Completion" && AwardDataExtra == 1);

            const dates = masteredArr.map(({ AwardedAt }) => AwardedAt)
                .map(d => new Date(d))
                .sort((d1, d2) => d1 - d2);
            let streak = 1;
            let max = 1;

            for (let i = 1; i < dates.length; i++) {
                const prev = dates[i - 1];
                const curr = dates[i];

                const diffMs = curr - prev;
                const diffDays = Math.floor(diffMs / 86400000);


                const nextDay = diffDays === 1;

                if (diffMs <= 86400000 || nextDay) {
                    streak++;
                } else {
                    streak = 1;
                }

                max = Math.max(max, streak);
            }
            return max;
        }
        function beatenCount(arr) {
            return arr.filter(a => a.AwardType === "Game Beaten" && a.AwardDataExtra === 1).length;
        }
        function beatenSoftCount(arr) {
            return arr.filter(a => a.AwardType === "Game Beaten" && a.AwardDataExtra === 0).length;
        }
        function gamesByPlatform(completion) {
            return completion.reduce((res, game) => {
                const { ConsoleID } = game;
                if (!res[ConsoleID]) {
                    res[ConsoleID] = 0;
                }
                res[ConsoleID]++;
                return res;
            }, {});
        }
        function topPlatform(completion) {
            const allPlatforms = gamesByPlatform(completion); // { ConsoleID: count }
            const topConsoleID = Object.keys(allPlatforms).reduce((max, platform) => {
                if (!max.platform || max.gamesCount < allPlatforms[platform]) {
                    max.platform = platform;
                    max.gamesCount = allPlatforms[platform];
                }
                return max;
            }, { platform: null, gamesCount: 0 }).platform;
            return RAPlatforms[topConsoleID]?.Name;
        }
        function platformCount(completion) {
            return new Set(completion.map(game => game.ConsoleID)).size;
        }
        function cheevosByMonth(cheevosArray) {
            const getMonth = (dateStamp) => new Date(dateStamp).toLocaleString("en-US", { month: "long" });
            //* const monthName = date.toLocaleString("en-US", { month: "long" });
            return cheevosArray.reduce((res, cheevo) => {
                const month = getMonth(cheevo.Date);
                res[month] ??= { month, count: 0, points: 0, retroPoints: 0, softPoints: 0 }
                res[month].count++;
                if (cheevo.HardcoreMode) {
                    res[month].points += cheevo.Points;
                    res[month].retroPoints += cheevo.TrueRatio;
                }
                else {
                    res[month].softPoints += cheevo.Points;
                }

                return res;
            }, {})
        }
        function topMonthData(cheevosArray) {
            const allMonths = cheevosByMonth(cheevosArray);
            const topMonth = Object.keys(allMonths).reduce((max, month) => {
                if (!max.month || max.count < allMonths[month].count) {
                    max.month = month;
                    max.count = allMonths[month].count;
                }
                return max;
            }, { month: null, count: 0 });
            return allMonths[topMonth.month];
        }
        function cheevosByDay(cheevosArray) {
            const getDay = (dateStamp) => new Date(dateStamp).toLocaleString("en-US", { month: "long", day: "numeric" });
            //* const monthName = date.toLocaleString("en-US", { month: "long" });
            return cheevosArray.reduce((res, cheevo) => {
                const day = getDay(cheevo.Date);
                res[day] ??= { day, count: 0, points: 0, retroPoints: 0, softPoints: 0 }
                res[day].count++;
                if (cheevo.HardcoreMode) {
                    res[day].points += cheevo.Points;
                    res[day].retroPoints += cheevo.TrueRatio;
                }
                else {
                    res[day].softPoints += cheevo.Points;
                }

                return res;
            }, {})
        }
        function topDayData(cheevosArray) {
            const allDays = cheevosByDay(cheevosArray);
            const topDay = Object.keys(allDays).reduce((max, day) => {
                if (!max.day || max.count < allDays[day].count) {
                    max.day = day;
                    max.count = allDays[day].count;
                }
                return max;
            }, { day: null, count: 0 });
            return allDays[topDay.day];
        }
        function gamesByGenre(completion, gamesArray) {
            return completion.reduce((res, game) => {
                const { ID } = game;
                const gameData = gamesArray.find(g => g.ID == ID);
                if (gameData && gameData.Genres.length > 0) {
                    const genreIDs = gameData.Genres;
                    const genres = getGenres(genreIDs);
                    genres.forEach(genre => {
                        if (!res[genre]) {
                            res[genre] = 0;
                        }
                        res[genre]++;
                    })
                }
                return res;
            }, {});
        }
        function topGameGenre(completion, games) {
            const allGenres = gamesByGenre(completion, games); // { ConsoleID: count }
            const topGenre = Object.keys(allGenres).reduce((max, genre) => {
                if (!max.genre || max.gamesCount < allGenres[genre]) {
                    max.genre = genre;
                    max.gamesCount = allGenres[genre];
                }
                return max;
            }, { genre: null, gamesCount: 0 }).genre;
            return topGenre;
        }
        if (config._cfg.recap2025 && !forceUpdate) {
            return config._cfg.recap2025;
        }
        else {
            // const cheevosArr = await fetch("cheevos.json")
            //     .then(r => r.json());
            const cheevosArr = await getCheevos();
            const awards = await getAwards();
            const completion = await getCompletion();
            const gamesData = await gamesFromJson();
            const data = {
                cheevosCount: cheevosCount(cheevosArr),
                cheevosCountSoft: cheevosCountSoft(cheevosArr),
                points: points(cheevosArr),
                softPoints: softPoints(cheevosArr),
                retropoints: retropoints(cheevosArr),
                gamesPlayed: gamesPlayed(completion),// || cheevosArr
                // "unlockStreak": 12,
                masteredCount: masteredCount(awards),
                beatenCount: beatenCount(awards),
                beatenSoftCount: beatenSoftCount(awards),
                completedCount: completedCount(awards),
                gamingStreak: gamingStreak(cheevosArr),
                beatenStreak: beatenStreak(awards),
                masteredStreak: masteredStreak(awards),
                topPlatform: topPlatform(completion),
                platformCount: platformCount(completion),
                topMonth: topMonthData(cheevosArr).month,
                monthCheevos: topMonthData(cheevosArr).count,
                monthPoints: topMonthData(cheevosArr).points,
                topDay: topDayData(cheevosArr).day,
                dayCheevos: topDayData(cheevosArr).count,
                dayPoints: topDayData(cheevosArr).points,
                rareCheevos: rareCheevos(cheevosArr, 8),
                topGenre: topGameGenre(completion, gamesData)
            }
            config._cfg.recap2025 = data;
            config.writeConfiguration();
            return data;
        }
    }
    async genContent(forceUpdate = false) {
        const container = document.createElement("section");
        container.className = "recap__container";
        container.id = "recap_2025";
        const data = await this.getData(forceUpdate);

        const genCardsData = (data) => {
            const statsObject = (title, value, valueSoft) => ({
                title,
                value: value,// valueSoft ? `${value} • ${valueSoft}` : value,
            })
            const card1 = [
                statsObject("Games played", data.gamesPlayed),
                statsObject("Games beaten", data.beatenCount, data.beatenSoftCount),
                statsObject("Games mastered", data.masteredCount, data.completedCount),
                statsObject("Achievements unlocked", data.cheevosCount, data.cheevosCountSoft),
                statsObject("Points earned", data.points, data.softPoints),
                statsObject("Retropoints earned", data.retropoints),

                statsObject("Gaming streak, days", data.gamingStreak),
                statsObject("Completion streak", data.beatenStreak),
                statsObject("Mastery streak", data.masteredStreak),
            ];
            const card2 = [
                statsObject("Platforms played", data.platformCount),
                statsObject("Preffered platform", data.topPlatform?.split("/")[0]),
                statsObject("Preffered genre", data.topGenre),
                statsObject("Retromonth", data.topMonth),
                statsObject("Achievements", data.monthCheevos),
                statsObject("Points", data.monthPoints),
                statsObject("Retroday", data.topDay),
                statsObject("Achievements", data.dayCheevos),
                statsObject("Points", data.dayPoints),
            ]
            return [
                card1,
                card2,
            ]
        }
        const cardsData = genCardsData(data);
        // const statisticsArray = makeStatisticsArray(data);
        const cardsHtml = cardsData.map(card => `
                <div class="recap__content-container">
                    ${card.map((title, value) => this.cardHtml(title, value)).join("\n")}
                </div>
            `
        ).join("");
        container.innerHTML = `
        <div class="recap__header">
            <div class="recap__header-content">
                <div class="recap-controls">
                            ${buttonsHtml.reload("ui.recap.forceUpdate()")}
                            ${buttonsHtml.close()}
                        </div>
                <div class="recap__user-name">
                    <img class="recap__header-icon" style="padding: 0.2rem;"
                        src="https://static.retroachievements.org/assets/images/ra-icon.webp" alt="">
                    <img class="recap__header-icon" src="https://media.retroachievements.org/UserPic/${configData.targetUser || config.USER_NAME}.png"
                        alt="">
                    ${configData.targetUser || config.USER_NAME}
                </div>
                <p class="recap__header-text">
                    2025 highlights
                </p>

            </div>
        </div>
        <div class="recap__main-content">
            ${cardsHtml}
            <div class="recap__content-container">
                ${this.cheevosListHtml({ title: "Rarest achievements", cheevosArray: data.rareCheevos })}
            </div>
            <div class="recap__indicator-container">
                <div class="recap__indicator active"></div>
                <div class="recap__indicator"></div>
                <div class="recap__indicator"></div>
            </div>
            <div class="recap__page-control recap__page-control_left">< </div>
            <div class="recap__page-control recap__page-control_right"> </div>

        </div>

        <div class="recap__footer">
            retrocheevos.vercel.app
        </div>
        `;
        document.querySelector(".recap__container")?.remove();
        ui.app.appendChild(container);
        this.addEvents();
        this.setValues();
    }
    open(forceUpdate) {
        const section = document.querySelector("#recap_2025");
        section ? this.close() : this.genContent();
    }
    close() {
        document.querySelector(".recap__container").remove();
    }
    forceUpdate() {
        this.genContent(true);
    }
}