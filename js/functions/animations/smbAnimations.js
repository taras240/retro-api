import { icons, signedIcons } from "../../components/icons.js";
import { delay } from "../delay.js";
const characters = {
    smbMario: {
        spriteFile: "smb3_1.png",
        standSpriteOffset: 0,
        walkSpritesOffset: 0,
        walkSpritesCount: 2,
        jumpSpritesCount: 1,
        jumpSpritesOffset: 2,
        spriteHeight: 16,
        spriteWidth: 16,
        collisionOffset: 0,
    },
    smbLuigi: {
        spriteFile: "smb3_2.png",
        standSpriteOffset: 0,
        walkSpritesOffset: 0,
        walkSpritesCount: 2,
        jumpSpritesCount: 1,
        jumpSpritesOffset: 2,
        spriteHeight: 16,
        spriteWidth: 16,
        collisionOffset: 0,
    },
    smwMario: {
        spriteFile: "smw_1.png",
        standSpriteOffset: 0,
        walkSpritesOffset: 1,
        walkSpritesCount: 2,
        jumpSpritesCount: 1,
        jumpSpritesOffset: 3,
        spriteHeight: 24,
        spriteWidth: 18,
        collisionOffset: 4,
    }, smbasMario: {
        spriteFile: "smbas_1.png",
        standSpriteOffset: 0,
        walkSpritesOffset: 0,
        walkSpritesCount: 2,
        jumpSpritesCount: 1,
        jumpSpritesOffset: 2,
        spriteHeight: 16,
        spriteWidth: 16,
        collisionOffset: 0,
    }, smbasLuigi: {
        spriteFile: "smbas_2.png",
        standSpriteOffset: 0,
        walkSpritesOffset: 0,
        walkSpritesCount: 2,
        jumpSpritesCount: 1,
        jumpSpritesOffset: 2,
        spriteHeight: 16,
        spriteWidth: 16,
        collisionOffset: 0,
    }
}
const updateFrame = ({ character, curSprite, sptiteOffset }) => {
    const spriteWidth = character.offsetWidth;
    const posX = `-${(sptiteOffset + curSprite) * spriteWidth}px`;
    character.style.backgroundPositionX = posX;
}
export function smb3UnlockAnimation() {
    const FRAME_TIME = 1000 / 50;
    const CHARACTER_MIN_SIZE = 36;
    const pageWidth = document.body.offsetWidth;
    let characterPreset;

    let speedX, speedY, g, maxJumpHeight = 0;

    const setCharacterPreset = (cheevoBox) => {
        const { TrueRatio, Points } = cheevoBox?.dataset;
        const rarity = TrueRatio / Points;
        if (rarity >= 4) {
            characterPreset = characters.smwMario;
        }
        else if (rarity > 3) {
            characterPreset = characters.smbasMario;
        }
        else if (rarity > 2) {
            characterPreset = characters.smbasLuigi;
        }
        else if (rarity > 1) {
            characterPreset = characters.smbMario;
        }
        else {
            characterPreset = characters.smbLuigi;
        }
        characterPreset = characters.smbasLuigi;

        // character.style.backgroundPositionY = `-${character.offsetHeight}px`;
    }
    const calcMoveProperties = ({ character }) => {
        const characterSize = character.offsetWidth;
        speedX = 2.5 * characterSize;
        speedY = 22 * characterSize;
        g = 5e3;
        maxJumpHeight = 1.1 * characterSize;// (speedY ** 2) / (2 * g);
    }
    const stand = async (character, duration) => {
        const { standSpriteOffset } = characterPreset;

        updateFrame({ character, curSprite: 0, sptiteOffset: standSpriteOffset });

        await delay(duration);
    }

    const walkAnimation = (character) => {
        // const startSpritePos = walkSpritesOffset;
        let walkInterval;

        const { walkSpritesCount, walkSpritesOffset, standSpriteOffset } = characterPreset;
        let curSprite = walkSpritesOffset;

        const start = () => {
            walkInterval = setInterval(() => {
                curSprite++;
                if (curSprite >= walkSpritesCount) curSprite = 0;
                updateFrame({ character, curSprite, sptiteOffset: walkSpritesOffset });
            }, 100);
        }
        const stop = () => {
            walkInterval && clearInterval(walkInterval);
            updateFrame({ character, curSprite: 0, sptiteOffset: standSpriteOffset, });
        }
        return { start, stop };
    }
    const jumpAnimation = (character) => {
        let jumpInterval;
        const { jumpSpritesCount, jumpSpritesOffset } = characterPreset;
        let curSprite = 0;
        const start = () => {
            updateFrame({ character, curSprite, sptiteOffset: jumpSpritesOffset, });
            jumpInterval = setInterval(() => {
                curSprite++;
                if (curSprite >= jumpSpritesCount) curSprite = 0;
                updateFrame({ character, curSprite, sptiteOffset: jumpSpritesOffset, });
            }, 100);
        }
        const stop = () => {
            jumpInterval && clearInterval(jumpInterval);
            updateFrame({ character, curSprite: 0, sptiteOffset: 0, });
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
        const { collisionOffset, spriteHeight } = characterPreset;
        const offset = character.offsetHeight * collisionOffset / spriteHeight;
        targetPos -= offset;
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
        const personHeight = Math.max(boxSizes.height, CHARACTER_MIN_SIZE);
        const personWidth = personHeight * characterPreset.spriteWidth / characterPreset.spriteHeight;
        character.style.setProperty("--width", `${personWidth}px`);
        character.style.setProperty("--height", `${personHeight}px`);
        character.style.backgroundImage = `url(../assets/img/mario_sprites/${characterPreset.spriteFile})`
        character.classList.add("person-container");

        return character;
    }
    const removePerson = (character) => {
        character?.remove();
    }
    async function doAction(cheevoBox, unlockCallback) {
        setCharacterPreset(cheevoBox);
        const boxSizes = cheevoBox.getBoundingClientRect();

        const character = createPerson(boxSizes);
        document.body.append(character);
        calcMoveProperties({ character, cheevoBox })

        const startPos = {
            top: boxSizes.top + boxSizes.height + maxJumpHeight,
            left: boxSizes.left < pageWidth - boxSizes.right ? -character.offsetWidth : pageWidth,
        }

        const setStartPosition = () => {
            character.style.top = `${startPos.top}px`;
            character.style.left = `${startPos.left}px`;
        }
        const onCollision = async (cheevoBox) => {
            const showCoin = async (cheevoBox) => {
                const coin = document.createElement("div");
                coin.classList.add("coin__container");
                coin.style.setProperty("--achiv-height", `${boxSizes.height}px`)

                const coins = cheevoBox.dataset.TrueRatio;
                coin.innerHTML = `
                    <div class='coins__points'>${icons.retropoints}${coins}</div>
                    <div class='coins__coin'></div>
                `;
                document.body.appendChild(coin);
                coin.style.top = boxSizes.top - boxSizes.height / 2 + "px";
                coin.style.left = boxSizes.left + "px";
                await delay(3000);
                coin?.remove();

            }
            cheevoBox.classList.add("mario-dumb");
            await showCoin(cheevoBox);
            cheevoBox.classList.remove("mario-dumb")
            unlockCallback?.();
        }

        const targetPos = {
            X: Math.round((boxSizes.left) + cheevoBox.offsetWidth / 2 - character.offsetWidth / 2) + 1,
            Y: Math.round(boxSizes.top + cheevoBox.offsetHeight),
        }

        setStartPosition();
        await walkToPos({ character, targetPos: targetPos.X });
        await stand(character, 250);
        await jumpToPos({
            character,
            targetPos: targetPos.Y,
            onCollision: () => onCollision(cheevoBox)
        });
        await stand(character, 250);
        await walkToPos({ character, targetPos: startPos.left });
        removePerson(character);

    }
    return { doAction }
}
