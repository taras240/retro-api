import { fromHtml } from "../../functions/html.js";

export function PlaylistsContainer({ playlists, onClick }) {
    const container = fromHtml(`
        <ul id="games_playlists" class="games__playlists"/>
    `);
    if (playlists) {
        Object.values(playlists)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .forEach(p => container.append(PlaylistItem({ playlistData: p, onClick })))
    }
    return container;
}
export function PlaylistItem({ playlistData, onClick }) {
    const { title, games, displayOrder } = playlistData;

    const playlistItem = fromHtml(`
        <li class="games__playlist-item">
            <h2 class="playlist-title">${title}</h2>
        </li>
    `);
    playlistItem.dataset.displayOrder = displayOrder;
    playlistItem.dataset.playlistName = title;
    playlistItem.addEventListener("click", () => onClick(title))
    return playlistItem;
}