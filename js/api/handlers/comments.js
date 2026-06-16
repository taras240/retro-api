import { raEdpoints } from "../../enums/RAEndpoints.js";
import { request } from "../http.js";
import { formatDateTime } from "../../functions/time.js";

export async function getComments({
    apiKey,
    id,
    offset = 0,
    count = 200,
    type = 2,
    sort = "-submitted" }) {
    //t - The target comment kind: 1 (game), 2 (achievement), or 3 (user)
    //c - Count, number of records to return (default: 100, max: 500).
    //o - Offset, number of entries to skip (default: 0).
    //sort	submitted - ascending, -submitted - descending
    const data = await request(raEdpoints.comments, {
        y: apiKey,
        i: id,
        t: type,
        o: offset,
        c: count,
        sort
    });
    // Filter server messages
    return (data?.Results || [])
        .filter(c => c.User !== "Server");
}
export async function getCheevoComments({ apiKey, cheevoID }) {
    return getComments({ apiKey, id: cheevoID, type: 2 })
}
export async function getGameComments({ apiKey, gameID }) {
    return getComments({ apiKey, id: gameID, type: 1 })
}
export async function getUserComments({ apiKey, username }) {
    return getComments({ apiKey, id: username, type: 3 })
}