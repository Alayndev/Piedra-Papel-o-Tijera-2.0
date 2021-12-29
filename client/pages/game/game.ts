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
    
    .no-choice-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
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


    .no-choice {
      font-size: 25px;
      text-align: center;
      margin: 0;
    }

    .player-dont-chose {
      color: #FF6442;
    }


    .circle-container {
      margin: 95px auto;
    }
    
    .circle {
      width: 250px;
      height: 250px;
      border: solid 25px black;
      border-radius: 50%;
      border-left-color: rgba(0, 0, 0, 0.3);
      border-bottom-color: rgba(0, 0, 0, 0.3);
      border-top-color: rgba(0, 0, 0, 0.3);
      animation: spin 1s linear infinite;
    
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    
    .countdown-counter {
      font-size: 100px;
    }

    .hands-container {
      height: 100%;
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      overflow: hidden;
    }

    @media (min-height: 639px) {
      .hands-container {
        margin-top: 70%;
        overflow: initial;
      }
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

        if (hand.getAttribute("handType") !== handType) {
          hand.classList.add("inactive-hand");
          hand.classList.remove("active-hand");
        } else if (hand.getAttribute("handType") === handType) {
          hand.classList.add("active-hand");
          hand.classList.remove("inactive-hand");
        }

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

    const counterInit = () => {
      counter--;

      const countdownEl = this.shadow.querySelector(".countdown-counter");

      countdownEl.textContent = counter as any;
    };

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

            mainPage.innerHTML = `
            <span class="no-choice-container">
              <p class="no-choice"> Lo siento, pero el jugador <span class="player-dont-chose" > ${playerDontChoiceName} </span> no ha elegido ninguna mano.</p>
              <button class="waitingroom-button"> Volver a la sala </button>
            </span>
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

            // ACA DEBERIA PONER INACTIVE Y ACTIVE CLASSES
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
                    Router.go("/result");
                  });
                });
              }

              if (finalResult == "derrota") {
                restartPromise.then(() => {
                  Router.go("/result");
                });
              }

              if (finalResult == "empate") {
                restartPromise.then(() => {
                  Router.go("/result");
                });
              }
            }

            setTimeout(() => {
              redirect();
            }, 2000);
          }
        }

        definePlay(mainPage);
      }, 2999);
    }

    mainPage.innerHTML = `
      <div class="circle-container">
        <div class="circle">
          <h3 class="countdown-counter">3</h3>
        </div>
      </div>

   
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
