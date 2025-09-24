export function hintElement(text) {
  let popup = document.createElement("div");
  popup.classList.add("popup", "hint", "hint-popup");
  popup.innerHTML = `
      <p>${text}</p>
      `;
  return popup;
}