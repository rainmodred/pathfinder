import "./style.css";
import { Grid } from "./Grid";
import { Table } from "./Table";
import type { NodeType } from "./Node";
import { Controller } from "./Controller";
import { View, type Speed } from "./View";

const header = document.querySelector(".header") as HTMLHeadElement;
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const findPathBtn = document.getElementById("find-path") as HTMLButtonElement;
const clearPathBtn = document.getElementById("clear-path") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const createMazeBtn = document.getElementById(
  "create-maze",
) as HTMLButtonElement;
const selectAlgorithm = document.getElementById(
  "algorithm",
) as HTMLSelectElement;
const selectSpeed = document.getElementById("speed") as HTMLSelectElement;
const selectNodeType = document.getElementById(
  "select-cell",
) as HTMLSelectElement;

const cellSize = 30;
const rows = Math.floor(
  (window.innerHeight - header.clientHeight - 16) / cellSize,
);
const cols = Math.floor(window.innerWidth / cellSize);

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

const controller = new Controller(
  new Grid(rows, cols),
  new View(rows, cols, cellSize),
);

controller.render();

let selectedAlgorithm = "bfs";
selectAlgorithm.addEventListener("change", () => {
  if (selectAlgorithm.value) {
    controller.clearPath();
    selectedAlgorithm = selectAlgorithm.value;
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
  controller.search(
    selectedAlgorithm,
    () => {
      findPathBtn.disabled = true;
      selectAlgorithm.disabled = true;
      clearPathBtn.disabled = true;
    },

    () => {
      selectAlgorithm.disabled = false;
      clearPathBtn.disabled = false;

      //TODO: fix table
      // table.addRow([selectedAlgorithm, ''])
    },
  );
});

clearPathBtn.disabled = true;
clearPathBtn.addEventListener("click", () => {
  controller.clearPath();
  findPathBtn.disabled = false;
  clearPathBtn.disabled = true;
});

resetBtn?.addEventListener("click", () => {
  controller.reset();
});

createMazeBtn.addEventListener("click", () => {
  createMazeBtn.disabled = true;
  findPathBtn.disabled = true;
  selectAlgorithm.disabled = true;

  controller.createMaze(() => {
    findPathBtn.disabled = false;
    selectAlgorithm.disabled = false;
  });
});

selectSpeed.addEventListener("change", () => {
  if (selectSpeed.value) {
    controller.setSpeed(selectSpeed.value as Speed);
  }
});

selectNodeType.addEventListener("change", () => {
  if (selectNodeType.value) {
    controller.setNodeType(selectNodeType.value as NodeType);
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
  for (const { label, value, selected } of cellTypes) {
    const option = document.createElement("option");
    option.value = value;
    option.label = label;
    option.selected = selected;

    fragment.appendChild(option);
  }

  selectNodeType.appendChild(fragment);
}
renderSelectCellType();

// grid.searchPath("DFS", (res) => console.log(res));
