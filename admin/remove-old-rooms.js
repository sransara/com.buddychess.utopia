var admin = require("firebase-admin");

var GCP_SA_Key = Buffer.from(process.env.GCP_SA_KEY, 'base64').toString();
var serviceAccount = JSON.parse(GCP_SA_Key);

// Initialize the app with a custom auth variable, limiting the server's access
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buddy-chess-utopia.firebaseio.com",
});

// Cut off time. Child nodes older than this will be deleted.
const CUT_OFF_TIME = 12 * 60 * 60 * 1000; // 12 hours in milliseconds.

(async () => {
  const db = admin.database();
  const fs = admin.firestore();

  const dbqOldRooms = db
    .ref("/rooms")
    .orderByChild("createdAt")
    .endAt(Date.now() - CUT_OFF_TIME);

  const snapshotOldRooms = await dbqOldRooms.once("value");

  const oldRooms = {};
  snapshotOldRooms.forEach((child) => {
    oldRooms[child.key] = child.val();
  });

  try {
    for (const roomKey in oldRooms) {
      await deleteCollection(fs, `/rooms/${roomKey}/msgs`, 20);
      await fs.collection('/rooms').doc(roomKey).delete();
      console.log(roomKey, oldRooms[roomKey]);
    }

    const dbUpdates = Object.keys(oldRooms).reduce((obj, room) => {
      obj[room] = null;
      return obj;
    }, {})
    db.ref('/rooms').update(dbUpdates);
  } catch (err) {
    console.log(err);
  }

  process.exit();
})();

async function deleteCollection(fs, collectionPath, batchSize) {
  const collectionRef = fs.collection(collectionPath);
  const query = collectionRef.orderBy("__name__").limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(fs, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(fs, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = fs.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(fs, query, resolve);
  });
}
