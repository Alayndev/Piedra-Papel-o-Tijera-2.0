import * as express from "express";
import * as cors from "cors";
import { nanoid } from "nanoid";
import * as path from "path";

import { firestore, realtimeDB } from "./database";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

const usersCollRef = firestore.collection("users");
const gameroomsCollRef = firestore.collection("gamerooms");

const dist = path.resolve(__dirname, "../dist/", "index.html");

// ENDPOINTS

// SIGNUP:
app.post("/signup", (req, res) => {
  let userName = req.body.userName;

  usersCollRef
    .where("userName", "==", userName)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        usersCollRef.add({ userName }).then((doc) => {
          res.json({ userId: doc.id, newUser: true });
        });
      } else {
        res.status(400).json({
          userId: querySnapshot.docs[0].id,
          newUser: false,
          message: "user already exists",
        });
      }
    });
});

//
app.post("/gamerooms", (req, res) => {});

//
app.post("/gameroomsscore/:roomId", (req, res) => {});

//
app.post("/gamedatascore/:roomId", (req, res) => {});

//
app.get("/gameroomsscores/:roomId", (req, res) => {});

//
app.get("/gamerooms/:roomId", (req, res) => {});

// AUTH:
app.post("/auth", (req, res) => {});

//
app.post("/gamedata/:id", (req, res) => {});

//
app.post("/gamestart/:id", (req, res) => {});

//
app.post("/disconnectplayer/:id", (req, res) => {});

//
app.post("/restartplayer/:id", (req, res) => {});

//
app.post("/gamestart/:id", (req, res) => {});

//
app.post("/handchoice/:id", (req, res) => {});

app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile(`${dist}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
