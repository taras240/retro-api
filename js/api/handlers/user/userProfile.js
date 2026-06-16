import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { request } from "../../http.js";

export async function getUserProfile({ username, apiKey }) {
    const data = await request(raEdpoints.userProfile, {
        y: apiKey,
        u: username,
    });
    return data;
}