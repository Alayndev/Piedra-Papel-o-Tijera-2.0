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
        justify-content: space-between;
        padding-top: 15px;
      }

      .score-header {
        display: flex;
        justify-content: space-around;
      }
      
      .share-code {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 35px;
        margin: 0;
        flex-grow: 1;
        gap: 10px;
      }

      .hands-container {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
      }

      @media (min-height: 639px) {
        .hands-container {
          overflow: initial;
          margin-bottom: 25%;
        }
      }

      @media (min-height: 735px) {
        .hands-container {
          overflow: initial;
          margin-bottom: 55%;
        }
      }
      
      @media (min-width: 639px) {
        .hands-container {
          margin-bottom: 0;
        }
      }


      .second-player {
        color: #FF6442;
      }
      
      .room-id {
        text-align: end;
      }
      
      .room-id__code {
        font-weight: bold;
        color: #09428d;
      }

      .code-to-share {
        font-weight: bold;
        color: #09428d;
        font-size: 61px;
      }

      .start-container{ 
        display: none;
        align-self: center;
        flex-direction: column;
        align-items: center;
        gap: 30px;
      }  

      .rules {
        font-size: 45px;
        text-align: center;
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

      .waiting-rival {
        font-size: 35px;
        text-align: center;
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

      state.playerReadyToStart(actualPlayerRef);
    });

    if (notConnectedUsers.length == 1) {
      const sessionUserNoReady =
        hasPlayersNotStarted["playerName"] ==
        state.getSessionUserRef()[1]["playerName"];

      if (sessionUserNoReady == false) {
        const startContainer = this.shadow.querySelector(".start-container");

        startContainer.innerHTML = `
      <p class="waiting-rival"> Esperando que <span class="second-player"> ${hasPlayersNotStarted["playerName"]} </span> presione ¡Jugar!... </p>
      `;
      }
    }

    if (!hasPlayersNotStarted) {
      Router.go("/countdown");
    }
  }

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

  render() {
    const divEl = document.createElement("div");
    divEl.classList.add("main-container");
    divEl.innerHTML = `

    <header class="score-header">
      <span class="players-name">

        <div>
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
        </div>


        <span class="second-player">
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

      </span>

      <span class="room-id">
        <div class="room-id__room" > Sala  </div> 
        <span class="room-id__code" > ${this.stateData.roomId} </span>
      </span>
    </header>

    <p class="share-code">  
      Compartí el código: 

      <span class="code-to-share"> ${this.stateData.roomId} </span> 

      con tu contrincante  
    </p> 

    <div class="start-container">
      <p class="rules"> Presioná jugar y elegí: piedra, papel o tijera antes de que pasen los 3 segundos.</p>

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
