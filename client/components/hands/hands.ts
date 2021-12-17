const handImages = {
  paper: require("url:../../images/paper-hand.png"),
  rock: require("url:../../images/rock-hand.png"),
  scissors: require("url:../../images/scissors-hand.png"),
};

class HandComp extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  addHandListeners() {
    const handImg: Element = this.shadow.querySelector(".hand");

    handImg.addEventListener("click", () => {
      const handCustomEvent = new CustomEvent("handClick", {
        detail: {
          handMove: this.getAttribute("handType"), // Dato que expongo al exterior, un string que es el tipo de dato, consolear donde use este customEvent hand-comp
        },
      });

      this.dispatchEvent(handCustomEvent);
    });
  }

  render() {
    const handType = this.getAttribute("handType") || "paper";

    const handHeight = this.getAttribute("handHeight") || "180px";
    const handWidth = this.getAttribute("handWidth") || "70px";

    const imgEl = document.createElement("img");
    imgEl.classList.add("hand");
    imgEl.setAttribute("src", handImages[handType]);

    const handStyles = document.createElement("style");
    handStyles.textContent = `
          * {
              box-sizing: border-box;
          }
  
          .hand {
              height: ${handHeight};
              width: ${handWidth};
              transform: translateY(30px);
              transition: all 0.3s ease-in-out;
              cursor: pointer;
          }
  
          .active-hand {
              transform: translateY(5px);
              transition: all 0.3s ease-in-out;
          }
  
          .inactive-hand {
              opacity: 45%;
              transition: all 0.3s ease-in-out;
          }        
        `;

    this.shadow.appendChild(handStyles);
    this.shadow.appendChild(imgEl);

    this.addHandListeners();
  }
}

customElements.define("hand-comp", HandComp);
