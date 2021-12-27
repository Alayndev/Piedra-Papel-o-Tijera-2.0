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
      
     .buttons-container {
        max-width: 450px;
        display: flex;
        flex-direction: column;
        gap: 15px;
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
      Router.go("/newroom");
    });

    const enterRoomButton = this.shadow.querySelector(".enter-room-button");
    enterRoomButton.addEventListener("click", () => {
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
      <main-title-comp></main-title-comp>
      

      <div class="buttons-container">
        <button-comp class="newgame-button"> Nuevo Juego </button-comp>

        <button-comp class="enter-room-button"> Ingresar a una sala </button-comp>
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

customElements.define("x-home-page", HomePage);
