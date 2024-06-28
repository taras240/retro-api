const fs = require("fs");
const templateFilePath = "./elements/tempIndex.elen";
const indexFilePath = "./index.html";
const sections = {
  gameCard: "./elements/gameCard.elem",
  // about: "./elements/about.elem",
  target: "./elements/target.elem",
  progression: "./elements/progression.elem",
  login: "./elements/login.elem",
  panel: "./elements/side-panel.elem",
  // settings: "./elements/settings.elem",
  awards: "./elements/awards.elem",
  status: "./elements/status.elem",
  games: "./elements/games.elem",
  note: "./elements/note.elem",
  user: "./elements/userInfo.elem",
  notifications: "./elements/notification.elem",
  stats: "./elements/stats.elem",
};

// Функція для завантаження розділів
async function makeHtml() {
  let wrapperHtml = "";
  // Проходимося по кожному імені розділу в об'єкті sections
  for (const sectionName in sections) {
    // Отримуємо шлях до розділу за його ім'ям
    const sectionUrl = sections[sectionName];
    // Читаємо файл
    let text = await readFile(sectionUrl);
    // Додаєм текст
    wrapperHtml += text;
  }
  const indexHtml = await readFile(templateFilePath);
  const insertionPoint = `<div class="wrapper">`;
  const resultHtml = indexHtml.replace(
    insertionPoint,
    insertionPoint + wrapperHtml
  );
  return resultHtml;
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, text) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(text);
    });
  });
}
function writeFile(filePath, htmlFile) {
  fs.writeFile(filePath, htmlFile, (err) => {
    if (err) {
      console.error("Помилка запису у файл:", err);
      return;
    }
    console.log("Файл успішно записано:", filePath);
  });
}
// makeHtml();
makeHtml().then((text) => writeFile(indexFilePath, text));

