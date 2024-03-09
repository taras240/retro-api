function addDraging(container) {
  // Функція, яка викликається при початку перетягування елементу
  const dragStart = (event) => {
    event.stopPropagation();
    console.log("event");
    // Встановлюємо дані, які будуть передані під час перетягування
    event.dataTransfer.setData("text/plain", event.target.id);
    // Додаємо клас для виділення під час перетягування
    event.target.classList.add("dragging");
  };
  // Функція, яка викликається після завершення перетягування елементу
  const dragEnd = (event) => {
    // Видаляємо клас для виділення під час перетягування
    event.target.classList.remove("dragging");
  };
  // Функція, яка викликається, коли перетягуваний елемент наводиться на контейнер
  const dragOver = (event) => {
    event.preventDefault();
  };
  // Функція, яка викликається, коли перетягуваний елемент опускається в контейнер
  const drop = (event) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain");
    const item = document.getElementById(itemId);
    // Додаємо перетягуваний елемент до контейнера
    event.target.appendChild(item);
  };

  console.log("start");
  // Вибираємо всі елементи, які можна перетягувати
  const dragAndDropItems = container.querySelectorAll(".target-achiv");

  // Додаємо обробник події для початку перетягування елементу
  dragAndDropItems.forEach((item) => {
    item.addEventListener("dragstart", dragStart);
  });

  // Додаємо обробник події для кінця перетягування елементу
  document.addEventListener("dragend", dragEnd);

  // Додаємо обробник події для кожного контейнера, в якому можна розмістити перетягуваний елемент
  const dropContainers = container.querySelectorAll(".drop-container");
  dropContainers.forEach((container) => {
    container.addEventListener("dragover", dragOver);
    container.addEventListener("drop", drop);
  });
}
