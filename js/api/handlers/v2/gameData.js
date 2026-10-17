import { raEdpointsV2 } from "../../../enums/RAEndpoints.js";
import { formatText } from "../../../functions/formatText.js";
import { request } from "../../http.js";

export async function getGameData({ username, gameID }) {
    const rawData = await request(formatText(raEdpointsV2.achievements, { gameID, count: 100 }), {}, true);
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
    const gameData = {
        id: rawGameData.id,
        achievements,
        ...rawGameData.attributes,
    }
    return gameData;
}