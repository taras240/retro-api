import { fromHtml } from "../../../../js/functions/html.js";

export function LibraryHeader(parent) {
    const gamesHeader = fromHtml(`
        <div class="section__header-container">
            <div class="section__header-title">Library</div>
            <div class="section__control-container">
                <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
                <button class="games-platform-filter simple-button" onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">${parent.platformFilter ?? "Platform"} (${parent.games.length})
                </button>
                <div class="hidden-text-input__container">
                    <input class="hidden-text-input__input" type="search">
                    <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                    onclick="ui.library.showHiddenInput(this)"></button>
                </div>
            </div>
        </div>
    `);
    return gamesHeader;
}