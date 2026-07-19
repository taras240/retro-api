import { RA_PLATFORM_CODES } from "../../enums/RAPlatforms.js";
import { gameUrl } from "../raLinks.js";

export function searchByTitle({ Title, ConsoleName, ConsoleID }) {
    if (!Title) return;
    ConsoleName ??= ConsoleID ? RA_PLATFORM_CODES[ConsoleID]?.Name : "";
    ConsoleName = ConsoleName?.split("/")?.[0] ?? "";
    const query = encodeURIComponent(
        `"${Title}" "${ConsoleName}" (${romSearchQuery})`
    );
    searchQuery(query);
}
export function openGameInRA({ ID }) {
    if (!ID) return;

    window.open(gameUrl(ID), '_blank');
}
export function searchFaqByGame({ Title, ConsoleName, ConsoleID }) {
    if (!Title) return;
    ConsoleName ??= ConsoleID ? RA_PLATFORM_CODES[ConsoleID]?.Name : "";
    ConsoleName = ConsoleName?.split("/")?.[0] ?? "";
    const query = encodeURIComponent(
        `"${Title}" "${ConsoleName}" (${faqSearchQuery})`
    );
    searchQuery(query);
}
function searchQuery(query) {
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
}
const romSearchQuery = [
    "site:www.romhacking.net",
    "site:wowroms.com/en/roms",
    "site:cdromance.org",
    "site:coolrom.com.au/roms",
    "site:planetemu.net",
    "site:emulatorgames.net",
    "site:romsfun.com/roms",
    "site:emu-land.net/en"
].join(" OR ");
const faqSearchQuery = [
    "https://gamefaqs.gamespot.com",
].join(" OR ");