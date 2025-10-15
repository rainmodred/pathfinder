import { Display } from "./Display";
import { State } from "./State";
import "./style.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const findBtn = document.querySelector("#find");

//TODO: broken with different sizes
const grid = new State({
  width: 10,
  height: 10,
});

const display = new Display(ctx, grid);
display.anim();

findBtn?.addEventListener("click", () => {
  display.state.BFS();
  display.drawGrid();
  display.drawCells();
});
