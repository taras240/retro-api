const http = require('http');
const fs = require('fs');
const { log } = require('console');

const imageUrlBase = 'http://media.retroachievements.org';


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
function downloadFile({ imageUrl, filePath }) {
    http.get(imageUrl, function (response) {
        const writer = fs.createWriteStream(filePath);

        response.pipe(writer);

        writer.on('finish', function () {
            log(filePath, ': Image downloaded successfully.');
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
        arr.forEach((game, index) => {
            //set time delay between downloads
            const delayInMiliseconds = 500;
            setTimeout(() => {
                // image name
                const imgName = game.ImageIcon.slice(game.ImageIcon.lastIndexOf("/") + 1);
                const filePath = cachePath + imgName;
                const imageUrl = `${imageUrlBase}${game.ImageIcon}`;
                // check for image exist and download 
                if (!isExist(filePath)) {
                    log(`${cachePath}[${imgName}] downloading`);
                    setTimeout(() => {
                        downloadFile({ imageUrl: imageUrl, filePath: filePath });
                    }, (index + 1) * delayInMiliseconds);
                }
                else {
                    log(`${cachePath}[${imgName}] exist`);
                }
            });

        })

    })
}
doImageСache({ gamesJsonPath: './json/games/3.json' });