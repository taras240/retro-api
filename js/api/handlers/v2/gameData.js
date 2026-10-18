import { raEdpointsV2 } from "../../../enums/RAEndpoints.js";
import { formatText } from "../../../functions/formatText.js";
import { request } from "../../http.js";

export async function getGameData({ username, gameID }) {
    let page = 1;
    let lastPage = 1;
    let rawData = {
        data: [],
        included: [],
    };
    while (page <= lastPage) {
        const pageRawData = await request(formatText(raEdpointsV2.achievements, { gameID, count: 100, page }), {}, true);
        rawData.data.push(...pageRawData.data);
        rawData.included.push(...pageRawData.included);
        page++;
        lastPage = pageRawData.meta.page.lastPage;
    }
    const gameData = normalizeGameData(rawData);
    return gameData;
}

const normalizeGameData = (rawData) => {
    const rawGameData = rawData.included.find(item => item.type === "games");
    const achievements = rawData.data.map(cheevo => ({
        id: cheevo.id,
        gameID: cheevo.relationships.games.data[0].id,
        setID: cheevo.relationships.achievementSet.data.id,
        ...cheevo.attributes,
    }));
    const achievementSets = rawData.included
        .filter(item => item.type === "achievement-sets")
        .reduce((sets, item) => {
            sets[item.id] ??= {
                id: item.id,
                ...item.attributes,
            };
            return sets;
        }, {});
    const gameData = {
        id: rawGameData.id,
        achievements,
        achievementSets,
        ...rawGameData.attributes,
    }
    return gameData;
}