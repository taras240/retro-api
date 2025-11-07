import { ui } from "../script.js";
import { inputTypes } from "./inputElements.js";

const generateContextMenu = ({ menuItems, sectionCode = "", isSubmenu = false }) => {
    const contextElement = document.createElement("ul");
    contextElement.className = isSubmenu ?
        "context-menu_item-menu context-submenu" :
        "achievement_context-menu context-menu hidden";

    menuItems.forEach((menuItem) => {
        const isExpandable = menuItem.hasOwnProperty("elements");
        let menuElement = document.createElement("li");
        menuElement.className = `context-menu_item ${isExpandable && "expandable"}`;

        if (isExpandable) {
            menuElement.innerHTML += menuItem.label;
            menuElement.appendChild(
                generateContextMenu({
                    menuItems: menuItem.elements,
                    isSubmenu: true,
                    sectionCode: sectionCode,
                })
            );
        }
        else {
            menuElement.innerHTML += contextInputs[menuItem.type](menuItem);
        }
        contextElement.appendChild(menuElement);
    });
    contextElement.addEventListener("contextmenu", (e) => e.stopPropagation());
    contextElement.addEventListener("mousedown", (e) => e.stopPropagation());

    //* for disable autoclose contextmenu
    if (!ui.AUTOCLOSE_CONTEXTMENU) {
        contextElement.addEventListener("click", (e) => e.stopPropagation());
    }
    contextElement.querySelectorAll(".context-menu_statebox")?.forEach(statebox => statebox.addEventListener("click", stateboxClick));
    return contextElement;
}

const contextInputs = {
    [inputTypes.CHECKBOX]: ({ type, name, id, checked, event, label, sectionCode = "" }) => `
        <input 
            type="${type}" 
            name="context-${name || id}${sectionCode}" 
            id="context-${id}${sectionCode}" 
            ${event ?? ""}
            ${checked ? "checked" : ""} 
            ></input>
        <label class="context-menu_${type}" for="context-${id}${sectionCode}">${label}</label>`,
    radio: (props) => contextInputs.checkbox(props),
    statebox: ({ state, type, value, id, event, label, sectionCode = "" }) => `
        <div 
            class="context-menu_statebox" 
            data-state="${state ?? 0}" 
            data-value="${value}" 
            data-event="${event}"
            id="context-${id + sectionCode}"
            <p class="statebox__label">${label}</p>
        </div>
    `,
    [inputTypes.NUM_INPUT]: ({ prefix, type, id, event, title, value, postfix, sectionCode = "" }) => `
        ${prefix}
        <input 
            class="context-menu_${type}" 
            id="context-${id}-${sectionCode}" 
            type="number" 
            data-title="${title}" 
            value="${value ?? ""}" 
            ${event || ""} 
            onclick="event.stopPropagation()">
                ${postfix ?? ""} 
        </input>`,
    [inputTypes.TEXT_INPUT]: ({ prefix, type, id, event, title, value, postfix, sectionCode = "" }) => `
        ${prefix}
        <input 
            class="context-menu_${type}" 
            id="context-${id}-${sectionCode}" 
            type="text" 
            data-title="${title}" 
            value="${value ?? ""}" 
            ${event || ""} 
            onclick="event.stopPropagation()">
                ${postfix ?? ""} 
        </input>`,
    range: ({ prefix, event, minRange, maxRange, value, id, sectionCode = "" }) => `
        ${prefix}
        <input 
            class="slider" 
            id="context-${id}-${sectionCode}"
            type="range" 
            ${event ?? ""} 
            min="${minRange}" 
            max="${maxRange}" 
            value="${value}">`,
    button: ({ type, id, sectionCode, event, label = "" }) => `
            <button 
                class="context-menu_${type}" 
                id="context-${id}-${sectionCode}" 
                ${event ?? ""} 
                type="button"
            >
                ${label ?? "NOLABEL"}
            </button>`,
}
function stateboxClick(event) {
    const statebox = event.target;
    const prevState = +statebox.dataset.state;
    const state = prevState === 1 ? -1 : prevState + 1;
    const filterName = statebox.dataset.value;
    statebox.dataset.state = state;
    statebox.dataset.event && new Function("event", "state", "filterName", statebox.dataset.event)(event, state, filterName);
}
export { generateContextMenu }