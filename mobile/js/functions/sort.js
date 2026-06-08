const sortMethods = {
    latest: "date",
    earnedCount: "earnedCount",
    points: "points",
    truepoints: "truepoints",
    disable: "disable",
    id: "id",
    default: "default",
    achievementsCount: "achievementsCount",
    title: "title",
    award: "award",
};
export const sortBy = {
    date: (a, b) => {

        const dateA = a.DateEarned
            ? new Date(a.DateEarnedHardcore ? a.DateEarnedHardcore : a.DateEarned)
            : -Infinity;
        const dateB = b.DateEarned
            ? new Date(b.DateEarnedHardcore ? b.DateEarnedHardcore : b.DateEarned)
            : -Infinity;
        return dateB - dateA; // Повертає різницю дат
    },

    earnedCount: (a, b) => b.NumAwardedHardcore - a.NumAwardedHardcore,

    points: (a, b) => parseInt(a.Points) - parseInt(b.Points),

    truepoints: (a, b) => a.TrueRatio - b.TrueRatio,

    default: (a, b) => {
        if (a.DisplayOrder === 0) {
            return sortBy.id(a, b);
        }
        return a.DisplayOrder - b.DisplayOrder;
    },

    id: (a, b) => a.ID - b.ID,

    disable: (a, b) => 0,

    achievementsCount: (a, b) => parseInt(a.NumAchievements) - parseInt(b.NumAchievements),

    title: (a, b) => {
        let nameA = a.Title?.toUpperCase() ?? a.FixedTitle.toUpperCase();
        let nameB = b.Title?.toUpperCase() ?? b.FixedTitle.toUpperCase();

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
            'event': 6,
            'mastered': 5,
            'beaten-hardcore': 4,
            'completed': 3,
            'beaten-softcore': 2,
            'started': 1,
        }
        const awardA = awardTypes[a.award] ?? 0;
        const awardB = awardTypes[b.award] ?? 0;

        const awardADate = new Date(a.AwardedAt);
        const awardBDate = new Date(b.AwardedAt);

        return awardA - awardB != 0 ? awardA - awardB : awardADate - awardBDate;
    }
}