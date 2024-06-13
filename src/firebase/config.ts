import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, Auth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAFI8jfCr19xMwr8Hbpdj5VCGmiCCfAaZ4",
  authDomain: "dev-trivia-9f984.firebaseapp.com",
  projectId: "dev-trivia-9f984",
  storageBucket: "dev-trivia-9f984.appspot.com",
  messagingSenderId: "170568231111",
  appId: "1:170568231111:web:4bf612017d9582d38af6e2",
  measurementId: "G-375JLRYGZH"
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
