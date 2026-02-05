export const fromHtml = (htmlCode) => {
    const template = document.createElement("template");
    template.innerHTML = htmlCode.trim();
    return template.content.firstElementChild;
}