import { Grid } from "./Grid";
import type { Cell, CellType } from "./Cell";

export const speed = {
  fast: 10,
  average: 50,
  slow: 100,
};

export type Speed = keyof typeof speed;

export class Display {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private animationIndex: number;
  private animationSpeed: number = speed.fast;
  private animationId: number | null = null;
  public state: "IDLE" | "STARTED";

  private cellType: CellType;
  private isPlacing: boolean;
  private cellSize: number;

  private grid: Grid;

  constructor(canvas: HTMLCanvasElement, grid: Grid, cellSize: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.grid = grid;
    this.cellSize = cellSize;

    this.canvas.width = this.grid.cols * this.cellSize;
    this.canvas.height = this.grid.rows * this.cellSize;

    this.animationIndex = 0;
    this.state = "IDLE";

    this.cellType = "wall";
    this.isPlacing = false;

    this.drawGrid();
    this.drawCells();

    this.initListeners();
  }

  getRowCol(e: MouseEvent) {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const col = Math.floor(((e.clientX - rect.left) * scaleX) / this.cellSize);
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / this.cellSize);

    return { row, col };
  }

  clearPath() {
    this.grid.clearPath();
    this.stopAnimation();
  }

  reset() {
    this.grid.reset();
    this.stopAnimation();
  }

  stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.grid.steps = [];
    this.state = "IDLE";
    this.animationIndex = 0;

    this.drawGrid();
    this.drawCells();
  }

  setSpeed(name: Speed) {
    this.animationSpeed = speed[name];
  }

  setCellType(type: CellType) {
    this.cellType = type;
  }

  initListeners() {
    this.ctx.canvas.addEventListener("mousedown", (e) => {
      //TODO: use states: iddle, animating, etc...
      if (this.state !== "IDLE") {
        return;
      }

      if (this.cellType === "start" || this.cellType === "end") {
        this.isPlacing = false;
      } else {
        this.isPlacing = true;
      }

      const { row, col } = this.getRowCol(e);

      this.grid.setCell(row, col, this.cellType);

      this.drawCells();
    });

    this.ctx.canvas.addEventListener("mousemove", (e) => {
      if (!this.isPlacing) {
        return;
      }

      const { row, col } = this.getRowCol(e);

      const currentCell = this.grid.getCell(row, col);
      if (
        this.cellType === "wall" &&
        (currentCell.type === "start" || currentCell.type === "end")
      ) {
        return;
      }

      this.grid.setCell(row, col, this.cellType);

      this.drawCells();
    });

    this.ctx.canvas.addEventListener("mouseup", () => {
      this.isPlacing = false;
    });
  }

  drawGrid() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "cyan";

    for (let i = 0; i <= this.grid.cols; i++) {
      const x = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let i = 0; i <= this.grid.rows; i++) {
      const y = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawCells(animation?: Cell) {
    for (const [, cell] of this.grid.cells) {
      cell.draw(this.ctx, this.cellSize);

      // if (cell.row === animation?.row && cell.col === animation?.col) {
      //   this.drawCell({ ...cell, type: "current" });
      // } else {
      //   this.drawCell(cell);
      // }
    }
  }

  drawPath() {
    function getMidpoint(row: number, col: number, size: number) {
      const x = col * size;
      const y = row * size;

      const x1 = x + size;
      const y1 = y + size;

      const mx = (x + x1) / 2;
      const my = (y + y1) / 2;

      return { x: mx, y: my };
    }

    this.ctx.lineWidth = 8;
    this.ctx.strokeStyle = "yellow";
    this.ctx.beginPath();

    for (let i = 0; i < this.grid.path.length; i++) {
      const { row, col } = this.grid.path[i];
      const { x, y } = getMidpoint(row, col, this.cellSize);

      if (i === 0) {
        this.ctx.moveTo(x, y);
        continue;
      }

      this.ctx.lineTo(x, y);
    }

    this.ctx.stroke();
  }

  animate(onStart: () => void, onFinish: () => void) {
    this.state = "STARTED";
    onStart();

    if (this.animationIndex >= this.grid.steps.length) {
      this.drawCells();
      this.drawPath();

      onFinish();
      return;
    }

    const currentAnimation = this.grid.steps[this.animationIndex];

    this.grid.setCell(
      currentAnimation.row,
      currentAnimation.col,
      currentAnimation.type,
    );

    this.drawCells(currentAnimation);

    this.animationIndex++;

    setTimeout(() => {
      this.animationId = requestAnimationFrame(() =>
        this.animate(onStart, onFinish),
      );
    }, this.animationSpeed);
  }

  animateCreateMaze(onCreate: () => void) {
    this.state = "STARTED";

    if (this.animationIndex >= this.grid.steps.length) {
      this.stopAnimation();
      onCreate();
      return;
    }

    const currentAnimation = this.grid.steps[this.animationIndex];

    this.grid.setCell(
      currentAnimation.row,
      currentAnimation.col,
      currentAnimation.type,
    );

    this.drawCells(currentAnimation);

    this.animationIndex++;

    setTimeout(() => {
      this.animationId = requestAnimationFrame(() =>
        this.animateCreateMaze(onCreate),
      );
    }, this.animationSpeed);
  }
}
