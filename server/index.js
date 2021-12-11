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
// ENDPOINTS
// SIGNUP:
app.post("/signup", function (req, res) { });
//
app.post("/gamerooms", function (req, res) { });
//
app.post("/gameroomsscore/:roomId", function (req, res) { });
//
app.post("/gamedatascore/:roomId", function (req, res) { });
//
app.get("/gameroomsscores/:roomId", function (req, res) { });
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
