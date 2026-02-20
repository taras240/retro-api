import { fromHtml } from "../functions/html.js";
import { updateStateBox } from "../functions/stateBoxClick.js";
import { ui } from "../script.js";


const checkbox = ({ event, onChange, id, checked, label, name, isRadio }) => {
    return `
        <div class="${isRadio ? "radio" : "checkbox"}-input_container">
            <input ${[
            `type="${isRadio ? "radio" : "checkbox"}"`,
            id && `id="${id}"`,
            `name="${name || id}"`,
            checked && "checked"
        ].filter(Boolean).join(" ")}
            >
            <label class="checkbox-input" ${id ? `for="${id}"` : ""}>
                ${label}
            </label>
        </div>
    `;

}
const statebox = ({ state, type, property, value, id, label, sectionCode }) => `
    <div 
            class="statebox statebox__container" 
            data-state="${state ?? 0}" 
            data-value="${value}" 
            data-property="${property}">
            <input 
                type="checkbox" 
                name="statebox-${id}-checkbox"
                id="statebox-${id}${sectionCode}"
                checked
                ></input>
            <label class="statebox__label statebox-input" for="statebox-${id}${sectionCode}">${label}</label>
        </div>
`;

const radioButton = (props) => {
    return checkbox({ ...props, isRadio: true });
}

const textInput = ({ prefix, title, id, value, label, isNumber, isSearch, placeholder }) => {
    return `
    <div>
        <input ${[
            `type="${isNumber ? "number" : isSearch ? "search" : "text"}"`,
            (title || prefix) && `data-title="${title || prefix}"`,
            'class="text-input"',
            id && `id="${id}"`,
            value !== undefined && `value="${value}"`,
            label && `placeholder="${label}"`,
        ]
            .filter(Boolean)
            .join(" ")}
        />
        </div>
    `;

}
const numberInput = (props) => {
    return textInput({ ...props, isNumber: true });
}
const searchInput = (props) => {
    return textInput({ ...props, isSearch: true });
}

const selectorInput = ({ id, label }) => {
    return `
        <button class="select-button" id="${id}">
            ${label}
        </button>
    `;
}

const button = ({ event, onClick, label, id }) => {
    return `
        <button ${[
            id && `id="${id}"`,
            'class="button-input"',
        ]
            .filter(Boolean)
            .join(" ")}>
            ${label}
        </button>
    `;

}
const group = ({ label }) => {
    return `
       <div class="group-header">${label}</div>
    `
}
const colorInput = ({ value, id, label, onChange }) => {


    return `
        <div class="color-input__container" style="--color:${value}">
            <div class="color-input__preview" onclick="this.nextElementSibling.click()"></div>
            <input 
                type="color" 
                class="color-input" 
                value="${value}" 
                id="${id}" 
                data-title="${label}" 
            />
            ${textInput({ title: label, label: value, value })}
        </div>
    `;
}

const inputElement = (props) => {
    const { hint } = props;
    const inputElement = fromHtml(inputHtml(props));
    hint && (inputElement.dataset.title = hint);
    addEvents(inputElement, props)
    return inputElement;
}
const addEvents = (element, props) => {
    const onColorChange = (event) => {
        const textInput = event.currentTarget;
        const container = textInput.closest('.color-input__container');

        if (container) {
            container.style.setProperty('--color', textInput.value)
        };
    }

    const { onChange, onClick, onInput, type } = props;
    if (type === inputTypes.COLOR) {
        const textInput = element.querySelector('input[type="text"]');
        const colorInput = element.querySelector('input[type="color"]');

        textInput?.addEventListener("input", (event) => {
            onColorChange(event);
            onChange(event);
        });
        colorInput?.addEventListener("change", (event) => {
            const colorValue = event.currentTarget.value;
            textInput.value = colorValue;
            onChange(event);
        });


    }
    else {
        const input = element?.querySelector("input");
        if (onChange) {
            input?.addEventListener("change", (event) => {
                const statebox = event.target.closest(".statebox");
                if (statebox) {
                    const currentState = updateStateBox(statebox)
                    onChange(currentState);
                }
                else {
                    onChange(event);
                }
            });
        }
        if (onInput) {
            input?.addEventListener("input", onInput)
        }
        if (onClick) {
            const button = element?.matches('button')
                ? element
                : element?.closest('button') || element?.querySelector('button');

            button?.addEventListener('click', onClick);
        }
    }

}
const inputHtml = (inputData) => {
    switch (inputData.type) {
        case inputTypes.TEXT_INPUT:
            return textInput(inputData);
        case inputTypes.SEARCH_INPUT:
            return searchInput(inputData);
        case inputTypes.NUM_INPUT:
            return numberInput(inputData);
        case inputTypes.BUTTON:
            return button(inputData);
        case inputTypes.CHECKBOX:
            return checkbox(inputData);
        case inputTypes.STATEBOX:
            return statebox(inputData);
        case inputTypes.RADIO:
            return radioButton(inputData);
        case inputTypes.SELECTOR:
            return selectorInput(inputData);
        case inputTypes.GROUP:
            return group(inputData)
        case inputTypes.COLOR:
            return colorInput(inputData);
        default:
            return `[${inputData.type} N/A]`;
    }
}
const inputTypes = Object.freeze({
    CHECKBOX: "checkbox",
    STATEBOX: "statebox",
    RADIO: "radio",
    NUM_INPUT: "number",
    TEXT_INPUT: "text",
    SEARCH_INPUT: "search",
    SELECTOR: "selector",
    BUTTON: "button",
    GROUP: "group",
    COLOR: "color"
})
export { inputTypes, inputHtml as input, inputElement, addEvents }
// export { checkbox, statebox, radioButton, numberInput, textInput, searchInput, selectorInput, button, }