import "./pages/home/home";
import "./pages/newgame/newgame";
import "./pages/entergame/entergame";
import "./pages/waitingpage/waitingpage";
import "./pages/countdown/countdown";

import "./pages/error/error";

import "./pages/result/result";

import "./router";

import "./components/hands/hands";
import "./components/button/button";
import "./components/loader/loader";
import "./components/main-title/main-title";

import { state } from "./state";

function main() {
  state.initState();
}

main();
