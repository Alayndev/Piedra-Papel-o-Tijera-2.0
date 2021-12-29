import { rtdb } from "./rtbd";

// Poner los de dwf-m5
//TYPES
type Jugada = "piedra" | "papel" | "tijeras";
type User = "myPlay" | "computerPlay";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://dwf-m6-r-p-s-v2.herokuapp.com"
    : "http://localhost:3000";

//const API_URL = "http://localhost:3000";

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
    result: null,
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
          console.log("Hago la llamada a POST /auth : ", json);

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
      console.log("Ahora paso el if");

      return fetch(API_URL + "/gamerooms/" + cs.roomId + "?userId=" + cs.userId)
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

  // OBJETIVO: currentGame: RTDB currentgame -- roomScore: Firestore Gamerooms Coll score con importGameRoomScore() (quizá score debería llevarlo RTDB)
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

      // roomScore
      fireBaseScorePromise.then((scoreData) => {
        cs.roomScore = scoreData;
        this.setState(cs);
      });
    });
  },

  //  Podrían sacarsele los method ya que es GET, ver si headers tambien puede sacarse
  // DEVUELVE EL SCORE DE LA BASE DE DATOS DE FIRESTORE
  // OBJETIVO: roomScore: Firestore Gamerooms Coll score, roomId es el ID de ese Doc de la Coll Gamerooms ( JM1234 )
  importGameRoomScore() {
    const cs = this.getState();
    console.log(cs.roomId, "llamada API -- GET /gameroomsscores/:roomId");

    if (cs.roomId) {
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
    }
  },

  //
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
      const stateName = cs.userName;

      const newUserScoreData = {
        playerName: stateName,
      };

      // SE REALIZA LA PROMESA PARA AGREGAR AL NUEVO JUGADOR A LOS SCORES DE FIREBASE
      const player2ScorePromise = state.setPlayer2Score(newUserScoreData);

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
        Router.go("/error");
      }
    }

    // SI AMBOS PLAYERS ESTAN CONECTADOS Y REGISTRADOS
    else if (
      currentGame.player1.online === true &&
      currentGame.player2.online === true
    ) {
      // REVISA QUE EL USUARIO INGRESE EL NOMBRE DE ALGUN USUARIO REGISTRADO, DE NO SER ASÍ, LO ENVIA A /error
      registeredPlayer ? Router.go("/waitingroom") : Router.go("/error");
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

    console.log("connectPlayer()");

    // ACTUALIZA LA DATA DENTRO DE LA RTDB
    if (cs.rtdbRoomId) {
      return fetch(API_URL + "/gamedata/" + gameRoomId + "?player=" + player, {
        headers: { "content-type": "application/json" },
        method: "PATCH",
        body: JSON.stringify(connectedUserData),
      });
    }
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

  // OBJETIVO: AGREGAR EL SCORE Y EL NOMBRE INICIAL DEL PLAYER 2 A FIRESTORE
  setPlayer2Score(playerData) {
    const cs = state.getState();

    console.log("Llamada a la API con setPlayer2Score()");

    if (cs.roomId) {
      return fetch(API_URL + "/gameroomsscore/" + cs.roomId, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(playerData),
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          return json;
        });
    }
  },

  // CREO QUE DEBERÍA SER GET
  // Tiene sentido teniendo /singup ? Para que ambas? Tiene sentido porque /auth esta en enterroom.ts ya que es para usuarios ya resgitrados
  // AGREGAR: if (cs.userName)
  // INGRESA EL userName DEL USUARIO Y RECIBE SU USER ID (id del Doc de la Coll Users de Firestore)
  getNameAuth(userName) {
    const cs = state.getState();

    console.log("Hago la llamada a POST /auth");

    return fetch(API_URL + "/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userName),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);

        cs.userId = json.userId;
        this.setState(cs);

        return json;
      });
  },

  // SETEA EL GAMEROOMID CORTO EN EL STATE (USO EN enterroom.ts - roomId lo seteo en  createNewGameRoom() en newroom.ts)
  setGameRoomId(gameRoomId: string) {
    const cs = this.getState();
    cs.roomId = gameRoomId;
    this.setState(cs);
  },

  // DEFINE QUE EL JUGADOR ESTA LISTO PARA JUGAR, ACTUALIZA LA DATA EN RTDB CAMBIARNDO start: true
  letStartPlayer(player: string) {
    const cs = this.getState();
    const currentGameData = cs.currentGame[`${player}`];

    console.log("Player: ", player);

    const connectedUserData = {
      ...currentGameData,
      start: true,
    };

    return fetch(
      API_URL + "/gamestart/" + cs.rtdbRoomId + "?player=" + player,
      {
        headers: { "content-type": "application/json" },
        method: "PATCH",
        body: JSON.stringify(connectedUserData),
      }
    );
  },

  // Falta probar en state y page
  // REINICIA EL CONTADOR START DEL JUGADOR
  restartPlayer(player: string) {
    const cs = this.getState();
    const currentGameData = cs.currentGame[`${player}`];

    const connectedUserData = {
      ...currentGameData,
      choice: "undefined",
      online: true,
      start: false,
    };

    console.log("restartPlayer(): ", player);

    // ACTUALIZA LA DATA DENTRO DE LA RTDB
    return fetch(
      API_URL + "/restartplayer/" + cs.rtdbRoomId + "?player=" + player,
      {
        headers: { "content-type": "application/json" },
        method: "PATCH",
        body: JSON.stringify(connectedUserData),
      }
    );
  },

  // Falta probar en state y page
  // SELECCIONA LA JUGADA DE LA MANO
  makeHandChoice(player: string, move: string) {
    const cs = this.getState();
    const currentGameData = cs.currentGame[`${player}`];

    const connectedUserData = {
      ...currentGameData,
      choice: move,
    };

    console.log("makeHandChoice(): ", player, move);

    return fetch(
      API_URL + "/handchoice/" + cs.rtdbRoomId + "?player=" + player,
      {
        headers: { "content-type": "application/json" },
        method: "PATCH",
        body: JSON.stringify(connectedUserData),
      }
    );
  },

  // DEVUELVE LA REFEFENCIA DEL RIVAL DEL USUARIO QUE ESTA CONECTADO ACTUALMENTE
  getRivalUserRef() {
    const cs = state.getState();
    const cg = cs.currentGame;
    const result = Object.entries(cg);
    const rivalUser = result.find((player) => {
      return player[1]["playerName"] !== state.getState().userName;
    });
    return rivalUser;
  },

  // Falta probar en state y page
  // AGREGA UN PUNTO AL JUGADOR QUE GANO LA PARTIDA DENTRO DEL GAMEROOM DE FIRESTORE
  addWinScore(playerData, roomId) {
    console.log("addWinScore(): ", playerData, roomId);

    return fetch(API_URL + "/gameroomscore/" + roomId, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(playerData),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return json;
      });
  },

  //////////// FRONT-END METHODS /////////////

  // Poner el de dwf-m5
  // 1 - SETEA/DEFINE LA JUGADA REALIZADA
  setMove(move: Jugada, user: User) {
    const currentState = this.getState();
    currentState.currentGame[user] = move;
  },

  // Poner el de dwf-m5
  // 2 - DEFINE QUIEN GANO LA PARTIDA EN BASE A SET MOVE
  whoWins(myPlay: Jugada, computerPlay: Jugada) {
    //JUGADAS DE VICTORIA
    const ganeConTijeras = myPlay == "tijeras" && computerPlay == "papel";
    const ganeConPiedra = myPlay == "piedra" && computerPlay == "tijeras";
    const ganeConPapel = myPlay == "papel" && computerPlay == "piedra";
    if (ganeConPapel || ganeConTijeras || ganeConPiedra) {
      return "victoria";
    }

    //JUGADAS DE DERROTA
    const perdiConTijeras = myPlay == "tijeras" && computerPlay == "piedra";
    const perdiConPiedra = myPlay == "piedra" && computerPlay == "papel";
    const perdiConPapel = myPlay == "papel" && computerPlay == "tijeras";
    if (perdiConPapel || perdiConTijeras || perdiConPiedra) {
      return "derrota";
    }

    //EMPATES
    const empateConTijeras = myPlay == "tijeras" && computerPlay == "tijeras";
    const empateConPiedras = myPlay == "piedra" && computerPlay == "piedra";
    const empateConPapel = myPlay == "papel" && computerPlay == "papel";
    if (empateConTijeras || empateConPiedras || empateConPapel) {
      return "empate";
    }
  },

  //DEFINE LA NUEVA JUGADA EN BASE A LOS ANTERIORES METODOS
  //PUEDE SER UTILIZADO O NO
  definePlay(myPlay: Jugada, computerPlay: Jugada) {
    const currentGame = state.getState().currentGame;

    state.setMove(myPlay, "myPlay");
    state.setMove(computerPlay, "computerPlay");

    const myMove = currentGame.myPlay;
    const computerMove = currentGame.computerPlay;

    const result = state.whoWins(myMove, computerMove);

    this.setResult(result);

    return result;
  },

  // VER DE DONDE SACAR EL DATO DERROTA O VICTORIA O EMPATE
  setResult(result) {
    const cs = this.getState();
    cs.result = result;
    this.setState(cs);
  },
};

export { state };
