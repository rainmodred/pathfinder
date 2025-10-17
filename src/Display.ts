import { Cell, type CellType } from "./Cell";
import type { State, Animation } from "./State";

export class Display {
  private ctx: CanvasRenderingContext2D;

  private width: number;
  private height: number;

  private cellSize: number;

  public state: State;

  private col: number;
  private row: number;

  private animationIndex: number;

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

    this.animationIndex = 0;

    // this.col = 0;
    // this.row = 0;
  }

  animate() {
    if (this.animationIndex >= this.state.animations.length) {
      this.drawCells();
      return;
    }

    const currentAnimation = this.state.animations[this.animationIndex];

    this.state.changeCellState(
      currentAnimation.x,
      currentAnimation.y,
      currentAnimation.type,
    );

    this.drawCells(currentAnimation);

    this.animationIndex++;

    setTimeout(() => requestAnimationFrame(() => this.animate()), 300);
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

  drawCell(x: number, y: number, type: CellType) {
    if (type === "empty") {
      return;
    }

    if (type === "start") {
      this.ctx.fillStyle = "lightgreen";
    } else if (type === "end") {
      this.ctx.fillStyle = "lightpink";
    } else if (type === "search") {
      this.ctx.fillStyle = "lightblue";
    } else if (type === "path") {
      this.ctx.fillStyle = "yellow";
    } else if (type === "wall") {
      this.ctx.fillStyle = "darkslategrey";
    } else if (type === "current") {
      this.ctx.fillStyle = "orange";
    }

    this.ctx.fillRect(
      x * this.cellSize + 1,
      y * this.cellSize + 1,
      this.cellSize - 1,
      this.cellSize - 1,
    );
  }

  drawCells(currentAnimation?: Animation) {
    for (let [key, cell] of this.state.grid) {
      let [x, y] = Cell.fromKey(key);
      if (x === currentAnimation?.x && y === currentAnimation?.y) {
        this.drawCell(x, y, "current");
      } else {
        this.drawCell(x, y, cell.type);
      }
    }
  }
}
