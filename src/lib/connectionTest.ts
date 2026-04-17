import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebase';

export async function validateFirestoreConnection() {
  try {
    // Attempt to fetch a non-existent doc to test connection
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log('Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is reporting as offline.");
    }
    // Other errors (like 403) are expected if the doc doesn't exist/no rules, 
    // but connectivity itself is checked by the 'offline' message.
  }
}
