import { state } from "../../state";

import { Router } from "@vaadin/router";

class WaitingPage extends HTMLElement {
  shadow: ShadowRoot;
  stateData: any;
  currentGame: any;
  currentScore: any;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    let pageStyles = document.createElement("style");
    pageStyles.textContent = `
      .main-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding-top: 15px;
      }
      
      .share-code {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 35px;
        margin: 0;
        flex-grow: 1;
      }

      .hands-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-grow: 1;
      }

      @media (min-height: 639px) {
        .hands-container {
          overflow: initial;
        }
      }

      .second-player {
        color: #FF6442;
      }
      
      .room-id {
        text-align: end;
      }

      .start-container{ 
        display: none;
        align-self: center;
        flex-direction: column;
        align-items: center;
        gap: 30px;
      }  

      .start-button {
        width: 100%;
        height: 87px;
        padding: 10px;
      
        font-family: inherit;
        font-size: 45px;
      
        color: white;
        background-color: #006cfc;
        border: solid 10px #09428d;
        border-radius: 10px;         
      }
    `;

    this.shadow.appendChild(pageStyles);
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
