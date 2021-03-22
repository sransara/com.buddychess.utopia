var admin = require("firebase-admin");

var GCP_SA_Key = Buffer.from(process.env.GCP_SA_KEY, 'base64').toString();
var serviceAccount = JSON.parse(GCP_SA_Key);

// Initialize the app with a custom auth variable, limiting the server's access
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buddy-chess-utopia.firebaseio.com",
});

(async () => {
    const db = admin.database();
    const dbRooms = db.ref("/rooms");
    const snapshot = await dbRooms.once("value");

    snapshot.forEach((child) => {
      console.log(child.key, child.val());
    });

    process.exit();
})();