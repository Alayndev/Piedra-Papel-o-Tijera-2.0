"use strict";
exports.__esModule = true;
var express = require("express");
var cors = require("cors");
var path = require("path");
var nanoid_1 = require("nanoid");
var database_1 = require("./database");
var app = express();
app.use(express.json());
app.use(cors());
var port = process.env.PORT || 3000;
var usersCollRef = database_1.firestore.collection("users");
var gameroomsCollRef = database_1.firestore.collection("gamerooms");
var dist = path.resolve(__dirname, "../dist/", "index.html");
// ENDPOINTS
// SIGNUP:
app.post("/signup", function (req, res) {
    var userName = req.body.userName;
    usersCollRef
        .where("userName", "==", userName)
        .get()
        .then(function (querySnapshot) {
        if (querySnapshot.empty) {
            usersCollRef.add({ userName: userName }).then(function (doc) {
                res.json({ userId: doc.id, newUser: true });
            });
        }
        else {
            res.status(400).json({
                userId: querySnapshot.docs[0].id,
                newUser: false,
                message: "User already exists"
            });
        }
    });
});
// CREATE GAMEROOMS
app.post("/gamerooms", function (req, res) {
    var userId = req.body.userId;
    var userName = req.body.userName;
    var userDocRef = usersCollRef.doc(userId.toString());
    userDocRef.get().then(function (doc) {
        if (doc.exists) {
            var gameroomId = (0, nanoid_1.nanoid)();
            var gameroomRef_1 = database_1.realtimeDB.ref("/gamerooms/" + gameroomId);
            // CREAMOS GAMEROOM EN LA RTDB (DE EXISTIR TAL DOC/USER EN LA COLL USERS DE FIRESTORE)
            gameroomRef_1
                .set({
                currentgame: {
                    player1: {
                        choice: "undefined",
                        online: false,
                        start: false,
                        playerName: "none",
                        playerScore: 0
                    },
                    player2: {
                        choice: "undefined",
                        online: false,
                        start: false,
                        playerName: "none",
                        playerScore: 0
                    }
                },
                userName: userName,
                ownerId: userId
            })
                .then(function () {
                var roomLongIdRtdb = gameroomRef_1.key;
                var randomNumber = 1000 + Math.floor(Math.random() * 999);
                var roomId = "JM" + randomNumber.toString();
                var gameroomDocRef = gameroomsCollRef.doc(roomId.toString());
                // CREAMOS DOC EN LA COLL GAMEROOMS DE FIRESTORE. GUARDAMOS EL ID DEL GAMEROOM RTDB
                gameroomDocRef
                    .set({
                    rtdbRoomId: roomLongIdRtdb,
                    score: {
                        player1: {
                            name: userName,
                            score: 0
                        },
                        player2: {
                            name: "none",
                            score: "none"
                        }
                    }
                })
                    .then(function () {
                    res.json({
                        roomId: roomId.toString()
                    });
                });
            });
        }
        else {
            res.status(401).json({
                message: "Unauthorized, this user does not exist"
            });
        }
    });
});
// GETTER DEL GAMEROOM RTDB
//   EJEMPLO: /gamerooms/JM1300?userId=Y5m8jxRGZTj3DoI10oqq
app.get("/gamerooms/:roomId", function (req, res) {
    var userId = req.query.userId;
    var roomId = req.params.roomId;
    console.log(userId); // Doc de la Coll Users
    console.log(roomId); // Doc de la Coll Gamerooms
    var userDocRef = usersCollRef.doc(userId.toString());
    // Si el Doc/userId existe en la Coll Users, busco en la Coll Gamerooms el Doc/roomId (corto) para devolver el ID largo RTDB que este Doc guarda
    userDocRef.get().then(function (doc) {
        if (doc.exists) {
            var gameroomsDocRef = gameroomsCollRef.doc(roomId.toString());
            gameroomsDocRef.get().then(function (snap) {
                if (snap.exists) {
                    var data = snap.data();
                    res.json(data);
                }
                else {
                    res.status(401).json({
                        message: "Gameroom does not exist."
                    });
                }
            });
        }
        else {
            res.status(401).json({
                message: "Unauthorized, this user does not exist."
            });
        }
    });
});
// DEVUELVE EL SCORE DE LA BASE DE DATOS DE FIRESTORE
// ADAPTAR CON /rooms DEL CAP. 5 TEORIA -- OK
// Repasar métodos Firestore y Rtdb con docs -- OK
// Revisar y probar en Postman -- OK
// Crear método para consumir este endpoint en state -- OK
// Consumirlo desde la page -- OK
// Deploy
// EJEMPLO: http://localhost:3000/gameroomsscores/JM1112
app.get("/gameroomsscores/:roomid", function (req, res) {
    var gameRoomIdFirstore = req.params.roomid; // Me pasan la roomId Firestore, el Doc de la Coll Gamerooms
    var gameroomsDocRef = gameroomsCollRef.doc(gameRoomIdFirstore.toString());
    gameroomsDocRef.get().then(function (snap) {
        var actualData = snap.data();
        res.json(actualData.score); // SOLAMENTE el score, así mantenemos oculto el Id de la RTDB ( rtdbRoomId )
    });
});
app.use(express.static("dist"));
app.get("*", function (req, res) {
    res.sendFile("".concat(dist));
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:".concat(port));
});
