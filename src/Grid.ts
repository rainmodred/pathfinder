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

  reset() {
    this.start = null;
    this.end = null;

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const cell = new Cell(j, i);
        this.cells.set(Cell.toKey(j, i), cell);
      }
    }
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

  //TODO: Add pathfinding failure handling - BFS doesn't indicate when no path exists
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

  heuristic(x: number, y: number) {
    //manhattan distance
    // return Math.abs(this.end!.x - x) + Math.abs(this.end!.y - y);

    return Math.floor(
      Math.sqrt((this.end!.x - x) ** 2 + (this.end!.y - y) ** 2),
    );
  }

  A_Star(animations: Cell[]) {
    if (!this.start || !this.end) {
      return;
    }

    const openSet = [this.start];
    const cameFrom = new Map();

    const gScore = new Map();
    // for (let [key, cell] of this.cells) {
    //   if (this.isCellEmpty(cell.x, cell.y)) {
    //     gScore.set(key, Infinity);
    //   }
    // }
    gScore.set(Cell.toKey(this.start.x, this.start.y), 0);

    const fScore = new Map<string, number>();
    // for (let [key, cell] of this.cells) {
    //   if (this.isCellEmpty(cell.x, cell.y)) {
    //     fScore.set(key, Infinity);
    //   }
    // }
    fScore.set(
      Cell.toKey(this.start.x, this.start.y),
      this.heuristic(this.start.x, this.start.y),
    );

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
      let currentKey = Cell.toKey(current.x, current.y);
      if (current.x === this.end.x && current.y === this.end.y) {
        let pathLength = 0;
        while (cameFrom.has(currentKey)) {
          currentKey = cameFrom.get(currentKey);

          let [x, y] = Cell.fromKey(currentKey);
          let cell = this.getCell(x, y);

          if (cell.x !== this.start.x || cell.y !== this.start.y) {
            pathLength++;
            animations.push({ ...cell, type: "path" });
          }
        }
        console.log("pathLength:", pathLength);
        return;
      }

      // animations.push({ ...current, type: "current" });

      const neighbors = this.getNeighbors(current);
      for (let [x, y] of neighbors) {
        let key = Cell.toKey(x, y);
        let tentativeGscore = gScore.get(currentKey) + 1;

        let g = gScore.get(key) ?? Infinity;
        if (tentativeGscore < g) {
          cameFrom.set(key, currentKey);
          gScore.set(key, tentativeGscore);
          fScore.set(key, tentativeGscore + this.heuristic(x, y));

          const cell = this.getCell(x, y);
          if (
            cell.type !== "wall" &&
            openSet.filter((cell) => cell.x === x && cell.y === y).length === 0
          ) {
            openSet.push(cell);

            if (cell.x !== this.end.x || cell.y !== this.end.y) {
              animations.push({ ...cell, type: "search" });
            }
          }
        }
      }
    }

    console.log("fail");
    return false;
  }
}
