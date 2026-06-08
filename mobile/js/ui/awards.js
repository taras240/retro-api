import { generateBadges } from "./components/badges.js";
import { sortBy } from "../functions/sort.js";
import { apiWorker, config } from "../main.js";
import { delay } from "../functions/delay.js";
import { lazyLoad } from "../functions/lazyLoad.js";
import { RAPlatforms } from "../enums/RAPlatforms.js";
let AWARDS;
export class Awards {

    awardTypeContext = () => {
        return {
            label: "Filter by type",
            elements: [
                {
                    label: `All (${AWARDS.VisibleUserAwards.length})`,
                    id: "filter_all",
                    type: "radio",
                    onChange: "ui.awards.awardFilter = 'award'",
                    checked: this.awardFilterName === 'award',
                    name: "filter-by-award"
                },
                // {
                //   label: "Mastered",
                //   id: "filter_mastered",
                //   type: "radio",
                //   onChange: "ui.awards.awardFilter = 'mastered'",
                //   checked: this.awardFilterName === 'mastered',
                //   name: "filter-by-award"
                // },
                ...Object.getOwnPropertyNames(this.awardTypes).reduce((elems, award) => {
                    const filterObj = {
                        label: `${this.awardTypes[award].name} (${this.awardTypes[award].count})`,
                        id: `filter_code-${award}`,
                        type: "radio",
                        onChange: `ui.awards.awardFilter = '${award}'`,
                        checked: this.awardFilterName == award,
                        name: "filter-by-award"
                    };
                    elems.push(filterObj);
                    return elems;
                }, [])
            ]
        }
    }
    awardPlatformContext = () => {
        return {
            label: "Filter by platform",
            elements: [
                {
                    label: `All (${AWARDS.VisibleUserAwards.length})`,
                    id: "filter_all",
                    type: "radio",
                    onChange: "ui.awards.platformFilterCode = 'platform'",
                    checked: this.platformFilterName === 'platform',
                    name: "filter-by-platform"
                },
                ...Object.getOwnPropertyNames(this.platformCodes).reduce((elems, platformCode) => {
                    const filterObj = {
                        label: `${this.platformCodes[platformCode].name} (${this.platformCodes[platformCode].count})`,
                        id: `filter_code-${platformCode}`,
                        type: "radio",
                        onChange: `ui.awards.platformFilterCode = ${platformCode}`,
                        checked: this.platformFilterCode == platformCode,
                        name: "filter-by-platform"
                    };
                    elems.push(filterObj);
                    return elems;
                }, [])

            ]
        }
    }
    awardSortContext = () => {
        return {
            label: "Sort by",
            elements: [
                {
                    label: "Date earned",
                    id: "sort_date-earned",
                    type: "radio",
                    onChange: "ui.awards.awardSortType = 'date'",
                    checked: this.awardSortType === 'date',
                    name: "sort-awards"
                },
                {
                    label: "Type",
                    id: "sort_award-type",
                    type: "radio",
                    onChange: "ui.awards.awardSortType = 'award'",
                    checked: this.awardSortType === 'award',
                    name: "sort-awards"
                },
                {
                    label: "Title",
                    id: "sort_title",
                    type: "radio",
                    onChange: "ui.awards.awardSortType = 'title'",
                    checked: this.awardSortType === 'title',
                    name: "sort-awards"
                },
                {
                    label: "Reverse sort",
                    id: "sort_reverse-sort",
                    type: "checkbox",
                    onChange: "ui.awards.awardSortTypeReverse = this.checked",
                    checked: this.awardSortTypeReverse == -1,
                    name: "sort-awards-reverse"
                },
            ]
        }
    }
    awardListContext = () => {
        return {
            label: "Show by",
            elements: [
                ...Object.getOwnPropertyNames(this.listTypes).reduce((elems, type) => {
                    const typeObj = {
                        label: `${this.listTypes[type]}`,
                        id: `awards_list-type-${type}`,
                        type: "radio",
                        onChange: `ui.awards.listType = '${type}'`,
                        checked: this.listType == type,
                        name: "awards-list-type"
                    };
                    elems.push(typeObj);
                    return elems;
                }, [])
            ]
        }
    }
    get listType() {
        return config.ui?.mobile?.listType ?? "list";
    }
    set listType(value) {
        config.ui.mobile.listType = value;
        config.writeConfiguration();
        this.update();
    }
    get awardFilter() {
        const type = config.ui?.mobile?.awardsTypeFilter ?? "award";
        return this.awardTypesNames[type]
    }
    get awardFilterName() {
        const type = config.ui?.mobile?.awardsTypeFilter ?? "award";
        return type;
    }
    set awardFilter(value) {

        config.ui.mobile.awardsTypeFilter = value;
        config.writeConfiguration()

        this.update();
    }

    get platformFilterName() {
        const code = config.ui?.mobile?.platformFilter ?? "platform";
        return code == "platform" ? "platform" : RAPlatforms[code];
    }
    get platformFilterCode() {
        const code = config.ui?.mobile?.platformFilter ?? "platform";
        return code;
    }
    set platformFilterCode(value) {
        config.ui.mobile.platformFilter = value;
        config.writeConfiguration()
        this.update();
    }

    get awardSortType() {
        return config.ui?.mobile?.awardSortType ?? "date";
    }

    set awardSortType(value) {
        config.ui.mobile.awardSortType = value;
        config.writeConfiguration()
        this.update();
    }
    get awardSortTypeReverse() {
        return config.ui?.mobile?.awardSortTypeReverse ?? "1";
    }

    set awardSortTypeReverse(value) {
        config.ui.mobile.awardSortTypeReverse = value ? -1 : 1;
        config.writeConfiguration()
        this.update();

    }

    applySort() {
        this.awardedGames = this.awardedGames.sort((a, b) => this.awardSortTypeReverse * sortBy[this.awardSortType](a, b));
    }

    applyFilter() {
        this.awardedGames = AWARDS.VisibleUserAwards;
        this.awardFilterName !== "award" && (this.awardedGames = this.awardedGames
            .filter(game => game.award == this.awardFilterName));
        this.platformFilterCode !== "platform" && (this.awardedGames =
            this.awardedGames
                .filter(game => game.ConsoleID == this.platformFilterCode));
    }

    listTypes = {
        list: 'list',
        grid: 'grid'
    }
    awardTypesNames = {
        beaten: "Beaten",
        beaten_softcore: "Beaten Softcore",
        completed: "Completed",
        mastered: "Mastered",
        event: "Event",
        award: "Award Type",
    }
    sortMethods = {
        latest: "date",
        // earnedCount: "earnedCount",
        // points: "points",
        // truepoints: "truepoints",
        // disable: "disable",
        // id: "id",
        // default: "default",
        // achievementsCount: "achievementsCount",
        title: "title",
    };
    awardedGames = [];
    constructor() {
        !config.ui.mobile.awards && (config.ui.mobile.awards = {});

        ui.showLoader();
        this.downloadAwardsData().then(() => {
            this.getAwardsStats();
            this.update();
        })

    }
    async update() {
        ui.showLoader();
        await delay(50);
        this.applyFilter();
        this.applySort();
        const section = this.AwardsSection()
        ui.content.innerHTML = '';
        ui.content.append(section);
        ui.removeLoader();
        const awardsList = section.querySelector(".user-info__awards-list");
        lazyLoad({ list: awardsList, items: this.awardedGames, callback: this.getGameElement })
    }
    getAwardsStats() {
        const stats = AWARDS.VisibleUserAwards
            .reduce((res, game) => {
                !res.platforms[game.ConsoleID] && (res.platforms[game.ConsoleID] = { count: 0 });
                res.platforms[game.ConsoleID].name = game.ConsoleName;
                res.platforms[game.ConsoleID].count++;


                (!res.awards[game.award]) && (res.awards[game.award] = { count: 0 });
                res.awards[game.award].name = this.awardTypesNames[game.award];
                res.awards[game.award].count++;



                return res;
            }, { platforms: {}, awards: {} });
        this.platformCodes = stats.platforms;
        this.awardTypes = stats.awards;
    }
    async downloadAwardsData() {
        !AWARDS && (AWARDS = await apiWorker.getUserAwards({}));
    }
    AwardsSection() {
        const awardsSection = document.createElement("section");
        awardsSection.classList.add("awards__section", "section");
        awardsSection.innerHTML = `
      ${this.headerHtml()}
      <ul class="user-info__awards-list ${this.listType}">
      </ul>
    `;
        return awardsSection;
    }
    headerHtml() {
        return `
      <div class="section__header-container">
        <div class="section__header-title">Awards</div>
        <div class="section__control-container">
          <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardSortContext(),event)">Sort</button>
          <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardPlatformContext(),event)">${this.platformFilterName ?? "Platform"}</button>
          <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardTypeContext(),event)">${this.awardFilter}</button>
          <button class="simple-button" onclick="generateContextMenu(ui.awards.awardListContext(),event)">${this.listType}</button>
        </div>
      </div>
    `;
    }
    getGameElement(game) {
        const gameElement = document.createElement('li');
        gameElement.className = `awards__game-item ${game.award}`;
        gameElement.dataset.id = game.AwardData;
        gameElement.innerHTML = `    
      <div class="awards__game-container"  onclick="ui.showGameDetails(${game.AwardData}); event.stopPropagation()">
          <div class="awards__game-preview-container" onclick="ui.goto.game(${game.AwardData}); event.stopPropagation()">
              <img class="awards__game-preview" src="https://media.retroachievements.org${game.ImageIcon}" alt="">
          </div>
          <div class="awards__game-description" >
              <h2 class="awards__game-title">
                ${game.FixedTitle} ${generateBadges(game.badges)}
              </h2>
              <div  class="game-stats__button"  onclick="ui.expandGameItem(${game.AwardData},this); event.stopPropagation()">
                <i class="game-stats__icon game-stats__expand-icon"></i>
              </div>
              <div class="awards__game-stats__text">${game.ConsoleName}</div>

              <div class="awards__game-stats-container" >
                  <div class="awards__game-stats__text awards__game-award-type">${ui.awards.awardTypesNames[game.award]}</div>
                  <div class="awards__game-stats__text">${new Date(game.AwardedAt).toLocaleDateString()}</div>
                  
              </div>
          </div>
      </div>
  `;
        return gameElement;
    }
}