import "./style.css";
import { Grid, type Speed } from "./Grid";
import { Table } from "./Table";
import type { CellType } from "./Cell";
import { Display } from "./Display";

const header = document.querySelector(".header") as HTMLHeadElement;
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const findPathBtn = document.getElementById("find-path") as HTMLButtonElement;
const clearPathBtn = document.getElementById("clear-path") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const createMazeButton = document.getElementById(
  "create-maze",
) as HTMLButtonElement;
const selectAlgorithm = document.getElementById(
  "algorithm",
) as HTMLSelectElement;
const selectSpeed = document.getElementById("speed") as HTMLSelectElement;
const selectCellType = document.getElementById(
  "select-cell",
) as HTMLSelectElement;

const cellSize = 30;
const rows = Math.floor(
  (window.innerHeight - header.clientHeight - 16) / cellSize,
);
const cols = Math.floor(window.innerWidth / cellSize);

const grid = new Grid(rows, cols);
console.log("can:", canvas.width);
const display = new Display(canvas, grid, cellSize);

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

clearPathBtn.disabled = true;
clearPathBtn.addEventListener("click", () => {
  grid.clearPath();
  findPathBtn.disabled = false;
  clearPathBtn.disabled = true;
});

resetBtn?.addEventListener("click", () => {
  grid.reset();
  findPathBtn.disabled = false;
});

createMazeButton.addEventListener("click", () => {
  createMazeButton.disabled = true;
  grid.createMaze(() => {
    createMazeButton.disabled = false;
  });
});

selectSpeed.addEventListener("change", () => {
  if (selectSpeed.value) {
    grid.changeSpeed(selectSpeed.value as Speed);
  }
});

selectCellType.addEventListener("change", () => {
  if (selectCellType.value) {
  }
});

function renderSelectCellType() {
  const cellTypes = [
    { label: "empty (1)", value: "empty", selected: false },
    { label: "wall", value: "wall", selected: true },
    { label: "hill (5)", value: "hill", selected: false },
    { label: "start", value: "start", selected: false },
    { label: "end", value: "end", selected: false },
  ];

  const fragment = document.createDocumentFragment();
  for (let { label, value, selected } of cellTypes) {
    const option = document.createElement("option");
    option.value = value;
    option.label = label;
    option.selected = selected;

    fragment.appendChild(option);
  }

  selectCellType.appendChild(fragment);
}
renderSelectCellType();

// grid.searchPath("DFS", (res) => console.log(res));
