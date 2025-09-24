import { delay } from "../functions/delay.js";
import { apiWorker, config, ui, watcher } from "../script.js";
import { PopupWindow } from "../widgets/popupWindow.js";
import { input } from "./inputElements.js";

export function cheevoPropsPopup() {
    const cheevoDataItems = (cheevoData) => [
        {
            label: ui.lang.title,
            elements: [
                {
                    type: "text",
                    title: ui.lang.cheevoTitleHint,
                    id: "cheevo-props-title",
                    value: cheevoData?.Title ?? '',
                },
            ]
        },
        {
            label: ui.lang.description,
            elements: [
                {
                    type: "text",
                    title: ui.lang.cheevoDescrHint,
                    id: "cheevo-props-description",
                    value: cheevoData?.Description ?? "",
                },
            ]
        },
        {
            label: ui.lang.genre,
            elements: [
                {
                    type: "text",
                    title: ui.lang.editGenreHint,
                    id: "cheevo-props-genres",
                    value: cheevoData?.genres?.join(",") ?? "",
                },
            ]
        },
        {
            label: ui.lang.levelName,
            elements: [
                {
                    type: "text",
                    title: ui.lang.levelNameHint,
                    id: "cheevo-props-zonename",
                    value: cheevoData?.zone ?? "",
                },
            ]
        },
        {
            label: ui.lang.levelNumber,
            elements: [
                {
                    type: "number",
                    title: ui.lang.editlevelHint,
                    id: "cheevo-props-level",
                    value: cheevoData?.level ?? "",
                },
            ]
        },
        {
            elements: [
                {
                    id: "reset-cheevo-props",
                    label: ui.lang.resetData,
                    type: "button",
                },
                {
                    id: "save-cheevo-props",
                    label: ui.lang.saveData,
                    type: "button",
                },
            ]
        },
    ]
    let gameDataWindow;
    const contentHtml = (items) => `
        <ul class="game-props__list flex-column-list">
        ${items.map(propsLine => `
            <li class="game-props__item">${propsLine.label ?? ""}
                ${propsLine.elements.map(inputData => input(inputData)).join("\n")}
            </li>
        `).join("\n")
        }
        </ul>
    `;


    const getCheevoDataFromWindow = (window) => ({
        Title: window.querySelector("#cheevo-props-title")?.value,
        Description: window.querySelector("#cheevo-props-description")?.value,
        zone: window.querySelector("#cheevo-props-zonename")?.value,
        level: window.querySelector("#cheevo-props-level")?.value,
        genres: window.querySelector("#cheevo-props-genres").value?.length > 1 ?
            window.querySelector("#cheevo-props-genres").value.split(",") : [],
    });

    const updateCheevoConfig = (data, ID) => {
        if (Object.keys(data).length > 0) {
            config.cheevosDB[ID] = data;
        }
        else {
            delete config.cheevosDB[ID];
        }
        config.writeConfiguration();
    };


    const resetCheevoData = async (window, cheevoData) => {
        const cheevoID = cheevoData.ID;
        const originalCheevoData = apiWorker.gameData?.Achievements[cheevoID];

        watcher.CHEEVOS[cheevoID].Title = originalCheevoData.Title;
        watcher.CHEEVOS[cheevoID].Description = originalCheevoData.Description;
        watcher.CHEEVOS[cheevoID].zone = originalCheevoData.zone;
        watcher.CHEEVOS[cheevoID].level = originalCheevoData.level;
        watcher.CHEEVOS[cheevoID].genres = originalCheevoData.genres || [];
        updateCheevoConfig({}, cheevoID);

        watcher.resetCheevo(cheevoID);
        gameDataWindow?.section?.remove();
        open(originalCheevoData);
    }
    const saveCheevoData = (window, cheevoData) => {
        const cheevoID = cheevoData.ID;
        const originalCheevoData = apiWorker.gameData?.Achievements[cheevoID];
        const newCheevoData = getCheevoDataFromWindow(window);
        Object.keys(newCheevoData)
            .forEach(property => {
                watcher.CHEEVOS[cheevoID][property] = newCheevoData[property];
                if (newCheevoData[property] == originalCheevoData[property]) {
                    delete newCheevoData[property];
                }
            })
        updateCheevoConfig(newCheevoData, cheevoID);

        watcher.resetCheevo(cheevoID);
    }

    const addEvents = (window, data) => {
        window.querySelector("#save-cheevo-props")?.addEventListener("click", () => saveCheevoData(window, data));
        window.querySelector("#reset-cheevo-props")?.addEventListener("click", () => resetCheevoData(window, data));

    }

    const open = (cheevoData) => {
        const popupData = () => ({
            title: cheevoData?.Title,
            content: contentHtml(cheevoDataItems(cheevoData)),
            id: `cheevo-data-popup`,
            classList: ["game-data__section"]
        })
        gameDataWindow = new PopupWindow(popupData());
        addEvents(gameDataWindow.section, cheevoData)
    }
    return { open }
}