import { state } from "../../state";

class NewGamePage extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    let pageStyles = document.createElement("style");
    pageStyles.textContent = `
      .main-container {
        height: inherit;
        display: flex;
        flex-direction: column;
        padding-top: 15px;
      }
      

      .form {
        max-width: 450px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .label-user-name {
        text-align: center;
        display: block;
        font-size: 45px;
        font-weight: 600;
      }
      
      .input-user-name {
        box-sizing: border-box;
        width: 100%;
        border: solid 10px #182460;
        border-radius: 10px;
        height: 40px;
        padding: 20px;
        text-align: center;
        font-family: "Odibee Sans";
        font-size: 20px;
      }

      .hands-container {
        height: 100%;
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        overflow: hidden;
      }

      @media (min-height: 735px) {
        .hands-container {
          margin-top: 10%;
          overflow: initial;
        }
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

      .loader-container {
        display: none;
      }
      
      .api-message-container {
        display: none;
      }

      .api-message {
        color: #FF6442;
        text-align: center;
        font-size: 20px;
      }
    `;

    this.shadow.appendChild(pageStyles);
  }

  addListeners() {
    const formEl = this.shadow.querySelector(".form");
    formEl.addEventListener("submit", (e: any) => {
      e.preventDefault();

      const loaderCont = this.shadow.querySelector(".loader-container");
      loaderCont.setAttribute("style", "display: initial");
      loaderCont.innerHTML = `
        <loader-comp></loader-comp>
      `;

      const target = e.target as any;

      const userName = target.username.value;

      state.setUserName(userName);

      const newUserData = {
        userName: userName,
      };

      const newUserPromise: any = state.signUp(newUserData);

      newUserPromise.then((res) => {
        if (res.message) {
          const apiMessageCont = this.shadow.querySelector(
            ".api-message-container"
          );
          apiMessageCont.setAttribute("style", "display: initial");
          apiMessageCont.innerHTML = `
            <p class="api-message"> ${res.message} </p>
          `;
          loaderCont.setAttribute("style", "display: none");
        } else if (res.userId) {
          const newGameRoomData = {
            userId: res.userId,
            userName: userName,
          };

          const newRoomPromise = state.createNewGameRoom(newGameRoomData);

          newRoomPromise.then((res) => {
            if (res.roomId) {
              const getRoomPromise = state.getGameRoomLongId();

              getRoomPromise.then((res) => {
                state.connectRTDBGamerooms();

                const conectionListener = setInterval(() => {
                  if (state.bothPlayers() && state.scoreReady()) {
                    clearInterval(conectionListener);
                    state.goTo();
                  }
                }, 200);
              });
            }
          });
        }
      });
    });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const newRoomEl = document.createElement("div");
    newRoomEl.classList.add("main-container");

    newRoomEl.innerHTML = `
      <main-title-comp></main-title-comp>
 
      <span class="loader-container"></span>

      <span class="api-message-container"></span>
    
      <form class="form" >
        <label class="label-user-name" > User Name: <br />
          <input class="input-user-name" type="text" name="username" maxlength="10" required />
        </label>

        <button class="start-button"> Empezar </button>
      </form>

      <div class="hands-container">  
        <hand-comp handType="tijeras"></hand-comp>
        <hand-comp handType="piedra"></hand-comp>
        <hand-comp handType="papel"></hand-comp>
      </div>


    `;

    this.shadow.appendChild(newRoomEl);

    this.addListeners();
  }
}
customElements.define("x-newgame-page", NewGamePage);
