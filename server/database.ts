var admin = require("firebase-admin");
const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://desafio-dwf-m6-default-rtdb.firebaseio.com",
});

const firestore = admin.firestore();
const realtimeDB = admin.database();

export { firestore, realtimeDB };
