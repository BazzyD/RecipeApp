import { initializeApp, cert, getApps  } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json';
import type { ServiceAccount } from 'firebase-admin';
if (getApps().length === 0) {
  initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
    projectId: serviceAccount.project_id, // Optional but safe
  });
}

const db = getFirestore();
const auth = getAuth();

export { db, auth };



