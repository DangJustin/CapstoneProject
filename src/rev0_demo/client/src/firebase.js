// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4BEcqA42zpKKzh8PxB1geknhMbYvKCJM",
  authDomain: "housemates-59de1.firebaseapp.com",
  projectId: "housemates-59de1",
  storageBucket: "housemates-59de1.appspot.com",
  messagingSenderId: "923278203017",
  appId: "1:923278203017:web:dd67ef806bf5cef9330e58",
  measurementId: "G-W4GKE9PHQB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
export const auth = getAuth(app)



