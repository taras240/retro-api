import { GAME_GENRE_CODES } from "../enums/gameGenres.js";

export function getGenres(genreCodes) {
    const genres = genreCodes.map(code => GAME_GENRE_CODES[code]);
    return genres;
}