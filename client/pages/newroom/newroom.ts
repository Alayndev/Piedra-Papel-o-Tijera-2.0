import { state } from "../../state";

class NewRoomPage extends HTMLElement {
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
      
      .home__title {
        font-size: 80px;
        font-weight: 700;
        color: #009048;
        text-align: center;
        margin: 50px 0;
      }

      .form {
        max-width: 450px;
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
          margin-top: 50%;
          overflow: initial;
        }
      }
      
    `;

    this.shadow.appendChild(pageStyles);
  }

  addListeners() {
    const formEl = this.shadow.querySelector(".form");
    formEl.addEventListener("submit", (e: any) => {
      e.preventDefault();

      const target = e.target as any;

      const userName = target.username.value;
      console.log(userName);

      state.setUserName(userName);

      const newUserData = {
        userName: userName,
      };

      const newUserPromise: any = state.signUp(newUserData);

      console.log(newUserPromise);

      newUserPromise.then((res) => {
        if (res.message) {
          alert(res.message);
        }

        if (res.userId) {
          const newGameRoomData = {
            userId: res.userId,
            userName: userName,
          };

          const newUserId = res.userId;
          const newRoomPromise = state.createNewGameRoom(newGameRoomData);

          newRoomPromise.then((res) => {
            if (res.roomId) {
              const getRoomPromise = state.getGameRoomLongId();

              getRoomPromise.then((res) => {
                state.connectRTDBGamerooms();

                // const conectionListener = setInterval(() => {
                //   if (state.currentGameFlag() && state.currentScoreFlag()) {
                //     clearInterval(conectionListener);
                //     state.redirectPlayers();
                //   }
                // }, 500);
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

    newRoomEl.innerHTML = `
      <h1 class="home__title" > Piedra Papel ó Tijera </h1>
      
    
      <form class="form" >
        <label class="label-user-name" > User Name: <br />
          <input class="input-user-name" type="text" name="username" required />
        </label>

        <br />

        <button-comp class="start-button"> Empezar </button-comp>
      </form>

      <div class="hands-container">  
        <hand-comp handType="scissors"></hand-comp>
        <hand-comp handType="rock"></hand-comp>
        <hand-comp handType="paper"></hand-comp>
      </div>

    `;

    this.shadow.appendChild(newRoomEl);

    this.addListeners();
  }
}
customElements.define("x-newroom-page", NewRoomPage);
