import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, Auth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBBuQ2YUp05ClALuSpg_8zxIEQCVyvC-tQ",
  authDomain: "dev-mycrm.firebaseapp.com",
  projectId: "dev-mycrm",
  storageBucket: "dev-mycrm.appspot.com",
  messagingSenderId: "935411313031",
  appId: "1:935411313031:web:9c28fbd6e7e5e7fa300b22",
  measurementId: "G-WT7D0J0JH9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const projectFirestore = getFirestore(firebaseApp);
const auth: Auth = getAuth(firebaseApp);
const projectStorage = getStorage(firebaseApp);
const functions = getFunctions(firebaseApp);

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("State persistence set to 'local'")
  })
  .catch((error) => {
    console.error("Could not set firebase auth state persistence: ", error)
  })

export { firebaseApp, analytics, projectFirestore, auth, projectStorage, functions };
