import { Cell } from "./Cell";
import type { State } from "./State";

export class Display {
  private ctx: CanvasRenderingContext2D;

  private width: number;
  private height: number;

  private cellSize: number;

  private state: State;

  private col: number;
  private row: number;

  constructor(ctx: CanvasRenderingContext2D, state: State) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;

    //add grid length instead of grid[0] ?
    this.cellSize = this.width / state.width;

    this.state = state;

    let rect = this.ctx.canvas.getBoundingClientRect();
    this.ctx.canvas.addEventListener("click", (e) => {
      let x = Math.floor((e.clientX - rect.left) / this.cellSize);
      let y = Math.floor((e.clientY - rect.top) / this.cellSize);

      this.state.toggleCell(x, y, () => {
        this.drawGrid();
        this.drawCells();
      });
    });

    this.drawGrid();
    this.drawCells();

    // this.col = 0;
    // this.row = 0;
  }

  anim() {
    // this.state.addCell(this.col, this.row, "n");
    // this.drawGrid();
    // this.drawCells();
    // this.col++;
    // if (this.col === this.state.width) {
    //   this.row++;
    //   this.col = 0;
    // }
    //
    // if (this.row === this.state.grid[0].length) {
    //   return;
    // }
    //
    // console.log("this.col", this.col);
    // requestAnimationFrame(() => this.anim());
  }

  drawGrid() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = "lightgray";
    for (let i = this.cellSize; i < this.width; i += this.cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.width, i);

      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.width);
      this.ctx.stroke();
    }
  }

  drawCells() {
    for (let [key, cell] of this.state.grid) {
      if (cell.state === "empty") {
        continue;
      }

      let [x, y] = Cell.fromKey(key);

      if (cell.state === "start") {
        this.ctx.fillStyle = "lightgreen";
      } else if (cell.state === "end") {
        this.ctx.fillStyle = "lightpink";
      } else if (cell.state === "search") {
        this.ctx.fillStyle = "lightblue";
      } else if (cell.state === "path") {
        this.ctx.fillStyle = "yellow";
      }

      this.ctx.fillRect(
        x * this.cellSize + 1,
        y * this.cellSize + 1,
        this.cellSize - 1,
        this.cellSize - 1,
      );
    }
  }
}
