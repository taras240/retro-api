import { icons, signedIcons } from "../../components/icons.js";
import { delay } from "../delay.js";

export function smb3UnlockAnimation() {
    const FRAME_TIME = 1000 / 50;
    const CHARACTER_MIN_SIZE = 48;
    const pageWidth = document.body.offsetWidth;
    const walkSpritesCount = 2;
    const walkSpritesOffset = 0;
    const jumpSpritesCount = 1;
    const jumpSpritesOffset = 2;

    let speedX, speedY, g, maxJumpHeight = 0;

    const setCharacter = (character, characterStyle) => {
        characterStyle ??= Math.floor(Math.random() * 2);
        character.style.backgroundPositionY = `-${characterStyle * character.offsetHeight}px`;
    }
    const calcMoveProperties = ({ character }) => {
        const characterSize = character.offsetWidth;
        speedX = 2.5 * characterSize;
        speedY = 22 * characterSize;
        g = 6e3;
        maxJumpHeight = 2 * characterSize;// (speedY ** 2) / (2 * g);
    }
    const walkAnimation = (character) => {
        const startSpritePos = walkSpritesOffset;
        let walkInterval;
        let curSprite = 0;
        const spritesCount = walkSpritesCount;
        const spriteWidth = character.offsetWidth;
        const start = () => {
            walkInterval = setInterval(() => {
                curSprite++;
                if (curSprite >= spritesCount) curSprite = 0;

                const posX = `-${startSpritePos + curSprite * spriteWidth}px`;
                character.style.backgroundPositionX = posX;
            }, 100);
        }
        const stop = () => {
            walkInterval && clearInterval(walkInterval);
            character.style.backgroundPositionX = `${startSpritePos}px`;
        }
        return { start, stop };
    }
    const jumpAnimation = (character) => {
        let jumpInterval;
        let curSprite = 0;
        const spritesCount = jumpSpritesCount;
        const spriteWidth = character.offsetWidth;
        const startSpritePos = jumpSpritesOffset * spriteWidth;

        const updateFrame = (curSprite) => {
            const posX = `-${startSpritePos + curSprite * spriteWidth}px`;
            character.style.backgroundPositionX = posX;
        }

        const start = () => {
            updateFrame(curSprite);
            jumpInterval = setInterval(() => {
                curSprite++;
                if (curSprite >= spritesCount) curSprite = 0;
                updateFrame(curSprite);
            }, 100);
        }
        const stop = () => {
            jumpInterval && clearInterval(jumpInterval);
            character.style.backgroundPositionX = `${0}px`;
        }
        return { start, stop };
    }
    const walkToPos = async ({ character, targetPos }) => {
        const walkAnim = walkAnimation(character);
        let curPosX = character.offsetLeft;
        character.classList.remove("to-left", "to-right");

        const goLeft = async (targetPos, walkAnim) => {
            character.classList.add("to-left");
            await delay(500);
            walkAnim.start();
            while (character.offsetLeft > targetPos) {
                const curPosX = character.offsetLeft;
                const newPos = curPosX - speedX / FRAME_TIME;
                character.style.left = `${newPos <= targetPos ? targetPos : newPos}px`;
                await delay(FRAME_TIME);
            }
            walkAnim.stop()

        }
        const goRight = async (targetPos, walkAnim) => {
            character.classList.add("to-right");
            await delay(500);
            walkAnim.start();
            while (character.offsetLeft < targetPos) {
                const curPosX = character.offsetLeft;
                const newPos = curPosX + speedX / FRAME_TIME;
                character.style.left = `${newPos >= targetPos ? targetPos : newPos}px`;
                await delay(FRAME_TIME);
            }
            walkAnim.stop()
        }

        if (curPosX < targetPos) await goRight(targetPos, walkAnim);
        else if (curPosX > targetPos) await goLeft(targetPos, walkAnim);


    }
    const jumpToPos = async ({ character, targetPos, onCollision }) => {
        const startPos = character.offsetTop;
        const jumpAnim = jumpAnimation(character);
        jumpAnim.start();

        do {
            const curY = character.offsetTop;

            const delta = speedY * FRAME_TIME / 1000;
            let newY = curY - delta;
            if (newY <= targetPos) {
                newY = targetPos;
                onCollision?.();
            }
            else if (newY > startPos) newY = startPos;
            character.style.top = `${newY}px`;

            if (newY === targetPos && speedY > 0) speedY = 0;

            speedY -= g * FRAME_TIME / 1000;

            await delay(FRAME_TIME);
        } while (character.offsetTop < startPos)

        jumpAnim.stop();
    };

    const createPerson = (boxSizes) => {

        const character = document.createElement("div");
        const personHeight = boxSizes.height > CHARACTER_MIN_SIZE ? boxSizes.height : CHARACTER_MIN_SIZE;
        character.style.setProperty("--height", `${personHeight}px`)
        character.classList.add("person-container", "smb3_small-m");
        return character;
    }
    const removePerson = (character) => {
        character?.remove();
    }
    async function doAction(cheevoBox, unlockCallback) {
        const boxSizes = cheevoBox.getBoundingClientRect();

        const character = createPerson(boxSizes);
        document.body.append(character);
        calcMoveProperties({ character, cheevoBox })
        setCharacter(character)
        const startPos = {
            top: boxSizes.top + boxSizes.height + maxJumpHeight,
            left: boxSizes.left < pageWidth - boxSizes.right ? -character.offsetWidth : pageWidth,
        }

        const setStartPosition = () => {
            character.style.top = `${startPos.top}px`;
            character.style.left = `${startPos.left}px`;
        }
        const onCollision = (cheevoBox) => {
            const showCoin = (cheevoBox) => {
                const coin = document.createElement("div");
                coin.classList.add("coin__container");
                coin.style.setProperty("--achiv-height", `${boxSizes.height}px`)

                const coins = cheevoBox.dataset.TrueRatio;
                coin.innerHTML = `
                    <div class='coins__points'>${icons.retropoints}${coins}</div>
                    <div class='coins__coin'></div>
                `;
                document.body.appendChild(coin);
                setTimeout(() => coin?.remove(), 5000)
                coin.style.top = boxSizes.top - boxSizes.height / 2 + "px";
                coin.style.left = boxSizes.left + "px";

            }
            cheevoBox.classList.add("mario-dumb");
            showCoin(cheevoBox);
            unlockCallback?.();
            setTimeout(() => cheevoBox.classList.remove("mario-dumb"), 2000)
        }

        const targetPos = {
            X: Math.round((boxSizes.left) + cheevoBox.offsetWidth / 2 - character.offsetWidth / 2) + 1,
            Y: Math.round(boxSizes.top + cheevoBox.offsetHeight),
        }

        setStartPosition();
        await walkToPos({ character, targetPos: targetPos.X });
        await delay(250);
        await jumpToPos({
            character,
            targetPos: targetPos.Y,
            onCollision: () => onCollision(cheevoBox)
        });
        await delay(250);
        await walkToPos({ character, targetPos: startPos.left });
        removePerson(character);

    }
    return { doAction }
}