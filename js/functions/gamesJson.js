import { gameKeysMap, gamesExtMap } from "../enums/gamesExtMap.js";

const gamesJsonUrl = `./json/games/all_min.json`;
const unpackMinJson = (gamesMinJson) => {
    const gamesJson = gamesMinJson.map(game => {
        let fullObject = {};
        if (game[0] === 253) console.log(game);
        game.forEach((value, key) => {
            fullObject = {
                ...fullObject,
                [gameKeysMap[key]]: value
            }
        });
        if (fullObject.HLTB) {
            const timeToBeatMins = Math.round(fullObject.HLTB / 60);
            const hrs = timeToBeatMins >= 60 ?
                `${~~(timeToBeatMins / 60)}hr${timeToBeatMins > 119 ? "s" : ""}` :
                "";
            const mins = timeToBeatMins % 60 > 0 ? `${timeToBeatMins % 60}mins` :
                "";
            const timeToBeat = `${hrs} ${mins}`;
            fullObject.timeToBeat = timeToBeat;
        }
        fullObject.Date = fullObject.relisedAt ? new Date(fullObject.relisedAt).toLocaleDateString() : "";
        fullObject.ImageIcon = `/Images/${fullObject.ImageIcon}.png`;
        !fullObject.badges && (fullObject.badges = []);
        !fullObject.Genres && (fullObject.Genres = []);

        return fullObject;
    })
    return gamesJson;
}
export const gamesFromJson = async () => {
    const gamesResponse = await fetch(gamesJsonUrl);
    const gamesMinJson = await gamesResponse.json();
    const gamesJson = unpackMinJson(gamesMinJson);
    return gamesJson;
}
