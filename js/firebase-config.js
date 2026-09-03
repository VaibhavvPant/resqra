// ==================== FIREBASE CONFIGURATION ====================
const firebaseConfig = {
  apiKey: "AIzaSyASUR2kN_06dAiSW96c_96xgpZmqbOSmcM",
  authDomain: "resqra-bc209.firebaseapp.com",
  projectId: "resqra-bc209",
  storageBucket: "resqra-bc209.firebasestorage.app",
  messagingSenderId: "677278150525",
  appId: "1:677278150525:web:b96c510a5a14bc8fb9a614",
  measurementId: "G-LQ8QTMH3EH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
