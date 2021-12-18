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
          message: "User already exists",
        });
      }
    });
});

// CREATE GAMEROOMS
app.post("/gamerooms", (req, res) => {
  const { userId } = req.body;
  const { userName } = req.body;

  const userDocRef = usersCollRef.doc(userId.toString());

  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const gameroomId = nanoid();

      const gameroomRef = realtimeDB.ref("/gamerooms/" + gameroomId);

      // CREAMOS GAMEROOM EN LA RTDB (DE EXISTIR TAL DOC/USER EN LA COLL USERS DE FIRESTORE)
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

          const roomId = "JM" + randomNumber.toString();

          const gameroomDocRef = gameroomsCollRef.doc(roomId.toString());

          // CREAMOS DOC EN LA COLL GAMEROOMS DE FIRESTORE. GUARDAMOS EL ID DEL GAMEROOM RTDB
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
                roomId: roomId.toString(), // DEVOLVEMOS EL ID DE EL DOC CREADO EN LA COLL GAMEROOMS DE FIRESTORE. CORTO.
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

// GETTER DEL GAMEROOM RTDB
//   EJEMPLO: /gamerooms/JM1300?userId=Y5m8jxRGZTj3DoI10oqq
app.get("/gamerooms/:roomId", (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;

  console.log(userId); // Doc de la Coll Users
  console.log(roomId); // Doc de la Coll Gamerooms

  const userDocRef = usersCollRef.doc(userId.toString());

  // Si el Doc/userId existe en la Coll Users, busco en la Coll Gamerooms el Doc/roomId (corto) para devolver el ID largo RTDB que este Doc guarda
  userDocRef.get().then((doc) => {
    if (doc.exists) {
      const gameroomsDocRef = gameroomsCollRef.doc(roomId.toString());

      gameroomsDocRef.get().then((snap) => {
        if (snap.exists) {
          const data = snap.data();
          res.json(data);
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

// DEVUELVE EL SCORE DE LA BASE DE DATOS DE FIRESTORE
// ADAPTAR CON /rooms DEL CAP. 5 TEORIA -- OK
// Repasar métodos Firestore y Rtdb con docs -- OK
// Revisar y probar en Postman -- OK
// Crear método para consumir este endpoint en state -- OK
// Consumirlo desde la page -- OK
// Deploy

// EJEMPLO: http://localhost:3000/gameroomsscores/JM1112
app.get("/gameroomsscores/:roomid", (req, res) => {
  const gameRoomIdFirstore = req.params.roomid; // Me pasan la roomId Firestore, el Doc de la Coll Gamerooms

  const gameroomsDocRef = gameroomsCollRef.doc(gameRoomIdFirstore.toString());

  gameroomsDocRef.get().then((snap) => {
    const actualData = snap.data();
    res.json(actualData.score); // SOLAMENTE el score, así mantenemos oculto el Id de la RTDB ( rtdbRoomId )
  });
});

app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile(`${dist}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
