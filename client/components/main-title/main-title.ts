class MainTitle extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const mainTitleEl = document.createElement("h1");
    mainTitleEl.classList.add("title");

    const titleStyles = document.createElement("style");
    titleStyles.textContent = `
          .title {
            font-size: 80px;
            font-weight: 700;
            color: #009048;
            text-align: center;
            margin: 50px 0;
          }
        `;

    mainTitleEl.textContent = `Piedra Papel ó Tijera`;

    this.shadow.appendChild(titleStyles);
    this.shadow.appendChild(mainTitleEl);
  }
}

customElements.define("main-title-comp", MainTitle);
