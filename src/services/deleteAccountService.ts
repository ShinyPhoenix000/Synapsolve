import { auth, db } from '../config/firebase';
import { deleteUser } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch, addDoc, Timestamp } from 'firebase/firestore';
import { deleteAllUserCalendarEvents } from './calendarService';

export async function deleteAccountAndData(user: any) {
  if (!user) throw new Error('No user');
  // 1. Delete all tickets submitted by user
  const ticketsQuery = query(collection(db, 'tickets'), where('submitter', '==', user.uid));
  const ticketsSnap = await getDocs(ticketsQuery);
  const batch = writeBatch(db);
  ticketsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

  // 2. Delete user profile
  batch.delete(doc(db, 'users', user.uid));

  // 3. Delete user preferences (if any)
  const prefsQuery = query(collection(db, 'preferences'), where('userId', '==', user.uid));
  const prefsSnap = await getDocs(prefsQuery);
  prefsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

  // 4. Delete notifications
  const notifQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
  const notifSnap = await getDocs(notifQuery);
  notifSnap.forEach((docSnap) => batch.delete(docSnap.ref));

  await batch.commit();

  // 5. Clean up Google Calendar events
  await deleteAllUserCalendarEvents(user.uid);

  // 6. Log to audit collection
  await addDoc(collection(db, 'audit'), {
    type: 'account_delete',
    userId: user.uid,
    email: user.email,
    deletedAt: Timestamp.now(),
  });

  // 7. Delete from Firebase Auth
  if (auth.currentUser) {
    await deleteUser(auth.currentUser);
  }
}
