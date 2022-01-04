import { rtdb } from "./rtbd";

type Move = "piedra" | "papel" | "tijeras";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://dwf-m6-r-p-s-v2.herokuapp.com"
    : "http://localhost:3000";

// const API_URL = "http://localhost:3000";

import { Router } from "@vaadin/router";

const state = {
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

  initState() {
    const lastStorageState = JSON.parse(sessionStorage.getItem("actualgame"));

    if (lastStorageState) {
      this.setState(lastStorageState);
      this.connectRTDBGamerooms();
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

  getGameRoomLongId() {
    const cs = this.getState();

    if (cs.roomId) {
      return fetch(API_URL + "/gamerooms/" + cs.roomId + "?userId=" + cs.userId)
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          console.log(json, "rtdbRoomId");

          cs.rtdbRoomId = json.rtdbRoomId;
          this.setState(cs);

          return json;
        });
    }
  },

  // CAMBIAR Y RECIBIR SCORE EN RTDB
  connectRTDBGamerooms() {
    const cs = this.getState();

    const gameRoomRef = rtdb.ref(
      "/gamerooms/" + cs.rtdbRoomId + "/currentgame"
    );

    gameRoomRef.on("value", (snapshot) => {
      const gameRoomData = snapshot.val();

      console.log(gameRoomData, "null");

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

  // CAMBIAR Y RECIBIR SCORE EN RTDB
  importGameRoomScore() {
    const cs = this.getState();
    console.log(cs.roomId, "llamada API -- GET /gameroomsscores/:roomId");

    if (cs.roomId) {
      return fetch(API_URL + "/gameroomsscores/" + cs.roomId, {
        method: "GET",
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

  goTo() {
    const cs = state.getState();
    const currentGame = cs.currentGame;
    const statePlayerName = cs.userName;
    const playersData = Object.values(currentGame);

    const registeredPlayer = playersData.find((player) => {
      return player["playerName"].includes(statePlayerName);
    });

    if (
      currentGame.player1.playerName == "none" &&
      currentGame.player1.online == false
    ) {
      const playerConnectionPromise = state.playerOnline("player1");
      playerConnectionPromise.then(() => {
        Router.go("/waitingpage");
      });
    } else if (
      currentGame.player1.playerName !== "none" &&
      currentGame.player1.online !== false &&
      currentGame.player2.playerName === "none" &&
      currentGame.player2.online === false
    ) {
      const cs = state.getState();
      const stateName = cs.userName;

      const newUserScoreData = {
        playerName: stateName,
      };

      const player2ScorePromise = state.setPlayer2Score(newUserScoreData);

      player2ScorePromise.then(() => {
        const playerConnectionPromise = state.playerOnline("player2");

        playerConnectionPromise.then(() => {
          Router.go("/waitingpage");
        });
      });
    } else if (
      currentGame.player1.online === false ||
      currentGame.player2.online === false
    ) {
      if (registeredPlayer) {
        state.playerOnline(state.getSessionUserRef()[0]);
        Router.go("/waitingpage");
      }
      if (!registeredPlayer) {
        Router.go("/error");
      }
    } else if (
      currentGame.player1.online === true &&
      currentGame.player2.online === true
    ) {
      registeredPlayer ? Router.go("/waitingpage") : Router.go("/error");
    }
  },

  bothPlayers() {
    let cs = state.getState();
    let currentGame = cs.currentGame;
    if (currentGame.player1 && currentGame.player2) {
      return true;
    }
  },

  scoreReady() {
    let cs = state.getState();
    let currentScore = cs.roomScore;
    if (currentScore !== null) {
      return true;
    }
  },

  // ACTUALIZA RTDB online: true - playerName: userName ingresado en el input
  playerOnline(player: string) {
    const cs = this.getState();
    const currentGameData = cs.currentGame[`${player}`];

    const gameRoomId = cs.rtdbRoomId;
    const playerName = cs.userName;

    const connectedUserData = {
      ...currentGameData,
      online: true,
      playerName: playerName,
    };

    console.log("playerOnline()");

    if (cs.rtdbRoomId) {
      return fetch(API_URL + "/gamedata/" + gameRoomId + "?player=" + player, {
        headers: { "content-type": "application/json" },
        method: "PATCH",
        body: JSON.stringify(connectedUserData),
      });
    }
  },

  // ACTUALIZA RTDB CAMBIARNDO start: true
  playerReadyToStart(player: string) {
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

  getSessionUserRef() {
    const cs = state.getState();
    const cg = cs.currentGame;
    const result = Object.entries(cg);

    const sessionUser = result.find((player) => {
      return player[1]["playerName"] === state.getState().userName;
    });

    return sessionUser;
  },

  getRivalUserRef() {
    const cs = state.getState();
    const cg = cs.currentGame;
    const result = Object.entries(cg);
    const rivalUser = result.find((player) => {
      return player[1]["playerName"] !== state.getState().userName;
    });
    return rivalUser;
  },

  // ELIMINAR, CAMBIAR SCORE EN RTDB
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

  // INGRESA EL userName DEL USUARIO Y RECIBE SU USER ID (id del Doc de la Coll Users de Firestore)
  getNameAuth(userName) {
    const cs = state.getState();

    console.log("Hago la llamada a POST /auth");

    if (cs.userName) {
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
    }
  },

  setRoomId(gameRoomId: string) {
    const cs = this.getState();
    cs.roomId = gameRoomId;
    this.setState(cs);
  },

  restartPlayerValues(player: string) {
    const cs = this.getState();
    const currentGameData = cs.currentGame[`${player}`];

    const connectedUserData = {
      ...currentGameData,
      choice: "undefined",
      online: true,
      start: false,
    };

    console.log("restartPlayer(): ", player);

    return fetch(
      API_URL + "/restartplayer/" + cs.rtdbRoomId + "?player=" + player,
      {
        headers: { "content-type": "application/json" },
        method: "PATCH",
        body: JSON.stringify(connectedUserData),
      }
    );
  },

  setPlayerMoveRTDB(player: string, move: string) {
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

  // CAMBIAR, SCORE EN RTDB
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

  whoWins(myMove: Move, rivalMove: Move) {
    const ganeConTijeras = myMove == "tijeras" && rivalMove == "papel";
    const ganeConPiedra = myMove == "piedra" && rivalMove == "tijeras";
    const ganeConPapel = myMove == "papel" && rivalMove == "piedra";
    if (ganeConPapel || ganeConTijeras || ganeConPiedra) {
      return "victoria";
    }

    const perdiConTijeras = myMove == "tijeras" && rivalMove == "piedra";
    const perdiConPiedra = myMove == "piedra" && rivalMove == "papel";
    const perdiConPapel = myMove == "papel" && rivalMove == "tijeras";
    if (perdiConPapel || perdiConTijeras || perdiConPiedra) {
      return "derrota";
    }

    const empateConTijeras = myMove == "tijeras" && rivalMove == "tijeras";
    const empateConPiedras = myMove == "piedra" && rivalMove == "piedra";
    const empateConPapel = myMove == "papel" && rivalMove == "papel";
    if (empateConTijeras || empateConPiedras || empateConPapel) {
      return "empate";
    }
  },

  definePlay(myMove: Move, rivalMove: Move) {
    const result = state.whoWins(myMove, rivalMove);

    this.setResult(result);

    return result;
  },

  setResult(result) {
    const cs = this.getState();
    cs.result = result;
    this.setState(cs);
  },
};

export { state };
