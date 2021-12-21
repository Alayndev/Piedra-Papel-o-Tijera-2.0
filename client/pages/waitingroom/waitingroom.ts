import { state } from "../../state";

class WaitingPage extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  addListeners() {}

  connectedCallback() {
    this.render();
  }

  render() {
    const cs = state.getState();
    const divEl = document.createElement("div");
    divEl.innerHTML = `
      <h1> Código de la sala ${cs.roomId} </h1> 
      <h2> Holaaaaaaa </h2>
    `;

    this.shadow.appendChild(divEl);

    this.addListeners();
  }
}

customElements.define("x-waiting-page", WaitingPage);
