import { Display } from "./Display";
import { Grid } from "./Grid";
import "./style.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const findBtn = document.getElementById("find") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;

const grid = new Grid({ width: 10, height: 10 });
const display = new Display(canvas, grid);

findBtn?.addEventListener("click", () => {
  //TODO: disable buttons
  if (!display.grid.start || !display.grid.end) {
    return;
  }

  display.animate("BFS");

  if (display.isAnimationStarted) {
    findBtn.disabled = true;
  }
});

resetBtn?.addEventListener("click", () => {
  display.reset();

  findBtn.disabled = false;
});
