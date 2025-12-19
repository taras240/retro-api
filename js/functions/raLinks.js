export const cheevoImageUrl = ({ BadgeName }) => `https://media.retroachievements.org/Badge/${BadgeName}.png`;
export const gameImageUrl = (imageEndpoint) => `https://media.retroachievements.org${imageEndpoint}`;
export const gameImageUrlByID = (imageID) => `https://media.retroachievements.org/Images/${imageID}.png`;
export const gameUrl = (gameID) => `https://retroachievements.org/game/${gameID}`;
export const cheevoUrl = ({ ID }) => `https://retroachievements.org/achievement/${ID}`;