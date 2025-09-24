import { cheevoTypes } from "../enums/cheevoTypes.js";
import { sortBy } from "./sortFilter.js";

export function generateCheevosDisplayOrder(game) {
    const cheevos = Object.values(game.Achievements);

    if (cheevos.length === 0 || cheevos[0].DisplayOrder !== 0) return;

    const sorted = cheevos.sort((a, b) => sortBy.unlockRate(a, b));

    sorted.forEach((cheevo, index) => {
        cheevo.DisplayOrder =
            [cheevoTypes.PROGRESSION, cheevoTypes.WIN].includes(cheevo.Type)
                ? index
                : ++index * 1e3;
    });
}
