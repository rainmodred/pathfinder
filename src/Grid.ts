import { Cell, type CellType } from "./Cell.ts";

export type Cells = Map<string, Cell>;

type Options = {
  width: number;
  height: number;
};

export class Grid {
  public cells: Cells;
  public width: number;
  public height: number;

  private start: Cell | null;
  private end: Cell | null;

  constructor({ width, height }: Options) {
    this.cells = new Map();

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const cell = new Cell(j, i);
        this.cells.set(Cell.toKey(j, i), cell);
      }
    }

    this.width = width;
    this.height = height;

    this.start = null;
    this.end = null;
  }

  changeCellState(x: number, y: number, state: CellType) {
    const cell = new Cell(x, y, state);

    this.cells.set(Cell.toKey(x, y), cell);
    return cell;
  }

  getCell(x: number, y: number) {
    let key = Cell.toKey(x, y);

    const cell = this.cells.get(key);
    if (!cell) {
      throw new Error("cell is not found");
    }

    return cell;
  }

  isCellEmpty(x: number, y: number) {
    return this.getCell(x, y)?.type === "empty";
  }

  toggleCell(x: number, y: number) {
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

  BFS(animations: Cell[]) {
    if (!this.start || !this.end) {
      return;
    }

    let queue: Cell[] = [];
    let visited = new Set();
    const parentsMap = new Map();

    queue.push(this.start);
    visited.add(Cell.toKey(this.start.x, this.start.y));

    while (queue.length > 0) {
      let currentCell = queue.shift()!;

      if (currentCell.type !== "start" && currentCell.type !== "end") {
        animations.push({
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
            animations.push({ x, y, type: "path" });
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
