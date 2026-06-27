import { gameKeysMap, gamesExtMap } from "../enums/gamesExtMap.js";

const gamesJsonUrl = `./json/games/all_min.json`;
const unpackMinJson = (gamesMinJson) => {
    const gamesJson = gamesMinJson.map(game => {
        let fullObject = {};
        game.forEach((value, key) => {
            fullObject = {
                ...fullObject,
                [gameKeysMap[key]]: value
            }
        });
        if (fullObject.timeToBeat) {
            const timeToBeatMins = Math.round(fullObject.timeToBeat / 60);
            const hrs = timeToBeatMins >= 60 ?
                `${~~(timeToBeatMins / 60)}hr${timeToBeatMins > 119 ? "s" : ""}` :
                "";
            const mins = timeToBeatMins % 60 > 0 ? `${timeToBeatMins % 60}mins` :
                "";
            const timeToBeatString = `${hrs} ${mins}`;
            fullObject.timeToBeatString = timeToBeatString;
        }
        fullObject.Date = fullObject.relisedAt ? new Date(fullObject.relisedAt).toLocaleDateString() : "";
        fullObject.trueRatio = +(fullObject.retropoints / fullObject.Points).toFixed(1);
        fullObject.beatenRate = Number((100 * fullObject.timesBeaten / fullObject.playersHardcore).toFixed(1)) || 0;
        fullObject.masteryRate = Number((100 * fullObject.timesMastered / fullObject.playersHardcore).toFixed(1)) || 0;
        fullObject.ImageIcon = `/Images/${fullObject.ImageIcon}.png`;
        fullObject.badges ??= [];

        return fullObject;
    })
    return gamesJson;
}
export const gamesFromJson = async (path = gamesJsonUrl) => {
    const gamesResponse = await fetch(path);
    const gamesMinJson = await gamesResponse.json();
    const gamesJson = unpackMinJson(gamesMinJson);
    return gamesJson;
}
