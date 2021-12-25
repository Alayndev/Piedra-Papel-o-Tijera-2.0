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

console.log(
  process.env.NODE_ENV === "production"
    ? "https://dwf-m6-r-p-s-v2.herokuapp.com"
    : "http://localhost:3000"
);

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
// DEVUELVE EL ID LARGO DE LA SALA CUANDO LE PASAS EL ID CORTO Y EL NOMBRE DE USUARIO. SETEA rtdbRoomId
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
// EJEMPLO: http://localhost:3000/gameroomsscores/JM1112
app.get("/gameroomsscores/:roomid", (req, res) => {
  const gameRoomIdFirstore = req.params.roomid; // Me pasan la roomId Firestore, el Doc de la Coll Gamerooms

  const gameroomsDocRef = gameroomsCollRef.doc(gameRoomIdFirstore.toString());

  gameroomsDocRef.get().then((snap) => {
    const actualData = snap.data();
    res.json(actualData.score); // SOLAMENTE el score, así mantenemos oculto el Id de la RTDB ( rtdbRoomId )
  });
});

// CONECTA A LOS JUGADORES AL GAMEROOM
// OBJETIVO: ACTUALIZO RTDB, RECIBE UN PLAYER Y LE ACTUALIZA ( lo que recibe en body ) online: true - playerName: userName ingresado en el input
app.patch("/gamedata/:gameroomId", function (req, res) {
  const player = req.query.player;
  const gameroomId = req.params.gameroomId;
  const body = req.body;

  // Ref al player a actualizar en la Rtdb
  const playerRef = realtimeDB.ref(
    "/gamerooms/" + gameroomId + "/currentgame/" + player
  );

  return playerRef.update(body, () => {
    res.status(201).json({ message: player + " connected" });
  });
});

// OBJETIVO: AGREGAR EL SCORE Y EL NOMBRE INICIAL DEL PLAYER 2 A FIRESTORE
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

// PREGUNTAR EN DISCORD SI NO DEBERÍA SER GET (ya que obtenemos el id del doc) Y RECIBIR EL userName/email por query string o params, ya que GET no recibe body
// AUTHENTICATION: RECIBE EL userName DEL USUARIO Y DEVUELVE SU USER ID  (id del Doc de la Coll Users de Firestore)
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
          userId: querySnapshot.docs[0].id, // Devolvemos el ID de ese Doc de la Coll Users de Firestore
        });
      }
    });
});

// DEFINE QUE EL JUGADOR ESTA LISTO PARA INICIAR, ACTUALIZA LA DATA EN RTDB CAMBIARNDO start: true
app.patch("/gamestart/:rtdbRoomId", function (req, res) {
  const { player } = req.query;
  const { rtdbRoomId } = req.params;
  const body = req.body; // Spread con todo lo que había, sólo cambiamos start: true

  const playerRef = realtimeDB.ref(
    "/gamerooms/" + rtdbRoomId + "/currentgame/" + player
  );

  return playerRef.update(body, () => {
    res.status(201).json({ message: player + "is ready to play" });
  });
});

// TODO OK
// RESETEA LA JUGADA Y ENVIA A LOS JUGADORES AL GAMEROOM
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


// TODO OK
// DEFINE QUE EL JUGADOR ESTA LISTO PARA INICIAR
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

// MOVER A LINEA 211 debajo de PATCH /gameroomsscore/:roomid

// PASOS BACK CON ESTE ENDPOINT. LUEGO PROBAR EN FRONT LOS 3 ENDPOINTS DE LINEA 318, CONSOLEAR TODO Y PROBAR SI TODO FUNCIONA
// OBJETIVO: AGREGA UN PUNTO AL SCORE DE FIRESTORE, PIDIENDO PARAMETRO EL ROOMID Y EL NOMBRE DEL USUARIO Y SU POSICIÓN EN EL JUEGO COMO REFERENCIA
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


// ADAPTAR CON CAP. 5 TEORIA -- OK
// Repasar métodos Firestore y Rtdb con docs -- OK --> https://firebase.google.com/docs/reference/js/v8/firebase.database.Reference
// Revisar y probar en Postman -- OK
// Crear método para consumir este endpoint en state -- OK
// Consumirlo desde la page -- OK
// Deploy -- OK
