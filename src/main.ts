import { Display } from "./Display";
import { State } from "./State";
import "./style.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
resize();
window.addEventListener("resize", () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  resize();
});

const findBtn = document.querySelector("#find");

//TODO: broken with different sizes
const grid = new State({
  width: 10,
  height: 10,
});

const display = new Display(ctx, grid);
// display.anim();
// display.animate();

findBtn?.addEventListener("click", () => {
  display.drawGrid();
  display.drawCells();

  display.state.BFS();

  display.animate();
});

// const animations = grid.BFS();
// display.animate(animations);
