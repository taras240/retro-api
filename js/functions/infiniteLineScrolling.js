const FRAME_TIME_MS = 40;

export function infiniteLineScrolling({ container, textGenerator }) {
    const markText = (text) => {
        const p = document.createElement('p');
        p.className = 'infinite-line';
        p.innerHTML = text;
        return p;
    };

    const fillText = () => {
        const fragment = document.createDocumentFragment();
        while (container.scrollWidth / container.offsetWidth < 3 || container.querySelectorAll("p").length < 3) {
            fragment.appendChild(markText(textGenerator()));
            container.appendChild(fragment);
        }
    };

    let scrollInterval = null;
    const step = async () => {
        container.scrollBy({ left: 1, behavior: 'auto' });

        const first = container.querySelector('.infinite-line');
        if (first) {
            const firstRight = first.offsetLeft + first.offsetWidth;
            if (firstRight <= container.scrollLeft) {
                const prevScroll = container.scrollLeft;
                const removedWidth = first.offsetWidth;
                first.remove();

                const newEl = markText(textGenerator());
                container.appendChild(newEl);

                container.scrollLeft = Math.max(0, prevScroll - removedWidth);
            }
        }

        if (container.querySelectorAll("p").length < 3 || container.scrollWidth / container.offsetWidth < 3) {
            fillText();
        }

    };

    const startScrolling = () => {
        stopScrolling();
        fillText();
        scrollInterval = setInterval(() => step(), FRAME_TIME_MS);
    };

    const stopScrolling = () => {
        scrollInterval && clearInterval(scrollInterval);
        container.innerHTML = "";
    };

    return { startScrolling, stopScrolling };
}