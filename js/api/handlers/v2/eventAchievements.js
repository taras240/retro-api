import { raEdpointsV2 } from "../../../enums/RAEndpoints.js";
import { request } from "../../http.js";

export async function getEventAchievements({
    eventID = [],
    page = 1,
    count = 100,
    active = true,
    evergreen = false, }) {
    const response = await request(raEdpointsV2.eventAchievements, {
        "page[size]": count,
        "page[number]": page,
        "filter[eventId]": eventID.join(","),
        "filter[active]": active,
        "filter[evergreen]": evergreen,
        "include": "eventAchievement,event"//"sourceAchievement,eventAchievement","event"
    }, true);
    return response;
    const eventAchievements = response?.data ?? [];
    return eventAchievements;
}
