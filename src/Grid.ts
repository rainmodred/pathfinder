import { Cell, type CellType } from "./Cell.ts";
import { type Animation } from "./Display.ts";

export type Cells = Map<string, Cell>;

type Options = {
  width: number;
  height: number;
};

export class Grid {
  public cells: Cells;
  public width: number;
  public height: number;

  public start: Cell | null;
  public end: Cell | null;

  constructor({ width, height }: Options) {
    this.width = width;
    this.height = height;

    this.cells = new Map();
    this.reset();

    this.start = null;
    this.end = null;
  }

  clearPath() {
    for (let [key, cell] of this.cells) {
      if (cell.type == "path" || cell.type == "search") {
        this.cells.set(key, new Cell(cell.x, cell.y, "empty"));
      }
    }
  }

  reset() {
    this.start = null;
    this.end = null;

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const cell = new Cell(j, i);
        this.cells.set(cell.key, cell);
      }
    }
  }

  changeCellState(x: number, y: number, state: CellType) {
    const cell = new Cell(x, y, state);

    this.cells.set(cell.key, cell);
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
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }

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
    const directions = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    const cells = [];
    for (let [posX, posY] of directions) {
      let x = cell.x + posX;
      let y = cell.y + posY;
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        cells.push(this.getCell(x, y));
      }
    }
    return cells;
  }

  reconstructPath(cameFrom: Map<string, string>, animations: Animation[]) {
    if (!this.start || !this.end) {
      return;
    }

    let pathLength = 0;
    let key = cameFrom.get(this.end.key);
    while (key && cameFrom.has(key)) {
      const [x, y] = Cell.fromKey(key);
      if (x !== this.start.x || y !== this.start.y) {
        animations.push({ x, y, type: "path" });
        pathLength++;
      }

      key = cameFrom.get(Cell.toKey(x, y));
    }

    console.log("pathLength:", pathLength);
    return;
  }

  //TODO: Add pathfinding failure handling - BFS doesn't indicate when no path exists
  BFS(animations: Animation[]) {
    if (!this.start || !this.end) {
      return;
    }

    let queue: Cell[] = [];
    let visited = new Set();
    const cameFrom = new Map();

    queue.push(this.start);
    visited.add(this.start.key);

    while (queue.length > 0) {
      let current = queue.shift()!;

      if (
        (current.x !== this.end.x || current.y !== this.end.y) &&
        (current.x !== this.start.x || current.y !== this.start.y)
      ) {
        animations.push({ ...current, type: "search" });
      }

      if (current.x === this.end.x && current.y === this.end.y) {
        this.reconstructPath(cameFrom, animations);
        return;
      }

      let neighbors = this.getNeighbors(current);
      for (let neighbor of neighbors) {
        if (!visited.has(neighbor.key)) {
          visited.add(neighbor.key);

          if (neighbor?.type === "wall") {
            continue;
          }

          queue.push(neighbor);
          cameFrom.set(neighbor.key, current.key);
        }
      }
    }
  }

  DFS(animations: Animation[]) {
    if (!this.start || !this.end) {
      return;
    }
    const cameFrom = new Map();

    const stack: Cell[] = [this.start];

    const visited = new Set();
    visited.add(this.start.key);

    while (stack.length > 0) {
      let current = stack.pop()!;

      if (
        (current.x !== this.end.x || current.y !== this.end.y) &&
        (current.x !== this.start.x || current.y !== this.start.y)
      ) {
        animations.push({ ...current, type: "search" });
      }

      if (current.x === this.end.x && current.y === this.end.y) {
        this.reconstructPath(cameFrom, animations);
        return;
      }

      if (!visited.has(current.key)) {
        visited.add(current.key);
      }
      const neighbors = this.getNeighbors(current);

      for (let neighbor of neighbors) {
        if (neighbor?.type === "wall") {
          continue;
        }

        if (!visited.has(neighbor.key)) {
          stack.push(neighbor);
          cameFrom.set(neighbor.key, current.key);
        }
      }
    }
  }

  heuristic(x: number, y: number) {
    //manhattan distance
    // return Math.abs(this.end!.x - x) + Math.abs(this.end!.y - y);

    return Math.floor(
      Math.sqrt((this.end!.x - x) ** 2 + (this.end!.y - y) ** 2),
    );
  }

  A_Star(animations: Animation[]) {
    if (!this.start || !this.end) {
      return;
    }

    const openSet = [this.start];
    const cameFrom = new Map();

    const gScore = new Map();
    gScore.set(this.start.key, 0);

    const fScore = new Map<string, number>();
    fScore.set(this.start.key, this.heuristic(this.start.x, this.start.y));

    //TODO: use priority queue
    function getCurrent() {
      let lowestFscore = Infinity;
      let lowestIndex = -1;

      for (let i = 0; i < openSet.length; i++) {
        const cell = openSet[i];
        const key = Cell.toKey(cell.x, cell.y);
        const f = fScore.get(key);
        if (f !== undefined && f < lowestFscore) {
          lowestIndex = i;
          lowestFscore = f;
        }
      }

      return openSet.splice(lowestIndex, 1)[0];
    }

    while (openSet.length > 0) {
      let current = getCurrent();

      if (
        (current.x !== this.end.x || current.y !== this.end.y) &&
        (current.x !== this.start.x || current.y !== this.start.y)
      ) {
        animations.push({ ...current, type: "search" });
      }

      if (current.x === this.end.x && current.y === this.end.y) {
        this.reconstructPath(cameFrom, animations);
        return;
      }

      const neighbors = this.getNeighbors(current);
      for (let neighbor of neighbors) {
        let tentativeGscore = gScore.get(current.key) + 1;

        let g = gScore.get(neighbor.key) ?? Infinity;
        if (tentativeGscore < g) {
          cameFrom.set(neighbor.key, current.key);
          gScore.set(neighbor.key, tentativeGscore);
          fScore.set(
            neighbor.key,
            tentativeGscore + this.heuristic(neighbor.x, neighbor.y),
          );

          if (
            neighbor.type !== "wall" &&
            openSet.filter(
              (cell) => cell.x === neighbor.x && cell.y === neighbor.y,
            ).length === 0
          ) {
            openSet.push(neighbor);
          }
        }
      }
    }

    console.log("fail");
    return false;
  }
}
