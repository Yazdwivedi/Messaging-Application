import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { createContext, useContext } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyCBbRiBPdIG_U2D-nqRI4RP4YkAplphSN0",
  authDomain: "messaging-5573e.firebaseapp.com",
  projectId: "messaging-5573e",
  storageBucket: "messaging-5573e.appspot.com",
  messagingSenderId: "109832450740",
  appId: "1:109832450740:web:e78b34d6e3d361280e1de1",
  measurementId: "G-JF3NXB1289",
};

const FirestoreContext = createContext("");

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const FirestoreProvider = ({ children }) => {
  return (
    <FirestoreContext.Provider
      // @ts-ignore
      value={db}
    >
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  const value = useContext(FirestoreContext);
  return value;
};
