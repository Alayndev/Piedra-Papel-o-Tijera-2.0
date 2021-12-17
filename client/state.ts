import { rtdb } from "./rtbd";

const API_URL = "http://localhost:3000"; // Esto hay que arreglarlo con un ternario o env var

import map from "lodash/map";

const state = {
  // STATE INITIAL DATA
  data: {
    currentGame: {},
    userName: null,
    roomId: null,
    rtdbRoomId: null,
    roomScore: null,
    userId: null,
  },

  listeners: [],

  /////////// BASIC STATE METHODS ///////////

  initState() {
    const lastStorageState = JSON.parse(sessionStorage.getItem("actualgame"));

    if (lastStorageState) {
      this.setState(lastStorageState);
    } else {
      const initialState = this.getState();

      this.setState(initialState);
    }
  },

  getState() {
    return this.data;
  },

  setState(newState) {
    this.data = newState;

    for (const cb of this.listeners) {
      cb();
    }

    sessionStorage.setItem("actualgame", JSON.stringify(newState));

    console.log("Soy el STATE, he cambiado. Aquí la nueva data:", this.data);
  },

  subscribe(cb: (any) => any) {
    this.listeners.push(cb);
  },

  setUserName(userName: string) {
    const currentState = this.getState();
    currentState.userName = userName;

    this.setState(currentState);
  },

  /////////// BACK METHODS ///////////

  // FUNCIONA
  signUp(userData) {
    const cs = this.getState();

    if (cs.userName) {
      return fetch(API_URL + "/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userData),
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(json);

          cs.userId = json.userId;
          this.setState(cs);

          return json;
        });
    }
  },

  // FUNCIONA
  createNewGameRoom(gameroomData) {
    const cs = this.getState();

    if (cs.userId) {
      return fetch(API_URL + "/gamerooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(gameroomData),
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          console.log(json);

          cs.roomId = json.roomId;
          this.setState(cs);

          return json;
        });
    }
  },

  // FUNCIONA
  // DEVUELVE EL ID LARGO DE LA SALA CUANDO LE PASAS EL ID CORTO Y EL NOMBRE DE USUARIO. SETEA rtdbRoomId
  //     EJEMPLO:  /gamerooms/JM1300?userId=Y5m8jxRGZTj3DoI10oqq
  getGameRoomLongId() {
    const cs = this.getState();

    if (cs.roomId) {
      return fetch(
        API_URL + "/gamerooms/" + cs.roomId + "?userId=" + cs.userId,
        {
          method: "get",
        }
      )
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          console.log(json);

          cs.rtdbRoomId = json.rtdbRoomId;
          this.setState(cs);

          return json;
        });
    }
  },


  // ACÁ DEJO: 
  // Endpoint GET /gameroomsscores/:roomid funciona en Postman
  // Falta consumirlo desde state y page ( ver pasos en API )
  // Hacer conexión con la Rtdb en state ( ver linea 159 ) y dentro de esta conexión hacer la llamada HTTP a dicha API con importGameRoomScore()
  // Guardar en currentGame (RTDB) y en roomScore (Firestore Coll Gamerooms score) lo indicado en linea 146 

  // PROBAR:
  // 1) Si se conecta a la rtdb. Probar si efectivamente nos conectamos a la Rtdb y escuchamos los cambios (hacerlo manual quizá)
  // 2) Por qué no hace la llamada HTTP con importGameRoomScore() a la API/Back?
  // Tiene que estar en currentGame lo de la RTDB -- en roomScore el score de Doc JR1112 de la Coll Gamerooms Firestore

  // IMPORTA LA DATA DEL GAMEROOM RTDB Y ESCUCHA LOS CAMBIOS
  connectToGamerooms() {
    const cs = this.getState();

    console.log("llegas hasta acá?"); // Si, llega

    // Ref a la Gameroom en la RTDB ( rtdbRoomId == nanoid )
    const chatroomRef = rtdb.ref(
      "/gamerooms/" + cs.rtdbRoomId + "/currentgame"
    );

    // ACÁ ALGO FALLA !!!! 1) Ver cap. 5 Rooms - 2) Ver Discord Rooms que pasaba esto y pasaron un link
    // Escuchamos los cambios y se los cargamos la State
    chatroomRef.on("value", (snapshot) => {
      console.log("Hola, conectas a la rtdb?");

      const gameRoomData = snapshot.val();

      // CARGA LA DATA EN EL STATE (chequear si con linea 174 es suficiente y se guarda algo en currentGame)
      cs.currentGame = gameRoomData;
      this.setState(cs);

      const fireBaseScorePromise = state.importGameRoomScore();

      fireBaseScorePromise.then((scoreData) => {
        cs.roomScore = scoreData;
        this.setState(cs);
      });
    });
  },

  // DEVUELVE EL SCORE DE LA BASE DE DATOS DE FIRESTORE
  // EJEMPLO: http://localhost:3000/gameroomsscores/JM1112
  importGameRoomScore() {
    const cs = this.getState();

    return fetch(API_URL + "/gameroomsscores/" + cs.roomId, {
      method: "get",
      headers: { "content-type": "application/json" },
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return json;
      });
  },

  // askNewRoom() {
  //   const cs = this.getState();

  //   if (cs.userId) {
  //     fetch(API_URL + "/rooms", {
  //       method: "POST",
  //       headers: {
  //         "content-type": "application/json",
  //       },
  //       body: JSON.stringify({ userId: cs.userId }),
  //     })
  //       .then((res) => res.json())
  //       .then((json) => {
  //         console.log(json);

  //         cs.roomId = json.roomIdFirestore;

  //         this.setState(cs);

  //         this.accessToRoom();
  //       });
  //   } else {
  //     console.error("No hay userId");
  //   }
  // },

  // accessToRoom() {
  //   const cs = this.getState();

  //   if (cs.roomId) {
  //     fetch(API_URL + "/rooms/" + cs.roomId + "/?userId=" + cs.userId)
  //       .then((res) => res.json())
  //       .then((json) => {
  //         console.log(json);

  //         cs.rtdbRoomId = json.rtdbRoomLongId;
  //         this.setState(cs);

  //         this.listenRoom();
  //         console.log("hola");
  //       });
  //   } else {
  //     console.error(
  //       "No hay roomId (id corto de doc de la coll rooms de Firestore)"
  //     );
  //   }
  // },

  // listenRoom() {
  //   const cs = this.getState();

  //   const chatroomRef = rtdb.ref("/rooms/" + cs.rtdbRoomId);

  //   chatroomRef.on("value", (snapshot) => {
  //     const messagesFromServer = snapshot.val();
  //     console.log(messagesFromServer);

  //     const messagesList = map(messagesFromServer.messages);
  //     cs.messages = messagesList;

  //     this.setState(cs);
  //     console.log(messagesList);
  //   });
  // },

  // pushMessage(message: string) {
  //   fetch(API_URL + "/messages", {
  //     method: "post",
  //     headers: {
  //       "content-type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       from: this.data.userName,
  //       message: message,
  //       roomIdRtdb: this.data.rtdbRoomId,
  //     }),
  //   });
  // },
};

export { state };
