export const getCheevoDifficulty = (trend, TrueRatio, NumAwardedHardcore) => {
    return trend <= 0.2 && TrueRatio > 1000 && NumAwardedHardcore < 100 ? 11 :
        trend <= 1 && TrueRatio > 300 || TrueRatio >= 500 ? 10 :
            trend <= 1.5 && TrueRatio > 300 || TrueRatio >= 500 ? 9 :
                trend <= 3 && TrueRatio > 100 || TrueRatio >= 300 ? 8 :
                    trend < 8 && TrueRatio > 24 ? 7 :
                        trend < 13 && TrueRatio > 10 ? 6 :
                            trend < 20 && TrueRatio > 5 || TrueRatio > 10 ? 5 :
                                4;
}