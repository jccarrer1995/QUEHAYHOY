/**
 * Inicialización de Firebase (app, Auth, Firestore, etc.).
 * La configuración y `initializeApp` están en `./config/firebaseConfig.js`;
 * este módulo expone el mismo API con el nombre de archivo solicitado.
 */
export { db, auth, functions, analytics, missingFirebaseEnvKeys } from './config/firebaseConfig.js'
export { default } from './config/firebaseConfig.js'
