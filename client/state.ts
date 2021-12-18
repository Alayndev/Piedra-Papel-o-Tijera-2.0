import { rtdb } from "./rtbd";

const API_URL = "http://localhost:3000"; // Esto hay que arreglarlo con un ternario o env var

import map from "lodash/map";

import { Router } from "@vaadin/router";

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

  // OBJETIVO: currentGame: RTDB currentgame -- roomScore: Firestore Gamerooms Coll score
  connectRTDBGamerooms() {
    const cs = this.getState();

    const gameRoomRef = rtdb.ref(
      "/gamerooms/" + cs.rtdbRoomId + "/currentgame"
    );

    gameRoomRef.on("value", (snapshot) => {
      const gameRoomData = snapshot.val();
      console.log(gameRoomData);

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
    console.log(cs.roomId, "llamada API -- GET /gameroomsscores/:roomId");

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

  // ENTENDER
  redirectPlayers() {
    const cs = state.getState();
    const currentGame = cs.currentGame;
    const statePlayerName = cs.userName;
    const playersData = Object.values(currentGame);

    //  SE PIDE UNA REFERENCIA DE LOS USUARIOS YA REGISTRADOS
    const registeredPlayer = playersData.find((player) => {
      return player["playerName"].includes(statePlayerName);
    });

    // SI EL PLAYER 1 ESTA DESCONECTADO Y NO REGISTRADO LO CONECTA AL PLAYER 1
    if (
      currentGame.player1.playerName == "none" &&
      currentGame.player1.online == false
    ) {
      // PROMESA DE CONEXIÓN DEL JUGADOR 1
      const playerConnectionPromise = state.connectPlayer("player1");
      playerConnectionPromise.then(() => {
        Router.go("/waitingroom");
      });
    }

    // SI EL PLAYER 1 ESTA CONECTADO Y REGISTRADO & EL 2 DESCONECTADO Y SIN REGISTRAR, LO REGISTRA/CONECTA AL PLAYER 2 EN AMBAS DB
    else if (
      currentGame.player1.playerName !== "none" &&
      currentGame.player1.online !== false &&
      currentGame.player2.playerName === "none" &&
      currentGame.player2.online === false
    ) {
      // SE VUELVEN A PEDIR LOS DATOS AL STATE
      const cs = state.getState();
      const actualRoomId = cs.roomId;
      const stateName = cs.userName;

      const newUserScoreData = {
        playerName: stateName,
      };

      // SE REALIZA LA PROMESA PARA AGREGAR AL NUEVO JUGADOR A LOS SCORES DE FIREBASE
      const player2ScorePromise = state.setPlayer2Score(
        newUserScoreData,
        actualRoomId
      );

      // PROMESA DE CONEXIÓN DEL JUGADOR 2
      player2ScorePromise.then(() => {
        const playerConnectionPromise = state.connectPlayer("player2");

        playerConnectionPromise.then(() => {
          Router.go("/waitingroom");
        });
      });
    }

    // SI AMBOS USUARIOS ESTAN DECONECTADOS
    else if (
      currentGame.player1.online === false ||
      currentGame.player2.online === false
    ) {
      // VERIFICA QUE SI ESTAN REGISTRADOS SE CONECTAN Y PASAN AL WAITING ROOM
      if (registeredPlayer) {
        state.connectPlayer(state.getSessionUserRef()[0]);
        Router.go("/waitingroom");
      }
      // SI NO ESTAN REGISTRADOS SE VAN A REFUSED
      if (!registeredPlayer) {
        Router.go("/refused");
      }
    }

    // SI AMBOS PLAYERS ESTAN CONECTADOS Y REGISTRADOS
    else if (
      currentGame.player1.online === true &&
      currentGame.player2.online === true
    ) {
      // REVISA QUE EL USUARIO INGRESE EL NOMBRE DE ALGUN USUARIO REGISTRADO, DE NO SER ASÍ, LO ENVIA A /REFUSED
      registeredPlayer ? Router.go("/waitingroom") : Router.go("/refused");
    }
  },

  // VERIFICA QUE SI HAY PLAYER 1 Y PLAYER 2 EN CURRENT GAME, DEVUELVA UN TRUE
  currentGameFlag() {
    let cs = state.getState();
    let currentGame = cs.currentGame;
    if (currentGame.player1 && currentGame.player2) {
      return true;
    }
  },

  // VERIFICA QUE EL ROOMSCORE NO ESTE VACIO DEVOLVIENDO TRUE DE SER ASÍ
  currentScoreFlag() {
    let cs = state.getState();
    let currentScore = cs.roomScore;
    if (currentScore !== null) {
      return true;
    }
  },

  // CONECTA A LOS JUGADORES A LA GAMEROOM
  // OBJETIVO: ACTUALIZO RTDB, RECIBE UN PLAYER Y LE ACTUALIZA online: true - playerName: userName ingresado en el input
  // DE ESTE MODO, currentGame QUEDA EN EL STATE CON player1/player2 online:true - playerName: lo ingresado en el input
  connectPlayer(player: string) {
    const cs = this.getState();
    const currentGameData = cs.currentGame[`${player}`];

    const gameRoomId = cs.rtdbRoomId;
    const playerName = cs.userName;

    const connectedUserData = {
      ...currentGameData,
      online: true,
      playerName: playerName,
    };

    // ACTUALIZA LA DATA DENTRO DE LA RTDB - PATCH DEBERÍA SER
    return fetch(API_URL + "/gamedata/" + gameRoomId + "?player=" + player, {
      headers: { "content-type": "application/json" },
      method: "PATCH",
      body: JSON.stringify(connectedUserData),
    });
  },

  // DEVUELVE LA REFEFENCIA DE LA POSICIÓN DEL USUARIO QUE ESTA CONECTADO ACTUALMENTE
  getSessionUserRef() {
    const cs = state.getState();
    const cg = cs.currentGame;
    const result = Object.entries(cg);

    const sessionUser = result.find((player) => {
      return player[1]["playerName"] === state.getState().userName;
    });

    return sessionUser;
  },

  // AGREGA EL SCORE DEL PLAYER 2 A FIRESTORE UNA VEZ QUE SE AGREGA UN SEGUNDO JUGADOR A LA SALA
  setPlayer2Score(playerData, roomId) {
    return fetch(API_URL + "/gameroomsscore/" + roomId, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(playerData),
    })
      .then((res) => {
        return res.json();
      })
      .then((finalres) => {
        return finalres;
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
