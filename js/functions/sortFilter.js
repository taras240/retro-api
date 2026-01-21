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

export const sortBy = {
    latestHardcore: (a, b, reverse = 1, strictMode = false) => {
        if (!a.DateEarnedHardcore && !b.DateEarnedHardcore) {
            return sortBy.latest(a, b);
        }
        else {
            const dateA = a.DateEarnedHardcore ?
                stringToDate(a.DateEarnedHardcore)
                : -Infinity;
            const dateB = b.DateEarnedHardcore ?
                stringToDate(b.DateEarnedHardcore) :
                -Infinity;
            return dateB - dateA; // Повертає різницю дат
        }
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
        return sortBy.latest(a, b, -1, true) * reverse
    },

    earnedCount: (a, b, reverse = 1) => (b.NumAwardedHardcore - a.NumAwardedHardcore) * reverse,
    unlockRate: (a, b, reverse = 1) => sortBy.earnedCount(a, b, reverse),
    rarest: (a, b, reverse = 1) => sortBy.earnedCount(a, b, reverse),
    points: (a, b, reverse = 1) => ((a.Points) - (b.Points)) * reverse,
    truepoints: (a, b, reverse = 1) => (a.TrueRatio - b.TrueRatio) * reverse,
    trueRatio: (a, b, reverse = 1) => {
        const ratioA = a.TrueRatio / a.Points;
        const ratioB = b.TrueRatio / b.Points;
        return (ratioA - ratioB) * reverse;
    },
    default: (a, b, reverse = 1) => a.DisplayOrder != 0 ?
        (a.DisplayOrder - b.DisplayOrder) * reverse :
        sortBy.unlockRate(a, b, reverse)
    ,
    progression: (a, b) => {
        if (a.DisplayOrder === b.DisplayOrder) return sortBy.unlockRate(a, b);
        const order = ({ DisplayOrder, Type }) => Type === CHEEVO_TYPES.PROGRESSION ? DisplayOrder : DisplayOrder * 1e3;
        const aOrder = order(a);
        const bOrder = order(b);
        return aOrder - bOrder;
    },
    id: (a, b) => a.ID - b.ID,

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

    rating: (a, b) => b.Rating - a.Rating,

    achievementsCount: (a, b) => parseInt(a.NumAchievements) - parseInt(b.NumAchievements),

    title: (a, b) => {
        let nameA = a.Title.toUpperCase();
        let nameB = b.Title.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;

    },
    award: (b, a) => {
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

        return awardA - awardB != 0 ? awardA - awardB : awardADate - awardBDate;
    },
    date: (a, b) => {
        const dateA = a.Date
            ? stringToDate(a.Date)
            : -Infinity;
        const dateB = b.Date
            ? stringToDate(b.Date)
            : -Infinity;
        return dateA - dateB; // Повертає різницю дат
    },
}

export const cheevosSortNames = Object.freeze({
    TIME_TO_UNLOCK: "timeToUnlock",
    UNLOCK_DATE: "latest",
    UNLOCK_DATE_RA: "raLatest",
    TRUE_RATIO: "trueRatio",
    DIFFICULTY: "difficulty",
    UNLOCK_RATE: "unlockRate",
    POINTS: "points",
    TRUE_POINTS: "truepoints",
    DEFAULT: "default",
    LEVEL: "level",
    // DISABLE: "disable",
});

export const sortMethods = {
    latest: "latest",
    raLatest: "raLatest",
    trueRatio: "trueRatio",
    earnedCount: "earnedCount",
    points: "points",
    truepoints: "truepoints",
    disable: "disable",
    id: "id",
    default: "default",
    achievementsCount: "achievementsCount",
    title: "title",
    award: "award",
    rating: "rating",
    date: "date",
    level: 'level',
    difficulty: 'difficulty'
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