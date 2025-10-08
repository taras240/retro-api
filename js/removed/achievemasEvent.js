import { UI, GameGenres, PlatformIcons, generateBadges, generateGenres, icons, badgeElements, signedIcons } from "../ui.js";
import { config, ui, apiWorker } from "../script.js";

export class AchievemasEvent {
    get VISIBLE() {
        return !this.section.classList.contains("hidden");
    }
    set VISIBLE(value) {
        // value = true;
        UI.switchSectionVisibility({ section: this.section, visible: value })
        this.widgetIcon && (this.widgetIcon.checked = value);
    }
    constructor() {
        this.initializeElements();
        this.addEvents();
        config.ui[this.section.id] && UI.applyPosition({ widget: this });
        this.loadData();
    }
    initializeElements() {
        this.section = document.querySelector(".achievemas__section");
        this.listElement = this.section.querySelector(".achievemas__games-list");
        this.eventPointsElement = this.section.querySelector(".achievemas-points__header");
        this.section.classList.add("expanded");
        setTimeout(() => this.section.classList.remove("expanded"), 2000)
    }
    addEvents() {

        this.section.addEventListener("mousedown", () => {
            !this.VISIBLE && (this.VISIBLE = true);

        });
        document.addEventListener("mousemove", (e) => {
            const xPos = e.clientX;
            if (window.innerWidth - xPos < 10) {
                // Якщо так, показуємо панель
                this.section.classList.add("expanded");
                this.section.addEventListener("mouseleave", (e) => {
                    setTimeout(
                        () => this.section.classList.remove("expanded"),
                        200
                    );
                });
            }
        });
    }
    async loadData() {
        this.listElement.innerHTML = "";
        this.eventPointsElement.innerHTML = `Earn 15 trophies to get the event reward!`;

        this.totalEventPoints = this.userAwards?.length || 0;

        achievemasGames
            .sort((a, b) => UI.sortBy.date(a, b))
            .forEach(game => {
                const gameAwardsCount = this.userAwards?.filter(({ AwardData }) => AwardData == game.ID)?.length || 0;
                const gameElement = `
                    <li class="achievemas-game__container ${gameAwardsCount === 2 ? "mastered" : gameAwardsCount === 1 ? "beaten" : ""}" data-id="${game.ID}">
                        <div class="achievemas-game__preview-container">
                            <img src="https://media.retroachievements.org${game.ImageIcon}" alt=""
                                class="achievemas-game__preview">
                        </div>
                        <div class="achievemas-game__description-container">
                            <div class="achievemas-game__title"><a target="_blanc" data-title="go to RA game-page" href="https://retroachievements.org/game/${game.ID}">
                    ${game.FixedTitle}</a></div>
                            <div class="achievemas-game__description">${PlatformIcons[game.ConsoleID]?.Name}</div>
                            <div class="achievemas-game__description">${(new Date(game.Date)).toLocaleDateString()}</div>
                        </div>
                    </li>
                `;
                this.listElement.innerHTML += gameElement;

            })
    }
    async update(awardsResp) {
        const eventProgress = (earnedCount) => {
            if (earnedCount == 0)
                return `Earn 15 trophies to get the event reward!`;
            if (earnedCount < 15)
                return `You’ve earned ${earnedCount} game troph${earnedCount === 1 ? "y" : "ies"}. Another ${15 - earnedCount} to get the event reward!`;
            if (earnedCount >= 15)
                return `Congratulations! With ${earnedCount} game trophies, the event reward is yours!`;
        }

        awardsResp || (awardsResp = await apiWorker.getUserAwards({}));

        this.userAwards = awardsResp
            ?.VisibleUserAwards
            ?.filter(({ AwardDataExtra, AwardData }) => AwardDataExtra === 1 && achievemasGames.find(({ ID }) => ID === AwardData));
        this.totalEventPoints = this.userAwards.length;
        const gameElements = this.listElement.querySelectorAll(".achievemas-game__container");
        gameElements.forEach(el => {
            const trophiesCount = this.userAwards
                .filter(a => a.AwardData == el.dataset.id)
                .length;
            el.classList.toggle("beaten", trophiesCount === 1);
            el.classList.toggle("mastered", trophiesCount === 2);
        });
        this.eventPointsElement.innerHTML = eventProgress(this.totalEventPoints);
    }
    close() {
        this.VISIBLE = false;
    }
}
const achievemasGames = [
    {
        "FixedTitle": "Santa Claus Junior",
        "badges": [],
        "ID": 7146,
        "ConsoleID": 6,
        "ImageIcon": "/Images/078146.png",
        "NumAchievements": 31,
        "Points": 445,
        "Date": "2001-11-01",
        "Coop": "false",
        "Rating": 71,
        "Genres": [
            5
        ]
    },
    {
        "FixedTitle": "Home Alone",
        "badges": [],
        "ID": 1737,
        "ConsoleID": 7,
        "ImageIcon": "/Images/063204.png",
        "NumAchievements": 11,
        "Points": 82,
        "Date": "1991-10-01",
        "Coop": "false",
        "Rating": 47,
        "Genres": [
            6
        ]
    },
    {
        "FixedTitle": "Batman Returns",
        "badges": [],
        "ID": 1569,
        "ConsoleID": 7,
        "ImageIcon": "/Images/011645.png",
        "NumAchievements": 26,
        "Points": 330,
        "Date": "1993-01-01",
        "Coop": "false",
        "Rating": 74,
        "Genres": [
            16
        ],
        "NumAwardedHardcore": 4,
        "Award": "started",
        "MostRecentAwardedDate": "2024-07-02T14:17:10+00:00"
    },
    {
        "FixedTitle": "Elf: The Movie",
        "badges": [],
        "ID": 7128,
        "ConsoleID": 5,
        "ImageIcon": "/Images/049698.png",
        "NumAchievements": 19,
        "Points": 90,
        "Date": "2004-11-04",
        "Coop": "false",
        "Rating": 45,
        "Genres": [
            5
        ]
    },
    {
        "FixedTitle": "Monopoly",
        "badges": [],
        "ID": 11188,
        "ConsoleID": 4,
        "ImageIcon": "/Images/059502.png",
        "NumAchievements": 35,
        "Points": 134,
        "Date": "1991-12-20",
        "Coop": "false",
        "Rating": 65,
        "Genres": [
            20
        ]
    },
    {
        "FixedTitle": "Elf Bowling 1 & 2",
        "badges": [],
        "ID": 6101,
        "ConsoleID": 5,
        "ImageIcon": "/Images/063150.png",
        "NumAchievements": 10,
        "Points": 110,
        "Date": "2005-11-28",
        "Coop": "false",
        "Rating": 54,
        "Genres": [
            13
        ]
    },
    {
        "FixedTitle": "Nickelodeon Party Blast",
        "badges": [],
        "ID": 25459,
        "ConsoleID": 16,
        "ImageIcon": "/Images/089273.png",
        "NumAchievements": 32,
        "Points": 200,
        "Date": "2002-11-20",
        "Coop": "",
        "Rating": 0
    },
    {
        "FixedTitle": "The Grinch",
        "badges": [],
        "ID": 13964,
        "ConsoleID": 12,
        "ImageIcon": "/Images/087334.png",
        "NumAchievements": 14,
        "Points": 270,
        "Date": "2000-11-10",
        "Coop": "false",
        "Rating": 54,
        "Genres": [
            5,
            6
        ]
    },
    {
        "FixedTitle": "Banjo-Kazooie",
        "badges": [],
        "ID": 10210,
        "ConsoleID": 2,
        "ImageIcon": "/Images/091553.png",
        "NumAchievements": 60,
        "Points": 486,
        "Date": "1998-06-29",
        "Coop": "false",
        "Rating": 89,
        "Genres": [
            17,
            6,
            7
        ]
    },
    {
        "FixedTitle": "The Polar Express",
        "badges": [],
        "ID": 7159,
        "ConsoleID": 5,
        "ImageIcon": "/Images/047837.png",
        "NumAchievements": 24,
        "Points": 140,
        "Date": "2004-11-02",
        "Coop": "false",
        "Rating": 42,
        "Genres": [
            17
        ]
    },
    {
        "FixedTitle": "Donald Duck: Goin' Quackers",
        "badges": [],
        "ID": 20063,
        "ConsoleID": 21,
        "ImageIcon": "/Images/060615.png",
        "NumAchievements": 62,
        "Points": 446,
        "Date": "2000-12-13",
        "Coop": "false",
        "Rating": 74,
        "Genres": [
            5,
            6
        ]
    },
    {
        "FixedTitle": "Daze Before Christmas",
        "badges": [],
        "ID": 1439,
        "ConsoleID": 1,
        "ImageIcon": "/Images/063153.png",
        "NumAchievements": 27,
        "Points": 265,
        "Date": "1994-11-01",
        "Coop": "false",
        "Rating": 77,
        "Genres": [
            5,
            6
        ]
    },
    {
        "FixedTitle": "Snow Bros.",
        "badges": [],
        "ID": 583,
        "ConsoleID": 1,
        "ImageIcon": "/Images/064810.png",
        "NumAchievements": 11,
        "Points": 110,
        "Date": "1993-05-28",
        "Coop": "false",
        "Rating": 79,
        "Genres": [
            5
        ]
    },
    {
        "FixedTitle": "Wacky Races",
        "badges": [],
        "ID": 2062,
        "ConsoleID": 7,
        "ImageIcon": "/Images/050157.png",
        "NumAchievements": 24,
        "Points": 170,
        "Date": "1991-12-25",
        "Coop": "false",
        "Rating": 69,
        "Genres": [
            6
        ]
    },
    {
        "FixedTitle": "Mario & Sonic at the Olympic Winter Games",
        "badges": [],
        "ID": 14813,
        "ConsoleID": 18,
        "ImageIcon": "/Images/069064.png",
        "NumAchievements": 239,
        "Points": 1300,
        "Date": "2009-10-13",
        "Coop": "false",
        "Rating": 74,
        "Genres": [
            13
        ]
    },
    {
        "FixedTitle": "Taz-Mania",
        "badges": [],
        "ID": 233,
        "ConsoleID": 1,
        "ImageIcon": "/Images/077493.png",
        "NumAchievements": 38,
        "Points": 450,
        "Date": "1992-07-01",
        "Coop": "false",
        "Rating": 66,
        "Genres": [
            6
        ]
    },
    {
        "FixedTitle": "Diddy Kong Racing",
        "ID": 10202,
        "ConsoleID": 2,
        "ImageIcon": "/Images/040625.png",
        "NumAchievements": 93,
        "Points": 667,
        "ForumTopicID": 4671,
        "badges": [],
        "Date": "1997-11-24",
    },
    {
        "FixedTitle": "Holiday Hex",
        "ID": 20565,
        "ConsoleID": 3,
        "ImageIcon": "/Images/064294.png",
        "NumAchievements": 15,
        "Points": 72,
        "ForumTopicID": 19136,
        "badges": ["Hack"],
        "Date": "2013-01-02",
    },
    {
        "FixedTitle": "South Park",
        "badges": [],
        "ID": 10328,
        "ConsoleID": 2,
        "ImageIcon": "/Images/088517.png",
        "NumAchievements": 54,
        "Points": 303,
        "Date": "1998-12-21",
        "Coop": "false",
        "Rating": 63,
        "Genres": [
            9
        ]
    },
    {
        "FixedTitle": "Paper Mario",
        "badges": [],
        "ID": 10154,
        "ConsoleID": 2,
        "ImageIcon": "/Images/041428.png",
        "NumAchievements": 87,
        "Points": 840,
        "Date": "2000-08-11",
        "Coop": "false",
        "Rating": 88,
        "Genres": [
            14
        ]
    },
    {
        "FixedTitle": "Christmas NiGHTS into Dreams...",
        "badges": [
            "Demo"
        ],
        "ID": 14531,
        "ConsoleID": 39,
        "ImageIcon": "/Images/049758.png",
        "NumAchievements": 14,
        "Points": 92,
        "Date": "1996-11-22",
        "Coop": "false",
        "Rating": 83,
        "Genres": [
            6
        ]
    },
    {
        "FixedTitle": "Snatcher",
        "badges": [],
        "ID": 10067,
        "ConsoleID": 9,
        "ImageIcon": "/Images/030095.png",
        "NumAchievements": 66,
        "Points": 500,
        "Date": "1994-12-01",
        "Coop": "false",
        "Rating": 88,
        "Genres": [
            17,
            9
        ]
    },
    {
        "FixedTitle": "Parasite Eve",
        "badges": [],
        "ID": 11277,
        "ConsoleID": 12,
        "ImageIcon": "/Images/029788.png",
        "NumAchievements": 64,
        "Points": 665,
        "Date": "1998-03-29",
        "Coop": "false",
        "Rating": 87,
        "Genres": [
            25,
            14
        ]
    },
    {
        "FixedTitle": "James Pond II - Codename: RoboCod",
        "badges": [],
        "ID": 29,
        "ConsoleID": 1,
        "ImageIcon": "/Images/010857.png",
        "NumAchievements": 27,
        "Points": 315,
        "Date": "1991-08-18",
        "Coop": "false",
        "Rating": 74,
        "Genres": [
            5,
            6
        ]
    },
    {
        "FixedTitle": "Die Hard Trilogy",
        "badges": [],
        "ID": 11392,
        "ConsoleID": 12,
        "ImageIcon": "/Images/080512.png",
        "NumAchievements": 76,
        "Points": 587,
        "Date": "1996-09-18",
        "Coop": "false",
        "Rating": 79,
        "Genres": [
            5,
            15,
            9
        ]
    }
]