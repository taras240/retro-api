export const filterBy = {
    earned: (achievement) => !!achievement.DateEarnedHardcore,
    notEarned: (achievement) => !achievement.DateEarnedHardcore,
    missable: (achievement) => achievement.type === "missable",
    progression: (achievement) => achievement.type === "progression" || achievement.type === "win_condition",
    all: () => true,
};