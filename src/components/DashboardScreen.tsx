const unsubSender = onSnapshot(query(txRef, where("senderId", "==", user.uid), orderBy("timestamp", "desc"), limit(20)), (snapshot) => {
  const senderTxs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);

  const unsubReceiver = onSnapshot(query(txRef, where("receiverId", "==", user.uid), orderBy("timestamp", "desc"), limit(20)), (snapshotRx) => {
