export async function rawgGameInfo({ gameTitle, platformID }) {
    gameTitle = gameTitle.split("|")[0];
    const RAWGPlatform = RAtoRAWG[platformID];
    if (!RAWGPlatform) {
        return false;
    }

    const baseUrl = `https://api.rawg.io/api/`;
    const endpoint = "games";
    let url = new URL(endpoint, baseUrl);

    let params = {
        search: gameTitle,
        platforms: RAWGPlatform,
        key: "179353905bcb491d975b1fc03b3c8bd6",
    };
    url.search = new URLSearchParams(params);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`HTTP error! status: ${response.status}`);
            return false;
        }
        const data = await response.json();
        const res = data.results ? data.results[0] : null;

        const testTitle = gameTitle.replace(/[^a-z0-9]/gi, " ").trim();
        const testRes = res?.name.replace(/[^a-z0-9]/gi, " ").trim() ?? "";
        if (!res || testTitle !== testRes) {
            console.log(`Game not found for title: ${gameTitle} on platform: ${platformID}`);
            return false;
        }

        const keys = [
            "name", "playtime", "released", "background_image", "rating",
            "ratings", "added", "metacritic", "score", "community_rating", "genres"
        ];

        return Object.fromEntries(
            Object.entries(res).filter(([key]) => keys.includes(key))
        );
    } catch (err) {
        console.log(`Fetch error: ${err.message}`);
        return false;
    }
}