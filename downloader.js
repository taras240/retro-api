const https = require('https');
const fs = require('fs');
const { log } = require('console');

const imageUrlBase = 'https://media.retroachievements.org';


function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, text) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(text));
        });
    });
}
let count = 0;
function downloadFile({ imageUrl, filePath }) {
    https.get(imageUrl, function (response) {
        const writer = fs.createWriteStream(filePath);

        response.pipe(writer);

        writer.on('finish', function () {
            log(`${++count}. `, filePath, ': Image downloaded successfully.');
        });

    }).on('error', function (error) {
        console.error('Error downloading image:', error);
    });
}
function isExist(filePath) {
    return fs.existsSync(filePath);
}

function doImageСache({ gamesJsonPath }) {
    const cachePath = './assets/imgCache/'
    //read json file with game-objects
    readFile(gamesJsonPath).then(arr => {
        //download image from each game-object
        const delayInMiliseconds = 500;
        let delayMult = 0;
        arr.forEach((game, index) => {
            //set time delay between downloads

            setTimeout(() => {
                // image name
                const imgName = game.ImageIcon.slice(game.ImageIcon.lastIndexOf("/") + 1);
                const filePath = cachePath + imgName;
                const webpFilePath = filePath.slice(0, filePath.lastIndexOf(".") + 1) + "webp";
                const imageUrl = `${imageUrlBase}${game.ImageIcon}`;
                // check for image exist and download 
                if (!isExist(filePath) && !isExist(webpFilePath)) {
                    setTimeout(() => {
                        downloadFile({ imageUrl: imageUrl, filePath: filePath });
                    }, (++delayMult) * delayInMiliseconds);
                }
                else {
                    log(`${cachePath}[${imgName}] exist`);
                }
            });

        })

    })
}
function downloadConsolesPreview({ consolesJsonPath }) {
    const cachePath = './assets/imgCache/'
    //read json file with game-objects
    readFile(consolesJsonPath).then(arr => {
        //download image from each game-object
        const delayInMiliseconds = 500;
        let delayMult = 0;
        arr.forEach((console, index) => {
            //set time delay between downloads
            setTimeout(() => {
                // image name
                const imgName = console.ID + ".png";
                const filePath = cachePath + imgName;
                const imageUrl = console.IconURL;
                // check for image exist and download 
                if (!isExist(filePath)) {
                    setTimeout(() => {
                        downloadFile({ imageUrl: imageUrl, filePath: filePath });
                    }, (++delayMult) * delayInMiliseconds);
                }
                else {
                    log(`${cachePath}[${imgName}] exist`);
                }
            });

        })

    })
}
downloadConsolesPreview({ consolesJsonPath: './json/games/consoles.json' });
// doImageСache({ gamesJsonPath: './json/games/41.json' });