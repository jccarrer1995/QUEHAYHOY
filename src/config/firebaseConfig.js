import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
} from 'firebase/firestore';
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

/** Sin esto, `signInWithPopup` suele fallar con auth/configuration-not-found */
const missingFirebaseEnvKeys = /** @type {string[]} */ ([])
if (!firebaseConfig.apiKey) missingFirebaseEnvKeys.push('VITE_FIREBASE_API_KEY')
if (!firebaseConfig.authDomain) missingFirebaseEnvKeys.push('VITE_FIREBASE_AUTH_DOMAIN')
if (!firebaseConfig.projectId) missingFirebaseEnvKeys.push('VITE_FIREBASE_PROJECT_ID')
if (!firebaseConfig.appId) missingFirebaseEnvKeys.push('VITE_FIREBASE_APP_ID')
if (!firebaseConfig.messagingSenderId) missingFirebaseEnvKeys.push('VITE_FIREBASE_MESSAGING_SENDER_ID')
if (!firebaseConfig.storageBucket) missingFirebaseEnvKeys.push('VITE_FIREBASE_STORAGE_BUCKET')

const hasValidConfig = missingFirebaseEnvKeys.length === 0

if (import.meta.env.DEV && !hasValidConfig) {
  console.warn(
    '[Firebase] Config incompleta. Completa en .env:',
    missingFirebaseEnvKeys.join(', '),
    '— Copia el objeto firebaseConfig desde Firebase Console → Configuración del proyecto → Tus apps → Web.'
  )
}

let app = null;
let db = null;
let auth = null;
let functions = null;
let analytics = null;

if (hasValidConfig) {
  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, {
    // Multi-tab permite usar IndexedDB persistente sin conflicto entre pestañas.
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
  enableNetwork(db).catch(() => {
    // Red o permisos: la app sigue con datos en caché si existen
  });
  auth = getAuth(app);
  functions = getFunctions(app);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
}

/** Nombres de variables faltantes en .env (vacío si la config es usable) */
export { missingFirebaseEnvKeys };

/** Firestore - base de datos */
export { db };
/** Auth - autenticación (Google, Apple, etc.) */
export { auth };
/** Cloud Functions */
export { functions };
/** Analytics - métricas (opcional) */
export { analytics };
export default app;
