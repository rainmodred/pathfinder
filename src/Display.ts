import { Cell } from "./Cell";
import type { Grid } from "./Grid";

export class Display {
  private ctx: CanvasRenderingContext2D;

  private cellSize: number;
  private width: number;
  private height: number;

  public grid: Grid;

  private isAnimationStarted: boolean;
  private animations: Cell[];
  private animationIndex: number;

  constructor(canvas: HTMLCanvasElement, grid: Grid) {
    this.ctx = canvas.getContext("2d")!;

    this.grid = grid;

    this.width = canvas.width;
    this.height = canvas.height;

    this.cellSize = canvas.width / grid.width;

    let rect = this.ctx.canvas.getBoundingClientRect();
    this.ctx.canvas.addEventListener("click", (e) => {
      let x = Math.floor((e.clientX - rect.left) / this.cellSize);
      let y = Math.floor((e.clientY - rect.top) / this.cellSize);

      this.grid.toggleCell(x, y);
      this.drawCells();
    });

    this.drawGrid();

    this.isAnimationStarted = false;
    this.animations = [];
    this.animationIndex = 0;
  }

  animate(type: "BFS") {
    if (!this.isAnimationStarted) {
      switch (type) {
        case "BFS":
          this.grid.BFS(this.animations);
      }
    }

    this.isAnimationStarted = true;

    if (this.animationIndex >= this.animations.length) {
      this.drawCells();
      return;
    }

    const currentAnimation = this.animations[this.animationIndex];

    this.grid.changeCellState(
      currentAnimation.x,
      currentAnimation.y,
      currentAnimation.type,
    );

    this.drawCells(currentAnimation);

    this.animationIndex++;

    setTimeout(() => requestAnimationFrame(() => this.animate("BFS")), 50);
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

  drawCell({ type, x, y }: Cell) {
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

  drawCells(currentCell?: Cell) {
    for (let [key, cell] of this.grid.cells) {
      let [x, y] = Cell.fromKey(key);

      if (x === currentCell?.x && y === currentCell?.y) {
        this.drawCell({ ...cell, type: "current" });
      } else {
        this.drawCell(cell);
      }
    }
  }
}
