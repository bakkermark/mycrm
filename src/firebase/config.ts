// Firebase configuration
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth, Auth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { FieldValue } from "@firebase/firestore"
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBBuQ2YUp05ClALuSpg_8zxIEQCVyvC-tQ",
  authDomain: "dev-mycrm.firebaseapp.com",
  projectId: "dev-mycrm",
  storageBucket: "dev-mycrm.appspot.com",
  messagingSenderId: "935411313031",
  appId: "1:935411313031:web:9c28fbd6e7e5e7fa300b22",
  measurementId: "G-WT7D0J0JH9"
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)
const projectStorage = getStorage(app);

// Firebase services
const auth: Auth = getAuth(app)
const projectFirestore = getFirestore(app)
const analytics = getAnalytics(app)

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("State persistence set to 'local'")
  })
  .catch((error) => {
    console.error("Could not set firebase auth state persistence: ", error)
  })

// Export Firebase services
export { auth, projectFirestore, projectStorage, analytics, FieldValue, app };
