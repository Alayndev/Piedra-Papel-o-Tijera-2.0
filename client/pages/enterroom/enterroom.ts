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
          margin-top: 50%;
          overflow: initial;
        }
      }
      
    `;

    this.shadow.appendChild(pageStyles);
  }

  addListeners() {}

  connectedCallback() {
    this.render();
  }

  render() {
    const divEl = document.createElement("div");

    divEl.innerHTML = `
      <h1 class="home__title" > Piedra Papel ó Tijera </h1>
        
      
      <form class="form" >
        <label class="label-user-name" > <br />
          <input class="input-user-name" type="text" name="username" placeholder="CODIGO" required />
        </label>

        <br />

        <button-comp class="start-button"> Ingresar a la sala </button-comp>
      </form>

      <div class="hands-container">  
        <hand-comp handType="scissors"></hand-comp>
        <hand-comp handType="rock"></hand-comp>
        <hand-comp handType="paper"></hand-comp>
      </div>

    `;

    this.shadow.appendChild(divEl);

    this.addListeners();
  }
}

customElements.define("x-enter-room-page", EnterRoomPage);
