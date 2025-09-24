export function infiniteLineScrolling({ container, textGenerator }) {
    const posX = (container) => container.scrollLeft;
    const isEnd = () => posX(container) + container.offsetWidth >= container.scrollWidth;

    const markText = (text) => `<p class="infinite-line">${text}</p>`
    const fillText = () => {
        while (container.scrollWidth / container.offsetWidth < 2 || container.querySelectorAll("p").length < 3) {
            container.innerHTML += markText(textGenerator());
        }
    }
    let scrollInterval;
    const startScrolling = () => {
        stopScrolling();
        fillText();
        scrollInterval = setInterval(() => {
            container.scrollLeft++;
            if (isEnd(container)) {
                container.querySelector('.infinite-line').remove();
                container.scrollTo(container.scrollWidth, 0)
                container.innerHTML += markText(textGenerator());
            }
        }, 40)
    };
    const stopScrolling = () => { scrollInterval && clearInterval(scrollInterval); container.innerHTML = "" };

    return { startScrolling, stopScrolling };
}