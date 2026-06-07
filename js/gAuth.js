// Імпорт з Firebase CDN (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDQ49fg0lzzevgVOEgOxEI_4EOZkGf-1GU",
    authDomain: "retrocheevos-tracker.firebaseapp.com",
    projectId: "retrocheevos-tracker",
    storageBucket: "retrocheevos-tracker.firebasestorage.app",
    messagingSenderId: "129539517826",
    appId: "1:129539517826:web:c8473ed416e1edb247f39b",
    measurementId: "G-LRJ1LTVEBM"
};

// Ініціалізація
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM елементи
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");

// Вхід через Google
loginBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Увійшов:", user);
    } catch (error) {
        console.error("Помилка входу:", error.message);
    }
});

// Вихід
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});

// Відстеження стану авторизації
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.hidden = true;
        logoutBtn.hidden = false;
        userInfo.innerHTML = `
      <img src="${user.photoURL}" width="48" style="border-radius:50%" />
      <p>Привіт, <strong>${user.displayName}</strong>!</p>
      <p>Email: ${user.email}</p>
    `;
    } else {
        loginBtn.hidden = false;
        logoutBtn.hidden = true;
        userInfo.innerHTML = "";
    }
});