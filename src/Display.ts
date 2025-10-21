import { Cell } from "./Cell";
import type { Grid } from "./Grid";

export type Animation = {
  x: number;
  y: number;
  type: "path" | "search";
};

export class Display {
  private ctx: CanvasRenderingContext2D;

  private cellSize: number;
  private width: number;
  private height: number;

  public grid: Grid;

  public isAnimationStarted: boolean;
  private animations: Animation[];
  private animationIndex: number;
  private animationSpeed: number = 10;
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement, grid: Grid) {
    this.ctx = canvas.getContext("2d")!;

    this.grid = grid;

    this.width = canvas.width;
    this.height = canvas.height;

    this.cellSize = canvas.width / grid.width;

    this.drawGrid();

    this.isAnimationStarted = false;
    this.animations = [];
    this.animationIndex = 0;

    let rect = this.ctx.canvas.getBoundingClientRect();
    this.ctx.canvas.addEventListener("click", (e) => {
      if (this.isAnimationStarted) {
        return;
      }
      let x = Math.floor((e.clientX - rect.left) / this.cellSize);
      let y = Math.floor((e.clientY - rect.top) / this.cellSize);

      this.grid.toggleCell(x, y);
      this.drawCells();
    });
  }
  stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimationStarted = false;
  }

  reset() {
    this.stopAnimation();
    this.grid.reset();
    this.isAnimationStarted = false;
    this.animations = [];
    this.animationIndex = 0;
    this.drawCells();
  }

  animate(type: string) {
    if (!this.isAnimationStarted) {
      let startTime = performance.now();
      switch (type) {
        case "DFS":
          this.grid.DFS(this.animations);
          break;
        case "BFS":
          this.grid.BFS(this.animations);
          break;
        case "A_STAR":
          this.grid.A_Star(this.animations);
          break;
      }
      let endTime = performance.now();
      console.log(`${endTime - startTime} milliseconds`);
      console.log("this.animations:", this.animations);
    }

    this.isAnimationStarted = true;

    if (this.animationIndex >= this.animations.length) {
      this.drawCells();
      this.isAnimationStarted = false;
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

    setTimeout(() => {
      this.animationId = requestAnimationFrame(() => this.animate(type));
    }, this.animationSpeed);
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
    } else if (type === "empty") {
      this.ctx.fillStyle = "white";
    }

    this.ctx.fillRect(
      x * this.cellSize + 1,
      y * this.cellSize + 1,
      this.cellSize - 1,
      this.cellSize - 1,
    );

    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(
      `${x}:${y}`,
      x * this.cellSize + this.cellSize / 2,
      y * this.cellSize + this.cellSize / 2,
    );
  }

  drawCells(animation?: Animation) {
    for (let [, cell] of this.grid.cells) {
      if (cell.x === animation?.x && cell.y === animation?.y) {
        this.drawCell({ ...cell, type: "current" });
      } else {
        this.drawCell(cell);
      }
    }
  }
}
