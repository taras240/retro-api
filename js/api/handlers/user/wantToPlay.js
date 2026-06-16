import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { request } from "../../http.js";

// y	Yes	Your web API key.
// u		The target username or ULID.
// c		Count, number of records to return (default: 100, max: 500).
// o		Offset, number of entries to skip (default: 0).
export async function getWantToPlayGamesList({ apiKey, username, count, offset }) {
    const data = await request(raEdpoints.wantToPlay, {
        y: apiKey,
        u: username,
        c: count,
        o: offset,
    });

    return data.Results || [];
}

