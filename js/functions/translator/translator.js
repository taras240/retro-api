

export async function isTranslationAvailable(
    sourceLanguage = "en",
    targetLanguage = globalThis.navigator?.language?.split("-")[0] || "en"
) {
    if (!sourceLanguage || !targetLanguage || !globalThis.Translator?.availability) {
        return false;
    }

    try {
        const availability = await globalThis.Translator.availability({
            sourceLanguage,
            targetLanguage
        });

        return availability === "available";
    } catch (error) {
        console.warn("Не вдалося перевірити наявність моделі перекладу.", error);
        return false;
    }
}

const translatorCache = new Map();

export async function translateCheevo({
    Title = "",
    Description = "",
    targetLanguage = globalThis.navigator?.language?.split("-")[0] || "en",
    sourceLanguage = "en"
} = {}) {
    if (targetLanguage === "en") return;
    if (!globalThis.Translator?.create) {
        throw new Error("Переклад у браузері недоступний.");
    }

    const cacheKey = `${sourceLanguage}:${targetLanguage}`;
    let translator = translatorCache.get(cacheKey);
    if (!translator) {
        translator = await globalThis.Translator.create({
            sourceLanguage,
            targetLanguage
        });
        translatorCache.set(cacheKey, translator);
    }

    const [titleTr, descriptionTr] = await Promise.all([
        Title ? translator.translate(Title) : "",
        Description ? translator.translate(`You need to do next steps:\n---\n${Description}`) : ""
    ]);

    return {
        titleTr: capitalizeText(titleTr),
        descriptionTr: normalizeDescription(descriptionTr),
    };
}
function capitalizeText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
function normalizeDescription(descriptionTr) {
    const trimmed = descriptionTr.split("---").slice(1).join("---").trim();
    const capitalized = capitalizeText(trimmed);
    return capitalized;
}