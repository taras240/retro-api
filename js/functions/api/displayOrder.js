import { CHEEVO_TYPES } from "../../enums/cheevoTypes.js";
import { sortBy } from "../sortFilter.js";

export function generateCheevosDisplayOrder(game) {
    const cheevos = Object.values(game.Achievements);

    if (cheevos.length === 0 || cheevos[0].DisplayOrder !== 0) return;

    const sorted = cheevos.sort((a, b) => sortBy.unlockRate(a, b));

    sorted.forEach((cheevo, index) => {
        switch (cheevo.Type) {
            case CHEEVO_TYPES.PROGRESSION:
                cheevo.DisplayOrder = index;
                break;
            case CHEEVO_TYPES.WIN:
                cheevo.DisplayOrder = index * 1e3;
                break;
            default:
                cheevo.DisplayOrder = index * 1e6;
                break;
        }
    });
}
