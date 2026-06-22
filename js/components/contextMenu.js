import { fromHtml } from "../functions/html.js";
import { getRandomID } from "../functions/randomID.js";
import { ui } from "../script.js";
import { addEvents, inputTypes } from "./inputElements.js";

const generateContextMenu = ({ menuItems, sectionCode = "", isSubmenu = false }) => {
    const contextElement = document.createElement("ul");
    contextElement.className = isSubmenu ?
        "context-menu_item-menu context-submenu" :
        "achievement_context-menu context-menu hidden";
    menuItems.forEach((menuItem) => {
        const isExpandable = menuItem.hasOwnProperty("elements");
        let menuElement;
        if (!menuItem) return;
        if (isExpandable) {
            menuElement = fromHtml(`
                <li class="context-menu_item expandable">
                    ${menuItem.label}
                </li>
            `);
            const subMenu = generateContextMenu({
                menuItems: menuItem.elements,
                isSubmenu: true,
                sectionCode: sectionCode,
            })
            menuElement.append(subMenu);
        }
        else {
            menuElement = ContextInput(menuItem);
        }
        contextElement.appendChild(menuElement);
    });
    contextElement.addEventListener("contextmenu", (e) => e.stopPropagation());
    contextElement.addEventListener("mousedown", (e) => e.stopPropagation());

    //* for disable autoclose contextmenu
    if (!ui.AUTOCLOSE_CONTEXTMENU) {
        contextElement.addEventListener("click", (e) => e.stopPropagation());
    }
    return contextElement;
}
const ContextInput = (props) => {
    const { onChange, onClick, onInput, hint, type } = props;
    if (type === inputTypes.DIVIDER) {
        return fromHtml(contextInputs[type](props))
    }
    const input = fromHtml(`
        <li class="context-menu_item">
            ${contextInputs[type](props)}
        </li>
        `);
    hint && (input.dataset.title = hint);
    addEvents(input, props);
    return input;

}
const contextInputs = {
    [inputTypes.CHECKBOX]: ({ type, name, id = getRandomID(), checked, event, label, onChange, sectionCode = "" }) => `
        <div class="context__input-container">
            <input 
                type="${type}" 
                name="context-${name || id}" 
                id="context-${id}" 
                ${event ?? ""}
                ${checked ? "checked" : ""} 
                ></input>
            <label class="context-menu_${type}" for="context-${id}">${label}</label>
        </div>
    ` ,
    radio: (props) => contextInputs.checkbox(props),
    statebox: ({ state, type, value, id = getRandomID(), event, label, property, sectionCode = "" }) => `
        <div 
            class="context-menu_statebox context-statebox statebox" 
            data-state="${state ?? 0}" 
            data-value="${value}" 
            data-property="${property}">
            <input 
                type="checkbox" 
                name="context-${getRandomID()}"
                id="context-${id}"
                checked
                ></input>
            <label class="statebox__label" for="context-${id}${sectionCode}">${label}</label>
        </div>
    `,
    [inputTypes.NUM_INPUT]: ({ prefix, type, id, event, hint, value, postfix, sectionCode = "" }) => `
        ${prefix}
        <input 
            class="context-menu_${type}" 
            id="${getRandomID()}" 
            type="number" 
            data-title="${hint || ""}" 
            value="${value ?? ""}" 
            ${event || ""} 
            onclick="event.stopPropagation()">
                ${postfix ?? ""} 
        </input>`,
    [inputTypes.TEXT_INPUT]: ({ prefix, type, id, event, hint, value, postfix, sectionCode = "" }) => `
        ${prefix}
        <input 
            class="context-menu_${type}" 
            id="${getRandomID()}" 
            type="text" 
            data-title="${hint || ""}" 
            value="${value ?? ""}" 
            ${event || ""} 
            onclick="event.stopPropagation()">
                ${postfix ?? ""} 
        </input>`,
    range: ({ prefix, event, minRange, maxRange, value, id, sectionCode = "" }) => `
        ${prefix}
        <input 
            class="slider" 
            id="${getRandomID()}"
            type="range" 
            ${event ?? ""} 
            min="${minRange}" 
            max="${maxRange}" 
            value="${value}">`,
    button: ({ type, id, sectionCode, event, label = "" }) => `
            <button 
                class="context-menu_${type}" 
                id="${getRandomID()}"
                ${event ?? ""} 
                type="button"
            >
                ${label ?? "NOLABEL"}
            </button>`,
    [inputTypes.STEPPER]: ({ initValue, step, label }) => `
    <div 
        class="stepper stepper__container" 
        data-value="${initValue}" 
        data-step="${step}">
            <button class="stepper__button stepper__decrease">-</button>
            <label class="stepper__label">
                ${label}: <span class="stepper__label-value">${initValue}</span>
            </label>
            <button class="stepper__button stepper__encrease">+</button>
    </div>
`,
    [inputTypes.DIVIDER]: () => `
    <div class="context__divider"/>
`,
    [inputTypes.CONTEXT_BUTTON]: (props) => contextInputs.button({ ...props, type: inputTypes.BUTTON }),
}

export { generateContextMenu }