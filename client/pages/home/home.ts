import { Router } from "@vaadin/router";

class HomePage extends HTMLElement {
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
    const newGameButton = this.shadow.querySelector(".newgame-button");
    newGameButton.addEventListener("click", () => {
      console.log("Holis");
      Router.go("/newroom");
    });

    const enterRoomButton = this.shadow.querySelector(".enter-room-button");
    enterRoomButton.addEventListener("click", () => {
      console.log("Caca");
      Router.go("/enterroom");
    });
  }

  connectedCallback() {
    this.render();
  }

  // Poner las manos fixed puede ser una opción, o ver como lo hice en 5
  render() {
    const divEl = document.createElement("div");
    divEl.classList.add("main-container");

    divEl.innerHTML = `
      <h1 class="home__title" > Piedra Papel ó Tijera </h1>
      
      <button-comp class="newgame-button"> Nuevo Juego </button-comp>

      <br />

      <button-comp class="enter-room-button"> Ingresar a una sala </button-comp>
  
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

customElements.define("x-home-page", HomePage);
