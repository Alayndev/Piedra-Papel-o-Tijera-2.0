import { Router } from "@vaadin/router";

class ErrorPage extends HTMLElement {
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
        justify-content: space-around;
        padding-top: 15px;
      }

      .home__title {
        font-size: 80px;
        font-weight: 700;
        color: #009048;
        text-align: center;
        margin: 50px 0;
      }

      .unordered-list {
        list-style: none;
        padding: 0;
      }

      .return-home {
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
    const returnButton = this.shadow.querySelector(".return-home");
    returnButton.addEventListener("click", () => {
      Router.go("/");
    });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const divEl = document.createElement("div");
    divEl.innerHTML = `
      <h1 class="home__title"> Piedra Papel o Tijera </h1>

      <h4> Ocurrió un error al intertar jugar </h4>

      <p> No te preocupes! Fijate de no cometer el siguiente error nuevamente: </p>

      <ul class="unordered-list"> 
        <li> ❌ Esta sala está completa y tu user name no coincide con nadie en la sala. </li>
      </ul>

      <button class="return-home" > Volver a jugar! </button>
    `;

    this.shadow.appendChild(divEl);

    this.addListeners();
  }
}

customElements.define("x-error-page", ErrorPage);
