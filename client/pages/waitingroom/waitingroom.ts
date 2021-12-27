import { state } from "../../state";

import { Router } from "@vaadin/router";

import "./styles.css";

class WaitingPage extends HTMLElement {
  shadow: ShadowRoot;
  stateData: any;
  currentGame: any;
  currentScore: any;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  addListeners() {
    const startButton = this.shadow.querySelector(".start-button");
    const cg = this.currentGame;
    const playersData = Object.values(cg);

    const bothPlayersOnline =
      cg.player1.online == true && cg.player2.online == true;

    if (bothPlayersOnline) {
      const codeContainer = this.shadow.querySelector(".share-code");
      codeContainer.setAttribute("style", "display:none");

      const startContainer = this.shadow.querySelector(".start-container");
      startContainer.setAttribute("style", "display:flex");
    }

    const hasPlayersNotStarted = playersData.find((player) => {
      return player["start"] == false;
    });

    const notConnectedUsers = playersData.filter((player) => {
      return player["start"] == false;
    });

    startButton.addEventListener("click", () => {
      const actualPlayerRef = state.getSessionUserRef()[0];

      state.letStartPlayer(actualPlayerRef);
    });

    if (notConnectedUsers.length == 1) {
      const sessionUserNoReady =
        hasPlayersNotStarted["playerName"] ==
        state.getSessionUserRef()[1]["playerName"];

      if (sessionUserNoReady == false) {
        const startContainer = this.shadow.querySelector(".start-container");

        startContainer.innerHTML = `
      <p> Esperando que ${hasPlayersNotStarted["playerName"]} presione ¡Jugar!... </p>
      `;
      }
    }

    if (!hasPlayersNotStarted) {
      Router.go("/game");
    }
  }

  // subscribe() - PARA VOLVER A HACER RE-RENDER Y MOSTRAR AL CONTRINCANTE/ CUANDO SE CONECTA/ APIERTA JUGAR/ ETC.
  connectedCallback() {
    state.subscribe(() => {
      const cs = state.getState();
      this.currentScore = cs.roomScore;
      this.currentGame = cs.currentGame;
      this.stateData = cs;
      this.shadow.children[1].remove();
      this.render();
    });

    const cs = state.getState();
    this.currentScore = cs.roomScore;
    this.currentGame = cs.currentGame;
    this.stateData = cs;

    this.render();
  }

  // Cambiar tags strong por span y dar estilos
  render() {
    const cs = state.getState();
    const divEl = document.createElement("div");
    divEl.classList.add("main-container");
    divEl.innerHTML = `

    <header class="score-header">
      <div class="players-name">

        <span class="score-title">
          ${
            this.currentScore.player1.name !== undefined
              ? this.currentScore.player1.name + ":"
              : ""
          }
          ${
            this.currentScore.player1.score !== undefined
              ? this.currentScore.player1.score
              : ""
          }
        </span>

        <br />

        <span class="score-title second-player">
          ${
            this.currentScore.player2.name !== "none"
              ? this.currentScore.player2.name + ":"
              : ""
          }
          ${
            this.currentScore.player2.score !== "none"
              ? this.currentScore.player2.score
              : ""
          }
        </span>

      </div>

      <div class="room-id">
        <span class="score-title"> <strong> Sala </strong> </span> <br />
        <span class="score-title"> ${this.stateData.roomId} </span>
      </div>
    </header>

    <p class="share-code">  
      Compartí el código: <br />  
      <strong> ${this.stateData.roomId} </strong> <br /> 
      con tu contrincante  
    </p> 

    <div class="start-container">
      <p>Presioná jugar y elegí: piedra, papel o tijera antes de que pasen los 3 segundos.</p>

      <button class="start-button"> Jugar! </button>
    </div>


    <div class="hands-container">  
      <hand-comp handType="tijeras"></hand-comp>
      <hand-comp handType="piedra"></hand-comp>
      <hand-comp handType="papel"></hand-comp>
    </div>

    `;

    this.shadow.appendChild(divEl);

    this.addListeners();
  }
}

customElements.define("x-waiting-page", WaitingPage);

// <header class="score-header">
// <div class="players-name">

//   <span class="score-title">
//     ${cs.roomScore.player1.name !== undefined ? cs.roomScore.player1.name + ":" : ""}
//     ${cs.roomScore.player1.score !== undefined ? cs.roomScore.player1.score : ""}
//   </span>

//   <span class="score-title rival-player">
//     ${cs.roomScore.player2.name !== "none" ? cs.roomScore.player2.name + ":" : ""}
//     ${cs.roomScore.player2.score !== "none" ? cs.roomScore.player2.score : "" }
//   </span>

// </div>

// <div class="room-id">
//   <span class="score-title">Sala</span>
//   <span class="score-title">${cs.roomId}</span>
// </div>
// </header>
