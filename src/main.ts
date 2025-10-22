import { Display } from "./Display";
import { Grid } from "./Grid";
import "./style.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const findBtn = document.getElementById("find") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const randomBtn = document.getElementById("random") as HTMLButtonElement;

const grid = new Grid({ width: 10, height: 10 });
const display = new Display(canvas, grid);

const select = document.getElementById("select") as HTMLSelectElement;
let selectedAlgoritm = "BFS";
select.addEventListener("change", (e) => {
  if (select.value) {
    display.clearPath();
    selectedAlgoritm = select.value;
    findBtn.disabled = false;
  }
});

findBtn?.addEventListener("click", () => {
  // display.grid.A_Star();
  // return;

  //TODO: disable buttons
  if (!display.grid.start || !display.grid.end) {
    return;
  }

  console.log("selectedAlgoritm:", selectedAlgoritm);
  display.animate(selectedAlgoritm);

  if (display.isAnimationStarted) {
    findBtn.disabled = true;
  }
});

resetBtn?.addEventListener("click", () => {
  display.reset();

  findBtn.disabled = false;
});
