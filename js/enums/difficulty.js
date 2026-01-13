export const DIFFICULTY_NAMES = {
    11: "rank x",
    10: "rank sss",
    9: "rank ss",
    8: "rank s",
    7: "rank a",
    6: "rank b",
    5: "rank c",
    4: "rank d",
}

export const masteryDifficulties = Object.fromEntries(
    Object.entries(DIFFICULTY_NAMES).map(([key, value]) => [key, `mastery: ${value}`])
);