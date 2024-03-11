function createGameCard() {
  // Створюємо елементи
  const section = document.createElement("section");
  section.classList.add("game-card_section", "section");
  section.id = "game_section";

  const container = document.createElement("div");
  container.classList.add("game-card_container");

  const headerContainer = document.createElement("div");
  headerContainer.classList.add("game-card-header_container");

  const header = document.createElement("h2");
  header.classList.add("game-card-header");
  header.setAttribute("id", "game-card-header");
  header.textContent = "Some Game Name";

  const infoContainer = document.createElement("div");
  infoContainer.classList.add("game-card-info_container");

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("game-card-image");

  const image = document.createElement("img");
  image.setAttribute("id", "game-card-image");
  image.setAttribute("src", "./assets/img/prev.png");
  image.setAttribute("alt", " ");

  const descriptionContainer = document.createElement("div");
  descriptionContainer.classList.add("game-card-description");

  const infoHeaders = [
    "Platform",
    "Developer",
    "Publisher",
    "Genre",
    "Released",
    "Completion",
  ];
  const infoTexts = [
    "Nes/Famicom",
    "SunSoft",
    "SunSoft",
    "Platformer",
    "December 1989",
    "54.45%",
  ];

  for (let i = 0; i < infoHeaders.length; i++) {
    const info = document.createElement("div");
    info.classList.add("game-card-info");

    const infoHeader = document.createElement("h3");
    infoHeader.classList.add("game-info-header");
    infoHeader.textContent = infoHeaders[i];

    const infoText = document.createElement("p");
    infoText.classList.add("game-card-text");
    infoText.classList.add(infoHeaders[i].toLowerCase());
    infoText.setAttribute("id", "game-card-" + infoHeaders[i].toLowerCase());
    infoText.textContent = infoTexts[i];

    info.appendChild(infoHeader);
    info.appendChild(infoText);
    descriptionContainer.appendChild(info);
  }

  // Додаємо створені елементи до DOM
  headerContainer.appendChild(header);
  container.appendChild(headerContainer);
  imageContainer.appendChild(image);
  infoContainer.appendChild(imageContainer);
  infoContainer.appendChild(descriptionContainer);
  container.appendChild(infoContainer);
  section.appendChild(container);
  return section;
}
