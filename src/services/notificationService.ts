import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs, writeBatch } from "firebase/firestore";

const db = getFirestore();

export const listenToNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  });
};

export const addNotification = async (userId: string, message: string, type: string = 'info', ticketId?: string) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    message,
    type,
    ticketId: ticketId || null,
    read: false,
    timestamp: Date.now(),
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.update(doc(db, "notifications", docSnap.id), { read: true });
  });
  await batch.commit();
};
