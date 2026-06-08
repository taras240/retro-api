export const Loader = () => {
    const loader = document.createElement("div");
    loader.classList.add("loading_screen");
    loader.innerHTML = `<div class="loading_screen__loader-icon"></div>`;
    return loader;
}