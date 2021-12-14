"use strict";
exports.__esModule = true;
var express = require("express");
var cors = require("cors");
var path = require("path");
var database_1 = require("./database");
var app = express();
app.use(express.json());
app.use(cors());
var port = process.env.PORT || 3000;
var usersCollRef = database_1.firestore.collection("users");
var gameroomsCollRef = database_1.firestore.collection("gamerooms");
var dist = path.resolve(__dirname, "../dist/", "index.html");
console.log(dist);
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
                message: "user already exists"
            });
        }
    });
});
//
app.post("/gamerooms", function (req, res) { });
//
app.post("/gameroomsscore/:roomId", function (req, res) { });
//
app.post("/gamedatascore/:roomId", function (req, res) { });
//
app.get("/gameroomsscores/:roomId", function (req, res) {
    res.send("Holaaaaaaaaaaaaaaaaaaaaaaaa");
});
//
app.get("/gamerooms/:roomId", function (req, res) { });
// AUTH:
app.post("/auth", function (req, res) { });
//
app.post("/gamedata/:id", function (req, res) { });
//
app.post("/gamestart/:id", function (req, res) { });
//
app.post("/disconnectplayer/:id", function (req, res) { });
//
app.post("/restartplayer/:id", function (req, res) { });
//
app.post("/gamestart/:id", function (req, res) { });
//
app.post("/handchoice/:id", function (req, res) { });
app.use(express.static("dist"));
app.get("*", function (req, res) {
    res.sendFile("".concat(dist));
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:".concat(port));
});
