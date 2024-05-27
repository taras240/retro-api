// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js';
import { getAuth, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';
import { getFirestore, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';


// Initialize Firebase
const app = initializeApp(UserAuthData.authConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google login function
window.loginWithGoogle = async function () {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        userAuthData.user = user;
    } catch (error) {
        userAuthData.removeUser()
        console.error('Error logging in with Google:', error);
    }
}

// Logout function
window.logoutGoogle = async function () {
    try {
        await signOut(auth);
        userAuthData.removeUser();
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Check auth state on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        userAuthData.user = user;
    } else {
        userAuthData?.removeUser();
    }
});

const db = getFirestore();

// Read data from FireStore
// window.getData = async function downloadFileFromStorage(filePath) {
//     const storageRef = firebase.storage().ref();
//     const fileRef = storageRef.child(filePath);

//     try {
//         const url = await fileRef.getDownloadURL();
//         console.log("URL файлу з Firebase Storage:", url);
//         return url;
//     } catch (error) {
//         console.error("Помилка отримання файлу з Firebase Storage:", error);
//     }
// }

// // Write data to FireStore
// window.saveData = async function uploadFileToStorage(filePath, file) {
//     const storageRef = firebase.storage().ref();
//     const fileRef = storageRef.child(filePath);

//     try {
//         await fileRef.put(file);
//         console.log("Файл успішно завантажений у Firebase Storage");
//     } catch (error) {
//         console.error("Помилка завантаження файлу у Firebase Storage:", error);
//     }
// }
