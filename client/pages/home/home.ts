import { Router } from "@vaadin/router";

class HomePage extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    let pageStyles = document.createElement("style");
    pageStyles.textContent = `
      .main-container {
        height: 100%;
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
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        overflow: hidden;
      }
      
      @media (min-width: 639px) {
        .hands-container {
          height: 100%;
        }
      }
      
    `;

    this.shadow.appendChild(pageStyles);
  }

  addListeners() {
    const newGameButton = this.shadow.querySelector(".newgame-button");
    newGameButton.addEventListener("click", () => {
      Router.go("/newgame");
    });

    const enterGameButton = this.shadow.querySelector(".entergame-button");
    enterGameButton.addEventListener("click", () => {
      Router.go("/entergame");
    });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const divEl = document.createElement("div");
    divEl.classList.add("main-container");

    divEl.innerHTML = `
      <main-title-comp></main-title-comp>
      

      <div class="buttons-container">
        <button-comp class="newgame-button"> Nuevo Juego </button-comp>

        <button-comp class="entergame-button"> Ingresar a una sala </button-comp>
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
