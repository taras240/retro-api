export function animateValue(element, to, duration, options = {}) {
    if (!element) return;
    const from = parseFloat(element.innerText?.replaceAll(",", "")) || 0;
    to = parseFloat(to) || 0;
    const decimals = options.decimals ?? getDecimals(from, to);
    const { suffix = "", prefix = "", separator = ",", absoluteValues = true } = options;

    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const v = from + (to - from) * easeOut(p);
        let valueString = v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        if (absoluteValues) {
            valueString = valueString.replace(/^-/, "");
        }
        let innerText = prefix + valueString + suffix;

        element.textContent = innerText;
        if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}
function getDecimals(from, to) {
    const str = n => String(n);
    const decimalsOf = n => {
        const parts = str(n).split(".");
        return parts[1] ? parts[1].length : 0;
    };
    return Math.max(decimalsOf(from), decimalsOf(to));
}