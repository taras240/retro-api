import { CHEEVO_TYPES } from "../enums/cheevoTypes.js";
import { delay } from "./delay.js";
import { animateNewOrder } from "./reorderAnimation.js";

export const filterBy = {
    earned: ({ DateEarnedHardcore }) => DateEarnedHardcore,
    earnedSoftcore: ({ DateEarned, DateEarnedHardcore }) => !DateEarnedHardcore && DateEarned,
    notEarned: ({ DateEarnedHardcore, DateEarned }) => !DateEarnedHardcore && !DateEarned,
    missable: ({ Type }) => Type === CHEEVO_TYPES.MISSABLE,
    progression: ({ Type }) => Type === CHEEVO_TYPES.PROGRESSION || Type === CHEEVO_TYPES.WIN,
    typeless: (cheevo) => !filterBy.progression(cheevo) && !filterBy.missable(cheevo),
    all: () => true,
    genre: ({ genres, genre }) => genres?.includes(genre),
    level: ({ level }, { targetLevel }) => {
        return parseInt(level) === parseInt(targetLevel);
    },
    group: ({ group, targetGroup }) => group === targetGroup,
    leveless: ({ level }) => !level,
    setID: ({ setID }, { targetSet }) => {
        return setID == targetSet
    },
};
export const cheevosFiterNames = Object.freeze({
    UNLOCKED: "earned",
    UNLOCKED_SOFT: "earnedSoftcore",
    MISSABLE: "missable",
    PROGRESSION: "progression",
})
export const filterMethods = {
    all: "all",
    earned: "earned",
    earnedSoftcore: "earnedSoftcore",
    notEarned: "notEarned",
    missable: "missable",
    progression: "progression",
    genre: "genre",
    group: "group",
    level: "level"
};

export async function applySort({ container, itemClassName, sortMethod, reverse, strictMode = false, animationDuration }) {
    const elements = [...container.querySelectorAll(itemClassName)];
    const newOrder = elements
        .sort((a, b) => sortMethod(a.dataset, b.dataset, reverse, strictMode))
    if (animationDuration) {
        await animateNewOrder(container, newOrder, animationDuration);
    }
    else {
        container.innerHTML = "";
        newOrder.forEach((element) => {
            container.appendChild(element);
        });
    }

}


function stringToDate(string) {
    return new Date(string);
}

export const cheevosSortNames = Object.freeze({
    TIME_TO_UNLOCK: "timeToUnlock",
    UNLOCK_DATE: "latest",
    TRUE_RATIO: "trueRatio",
    // DIFFICULTY: "difficulty",
    UNLOCK_RATE: "unlockRate",
    POINTS: "points",
    TRUE_POINTS: "truepoints",
    UNLOCK_DATE_RA: "raLatest",
    DEFAULT: "default",
    LEVEL: "level",
    CUSTOM_ORDER: "customOrder",
    // DISABLE: "disable",
});

export const sortBy = {
    latestHardcore: (a, b, reverse = 1, strictMode = false) => {
        const dateA = a.DateEarnedHardcore
            ? stringToDate(a.DateEarnedHardcore) : 0;
        const dateB = b.DateEarnedHardcore
            ? stringToDate(b.DateEarnedHardcore) : 0;

        if (strictMode && (dateA * dateB === 0) && (dateA + dateB !== 0)) {
            return dateB ? 1 : -1;
        }
        return (dateB - dateA) * reverse; // Повертає різницю дат
    },
    latest: (a, b, reverse = 1, strictMode = false) => {
        const dateA = a.DateEarnedHardcore
            ? stringToDate(a.DateEarnedHardcore) : a.DateEarned ? stringToDate(a.DateEarned)
                : 0;
        const dateB = b.DateEarnedHardcore
            ? stringToDate(b.DateEarnedHardcore) : b.DateEarned ? stringToDate(b.DateEarned)
                : 0;
        if (strictMode && (dateA * dateB === 0) && (dateA + dateB !== 0)) {
            return dateB ? 1 : -1;
        }
        return (dateB - dateA) * reverse; // Повертає різницю дат
    },
    raLatest: (a, b, reverse = 1, strictMode) => {
        const dateA = a.DateEarnedHardcore
            ? stringToDate(a.DateEarnedHardcore) : a.DateEarned ? stringToDate(a.DateEarned)
                : 0;
        const dateB = b.DateEarnedHardcore
            ? stringToDate(b.DateEarnedHardcore) : b.DateEarned ? stringToDate(b.DateEarned)
                : 0;
        if (dateA * dateB === 0 && dateA - dateB !== 0) {
            return dateB ? reverse : -1 * reverse;
        }
        return sortBy.default(a, b);
    },

    earnedCount: (a, b, reverse = 1) => (b.NumAwardedHardcore - a.NumAwardedHardcore) * reverse,
    unlockRate: (a, b, reverse = 1) => sortBy.earnedCount(a, b, reverse),
    rarest: (a, b, reverse = 1) => sortBy.earnedCount(a, b, reverse),
    points: (a, b, reverse = 1) => (a.Points - b.Points) * reverse,
    truepoints: (a, b, reverse = 1) => (a.TrueRatio - b.TrueRatio) * reverse,
    trueRatio: (a, b, reverse = 1) => {
        const ratioA = a.TrueRatio / a.Points;
        const ratioB = b.TrueRatio / b.Points;
        return (ratioA - ratioB) * reverse;
    },
    default: (a, b, reverse = 1) => a.DisplayOrder != 0 ?
        (a.DisplayOrder - b.DisplayOrder) * reverse :
        sortBy.id(a, b, reverse)
    ,
    customOrder: (a, b) => {

        return a.customOrder - b.customOrder;
    },
    progression: (a, b) => {
        if (a.DisplayOrder === b.DisplayOrder) return sortBy.unlockRate(a, b);
        const order = ({ DisplayOrder, Type }) => Type === CHEEVO_TYPES.PROGRESSION ? DisplayOrder : DisplayOrder * 1e3;
        const aOrder = order(a);
        const bOrder = order(b);
        return aOrder - bOrder;
    },
    id: (a, b, reverse = 1) => (a.ID - b.ID) * reverse,

    disable: (a, b) => 0,

    level: (a, b, reverse, strictMode = false) => {
        if (strictMode && (!a.level || !b.level) && !(!a.level && !b.level)) {
            return b.level ? 1 : -1;
        }
        if (!a.level && !b.level) return strictMode ? 0 : sortBy.default(a, b, reverse);
        if (!a.level) return 1 * reverse;
        if (!b.level) return -1 * reverse;
        return (a.level - b.level) * reverse;
    },
    timeToUnlock: (a, b, reverse, strictMode = false) => {
        if (strictMode && (!a.timeToUnlock || !b.timeToUnlock) && !(!a.timeToUnlock && !b.timeToUnlock)) {
            return b.timeToUnlock ? 1 : -1;
        }
        if (!a.timeToUnlock && !b.timeToUnlock) return strictMode ? 0 : sortBy.difficulty(a, b, reverse);
        if (!a.timeToUnlock) return 1 * reverse;
        if (!b.timeToUnlock) return -1 * reverse;
        return (a.timeToUnlock - b.timeToUnlock) * reverse;
    },
    difficulty: (a, b, reverse) => {
        let difRes = a.difficulty - b.difficulty;
        difRes == 0 && (difRes = b.NumAwardedHardcore - a.NumAwardedHardcore);
        return difRes * reverse;
    },
}


export const sortGamesBy = {
    title: (a, b, reverse = 1) => {
        let nameA = a.Title.toUpperCase();
        let nameB = b.Title.toUpperCase();

        if (nameA < nameB) {
            return -1 * reverse;
        }
        if (nameA > nameB) {
            return 1 * reverse;
        }
        return 0;

    },
    points: (a, b, reverse = 1, strictMode = true) => {
        if (strictMode && !(a.Points && b.Points)) {
            return a.Points ? -1 : 1;
        }
        return (a.Points - b.Points) * reverse;
    },
    cheevos: (a, b, reverse = 1) => (parseInt(a.NumAchievements) - parseInt(b.NumAchievements)) * reverse,
    date: (a, b, reverse = 1, strictMode = true) => {
        const dateA = a.Date
            ? stringToDate(a.Date)
            : -Infinity;
        const dateB = b.Date
            ? stringToDate(b.Date)
            : -Infinity;
        if (strictMode && !(a.Date && b.Date)) {
            return a.Date ? -1 : 1;
        }
        return (dateA - dateB) * reverse; // Повертає різницю дат
    },
    rating: (a, b) => b.Rating - a.Rating,
    playedDate: (a, b, reverse = 1, strictMode = true) => sortGamesBy.date({ Date: a.datePlayed }, { Date: b.datePlayed }, -1 * reverse, strictMode),
    released: (a, b, reverse = 1) => {
        return (a.relisedAt - b.relisedAt) * reverse;
    },
    award: (b, a, reverse = 1, strictMode = true) => {
        const awardTypes = {
            'mastered': 5,
            'completed': 4,
            'beaten-hardcore': 3,
            'beaten-softcore': 2,
            'started': 1,
        }
        const awardA = awardTypes[a.Award] ?? 0;
        const awardB = awardTypes[b.Award] ?? 0;

        const awardADate = new Date(a.MostRecentAwardedDate);
        const awardBDate = new Date(b.MostRecentAwardedDate);
        const delta = awardA - awardB != 0 ? awardA - awardB : awardADate - awardBDate;
        return delta * reverse;
    },
    beatenRate: (a, b, reverse = 1, strictMode = true) => {
        if (strictMode && !(a.beatenRate && b.beatenRate)) {
            return a.beatenRate ? -1 : 1;
        }
        return (a.beatenRate - b.beatenRate) * reverse;
    },
    masteryRate: (a, b, reverse = 1, strictMode = true) => {
        if (strictMode && !(a.masteryRate && b.masteryRate)) {
            return a.masteryRate ? -1 : 1;
        }
        return (a.masteryRate - b.masteryRate) * reverse;
    },
    players: (a, b, reverse = 1, strictMode = true) => {
        if (strictMode && !(a.playersTotal && b.playersTotal)) {
            return a.playersTotal ? -1 : 1;
        }
        return (b.playersTotal - a.playersTotal) * reverse;
    },
    trueRatio: (a, b, reverse = 1, strictMode = 1) => {
        if (strictMode && !(a.trueRatio && b.trueRatio)) {
            return a.trueRatio ? -1 : 1;
        }
        return (a.trueRatio - b.trueRatio) * reverse;
    },
    timeToBeat: (a, b, reverse = 1, strictMode = 1) => {
        if (strictMode && !(a.timeToBeat && b.timeToBeat)) {
            return a.timeToBeat ? -1 : 1;
        }
        return (a.timeToBeat - b.timeToBeat) * reverse;
    },
    timeToMaster: (a, b, reverse = 1, strictMode = 1) => {
        if (strictMode && !(a.timeToMaster && b.timeToMaster)) {
            return a.timeToMaster ? -1 : 1;
        }
        return (a.timeToMaster - b.timeToMaster) * reverse;
    },
}
export const gamesSortNames = {
    title: "title",
    released: 'released',
    playedDate: "playedDate",
    players: "players",
    cheevos: "cheevos",
    points: "points",
    trueRatio: 'trueRatio',
    beatenRate: "beatenRate",
    timeToBeat: "timeToBeat",
    masteryRate: "masteryRate",
    timeToMaster: "timeToMaster"
};

export function applyFilter({
    container,
    itemClassName,
    filters,
    isHide,
}) {
    const cheevos = container.querySelectorAll(itemClassName);

    const positiveFilters = filters && Object.values(filters)?.filter((data) => data?.state == 1);
    const negativeFilters = filters && Object.values(filters)?.filter((data) => data?.state == -1);

    cheevos.forEach(cheevo => cheevo.classList.remove("hidden", "removed"));

    const havePositiveFilters = positiveFilters?.length > 0;
    havePositiveFilters && cheevos.forEach(cheevo => cheevo.classList.add("hidden", isHide ? "removed" : "f"));

    positiveFilters?.forEach(filter => {
        cheevos.forEach(cheevo => {
            filterBy[filter.filterName]({ ...cheevo.dataset, ...filter }) && cheevo.classList.remove("hidden", "removed")
        })
    })
    negativeFilters?.forEach(filter => {
        cheevos.forEach(cheevo => {
            filterBy[filter.filterName](cheevo.dataset) && cheevo.classList.add("hidden", isHide ? "removed" : "f")
        })
    })
}