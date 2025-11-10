import { Grid } from "./Grid";
import type { Cell, CellType } from "./Cell";

export const speed = {
  fast: 10,
  average: 50,
  slow: 100,
};

export class Display {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public isAnimationStarted: boolean;
  private animations: Cell[];
  private animationIndex: number;
  private animationSpeed: number = speed.fast;
  private animationId: number | null = null;

  private selectedCellType: CellType;
  private isPlacing: boolean;
  private cellSize: number;

  private path: Cell[];

  private grid: Grid;

  constructor(canvas: HTMLCanvasElement, grid: Grid, cellSize: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.grid = grid;
    this.cellSize = cellSize;

    this.isAnimationStarted = false;
    this.animations = [];
    this.animationIndex = 0;

    this.selectedCellType = "wall";
    this.isPlacing = false;

    this.drawGrid();
  }

  getRowCol(e: MouseEvent) {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const col = Math.floor(((e.clientX - rect.left) * scaleX) / this.cellSize);
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / this.cellSize);

    return { row, col };
  }

  initListeners() {
    this.ctx.canvas.addEventListener("mousedown", (e) => {
      //TODO: use states: iddle, animating, etc...
      if (this.isAnimationStarted || this.animations.length > 0) {
        return;
      }

      if (
        this.selectedCellType === "start" ||
        this.selectedCellType === "end"
      ) {
        this.isPlacing = false;
      } else {
        this.isPlacing = true;
      }

      const { row, col } = this.getRowCol(e);

      this.grid.setCell(row, col, this.selectedCellType);

      this.drawCells();
    });

    this.ctx.canvas.addEventListener("mousemove", (e) => {
      if (!this.isPlacing) {
        return;
      }

      const { row, col } = this.getRowCol(e);
      this.grid.setCell(row, col);

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
    for (const [, cell] of this.cells) {
      if (cell.row === animation?.row && cell.col === animation?.col) {
        this.drawCell({ ...cell, type: "current" });
      } else {
        this.drawCell(cell);
      }
    }
  }
}
