import { state } from "../../state";

class NewRoomPage extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  addListeners() {
    const formEl = this.shadow.querySelector(".form");
    formEl.addEventListener("submit", (e: any) => {
      e.preventDefault();

      const target = e.target as any;

      const userName = target.username.value;
      console.log(userName);

      state.setUserName(userName);

      const newUserData = {
        userName: userName,
      };

      state.signUp(newUserData);
    });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const newRoomEl = document.createElement("div");

    newRoomEl.innerHTML = `
    <form class="form" >
        <label> User Name:
            <input type="text" name="username" required />
        </label>
    </form>
    `;

    this.shadow.appendChild(newRoomEl);

    this.addListeners();
  }
}
customElements.define("x-newroom-page", NewRoomPage);
