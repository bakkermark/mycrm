import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { FieldValue } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBuQ2YUp05ClALuSpg_8zxIEQCVyvC-tQ",
  authDomain: "dev-mycrm.firebaseapp.com",
  projectId: "dev-mycrm",
  storageBucket: "dev-mycrm.appspot.com",
  messagingSenderId: "935411313031",
  appId: "1:935411313031:web:9c28fbd6e7e5e7fa300b22",
  measurementId: "G-WT7D0J0JH9"
};

const app = initializeApp(firebaseConfig);
const projectFirestore = getFirestore(app);
const analytics = getAnalytics(app);

const auth = getAuth();
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("State persistence set to 'local'");
  })
  .catch((error) => {
    console.error("Could not set firebase auth state persistence: ", error);
  });

export { app, projectFirestore, analytics, FieldValue, firebaseConfig };
