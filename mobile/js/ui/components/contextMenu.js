export function generateContextMenu(structureObj, event) {
    event.stopPropagation();
    ui.removeContext();
    const contextElement = document.createElement("div");
    contextElement.classList.add("context-menu__container", "context");
    contextElement.addEventListener("touchend", e => e.stopPropagation());
    contextElement.addEventListener("mousedown", e => e.stopPropagation());
    contextElement.innerHTML += `
    <div class="context__header" onclick="ui.removeContext()">${structureObj.label}</div>
  `;
    const generateContextElements = () => {
        const controlsContainer = document.createElement("div");
        controlsContainer.classList.add("context__controls");
        structureObj.elements.forEach(el => {
            switch (el.type) {
                case "radio":
                    controlsContainer.innerHTML += `
            <div class="context__radio">
              <input type="radio" onchange="${el.onChange}"
                    name="${el.name}" ${el.checked && "checked"} id="${el.id}">
              <label class="context__radio-label" for="${el.id}">${el.label}</label>
            </div>
          `;
                    break;
                case "checkbox":
                    controlsContainer.innerHTML += `
            <div class="context__checkbox">
              <input type="checkbox" onchange="${el.onChange}"
                    name="${el.name}" ${el.checked && "checked"} id="${el.id}">
              <label class="context__checkbox-label" for="${el.id}">${el.label}</label>
            </div>
          `;
                    break;
                default:
                    return "";
            }

        })
        return controlsContainer;
    }
    const controlContainer = document.createElement("div");
    controlContainer.classList.add("context__control-container");
    controlContainer.append(generateContextElements(structureObj));
    contextElement.append(controlContainer);
    ui.app.appendChild(contextElement);
}