export const fromHtml = (htmlCode, all = false) => {
    if (Array.isArray(htmlCode)) {
        htmlCode = htmlCode.join(" ");
        all = true;
    }
    htmlCode = htmlCode.replace(
        /<(\w+)?((?:[.#][\w-]+)+)([^>]*)>/g,
        (match, tag, shorthand, attrs) => {
            tag ??= "div";

            const classes = [];
            let id = null;

            shorthand.replace(
                /([.#])([\w-]+)/g,
                (_, type, value) => {
                    if (type === ".") {
                        classes.push(value);
                    } else {
                        id = value;
                    }
                }
            );

            const attributes = [
                id && `id="${id}"`,
                classes.length && `class="${classes.join(" ")}"`,
                attrs.trim()
            ].filter(Boolean).join(" ");

            return `<${tag}${attributes ? " " + attributes : ""}>`;
        }
    );
    htmlCode = htmlCode.replace(/<\/>/g, "</div>");
    if (/\/>/g.test(htmlCode))
        htmlCode = htmlCode.replace(
            /<(\w+)([^>]*)\/>/g,
            (match, tag, attrs) => {
                const voidTags = new Set([
                    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
                    'link', 'meta', 'param', 'source', 'track', 'wbr'
                ]);

                if (voidTags.has(tag.toLowerCase())) {
                    return match; // не чіпаємо void-теги
                }

                return `<${tag}${attrs}></${tag}>`;
            }
        );
    const template = document.createElement("template");
    template.innerHTML = htmlCode.trim();
    const elements = [...template.content.children];

    return all ? elements : elements[0];
}