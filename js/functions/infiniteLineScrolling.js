export function infiniteLineScrolling({ container, textGenerator }) {
    const posX = (container) => container.scrollLeft;
    const isEnd = () => posX(container) + container.offsetWidth >= container.scrollWidth;

    const markText = (text) => `<p class="infinite-line">${text}</p>`;
    const fillText = () => {
        while (container.scrollWidth / container.offsetWidth < 3 || container.querySelectorAll("p").length < 3) {
            container.innerHTML += markText(textGenerator());
        }
    }
    let scrollInterval;
    const startScrolling = () => {
        stopScrolling();
        fillText();
        scrollInterval = setInterval(() => {
            container.scrollBy({ left: 1, behavior: 'auto' });

            if (isEnd(container)) {
                container.querySelector('.infinite-line')?.remove();

                container.scrollTo({ left: container.scrollWidth, behavior: 'auto' });

                const fragment = document.createElement('div');
                fragment.innerHTML = markText(textGenerator());
                container.appendChild(fragment.firstElementChild);
            }
        }, 40);
    };
    const stopScrolling = () => { scrollInterval && clearInterval(scrollInterval); container.innerHTML = "" };

    return { startScrolling, stopScrolling };
}