import { fromHtml } from "../../functions/html.js";
import { buttonsHtml } from "../htmlElements.js";
import { icons } from "../icons.js";
import { inputElement, inputTypes } from "../inputElements.js";

export function PlaylistsContainer({ playlists, onClick, onEdit }) {
    const container = fromHtml(`
        <ul id="games_playlists" class="games__playlists"/>
    `);
    if (playlists) {
        Object.values(playlists)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .forEach(p => container.append(PlaylistItem({ playlistData: p, onClick, onEdit })))
    }
    return container;
}
export function PlaylistItem({ playlistData, onClick, onEdit }) {
    const { title, games, displayOrder, editable } = playlistData;
    playlistData.onClick ??= onClick;
    const playlistItem = fromHtml(`
        <li class="games__playlist-item">
            <h2 class="playlist-title">${title}</h2>
            <div class="list-item-controls"/>
        </li>
    `);
    if (editable) {
        const controlsContainer = playlistItem.querySelector(".list-item-controls");

        const exportButton = fromHtml(buttonsHtml.exportButton({ ID: title }));
        controlsContainer.append(exportButton);
        exportButton.addEventListener("click", (e) => {
            e.stopPropagation();
            onEdit({ title, isExport: true });
        })

        const editButton = fromHtml(buttonsHtml.editButton({ ID: title }));
        controlsContainer.append(editButton);

        editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            const saveEditedTitle = (editableTitleElement) => {
                const newTitle = editableTitleElement.value;
                const titleElement = fromHtml(`<h2 class="playlist-title"></h2>`);
                editableTitleElement.replaceWith(titleElement);
                playlistItem.dataset.playlistName = newTitle;
                onEdit({ title, newTitle });
                controlsContainer.style.visibility = "";

            }
            const cancelEditing = () => {
                const titleElement = fromHtml(`<h2 class="playlist-title">${title}</h2>`);
                editableTitleElement.replaceWith(titleElement);
                controlsContainer.style.visibility = "";
                onEdit({ title, title });
            }
            let titleElement = playlistItem.querySelector("h2");
            let editableTitleElement = playlistItem.querySelector("input");
            if (titleElement) {
                controlsContainer.style.visibility = "hidden";
                editableTitleElement = inputElement({
                    type: inputTypes.SEARCH_INPUT,
                    label: title ?? ui.lang.playlistTitle,
                    value: title ?? "",
                    title: ui.lang.playlistTitle,
                    classList: ["wide-input"],

                },).querySelector("input");
                titleElement.replaceWith(editableTitleElement);
                editableTitleElement.focus();
                editableTitleElement.select();
                editableTitleElement.addEventListener("keydown", event => {
                    if (["Enter", "NumpadEnter"].includes(event.code)) {
                        saveEditedTitle(editableTitleElement);
                    }
                    else if (event.code === "Escape") {
                        cancelEditing();
                    }
                });
                playlistItem.addEventListener("focusout", event => saveEditedTitle(editableTitleElement));
                editableTitleElement.addEventListener("click", event => event.stopPropagation());

            }
            // else if (editableTitleElement) {
            //     saveEditedTitle(editableTitleElement);
            // }

        })

        const removeButton = fromHtml(buttonsHtml.delete());
        controlsContainer.append(removeButton);
        removeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            onEdit({ title, isRemoved: true });
        })

    }

    playlistItem.dataset.displayOrder = displayOrder;
    playlistItem.dataset.playlistName = title;
    playlistItem.addEventListener("click", () => playlistData.onClick(title))
    return playlistItem;
}