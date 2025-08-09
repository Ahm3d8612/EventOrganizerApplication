// firebaseConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCJyF6OvPsTfqsxuWdJy8rN6bZOdPOwn4c",
    authDomain: "eventorganizerapp-bd8f9.firebaseapp.com",
    projectId: "eventorganizerapp-bd8f9",
    storageBucket: "eventorganizerapp-bd8f9.firebasestorage.app",
    messagingSenderId: "180380875267",
    appId: "1:180380875267:web:9e9e6c5b6b8ef67c15ec36"
  };

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);



