class EnterRoomPage extends HTMLElement {
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
    const divEl = document.createElement("div");

    divEl.innerHTML = `
      <h1> Ingresar a la sala </h1>
    `;

    this.shadow.appendChild(divEl);

    this.addListeners();
  }
}

customElements.define("x-enter-room-page", EnterRoomPage);
