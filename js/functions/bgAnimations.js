import { ANIMATIONS } from "../enums/bgAnimations.js";
import { delay } from "./delay.js";

const moveTypes = Object.freeze({
    RANDOM: "random",
    TO_RIGHT: "right",
    TO_TOP: "top"
})
export function initBgAnimation(container, bgAnimType) {
    switch (bgAnimType) {
        case ANIMATIONS.RANDOM_IMAGE:
            return randomImage(container);
        case ANIMATIONS.PARTICLES_MOVE_RANDOM:
            return particlesAnimation(container, moveTypes.RANDOM);
        case ANIMATIONS.PARTICLES_MOVE_RIGHT:
            return particlesAnimation(container, moveTypes.TO_RIGHT);
        case ANIMATIONS.PARTICLES_MOVE_TOP:
            return particlesAnimation(container, moveTypes.TO_TOP);
        case ANIMATIONS.WAVES:
            return wavesAnimation(container);
        default:
            return particlesAnimation(container, moveTypes.TO_RIGHT);
    }
}
function randomImage(container) {
    let imageElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let seed = new Date().getDate() * 5;
    const stop = () => {
        imageElement?.remove();
    }
    const start = () => {
        const initContainer = () => {
            container.innerHTML = "";
            imageElement = document.createElement("img");
            imageElement.id = "background-image";
            container.appendChild(imageElement);
        };
        stop();
        initContainer();
        imageElement.src = `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }
    return { start, stop };
}
function particlesAnimation(container, moveType) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let starMaxSize = 5;
    let starsCount = Math.floor(width * height / (3e4));
    let isPlay = false;
    let canvas, ctx;
    let particles = [];
    const getColorPart = (base) =>
        base ? ~~(Math.random() * 80) - 40 + base : ~~(Math.random() * 155) + 100;

    class Particle {
        constructor(x, y, size, speedX, speedY, color) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speedX = speedX;
            this.speedY = speedY;
            this.color = color;
        }


        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            switch (moveType) {
                case (moveTypes.TO_RIGHT):
                    if (this.x - this.size > width) {
                        this.x = 0 - this.size;
                        this.y = Math.random() * height;
                    };
                    break;
                case (moveTypes.TO_TOP):
                    if (this.y - this.size > height) {
                        this.y = 0 - this.size;
                        this.x = Math.random() * width;
                    };
                    break;
                default:
                    if (this.x - this.size <= 0 || this.x + this.size >= width) this.speedX *= -1;
                    if (this.y - this.size <= 0 || this.y + this.size >= height) this.speedY *= -1;
                    break;
            }

        }


        draw() {
            ctx.beginPath();
            ctx.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }


    const init = (moveType) => {
        const initContainer = () => {
            container.innerHTML = "";
            canvas = document.createElement("canvas");
            container.appendChild(canvas);

            ctx = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
        }
        initContainer();

        for (let i = 0; i < starsCount; i++) {
            const size = ~~(Math.random() * starMaxSize) + 1;
            const x = Math.random() * width;
            const y = Math.random() * height;
            let speedX, speedY;
            switch (moveType) {
                case (moveTypes.TO_RIGHT):
                    speedX = size / (starMaxSize * 3);
                    speedY = 0;
                    break;
                case (moveTypes.TO_TOP):
                    speedY = size / (starMaxSize * 3);
                    speedX = 0;
                    break;
                default:
                    speedX = (Math.random() - 0.5) * 1;
                    speedY = (Math.random() - 0.5) * 1;
                    break;
            }
            const baseColor = getColorPart();
            const color = `rgb(${baseColor},${getColorPart(baseColor)},${getColorPart(baseColor)})`;
            particles.push(new Particle(x, y, size, speedX, speedY, color));
        }
    }


    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!isPlay) return;

        for (let p of particles) {
            p.update();
            p.draw();
        }

        requestAnimationFrame(animate);
    }



    const start = () => {
        stop();

        isPlay = true;
        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });


        init(moveType);
        animate();
    }
    const stop = () => {
        isPlay = false;
        particles = [];

    }
    return { start, stop };
}

function wavesAnimation(container) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isPlay = false;
    let canvas, ctx;
    const init = (moveType) => {
        const initContainer = () => {
            container.innerHTML = "";
            canvas = document.createElement("canvas");
            container.appendChild(canvas);

            ctx = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
            canvas.style.background = "var(--selection-color)";
        }
        initContainer();

        resize();
    }

    function resize() {
        canvas.width = innerWidth * devicePixelRatio;
        canvas.height = innerHeight * devicePixelRatio;
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    addEventListener("resize", resize);

    const waves = [
        {
            color: "rgba(255,255,255,0.20)",
            amplitude: 25,
            wavelength: 320,
            speed: 0.6,
            offset: innerHeight * 0.55
        },
        {
            color: "rgba(255,255,255,0.12)",
            amplitude: 40,
            wavelength: 450,
            speed: 1.2,
            offset: innerHeight * 0.58
        },
        {
            color: "rgba(255,255,255,0.08)",
            amplitude: 18,
            wavelength: 180,
            speed: 0.35,
            offset: innerHeight * 0.52
        }
    ];

    let time = 0;

    function drawWave(wave) {
        ctx.beginPath();

        for (let x = 0; x <= innerWidth; x += 2) {
            const y =
                wave.offset +
                Math.sin((x / wave.wavelength) + time * wave.speed) * wave.amplitude;

            if (x === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.lineTo(innerWidth, innerHeight);
        ctx.lineTo(0, innerHeight);
        ctx.closePath();

        ctx.fillStyle = wave.color;
        ctx.fill();
    }

    function animate() {
        time += 0.01;

        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (const wave of waves)
            drawWave(wave);

        requestAnimationFrame(animate);
    }
    const start = () => {
        stop();

        isPlay = true;
        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });


        init();
        animate();
    }
    const stop = () => {
        isPlay = false;
        container.innerHTML = "";
    }
    // animate();
    return { start, stop };
}