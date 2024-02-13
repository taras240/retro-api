const API_KEY = "iVoZ7p4a2IkZVdVEXbvwgeJbT7MkFiTh";
const USER_NAME = "taras240";
let gameId = "1532";
const requestGameProgressScript = "API_GetGameInfoAndUserProgress.php";
let wrapper = document.querySelector(".wrapper");
// y  =>  Your web API key.
// z  =>  Your username.
// u  =>  The target username.
// g  =>  The target game ID.
let url = `https://retroachievements.org/API/${requestGameProgressScript}?g=${gameId}&u=${USER_NAME}&z=${USER_NAME}&y=${API_KEY}`;
fetch(url)
  .then((resp) => resp.json())
  .then((resp) => parseGameAchievements(resp["Achievements"]));
function parseGameAchievements(achivs) {
  console.log(achivs);
  Object.values(achivs).forEach((achiv) => {
    let achivElement = document.createElement("div");
    achivElement.className = "achiv-block";
    achivElement.innerHTML = `
    <img
        class="achiv-preview"
        src="https://media.retroachievements.org/Badge/${achiv["BadgeName"]}.png"
        alt=""
        srcset=""
    />
    <div class="achiv-details">
        <h2 class="achiv-title">${achiv["Title"]}</h2>
        <p class="achiv-description">${achiv["Description"]}</p>
        <p class="collected-date">${achiv["DateEarned"]}</p>
    </div>
    `;
    wrapper.appendChild(achivElement);
  });
}
