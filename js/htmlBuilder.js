// Об'єкт, що містить імена розділів і шляхи до них
const sections = {
  gameCard: "./elements/gameCard.jsx",
  about: "./elements/about.jsx",
  target: "./elements/target.jsx",
  achievements: "./elements/achievements.jsx",
  login: "./elements/login.jsx",
  panel: "./elements/panel.jsx",
  settings: "./elements/settings.jsx",
};

// Функція для завантаження розділів
async function loadSections() {
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
