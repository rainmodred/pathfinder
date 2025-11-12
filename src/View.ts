import type { Grid, Nodes } from "./Grid";
import { Node } from "./Node";

export class View {
  private cellSize: number;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public isPlacing: boolean;

  constructor(rows: number, cols: number, cellSize: number) {
    this.cellSize = cellSize;

    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;

    this.canvas.width = cols * cellSize;
    this.canvas.height = rows * this.cellSize;

    this.isPlacing = false;
  }

  getRowCol(e: MouseEvent) {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const col = Math.floor(((e.clientX - rect.left) * scaleX) / this.cellSize);
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / this.cellSize);

    return { row, col };
  }

  onMouseDown(handler: (row: number, col: number) => void) {
    this.ctx.canvas.addEventListener("mousedown", (e) => {
      const { row, col } = this.getRowCol(e);
      handler(row, col);
    });
  }

  onMouseMove(handler: (row: number, col: number) => void) {
    this.ctx.canvas.addEventListener("mousemove", (e) => {
      if (!this.isPlacing) {
        return;
      }

      const { row, col } = this.getRowCol(e);
      handler(row, col);
    });
  }

  onMouseUp() {
    this.ctx.canvas.addEventListener("mouseup", () => {
      this.isPlacing = false;
    });
  }

  drawGrid(rows: number, cols: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "cyan";

    for (let i = 0; i <= cols; i++) {
      const x = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let i = 0; i <= rows; i++) {
      const y = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawNodes(nodes: Nodes) {
    for (let row = 0; row < nodes.length; row++) {
      for (let col = 0; col < nodes[0].length; col++) {
        const node = nodes[row][col];
        this.drawNode(node);
      }
    }
  }

  drawNode(node: Node) {
    const colorScheme = {
      start: "#10B981",
      end: "#EF4444",
      search: "lightblue",
      path: "yellow",
      wall: "#283140",
      current: "orange",
      empty: "white",
      hill: "brown",
    };

    // switch (node.type) {
    //   case "start":
    // }

    this.ctx.fillStyle = colorScheme[node.type];
    this.ctx.fillRect(
      node.col * this.cellSize + 1,
      node.row * this.cellSize + 1,
      this.cellSize - 2,
      this.cellSize - 2,
    );
  }

  animate(onStart: () => void, onFinish: () => void) {
    onStart();

    if (this.animationIndex >= this.grid.steps.length) {
      this.drawCells();
      this.drawPath();

      onFinish();
      return;
    }

    const currentAnimation = this.grid.steps[this.animationIndex];

    this.grid.setNode(
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
}
