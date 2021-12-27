import { state } from "../../state";

class EnterRoomPage extends HTMLElement {
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

      @media (min-height: 639px) {
        .hands-container {
          margin-top: 70%;
          overflow: initial;
        }
      }

      .submit-button {
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
    `;

    this.shadow.appendChild(pageStyles);
  }

  // OBJETIVO: 1) SI EL USUARIUO NO ESTÁ LOGEADO, LOGEARLO CON POST /singup - 2) SI ESTÁ LOGEADO, DEBE INGRESAR EL USERNAME CORRECTO PARA LA GAMEROOM QUE INDIQUE, SINO IRÁ A /refused
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

      const roomCode = target.roomcode.value; // CAMBIAR A roomId QUE ES COMO ESTA EN EL STATE
      const userName = target.username.value;

      if (roomCode.trim() !== "" && userName.trim() !== "") {
        state.setUserName(userName);

        const userData = {
          userName: userName,
        };

        const nameAuthPromise: any = state.getNameAuth(userData);

        // FUNCIONA - 1) NO HAY USER - SI EL NOMBRE NO EXISTE, CREA EL NUEVO USER Y SE AUTENTICA CON ESE ID
        nameAuthPromise.then((res) => {
          if (res.message) {
            const newUserPromise: any = state.signUp(userData);

            console.log(
              "no existe el user y hay que CREARLO, newUserPromise: ",
              newUserPromise
            );

            newUserPromise.then((res) => {
              if (res.userId) {
                state.setGameRoomId(roomCode);

                const getGameRoomPromise: any = state.getGameRoomLongId();

                console.log("getGameRoomPromise: ", getGameRoomPromise);

                getGameRoomPromise.then((res) => {
                  if (res.message) {
                    alert(res.message);
                  }

                  if (res.rtdbRoomId) {
                    state.connectRTDBGamerooms();

                    const conectionListener = setInterval(() => {
                      if (state.currentGameFlag() && state.currentScoreFlag()) {
                        clearInterval(conectionListener);
                        state.redirectPlayers();
                      }
                    }, 500);
                  }
                });
              }
            });
          }

          // 2) FUNCIONA - HAY USER - EL USER YA EXISTE
          if (res.userId) {
            state.setGameRoomId(roomCode);

            const getGameRoomPromise: any = state.getGameRoomLongId();

            console.log("HAY userId", getGameRoomPromise);

            getGameRoomPromise.then((res) => {
              if (res.message) {
                alert(res.message);
              }

              if (res.rtdbRoomId) {
                state.connectRTDBGamerooms();

                console.log("HAY rtdbRoomId");

                const conectionListener = setInterval(() => {
                  if (state.currentGameFlag() && state.currentScoreFlag()) {
                    clearInterval(conectionListener);
                    state.redirectPlayers();
                  }
                }, 500);
              }
            });
          }
        });
      }
    });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const divEl = document.createElement("div");

    divEl.innerHTML = `
      <main-title-comp></main-title-comp>
        
      <span class="loader-container"></span>
      
      <form class="form" >

        <input class="input-user-name" name="username" placeholder="tu nombre" maxlength="15" required></input>

        <input class="input-user-name" name="roomcode" placeholder="codigo" required></input>

        <button class="submit-button"> Ingresar a la sala </button>
    
      </form>

      

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

customElements.define("x-enter-room-page", EnterRoomPage);
