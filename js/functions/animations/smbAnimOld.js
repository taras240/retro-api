import { delay } from "../delay.js";

export async function marioAction(cheevoElement, cheevo, context) {
    const isHardcore = cheevo.isEarnedHardcore;
    const mario = document.createElement("div");
    mario.classList.add("mario__container", "stand");
    context.container.appendChild(mario);

    const marioSize = mario.getBoundingClientRect().width;
    const targetElementDimensions = cheevoElement?.getBoundingClientRect();
    const targetPos = {
        xPos: targetElementDimensions.left,
        yPos: targetElementDimensions.top + marioSize,
    }
    const jumpHeight = marioSize * 2;
    const toLeft = targetElementDimensions.left > window.innerWidth / 2;
    const startPos = {
        xPos: toLeft ? window.innerWidth + marioSize : - marioSize,
        yPos: targetPos.yPos + jumpHeight,
    }
    const frameDuration = 70;
    const g = 10;
    let dx = 20;
    let dy = Math.sqrt(2 * g * jumpHeight);

    mario.style.top = startPos.yPos + 'px';
    mario.style.left = startPos.xPos + 'px';


    const walkToTarget = async () => {
        let XPos = startPos.xPos;

        mario.classList.remove("stand");
        mario.classList.add("walk");
        mario.classList.toggle("to-left", toLeft)
        mario.style.setProperty('--frame-duration', `${frameDuration}ms`);

        while (XPos !== targetPos.xPos) {
            if (toLeft) {
                XPos -= dx;
                XPos < targetPos.xPos && (XPos = targetPos.xPos);
            }
            else {
                XPos += dx;
                XPos > targetPos.xPos && (XPos = targetPos.xPos);
            }
            mario.style.left = XPos + 'px';
            await delay(frameDuration);
        }
        mario.classList.remove("walk");
        mario.classList.add("stand");
        await delay(500);
    }
    const jump = async () => {
        mario.classList.remove("stand");
        mario.classList.add("jump");
        let YPos = startPos.yPos;
        while (~~dy > 0) {
            YPos -= dy;
            dy -= g;
            if (YPos < targetPos.yPos) {
                YPos = targetPos.yPos - 2;
                mario.style.top = YPos + 'px';
            }
            else {
                mario.style.top = YPos + 'px';
                await delay(frameDuration);
            }
        }
        collisionWithTarget();
        dy = 0;
        while (YPos < startPos.yPos) {
            YPos += dy;
            dy += g;
            YPos > startPos.yPos && (YPos = startPos.yPos);
            mario.style.top = YPos + 'px';
            await delay(frameDuration);
        }
        mario.classList.remove("jump");
        mario.classList.add("stand");
        await delay(500);
        mario.classList.toggle("to-left", !toLeft);
        await delay(500);
    }
    const collisionWithTarget = () => {
        const coin = document.createElement("div");
        coin.classList.add("coin__container");

        const coins = isHardcore ? cheevo.TrueRatio + "RP" : cheevo.Points + "SP";
        coin.innerHTML = `
                <div class='coins__points'>+${coins}</div>
                <div class='coins__coin'></div>
            `;
        context.section.appendChild(coin);
        context.section.classList.add("focus");
        coin.style.top = targetElementDimensions.top - targetElementDimensions.height / 2 + "px";
        coin.style.left = targetPos.xPos + "px";
        cheevoElement?.classList.add("earned", "mario-dumb");
        cheevoElement?.classList.toggle("hardcore", isHardcore);
        setTimeout(() => cheevoElement?.classList.remove("mario-dumb"), 500);
        setTimeout(() => {
            coin.remove();
            context.section.classList.remove("focus")
        }, 5000);

    }
    const walkAway = async () => {
        let XPos = mario.getBoundingClientRect().left;
        mario.style.setProperty('--frame-duration', `${frameDuration * 0.75}ms`);
        mario.className = `mario__container walk ${!toLeft ? 'to-left' : ''} `;
        while (XPos !== startPos.xPos) {
            if (toLeft) {
                XPos += dx;
                XPos > startPos.xPos && (XPos = startPos.xPos)
            }
            else {
                XPos -= dx;
                XPos < startPos.xPos && (XPos = startPos.xPos)
            }
            mario.style.left = XPos + 'px';
            await delay(frameDuration * 0.75);
        }
    }

    await walkToTarget();
    await jump();
    await walkAway();

    mario.remove();
    await delay(100);
    return;
}