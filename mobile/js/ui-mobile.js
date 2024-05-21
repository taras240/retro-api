class UI {
    routes = {
        '/': async () => {
            config.identConfirmed ?
                this.home = new Home() : content.innerHTML = await Login();
        },
        '/login': async () => {
            content.innerHTML = "";
            content.append(await Login());
        },
        '/home': () => {
            this.home = new Home();
        },
    };

    goto = {
        "home": () => {
            history.pushState(null, null, "#/home");
            this.updatePage();
        },
        "login": () => {
            history.pushState(null, null, "#/login");
            this.updatePage();

        }
    }
    constructor() {
        this.sectionContainer = document.querySelector(".section-container");
        // this.home = new Home();
        this.app = document.getElementById('app');
        this.content = document.getElementById('content');


        window.addEventListener('hashchange', () => {
            this.updatePage();
        });

        // Ініціалізація
        window.addEventListener('DOMContentLoaded', () => {
            window.dispatchEvent(new Event('hashchange'));
        });
    }
    updatePage() {
        const hash = window.location.hash.substring(1);
        const route = this.routes[hash] || this.routes['/'];
        route();
    }
}
class Home {
    USER_INFO = {};
    constructor() {
        this.update();
    }

    update() {
        apiWorker.getUserSummary({})
            .then(resp => {
                const { User, Status, RichPresenceMsg, MemberSince,
                    UserPic, Rank, TotalRanked, TotalPoints, TotalSoftcorePoints,
                    TotalTruePoints, RecentlyPlayed, NumPossibleAchievements, NumAchievedHardcore } = resp;
                this.USER_INFO.userName = User;
                this.USER_INFO.status = Status.toLowerCase();
                this.USER_INFO.richPresence = RichPresenceMsg;
                this.USER_INFO.memberSince = MemberSince;
                this.USER_INFO.userImageSrc = `https://media.retroachievements.org${UserPic}`;
                this.USER_INFO.userRank = `${Rank} (Top ${~~(10000 * Rank / TotalRanked) / 100}%)`;
                this.USER_INFO.softpoints = TotalSoftcorePoints;
                this.USER_INFO.retropoints = TotalTruePoints;
                this.USER_INFO.hardpoints = TotalPoints;
                this.USER_INFO.lastGames = RecentlyPlayed;

            })
            .then(() => this.generateSection())
    }

    expandRecentGame(gameID) {
        const getRecentGame = (gameID) => {
            const achivsContainer = document.createElement("div");
            achivsContainer.classList.add("user-info__game-achivs-container");

            const achivsList = document.createElement("ul");
            achivsList.classList.add("user-info__game-achivs-list");

            achivsContainer.appendChild(achivsList);
            apiWorker
                .getGameProgress({ gameID: gameID })
                .then(gameObj => {
                    Object.values(gameObj.Achievements).forEach(achiv => {
                        achivsList.innerHTML += this.generateAchivElement(achiv);
                    })
                }).then(() => targetGameElement.appendChild(achivsContainer))
        }
        const targetGameElement = document
            .querySelector(`.user-info__last-game-container[data-id='${gameID}'`);

        targetGameElement.classList.toggle("expanded");
        targetGameElement.querySelector(".user-info__game-achivs-container") ?? (getRecentGame(gameID))
    }

    generateSection() {
        const homeSection = document.createElement("section");
        homeSection.classList.add("home__section");
        homeSection.innerHTML = `
        <div class="user-info__container">
            <div class="user-info__header">
                <div class="user-info__avatar-container">
                    <img src="${this.USER_INFO.userImageSrc}" alt="" class="user-info__avatar">
                </div>
                <div class="user-info__user-name-container">
                    <h1 class="user-info__user-name">${this.USER_INFO.userName}</h1>
                    <div class="user-info__user-rank">RANK: ${this.USER_INFO.userRank}</div>
                    <div class="user-info__rich-presence">Member since: ${this.USER_INFO.memberSince}</div>
                </div>
            </div>

            <div class="user-info__rich-presence"> ${this.USER_INFO.richPresence}</div>
            <div class="user-info__points-container">
                <div class="user-info__points-group">
                    <h3 class="user-info__points-name">softpoints</h3>
                    <p class="user-info__points">${this.USER_INFO.softpoints}</p>
                </div>

                <div class="vertical-line"></div>
                <div class="user-info__points-group">
                    <h3 class="user-info__points-name">hardpoints</h3>
                    <p class="user-info__points">${this.USER_INFO.hardpoints}</p>

                </div>
                <div class="vertical-line"></div>
                <div class="user-info__points-group">
                    <h3 class="user-info__points-name">retropoints</h3>
                    <p class="user-info__points">${this.USER_INFO.retropoints}</p>

                </div>
            </div>
            <h2 class="user-info__block-header">Last played</h2>
            <ul class="user-info__last-games-list">
                ${this.USER_INFO.lastGames.reduce((elements, game) => {
            const gameHtml = this.generateGameElement(game);
            elements += gameHtml;
            return elements;
        }, "")}
            </ul>
        </div>
        `;
        ui.content.innerHTML = '';
        ui.content.append(homeSection);
    }
    generateGameElement(game) {
        return `    
            <li class="user-info__last-game-container" data-id="${game.GameID}">
                <div class="user-info__game-main-info">
                    <div class="user-info__game-preview-container">
                        <img class="user-info__game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
                    </div>
                    <div class="user-info__game-description">
                        <h2 class="user-info__game-title">${game.Title}</h2>
                        <div class="user-info_game-stats-container">
                            <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"></i>
                            <div class="game-stats__text">${game.NumAchievedHardcore} / ${game.NumPossibleAchievements}</div>
                            </div>
                            <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"></i>
                            <div class="game-stats__text">${game.ScoreAchievedHardcore} / ${game.PossibleScore}</div>
                            </div>
                            <button  class="game-stats__button" onclick="ui.home.expandRecentGame(${game.GameID})">
                                <i class="game-stats__icon game-stats__expand-icon"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        `;
    }
    generateAchivElement(achiv) {

        return `    
            <li class="user-info__achiv-container">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${achiv.isHardcoreEarned && "earned"}" src="${achiv.prevSrc}" alt="">
                </div>
                <div class="user-info__achiv-description">
                    <h2 class="user-info__game-title">${achiv.Title}</h2>
                    <div class="user-info_game-stats-container">
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${achiv.Points}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${achiv.TrueRatio}</div>
                        </div>                        
                    </div>
                </div>             
            </li>
        `;
    }
}

const Login = () => {
    const sectionUrl = './sections/login.elem';
    return fetch(sectionUrl)
        .then(responce => responce.text())
        .then(sectionHTML => {
            const sectionElement = document.createElement("section");
            sectionElement.className = "login__section section";
            sectionElement.innerHTML = sectionHTML;
            return sectionElement;
        })
        .then(sectionElement => {
            config.USER_NAME && (sectionElement.querySelector("#login_user-name").value = config.USER_NAME);
            config.API_KEY && (sectionElement.querySelector("#login__api-key").value = config.API_KEY);
            config.identConfirmed && (sectionElement.querySelector("#login__submit-button").classList.add("verified"));
            return sectionElement;
        })
}

