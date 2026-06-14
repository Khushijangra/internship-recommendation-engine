import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// ---------------------------------------------------------------------------
// Firebase configuration — all values must come from environment variables.
// Copy frontend/.env.example → frontend/.env and fill in your project values.
// NEVER add hardcoded credentials here.
// ---------------------------------------------------------------------------

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED_ENV_VARS.filter(
  (key) => !import.meta.env[key]
);

if (missing.length > 0) {
  throw new Error(
    `[firebase.ts] Missing required environment variables: ${missing.join(', ')}.\n` +
    'Copy frontend/.env.example to frontend/.env and fill in your Firebase project credentials.'
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);
auth.languageCode = 'en';

// Firebase Storage
export const storage = getStorage(app);

export default app;
