import { Router } from "@vaadin/router";

const router = new Router(document.querySelector("#root"));
router.setRoutes([
  { path: "/", component: "x-home-page" },
  { path: "/newroom", component: "x-newroom-page" },
  { path: "/enterroom", component: "x-enter-room-page" },
  { path: "/waitingroom", component: "x-waiting-page" },
  { path: "/game", component: "x-game-page" },
  { path: "/error", component: "x-error-page" },
  { path: "/result", component: "x-result-page" },
]);
