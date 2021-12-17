class WinPage extends HTMLElement {
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

    this.shadow.appendChild(divEl);

    this.addListeners();
  }
}

customElements.define("x-win-page", WinPage);
