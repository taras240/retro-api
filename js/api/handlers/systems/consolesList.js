import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { request } from "../../http.js";

export async function getConsolesList({ apiKey, activeOnly = true }) {
    const data = await request(raEdpoints.consolesList, {
        y: apiKey,
        a: activeOnly ? 1 : 0,
        g: 1, //not hubs or events
    });
    return data;
}