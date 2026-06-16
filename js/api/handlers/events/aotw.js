import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { getNormalizedAotW } from "../../../functions/api/cheevosNormalization.js";
import { request } from "../../http.js";

export async function getAotW({ apiKey, username }) {
    const aotwData = await request(raEdpoints.achievementOfTheWeek, {
        y: apiKey,
    });
    const normalized = getNormalizedAotW({
        aotwData, username
    })
    return normalized;
}