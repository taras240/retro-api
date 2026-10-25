
const baseClass = "rp__heatmapbar";

export const heatmapBarHtml = () => {
    return `
        <.${baseClass}-container data-type="${type}">
            <.${baseClass}-header>
                <.${baseClass}-title/>
            </>
            <.${baseClass}>
                <.${baseClass}-bg/>
                <.${baseClass}-unlocks/>
            </>
        </>
    `;
}