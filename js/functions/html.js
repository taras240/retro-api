export const fromHtml = (htmlCode) => {
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
    return template.content.firstElementChild;
}