export function createAutoScroll(container, options = {}) {
    const {
        axis = "y",
        pauseOnEndMs = 1e3,
        hoverPause = true,
        resumeDelay = 5e3
    } = options;
    let { speed = 20 } = options;

    let rafId = null;
    let hoverTimeout = null;
    let pauseTimeout = null;
    let lastTime = null;
    let remainder = 0;
    let dir = 1;
    let speedMultiplier = 1;

    const isY = axis === "y";
    const getPos = () => isY ? container.scrollTop : container.scrollLeft;
    const setPos = (v) => isY ? container.scrollTop = v : container.scrollLeft = v;
    const getMax = () => {
        if (!container) return 0;
        return isY
            ? container.scrollHeight - container.clientHeight
            : container.scrollWidth - container.clientWidth;
    };

    let mouseEnterHandler, mouseLeaveHandler;
    let isHoverPaused = false;

    function addHoverEvents() {
        if (!container || !hoverPause) return;
        mouseEnterHandler = () => {
            clearTimeout(hoverTimeout);
            speedMultiplier = 0;
            isHoverPaused = true;
        };
        mouseLeaveHandler = () => {
            isHoverPaused = false;
            hoverTimeout = setTimeout(() => {
                speedMultiplier = 1;
            }, resumeDelay);
        };
        container.addEventListener("mouseenter", mouseEnterHandler);
        container.addEventListener("mouseleave", mouseLeaveHandler);
    }

    function removeHoverEvents() {
        if (!container || !hoverPause) return;
        container.removeEventListener("mouseenter", mouseEnterHandler);
        container.removeEventListener("mouseleave", mouseLeaveHandler);
    }

    function stop() {
        clearTimeout(hoverTimeout);
        clearTimeout(pauseTimeout);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        removeHoverEvents();
    }

    function pause(delay = pauseOnEndMs) {
        clearTimeout(pauseTimeout);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        pauseTimeout = setTimeout(() => {
            lastTime = null;
            rafId = requestAnimationFrame(tick);
        }, delay);
    }

    function tick(now) {
        if (!container) {
            rafId = requestAnimationFrame(tick);
            return;
        }

        if (!lastTime) lastTime = now;
        const delta = now - lastTime;
        lastTime = now;

        if (speedMultiplier > 0) {
            const max = getMax();
            if (max <= 0) {
                pause(10e3);
                return;
            }

            const exact = (speed * delta / 1000) * speedMultiplier + remainder;
            const whole = Math.trunc(exact);
            remainder = exact - whole;
            let pos = getPos() + whole * dir;

            if (pos > max) {
                pos = max;
                dir = -1;
                setPos(pos);
                pause();
                return;
            }
            if (pos < 0) {
                pos = 0;
                dir = 1;
                setPos(pos);
                pause();
                return;
            }


            setPos(pos);
        }

        rafId = requestAnimationFrame(tick);
    }


    function start() {
        stop();
        addHoverEvents();
        lastTime = null;
        remainder = 0;
        pause(pauseOnEndMs);
        // rafId = requestAnimationFrame(tick);
    }
    function setSpeed(targetSpeed) {
        speed = targetSpeed;
    }
    return { start, stop, pause, setSpeed };
}