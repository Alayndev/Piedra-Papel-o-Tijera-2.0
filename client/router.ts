import { Router } from "@vaadin/router";

const router = new Router(document.querySelector("#root"));
router.setRoutes([
  { path: "/", component: "x-newroom-page" },
  { path: "/waitingroom", component: "x-waitingroom-page" },
]);
