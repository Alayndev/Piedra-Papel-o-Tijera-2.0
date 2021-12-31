import { state } from "../../state";

import { Router } from "@vaadin/router";

const resultsImages = {
  victoria: require("url:../../images/win.svg"),
  derrota: require("url:../../images/lose.svg"),
  empate: require("url:../../images/tiedGame.svg"),
};

class ResultPage extends HTMLElement {
  shadow: ShadowRoot;
  currentScore: any;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    var pageStyles = document.createElement("style");
    pageStyles.textContent = `    
      .main-container {
        height: 100vh;
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 20px;    
        padding-top: 15px;
      }


      .win-container {
        background-color: rgba(136, 137, 73, 0.9);
      }

      .result__img {
        height: 285px;
        margin: 0;
        background: no-repeat;
      }


      .score-table {
        padding: 5px 30px;
        background: #ffffff;
        border: 10px solid #000000;
        border-radius: 10px;
        max-height: 300px;
        box-sizing: border-box;
      }

      .score-table__score {
        margin: 0 auto 10px;
        text-align: center;
        font-family: "Odibee Sans";
        font-size: 55px;
      }

      .score-table__player {
        margin: 0;
        text-align: center;
        font-family: "Odibee Sans";
        font-size: 45px;
        text-align: right;
      }
      
      .second-player {
        color: #FF6442;
      }
        
      .waitingroom-button {
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
    const gameroomButton = this.shadow.querySelector(".waitingroom-button");
    gameroomButton.addEventListener("click", () => {
      Router.go("/waitingpage");
    });
  }

  connectedCallback() {
    state.subscribe(() => {
      const cs = state.getState();
      this.currentScore = cs.roomScore;
      this.shadow.children[1].remove();
      this.render();
    });

    const cs = state.getState();
    this.currentScore = cs.roomScore;
    this.render();
  }

  render() {
    const divEl = document.createElement("div");
    divEl.classList.add("main-container");

    const cs = state.getState();
    const gameResult = cs.result;
    console.log(gameResult, "gameResult");

    divEl.innerHTML = `
      <img src=${resultsImages[gameResult]} class="result__img" />

      <div class="score-table">
        <h3 class="score-table__score" > Score </h3>
        <h4 class="score-table__player" >${this.currentScore.player1.name}: ${this.currentScore.player1.score}</h4>
        <h4 class="score-table__player second-player" >${this.currentScore.player2.name}: ${this.currentScore.player2.score}</h4>
      </div>

      <button class="waitingroom-button"> Volver a jugar! </button>
    `;

    this.shadow.appendChild(divEl);

    this.addListeners();

    window.onbeforeunload = function disconectPlayer() {
      const actualPlayerRef = state.getSessionUserRef()[0];
      state.restartPlayerValues(actualPlayerRef);
    };
  }
}

customElements.define("x-result-page", ResultPage);
