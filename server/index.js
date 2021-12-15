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
                message: "user already exists"
            });
        }
    });
});
//
app.get("/getter", function (req, res) {
    res.send("Holaaaaaaaaaaaaaaaaaaaaaaaa");
});
app.use(express.static("dist"));
app.get("*", function (req, res) {
    res.sendFile("".concat(dist));
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:".concat(port));
});
