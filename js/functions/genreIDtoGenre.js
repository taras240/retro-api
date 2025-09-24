import { gameGenres } from "../enums/gameGenres.js";

export function getGenres(genreCodes) {
    const genres = genreCodes.map(code => gameGenres[code]);
    return genres;
}