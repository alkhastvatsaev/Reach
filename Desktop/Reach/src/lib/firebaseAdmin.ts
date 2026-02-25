import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && projectId && clientEmail && privateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Nettoyage de la clé privée pour gérer les retours à la ligne \n
        privateKey: privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Cloud Sync [ACTIVE]');
  } catch (error) {
    console.error('Firebase Admin Initialization error:', error);
  }
} else if (!admin.apps.length) {
    console.warn('Firebase Credentials missing. Sync is [DISABLED]. Using Local JSON persistence.');
}

export const db = admin.apps.length ? admin.firestore() : null;
