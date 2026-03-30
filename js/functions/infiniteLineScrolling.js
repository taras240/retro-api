export function infiniteLineScrolling({ container, textGenerator, speed = 20 }) {
    let rafId = null;
    let lastTime = null;
    let remainder = 0;
    let speedMultiplier = 1;
    let lineCount = 0;

    const markText = (text) => {
        const p = document.createElement('p');
        p.className = 'infinite-line';
        p.innerHTML = text;
        return p;
    };

    const appendLine = () => {
        container.appendChild(markText(textGenerator()));
        lineCount++;
    };

    const fillText = () => {
        // Один reflow замість двох перевірок у while
        while (lineCount < 3 || container.scrollWidth < container.offsetWidth * 3) {
            appendLine();
        }
    };

    const step = (now) => {
        if (!container.offsetWidth) {
            rafId = requestAnimationFrame(step);
            return;
        }

        if (!lastTime) lastTime = now;
        const delta = now - lastTime;
        lastTime = now;

        const exact = (speed * delta / 1000) * speedMultiplier + remainder;
        const whole = Math.trunc(exact);
        remainder = exact - whole;

        container.scrollLeft += whole;

        const firstLine = container.firstElementChild;
        if (firstLine) {
            if (firstLine.offsetWidth <= container.scrollLeft) {
                container.scrollLeft -= firstLine.offsetWidth;
                firstLine.remove();
                lineCount--;

                appendLine();
            }
        }

        if (lineCount < 3 || container.scrollWidth < container.offsetWidth * 3) {
            fillText();
        }

        rafId = requestAnimationFrame(step);
    };

    const startScrolling = () => {
        if (!container) return;
        stopScrolling();
        fillText();
        rafId = requestAnimationFrame(step);
    };

    const stopScrolling = () => {
        if (!container) return;
        if (rafId) {
            cancelAnimationFrame(rafId); // ← виправлено витік
            rafId = null;
        }
        lastTime = null;
        remainder = 0;
        lineCount = 0;
        container.innerHTML = '';
    };

    const setSpeed = (targetSpeed) => {
        if (targetSpeed > 0) speed = targetSpeed;
    };

    return { startScrolling, stopScrolling, setSpeed };
}