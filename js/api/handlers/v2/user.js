import { raEdpointsV2 } from "../../../enums/RAEndpoints.js";
import { formatText } from "../../../functions/formatText.js";
import { request } from "../../http.js";

export async function getUserProfileV2({
    username }) {
    const userData = await request(formatText(raEdpointsV2.user, { username }), {
        include: "lastGame",
    }, true);
    const profileInfo = normalizeUserInfo(userData);
    return profileInfo;
}

const normalizeUserInfo = (userData) => {
    const {
        displayName: User,
        avatarUrl,
        motto: Motto,
        points: TotalSoftcorePoints,
        pointsHardcore: TotalPoints,
        pointsWeighted: TotalTruePoints,
        rankHardcore: Rank,
        rankCasual: RankCasual,
        joinedAt: MemberSince,
        lastActivityAt,
        richPresence: RichPresenceMsg,
        richPresenceUpdatedAt: RichPresenceMsgDate,
    } = userData?.data?.attributes ?? {};

    const {
        hardcore: TotalRanked,
        casual: TotalRankedCasual
    } = userData?.meta?.rankedUsers ?? {};


    const {
        id: LastGameID
    } = userData?.data?.relationships?.lastGame?.data ?? {};

    return {
        User,
        Motto,
        TotalPoints,
        TotalSoftcorePoints,
        TotalTruePoints,
        Rank,
        TotalRanked,
        RankCasual,
        TotalRankedCasual,
        MemberSince,
        RichPresenceMsg,
        RichPresenceMsgDate,
        LastGameID,
    }
}