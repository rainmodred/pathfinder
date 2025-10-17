import { Cell, type CellType } from "./Cell.ts";

type Options = {
  width: number;
  height: number;
};

export type Animation = {
  type: "search" | "path" | "current";
  x: number;
  y: number;
};

export class State {
  public grid: Map<string, Cell>;
  public width: number;
  public height: number;

  private start: Cell | null;
  private end: Cell | null;

  public animations: Animation[];

  constructor({ width, height }: Options) {
    this.grid = new Map();
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const cell = new Cell(j, i);
        this.grid.set(Cell.toKey(j, i), cell);
      }
    }

    this.width = width;
    this.height = height;

    this.start = null;
    this.end = null;

    this.animations = [];
  }

  changeCellState(x: number, y: number, state: CellType) {
    const cell = new Cell(x, y, state);

    this.grid.set(Cell.toKey(x, y), cell);
    return cell;
  }

  getCell(x: number, y: number) {
    let key = Cell.toKey(x, y);

    const cell = this.grid.get(key);
    if (!cell) {
      throw new Error("cell is not found");
    }

    return cell;
  }

  isCellEmpty(x: number, y: number) {
    return this.getCell(x, y)?.type === "empty";
  }

  toggleCell(x: number, y: number, update: () => void) {
    if (!this.start && this.isCellEmpty(x, y)) {
      this.start = this.changeCellState(x, y, "start");
    } else if (this.getCell(x, y)?.type === "start") {
      this.changeCellState(x, y, "empty");
      this.start = null;
    } else if (!this.end && this.isCellEmpty(x, y)) {
      this.end = this.changeCellState(x, y, "end");
    } else if (this.getCell(x, y)?.type === "end") {
      this.changeCellState(x, y, "empty");
      this.end = null;
    } else if (this.getCell(x, y)?.type === "wall") {
      this.changeCellState(x, y, "empty");
    } else {
      this.changeCellState(x, y, "wall");
    }

    // this.getNeighbors(x, y);
    update();
    return;
  }

  getNeighbors(cell: Cell) {
    const positions = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    const cells = [];
    for (let [posX, posY] of positions) {
      let nextX = cell.x + posX;
      let nextY = cell.y + posY;
      if (
        nextX >= 0 &&
        nextX < this.width &&
        nextY >= 0 &&
        nextY < this.height
      ) {
        cells.push([nextX, nextY]);
      }
    }
    return cells;
  }

  BFS() {
    if (!this.start || !this.end) {
      return;
    }

    let steps = 0;
    let queue: Cell[] = [];
    let visited = new Set();
    const parentsMap = new Map();

    queue.push(this.start);
    visited.add(Cell.toKey(this.start.x, this.start.y));

    while (queue.length > 0) {
      steps++;
      let currentCell = queue.shift()!;

      if (currentCell.type !== "start" && currentCell.type !== "end") {
        this.animations.push({
          x: currentCell.x,
          y: currentCell.y,
          type: "search",
        });
      }

      if (currentCell.x === this.end.x && currentCell.y === this.end.y) {
        debugger;
        let key = parentsMap.get(Cell.toKey(this.end.x, this.end.y));
        while (parentsMap.has(key)) {
          const [x, y] = Cell.fromKey(key);
          if (x !== this.start.x || y !== this.start.y) {
            this.animations.push({ x, y, type: "path" });
          }

          key = parentsMap.get(Cell.toKey(x, y));
        }

        return;
      }

      let neighbors = this.getNeighbors(currentCell);
      for (let [x, y] of neighbors) {
        let key = Cell.toKey(x, y);

        if (!visited.has(key)) {
          visited.add(key);

          const cell = this.getCell(x, y);
          if (cell?.type === "wall") {
            continue;
          }

          queue.push(cell);
          parentsMap.set(key, Cell.toKey(currentCell.x, currentCell.y));
        }
      }
    }
  }
}
