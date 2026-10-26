import { inputTypes } from "../../components/inputElements.js";
import { openGameInRA, searchByFilename, searchByTitle, searchFaqByGame } from "../games/search.js";


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
            onClick: () => searchByFilename(gameData)
        },
        {
            type: inputTypes.CONTEXT_BUTTON,
            id: "search-faq",
            label: lang.searchFaq,
            onClick: () => searchFaqByGame(gameData)
        },
    ]
}