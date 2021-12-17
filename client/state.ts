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

    console.log("sessionStorage", lastStorageState);

    if (lastStorageState) {
      this.setState(lastStorageState);

      console.log("hay algo en sessionStorage");
    } else {
      const initialState = this.getState();

      console.log("NO hay nada");
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
    console.log(userName);

    const currentState = this.getState();
    currentState.userName = userName;

    this.setState(currentState);
  },

  /////////// BACK METHODS ///////////

  // FUNCIONA
  signUp(userData) {
    const cs = this.getState();

    console.log(userData, "signup");

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

    console.log(gameroomData, "create gameroom");

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

  // DESPUES.
  // IMPORTA LA DATA DEL GAMEROOM Y ESCUCHA LOS CAMBIOS
  // connectToGamerooms(roomId) {
  //   const chatroomRef = realtimeDB.ref("/gamerooms/" + roomId + "/currentgame");
  //   chatroomRef.on("value", (snapshot) => {
  //     const gameRoomData = snapshot.val();

  //     // CARGA LA DATA AL STATE
  //     const currentState = this.getState();
  //     currentState.currentGame = gameRoomData;

  //     const fireBaseScorePromise = state.importGameRoomScore(
  //       currentState.roomId
  //     );

  //     fireBaseScorePromise.then((scoreData) => {
  //       currentState.roomScore = scoreData;
  //       this.setState(currentState);
  //     });
  //   });
  // },

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
