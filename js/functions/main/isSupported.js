export function isSupported() {
    const hasUnsupportedLang = navigator.languages?.some(lang =>
        lang.toLowerCase().startsWith("ru")
    );

    if (hasUnsupportedLang) {
        return false;
    }
    return true;
}