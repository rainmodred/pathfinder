import { Display } from "./Display";
import { State } from "./State";
import "./style.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const grid = new State({
  width: 10,
  height: 10,
});

const display = new Display(ctx, grid);
display.anim();

// const canvas = new Renderer(canvas)
