// RENOMBRAR A countdown.ts
import { state } from "../../state";

import { Router } from "@vaadin/router";

class GamePage extends HTMLElement {
  shadow: ShadowRoot;
  stateData: any;
  currentGame: any;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = `
    .final-game-container {
      display: flex;
      margin: 0 auto;
      width: 100px;
      height: 50vh;
      justify-self: center;
    }
    
    .progress-ring {
      margin-top: 60px;
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
    this.shadow.appendChild(style);
  }

  addListeners() {
    const playerCont = this.shadow.querySelector(".hands-container");
    const handsArray = playerCont.children;

    for (const hand of handsArray) {
      hand.addEventListener("handClick", (e: any) => {
        let handType = e.detail.handMove;

        console.log(e.detail);

        const actualPlayerRef = state.getSessionUserRef()[0];

        state.makeHandChoice(actualPlayerRef, handType);
      });
    }
  }

  connectedCallback() {
    state.subscribe(() => {
      const cs = state.getState();
      this.currentGame = cs.currentGame;
      this.stateData = cs;
    });

    const cs = state.getState();
    this.currentGame = cs.currentGame;
    this.stateData = cs;
    this.render();
  }

  render() {
    const mainPage = document.createElement("main");
    mainPage.classList.add("welcome-container");

    let counter = 3;
    let progress = 0;

    function counterInit() {
      const ring = mainPage.children[0];
      const ringText = ring.shadowRoot.children[0].children[0].children[0];
      counter--,
        (progress += 33.3),
        (ringText.textContent = `${counter}`),
        ring.setAttribute("progress", `${progress}`);
    }

    let timeout;

    function setTimeOut(mainPage) {
      timeout = setTimeout(() => {
        clearInterval(contador);

        function definePlay(mainPage) {
          const cs = state.getState();
          const cg = cs.currentGame;
          const playersData = Object.values(cg);

          const playersDontChoice = playersData.find((player) => {
            return player["choice"] == "undefined";
          });

          if (playersDontChoice) {
            const playerDontChoiceName = playersDontChoice["playerName"];

            mainPage.style.justifyContent = "center";
            mainPage.innerHTML = `
            <p>Lo siento, pero el jugador ${playerDontChoiceName} no ha elegido ninguna mano.</p>
            <button class="waitingroom-button">Volver a la sala</button>
            `;

            const newGameButton = mainPage.querySelector(".waitingroom-button");
            newGameButton.addEventListener("click", () => {
              const actualPlayerRef = state.getSessionUserRef()[0];
              const restartPromise = state.restartPlayer(actualPlayerRef);
              restartPromise.then(() => {
                Router.go("/waitingroom");
              });
            });
          }

          const playerData = state.getSessionUserRef()[1];
          const rivalData = state.getRivalUserRef()[1];

          console.log(playerData, "playerData");
          console.log(rivalData, "rivalData");

          if (!playersDontChoice) {
            const playerMove = playerData["choice"];
            const rivalMove = rivalData["choice"];

            mainPage.innerHTML = `
              <div class="final-game-container"></>
                <hand-comp handType=${rivalMove}></hand-comp>
                <hand-comp handType=${playerMove}></hand-comp>
              </div>
              `;

            const handPlayerEl = mainPage.getElementsByTagName("hand-comp");

            handPlayerEl[1].shadowRoot.children[0].innerHTML = `
               .hand{
              height: 240px;
              position: absolute;
              bottom: 5%;
              cursor: pointer;
              }
              `;

            handPlayerEl[0].shadowRoot.children[0].innerHTML = `
              .hand{
               height: 220px;
               position: absolute;
               top: 5%;
               cursor: pointer;
              transform: rotate(180deg);
              }
              `;

            const finalResult = state.definePlay(playerMove, rivalMove);

            function redirect() {
              const actualPlayerRef = state.getSessionUserRef()[0];
              const restartPromise = state.restartPlayer(actualPlayerRef);

              if (finalResult == "victoria") {
                const cs = state.getState();
                const roomId = cs.roomId;
                const actualPlayerRef = state.getSessionUserRef();
                const userName = actualPlayerRef[1]["playerName"];
                const userRef = actualPlayerRef[0];

                const userData = {
                  playerName: userName,
                  playerRef: userRef,
                };

                const addWinnerScorePromise = state.addWinScore(
                  userData,
                  roomId
                );

                addWinnerScorePromise.then(() => {
                  restartPromise.then(() => {
                    Router.go("/win");
                  });
                });
              }

              if (finalResult == "derrota") {
                restartPromise.then(() => {
                  Router.go("/lose");
                });
              }

              if (finalResult == "empate") {
                restartPromise.then(() => {
                  Router.go("/draw");
                });
              }
            }

            setTimeout(() => {
              redirect();
            }, 2000);
          }
        }

        definePlay(mainPage);
      }, 3999);
    }

    mainPage.innerHTML = `
     <progress-ring stroke="20" radius="150" progress="0" contador="3"></progress-ring>
   
      <div class="hands-container">  
        <hand-comp handType="tijeras"></hand-comp>
        <hand-comp handType="piedra"></hand-comp>
        <hand-comp handType="papel"></hand-comp>
      </div>
     `;

    this.shadow.appendChild(mainPage);

    const contador = setInterval(counterInit, 1000);

    setTimeOut(mainPage);

    this.addListeners();

    window.onbeforeunload = function disconectPlayer() {
      const actualPlayerRef = state.getSessionUserRef()[0];
      state.restartPlayer(actualPlayerRef);
    };
  }
}

customElements.define("x-game-page", GamePage);
