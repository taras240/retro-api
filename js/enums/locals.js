export const local = Object.freeze({
    en: "en",
    ua: "ua",
    br: "br"
})
export const langPackUrl = (lang = local.en) => {
    const availableLangs = Object.keys(local);
    const selectedLang = availableLangs.includes(lang) ? lang : local.en;

    return `./json/lang/${local[selectedLang]}.json`;
};