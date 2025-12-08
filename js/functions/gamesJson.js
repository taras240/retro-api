import { gamesExtMap } from "../enums/gamesExtMap.js";

const gamesJsonUrl = `./json/games/all_ext_min.json`;
const unpackMinJson = (gamesMinJson) => {
    const gamesJson = gamesMinJson.map(game => {
        let fullObject = {};
        Object.keys(game).forEach(key => {
            fullObject = {
                ...fullObject,
                [gamesExtMap[key]]: game[key]
            }
        });
        if (fullObject.HLTB) {
            const timeToBeatMins = Math.min(...Object.values(fullObject.HLTB));
            const hrs = timeToBeatMins >= 60 ?
                `${~~(timeToBeatMins / 60)}hr${timeToBeatMins > 119 ? "s" : ""}` :
                "";
            const mins = timeToBeatMins % 60 > 0 ? `${timeToBeatMins % 60}mins` :
                "";
            const timeToBeat = `${hrs} ${mins}`;
            fullObject.timeToBeat = timeToBeat;
        }
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
