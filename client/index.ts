import "./pages/home/home";
import "./pages/newroom/newroom";
import "./pages/enterroom/enterroom";
import "./pages/waitingroom/waitingroom";
import "./pages/game/game";

import "./pages/error/error";

import "./router";

import "./components/hands/hands";
import "./components/button/button";

import { state } from "./state";

function main() {
  state.initState();
  console.log(
    process.env.NODE_ENV === "production"
      ? "https://dwf-m6-r-p-s-v2.herokuapp.com"
      : "http://localhost:3000"
  );
}

main();
