// Import the necessary functions from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import {getAnalytics, isSupported} from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ9dVqZAWX46gp_1uiiNR9Fgd8uvKNXhA",
  authDomain: "pantrytracker-headstarter.firebaseapp.com",
  projectId: "pantrytracker-headstarter",
  storageBucket: "pantrytracker-headstarter.appspot.com",
  messagingSenderId: "537546835003",
  appId: "1:537546835003:web:6f777846ef97eb9ba1881e",
  measurementId: "G-CM95FCT9G4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app); // Initialize Firestore
let analytics;
if (typeof window !== 'undefined' && isSupported()){
  analytics = getAnalytics(app);
}

export { firestore };

/////


