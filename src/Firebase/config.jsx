import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDHXr8ZbCL7zVCi6Sw2FOYgIO9yeXSGNQs',
  authDomain: 'plataformas-8cabd.firebaseapp.com',
  projectId: 'plataformas-8cabd',
  storageBucket: 'plataformas-8cabd.appspot.com',
  messagingSenderId: '221357654076',
  appId: '1:221357654076:web:f5cb1e54d169677099c339',
  measurementId: 'G-F225055YCE',
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, { experimentalForceLongPolling: true });

export const storage = getStorage(app);
export default {};
