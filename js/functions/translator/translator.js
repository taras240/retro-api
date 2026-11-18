

let activeLoadingScreens = 0;

function setLoadingScreen(show, message = "Loading...") {
    if (typeof globalThis.ui?.toggleLoading === "function") {
        globalThis.ui.toggleLoading(show, message);
        return;
    }

    const loading = globalThis.document?.querySelector(".loading-section");
    if (!loading) return;

    loading.classList.toggle("hidden", !show);
    loading.dataset.message = message;
}

function showLoadingScreen(message) {
    activeLoadingScreens++;
    setLoadingScreen(true, message);
}

function hideLoadingScreen() {
    activeLoadingScreens = Math.max(0, activeLoadingScreens - 1);
    if (activeLoadingScreens === 0) {
        setLoadingScreen(false);
    }
}

export async function withTranslationLoading(task, message) {
    showLoadingScreen(message);
    try {
        return await task();
    } finally {
        hideLoadingScreen();
    }
}

const translatorCache = new Map();

async function createTranslator(sourceLanguage, targetLanguage) {
    const cacheKey = `${sourceLanguage}:${targetLanguage}`;
    if (translatorCache.has(cacheKey)) {
        return translatorCache.get(cacheKey);
    }

    const translatorPromise = globalThis.Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor(monitor) {
            monitor.addEventListener("downloadprogress", (event) => {
                const progress = Math.max(0, Math.min(100, Math.round(event.loaded * 100)));
                setLoadingScreen(true, `Loading translation language model: ${progress}%`);
            });
        }
    });

    translatorCache.set(cacheKey, translatorPromise);
    try {
        return await translatorPromise;
    } catch (error) {
        translatorCache.delete(cacheKey);
        throw error;
    }
}

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
        console.log({ availability, targetLanguage, sourceLanguage })
        if (availability === "available") {
            return true;
        }

        if (availability === "downloadable" || availability === "downloading") {
            await withTranslationLoading(
                () => createTranslator(sourceLanguage, targetLanguage),
                "Loading translation language model..."
            );
            return true;
        }

        return false;
    } catch (error) {
        console.warn("Не вдалося перевірити наявність моделі перекладу.", error);
        return false;
    }
}

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

    return withTranslationLoading(async () => {
        const translator = await createTranslator(sourceLanguage, targetLanguage);
        const [titleTr, descriptionTr] = await Promise.all([
            Title ? translator.translate(Title) : "",
            Description ? translator.translate(`You need to do next steps:\n---\n${Description}`) : ""
        ]);

        return {
            titleTr: capitalizeText(titleTr),
            descriptionTr: normalizeDescription(descriptionTr),
        };
    }, "Translating achievements...");
}
function capitalizeText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
function normalizeDescription(descriptionTr) {
    const trimmed = descriptionTr.split("---").slice(1).join("---").trim();
    const capitalized = capitalizeText(trimmed);
    return capitalized;
}