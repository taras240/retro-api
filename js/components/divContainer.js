export const divHtml = (classList = [], content = "") => {
    return `
        <div class="${classList.join(" ")}">
            ${content}
        </div>
    `;
}