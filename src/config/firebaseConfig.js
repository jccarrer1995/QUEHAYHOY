import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

/**
 * Configuración de Firebase para QUEHAYHOY
 * Credenciales desde .env (VITE_FIREBASE_*)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

let app = null;
let db = null;
let auth = null;
let functions = null;
let analytics = null;

if (hasValidConfig) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  functions = getFunctions(app);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
}

/** Firestore - base de datos */
export { db };
/** Auth - autenticación (Google, Apple, etc.) */
export { auth };
/** Cloud Functions */
export { functions };
/** Analytics - métricas (opcional) */
export { analytics };
export default app;
