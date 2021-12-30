import { Router } from "@vaadin/router";

const router = new Router(document.querySelector("#root"));
router.setRoutes([
  { path: "/", component: "x-home-page" },
  { path: "/newgame", component: "x-newgame-page" },
  { path: "/entergame", component: "x-entergame-page" },
  { path: "/waitingpage", component: "x-waiting-page" },
  { path: "/countdown", component: "x-countdown-page" },
  { path: "/error", component: "x-error-page" },
  { path: "/result", component: "x-result-page" },
]);
