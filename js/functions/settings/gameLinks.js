import { inputTypes } from "../../components/inputElements.js";
import { openGameInRA, searchByTitle, searchFaqByGame } from "../games/search.js";


export function gameLinksMenu(gameData) {
    return [
        {
            type: inputTypes.CONTEXT_BUTTON,
            id: "open-game-ra",
            label: lang.openInRA,
            onClick: () => openGameInRA(gameData)
        },
        {
            type: inputTypes.CONTEXT_BUTTON,
            id: "search-game",
            label: lang.searchRom,
            onClick: () => searchByTitle(gameData)
        },
        {
            type: inputTypes.CONTEXT_BUTTON,
            id: "search-faq",
            label: lang.searchFaq,
            onClick: () => searchFaqByGame(gameData)
        },
    ]
}