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
app.post("/gamerooms", function (req, res) {
    var userId = req.body.userId;
    var userName = req.body.userName;
    var userDocRef = usersCollRef.doc(userId.toString());
    userDocRef.get().then(function (doc) {
        if (doc.exists) {
            var gameroomId = (0, nanoid_1.nanoid)();
            var gameroomRef_1 = database_1.realtimeDB.ref("/gamerooms/" + gameroomId);
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
                var makeid = function (length) {
                    var result = "";
                    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                    var charactersLength = characters.length;
                    for (var i = 0; i < length; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }
                    return result;
                };
                var roomId = makeid(2) + randomNumber.toString();
                var gameroomDocRef = gameroomsCollRef.doc(roomId.toString());
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
app.get("/gamerooms/:roomId", function (req, res) {
    var userId = req.query.userId;
    var roomId = req.params.roomId;
    var userDocRef = usersCollRef.doc(userId.toString());
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
app.get("/gameroomsscores/:roomid", function (req, res) {
    var gameRoomIdFirstore = req.params.roomid;
    var gameroomsDocRef = gameroomsCollRef.doc(gameRoomIdFirstore.toString());
    gameroomsDocRef.get().then(function (snap) {
        var actualData = snap.data();
        res.json(actualData.score);
    });
});
app.patch("/gamedata/:gameroomId", function (req, res) {
    var player = req.query.player;
    var gameroomId = req.params.gameroomId;
    var body = req.body;
    var playerRef = database_1.realtimeDB.ref("/gamerooms/" + gameroomId + "/currentgame/" + player);
    return playerRef.update(body, function () {
        res.status(201).json({ message: player + " online" });
    });
});
app.patch("/gameroomsscore/:roomid", function (req, res) {
    var gameRoomId = req.params.roomid;
    var playerName = req.body.playerName;
    var gameroomsDocRef = gameroomsCollRef.doc(gameRoomId.toString());
    gameroomsDocRef.get().then(function (snap) {
        var actualData = snap.data();
        console.log(actualData);
        actualData.score["player2"] = {
            name: playerName,
            score: 0
        };
        gameroomsDocRef.update(actualData).then(function () {
            res.json({
                message: "Player2 score updated"
            });
        });
    });
});
app.post("/auth", function (req, res) {
    var userName = req.body.userName;
    usersCollRef
        .where("userName", "==", userName)
        .get()
        .then(function (querySnapshot) {
        if (querySnapshot.empty) {
            res.status(404).json({
                message: "This user does not exist."
            });
        }
        else {
            res.status(200).json({
                userId: querySnapshot.docs[0].id
            });
        }
    });
});
app.patch("/gamestart/:rtdbRoomId", function (req, res) {
    var player = req.query.player;
    var rtdbRoomId = req.params.rtdbRoomId;
    var body = req.body;
    var playerRef = database_1.realtimeDB.ref("/gamerooms/" + rtdbRoomId + "/currentgame/" + player);
    return playerRef.update(body, function () {
        res.status(201).json({ message: player + " is ready to play" });
    });
});
app.patch("/restartplayer/:rtdbRoomId", function (req, res) {
    var player = req.query.player;
    var rtdbRoomId = req.params.rtdbRoomId;
    var body = req.body;
    var playerRef = database_1.realtimeDB.ref("/gamerooms/" + rtdbRoomId + "/currentgame/" + player);
    return playerRef.update(body, function () {
        res.status(201).json({ message: player + " disconnected" });
    });
});
app.patch("/handchoice/:rtdbRoomId", function (req, res) {
    var player = req.query.player;
    var rtdbRoomId = req.params.rtdbRoomId;
    var body = req.body;
    var playerRef = database_1.realtimeDB.ref("/gamerooms/" + rtdbRoomId + "/currentgame/" + player);
    return playerRef.update(body, function () {
        res.status(201).json({ message: player + " played" });
    });
});
app.patch("/gameroomscore/:roomId", function (req, res) {
    var roomId = req.params.roomId;
    var playerRef = req.body.playerRef;
    var playerName = req.body.playerName;
    var gameroomsDocRef = gameroomsCollRef.doc(roomId.toString());
    gameroomsDocRef.get().then(function (snap) {
        var actualData = snap.data();
        var newscore = actualData.score[playerRef].score + 1;
        actualData.score[playerRef] = {
            name: playerName,
            score: newscore
        };
        gameroomsDocRef.update(actualData).then(function () {
            res.json({
                message: "score updated, Firestore gameroom " + roomId
            });
        });
    });
});
app.use(express.static("dist"));
app.get("*", function (req, res) {
    res.sendFile("".concat(dist));
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:".concat(port));
});
