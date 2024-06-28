const sections = {
  gameCard: "./elements/gameCard.elem",
  about: "./elements/about.elem",
  target: "./elements/target.elem",
  achievements: "./elements/progression.elem",
  login: "./elements/login.elem",
  panel: "./elements/side-panel.elem",
  // settings: "./elements/settings.elem",
  gamePopup: "./elements/gamePopup.elem",
  awards: "./elements/awards.elem",
  status: "./elements/status.elem",
  games: "./elements/games.elem",
  note: "./elements/note.elem",
  user: "./elements/userInfo.elem",
  notification: "./elements/notification.elem",
  stats: "./elements/stats.elem",
};
export async function loadSections() {
  if (window.location.pathname !== '/test.html') {
    return;
  }
  try {
    // Проходимося по кожному імені розділу в об'єкті sections
    for (const sectionName in sections) {
      // Отримуємо шлях до розділу за його ім'ям
      const sectionUrl = sections[sectionName];
      // Виконуємо запит за шляхом за допомогою fetch
      const response = await fetch(sectionUrl);
      // Перевіряємо, чи був успішним запит
      if (!response.ok) {
        throw new Error(`Failed to fetch section: ${sectionUrl}`);
      }
      // Отримуємо HTML відповіді
      const html = await response.text();
      // Створюємо новий елемент div для розділу
      const section = document.createElement("div");
      // Додаємо HTML вміст до нового елементу div
      section.innerHTML = html;
      // Знаходимо контейнер з класом .wrapper та додаємо до нього новий розділ
      document.querySelector(".wrapper").appendChild(section);
    }
  } catch (error) {
    // Ловимо будь-які помилки та виводимо їх в консоль
    console.error("Error loading sections:", error);
  }

}
