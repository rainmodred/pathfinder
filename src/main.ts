import "./style.css";
import { Grid, type Speed } from "./Grid";
import { Table } from "./Table";

const header = document.querySelector(".header") as HTMLHeadElement;
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const findPathBtn = document.getElementById("find-path") as HTMLButtonElement;
const clearPathBtn = document.getElementById("clear-path") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const createMaze = document.getElementById("create-maze") as HTMLButtonElement;
const selectAlgorithm = document.getElementById(
  "algorithm",
) as HTMLSelectElement;
const selectSpeed = document.getElementById("speed") as HTMLSelectElement;

// let width = 52;
// let height = 26;
//
// if (window.innerWidth < 1280) {
//   width = 19;
//   height = 14;
// }
//
// if (window.innerWidth < 780) {
//   width = 9;
//   height = 13;
// }

let cellSize = 30;
let width = Math.floor(window.innerWidth / cellSize);

let height = Math.floor((window.innerHeight - header.clientHeight) / cellSize);

const grid = new Grid(canvas, { width, height, cellSize });

let selectedAlgorithm = "BFS";
selectAlgorithm.addEventListener("change", () => {
  if (selectAlgorithm.value) {
    grid.clearPath();
    selectedAlgorithm = selectAlgorithm.value;
    findPathBtn.disabled = false;
  }
});

const tableEl = document.querySelector(".results-table") as HTMLTableElement;
const table = new Table(tableEl, [
  "algorithm",
  "time",
  "visited cells",
  "path length",
]);

findPathBtn?.addEventListener("click", () => {
  if (!grid.start || !grid.end) {
    return;
  }

  grid.searchPath(selectedAlgorithm, (result) => {
    table.addRow(result);
  });
  grid.animate(() => {
    clearPathBtn.disabled = false;
    selectAlgorithm.disabled = false;
  });

  if (grid.isAnimationStarted) {
    findPathBtn.disabled = true;
    selectAlgorithm.disabled = true;
    clearPathBtn.disabled = true;
  }
});

clearPathBtn.addEventListener("click", () => {
  grid.clearPath();
  findPathBtn.disabled = false;
});

resetBtn?.addEventListener("click", () => {
  grid.reset();
  findPathBtn.disabled = false;
});

createMaze.addEventListener("click", () => {
  grid.createMaze();
});

selectSpeed.addEventListener("change", () => {
  if (selectSpeed.value) {
    grid.changeSpeed(selectSpeed.value as Speed);
  }
});
