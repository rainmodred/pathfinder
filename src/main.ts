import { Display } from "./Display";
import { Grid } from "./Grid";
import "./style.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const findBtn = document.getElementById("find");

const grid = new Grid({ width: 10, height: 10 });
const display = new Display(canvas, grid);

findBtn?.addEventListener("click", () => {
  display.animate("BFS");
});
