import { state } from "../../state";

import { Router } from "@vaadin/router";

const winStarIMG = require("url:../../images/lose.svg");


class LosePage extends HTMLElement {
  shadow: ShadowRoot;
  currentScore: any;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    var pageStyles = document.createElement("style");
    pageStyles.textContent = `    
      .main-container {
        height: 120vh;
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 20px;    
        padding-top: 15px;
      }


      .win-container {
        background-color: rgba(136, 137, 73, 0.9);
      }

      .win-star {
        height: 362px;
        width: 361px;
        background: no-repeat;
      }

      .win-star {
        background-image: url(${winStarIMG});
      }

      .score-table {
        padding: 5px 30px;
        background: #ffffff;
        border: 10px solid #000000;
        border-radius: 10px;
        height: 217px;
      }

      .score-table h3 {
        margin: 0 auto 10px;
        text-align: center;
        font-family: "Odibee Sans";
        font-size: 55px;
      }

      .score-table h4 {
        margin: 0;
        text-align: center;
        font-family: "Odibee Sans";
        font-size: 45px;
        text-align: right;
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
      Router.go("/waitingroom");
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

    divEl.innerHTML = `
      <span class="win-star"></span>

      <div class="score-table">
        <h3> Score </h3>
        <h4>${this.currentScore.player1.name}: ${this.currentScore.player1.score}</h4>
        <h4>${this.currentScore.player2.name}: ${this.currentScore.player2.score}</h4>
      </div>

      <button class="waitingroom-button"> Volver a jugar! </button>
    `;

    this.shadow.appendChild(divEl);

    this.addListeners();

    // SI EL USUARIO CIERRA LA PAGINA, SE REINICIA SU START DE LA RTBD
    window.onbeforeunload = function disconectPlayer() {
      const actualPlayerRef = state.getSessionUserRef()[0];
      state.restartPlayer(actualPlayerRef);
    };
  }
}

customElements.define("x-lose-page", LosePage);
