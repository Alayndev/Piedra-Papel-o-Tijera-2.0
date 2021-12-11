import * as admin from "firebase-admin";
const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});

const firestore = admin.firestore();
const realtimeDB = admin.database();

export { firestore, realtimeDB };
