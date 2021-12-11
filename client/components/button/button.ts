export function initButtonComp() {
  class ButtonComp extends HTMLElement {
    shadow: ShadowRoot;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }

    render() {
      const buttonEl = document.createElement("button");
      buttonEl.classList.add("button");

      const buttonStyles = document.createElement("style");
      buttonStyles.textContent = `
        .button {
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

      buttonEl.textContent = this.textContent;

      this.shadow.appendChild(buttonStyles);
      this.shadow.appendChild(buttonEl);
    }
  }
  customElements.define("button-comp", ButtonComp);
}
