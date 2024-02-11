import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
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

export { app, projectFirestore, analytics, FieldValue };
