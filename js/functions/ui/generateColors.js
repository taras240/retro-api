export function blendColors(foreground, background, alpha = 0.7) {
    const hexToRgb = (hex) => {
        hex = hex.replace("#", "");
        if (hex.length === 3) {
            hex = hex.split("").map(c => c + c).join("");
        }

        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
        };
    };

    const rgbToHex = ({ r, g, b }) =>
        "#" +
        [r, g, b]
            .map(v => Math.round(v).toString(16).padStart(2, "0"))
            .join("");

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    return rgbToHex({
        r: fg.r * alpha + bg.r * (1 - alpha),
        g: fg.g * alpha + bg.g * (1 - alpha),
        b: fg.b * alpha + bg.b * (1 - alpha),
    });
}
export function hexToRgba(hex, alpha = 1) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}