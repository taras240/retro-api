import { raEdpointsV2 } from "../../../enums/RAEndpoints.js";
import { formatText } from "../../../functions/formatText.js";
import { request } from "../../http.js";

export async function getGameHashes({ gameID }) {

    let rawData = await request(formatText(raEdpointsV2.gameHashes, { gameID }), {}, true);
    const hashes = rawData?.data
        ?.filter(({ attributes }) => !attributes.patchUrl)
        .map(({ attributes }) => ({
            hash: attributes.raMd5,
            name: attributes.name,
        }))
    return hashes;
}

// {
//             "type": "game-hashes",
//             "id": "3508",
//             "attributes": {
//                 "raMd5": "1b1d9ac862c387367e904036114c4825",
//                 "name": "Sonic The Hedgehog (USA, Europe) (Ru) (NewGame).md",
//                 "labels": [
//                     "nointro",
//                     "rapatches"
//                 ],
//                 "compatibility": "compatible",
//                 "patchUrl": "https://github.com/RetroAchievements/RAPatches/raw/main/MD/Translation/Russian/1-Sonic1-Russian.zip",
//                 "createdAt": null,
//                 "updatedAt": "2024-01-12T23:59:10.000000Z"
//             }
//         },