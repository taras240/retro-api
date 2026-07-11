

const REQUEST_DELAY_MS = 250;
const PAGE_SIZE = 100;
const MAX_PAGES_COUNT = 6;

export default async function handler(req, res) {
    const apiKey = req.headers["x-api-key"];
    const { username } = req.query;

    if (!apiKey || !username) {
        return res.status(400).json({ error: "Missing apiKey or username" });
    }

    try {
        const games = await getRecentlyPlayedGames({ apiKey, username });
        res.status(200).json({ games });
    } catch (error) {
        console.error("getRecentlyPlayedGames failed:", error.message);
        res.status(502).json({ error: "Failed to fetch data from RetroAchievements API" });
    }
}


async function getRecentlyPlayedGames({
    username,
    apiKey,
}) {
    let currentPage = 1;
    let totalPages = 1;
    let gamesArray = [];

    do {
        if (currentPage > 1) {
            await delay(REQUEST_DELAY_MS);
        }

        const pageData = await fetchPageData({
            username,
            apiKey,
            page: currentPage++,
        });

        const pageGamesArray = normalizeGamesData(pageData);
        gamesArray = gamesArray.concat(pageGamesArray);

        totalPages = Math.min(pageData.meta?.page?.lastPage ?? 1, MAX_PAGES_COUNT);

    } while (currentPage <= totalPages);

    return gamesArray;
}

async function fetchPageData({ username, apiKey, page = 1 }) {
    const url = `https://api.retroachievements.org/v2/users/${encodeURIComponent(username)}/player-games?include=game&sort=-lastPlayedAt&page[number]=${page}&page[size]=${PAGE_SIZE}`;

    const response = await fetch(url, {
        headers: {
            "x-api-key": apiKey,
        },
    });

    if (!response.ok) {
        throw new Error(`RetroAchievements API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

function normalizeGamesData(pageData) {
    const gamesArray = pageData?.data ?? [];

    return gamesArray.map(item => ({
        ...item.attributes,
        id: Number(item.relationships.game.data.id),
    }));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// const data = await getRecentlyPlayedGames({});