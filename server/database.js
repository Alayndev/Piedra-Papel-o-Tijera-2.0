"use strict";
exports.__esModule = true;
exports.realtimeDB = exports.firestore = void 0;
var admin = require("firebase-admin");
var serviceAccount = require("./key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
var firestore = admin.firestore();
exports.firestore = firestore;
var realtimeDB = admin.database();
exports.realtimeDB = realtimeDB;
