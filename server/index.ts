import * as express from "express";
import * as cors from "cors";
import * as path from "path";
import { nanoid } from "nanoid";

import { firestore, realtimeDB } from "./database";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

const usersCollRef = firestore.collection("users");
const gameroomsCollRef = firestore.collection("gamerooms");

const dist = path.resolve(__dirname, "../dist/", "index.html");

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
          message: "User already exists",
        });
      }
    });
});

app.post("/gamerooms", (req, res) => {
  const { userId } = req.body;
  const { userName } = req.body;

  const userDocRef = usersCollRef.doc(userId.toString());

  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const gameroomId = nanoid();

      const gameroomRef = realtimeDB.ref("/gamerooms/" + gameroomId);

      gameroomRef
        .set({
          currentgame: {
            player1: {
              choice: "undefined",
              online: false,
              start: false,
              playerName: "none",
              playerScore: 0,
            },
            player2: {
              choice: "undefined",
              online: false,
              start: false,
              playerName: "none",
              playerScore: 0,
            },
          },
          userName: userName,
          ownerId: userId,
        })
        .then(() => {
          const roomLongIdRtdb = gameroomRef.key;

          const randomNumber = 1000 + Math.floor(Math.random() * 999);

          const makeid = (length) => {
            let result = "";
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
              result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
              );
            }
            return result;
          };

          const roomId = makeid(2) + randomNumber.toString();

          const gameroomDocRef = gameroomsCollRef.doc(roomId.toString());

          gameroomDocRef
            .set({
              rtdbRoomId: roomLongIdRtdb,
              score: {
                player1: {
                  name: userName,
                  score: 0,
                },
                player2: {
                  name: "none",
                  score: "none",
                },
              },
            })
            .then(() => {
              res.json({
                roomId: roomId.toString(),
              });
            });
        });
    } else {
      res.status(401).json({
        message: "Unauthorized, this user does not exist",
      });
    }
  });
});

app.get("/gamerooms/:roomId", (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;

  const userDocRef = usersCollRef.doc(userId.toString());

  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const gameroomsDocRef = gameroomsCollRef.doc(roomId.toString());

      gameroomsDocRef.get().then((snap) => {
        if (snap.exists) {
          const data = snap.data();
          res.json(data.rtdbRoomId);
        } else {
          res.status(401).json({
            message: "Gameroom does not exist.",
          });
        }
      });
    } else {
      res.status(401).json({
        message: "Unauthorized, this user does not exist.",
      });
    }
  });
});

app.get("/gameroomsscores/:roomid", (req, res) => {
  const gameRoomIdFirstore = req.params.roomid;

  const gameroomsDocRef = gameroomsCollRef.doc(gameRoomIdFirstore.toString());

  gameroomsDocRef.get().then((snap) => {
    const actualData = snap.data();
    res.json(actualData.score);
  });
});

app.patch("/gamedata/:gameroomId", function (req, res) {
  const player = req.query.player;
  const gameroomId = req.params.gameroomId;
  const body = req.body;

  const playerRef = realtimeDB.ref(
    "/gamerooms/" + gameroomId + "/currentgame/" + player
  );

  return playerRef.update(body, () => {
    res.status(201).json({ message: player + " online" });
  });
});

app.patch("/gameroomsscore/:roomid", (req, res) => {
  const gameRoomId = req.params.roomid;
  const playerName = req.body.playerName;

  const gameroomsDocRef = gameroomsCollRef.doc(gameRoomId.toString());

  gameroomsDocRef.get().then((snap) => {
    const actualData = snap.data();

    console.log(actualData);

    actualData.score["player2"] = {
      name: playerName,
      score: 0,
    };

    gameroomsDocRef.update(actualData).then(() => {
      res.json({
        message: "Player2 score updated",
      });
    });
  });
});

app.post("/auth", (req, res) => {
  var { userName } = req.body;

  usersCollRef
    .where("userName", "==", userName)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        res.status(404).json({
          message: "This user does not exist.",
        });
      } else {
        res.status(200).json({
          userId: querySnapshot.docs[0].id,
        });
      }
    });
});

app.patch("/gamestart/:rtdbRoomId", function (req, res) {
  const { player } = req.query;
  const { rtdbRoomId } = req.params;
  const body = req.body;

  const playerRef = realtimeDB.ref(
    "/gamerooms/" + rtdbRoomId + "/currentgame/" + player
  );

  return playerRef.update(body, () => {
    res.status(201).json({ message: player + " is ready to play" });
  });
});

app.patch("/restartplayer/:rtdbRoomId", function (req, res) {
  const { player } = req.query;
  const { rtdbRoomId } = req.params;
  const body = req.body;

  const playerRef = realtimeDB.ref(
    "/gamerooms/" + rtdbRoomId + "/currentgame/" + player
  );

  return playerRef.update(body, () => {
    res.status(201).json({ message: player + " disconnected" });
  });
});

app.patch("/handchoice/:rtdbRoomId", function (req, res) {
  const { player } = req.query;
  const { rtdbRoomId } = req.params;
  const body = req.body;

  const playerRef = realtimeDB.ref(
    "/gamerooms/" + rtdbRoomId + "/currentgame/" + player
  );

  return playerRef.update(body, () => {
    res.status(201).json({ message: player + " played" });
  });
});

app.patch("/gameroomscore/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { playerRef } = req.body;
  const { playerName } = req.body;

  const gameroomsDocRef = gameroomsCollRef.doc(roomId.toString());

  gameroomsDocRef.get().then((snap) => {
    const actualData = snap.data();

    const newscore = actualData.score[playerRef].score + 1;

    actualData.score[playerRef] = {
      name: playerName,
      score: newscore,
    };

    gameroomsDocRef.update(actualData).then(() => {
      res.json({
        message: "score updated, Firestore gameroom " + roomId,
      });
    });
  });
});

app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile(`${dist}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
