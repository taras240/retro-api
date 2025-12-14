
export const getNormalizedTimes = (gameTimesData) => {
    const Achievements = gameTimesData.Achievements
        ?.reduce((obj, { ID, MedianTimeToUnlock, MedianTimeToUnlockHardcore }) => {
            obj[ID] = { ID, MedianTimeToUnlock, MedianTimeToUnlockHardcore };
            return obj
        }, {});

    const { ID, MedianTimeToBeat, MedianTimeToBeatHardcore, MedianTimeToMaster, MedianTimeToComplete } = gameTimesData;

    const timesData = {
        ID,
        MedianTimeToBeat,
        MedianTimeToBeatHardcore,
        MedianTimeToMaster,
        MedianTimeToComplete,
        Achievements
    }

    return timesData;
}