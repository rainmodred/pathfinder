import { Node, type NodeType } from "./Cell";
import { getRandomEvenNumber, getRandomOddNumber, timeDiff } from "./utils";

export type Cells = Map<string, Node>;

export class Grid {
  public cells: Cells;

  public rows: number;
  public cols: number;

  public start: Node | null;
  public end: Node | null;

  public path: Node[];
  public steps: Node[];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.start = null;
    this.end = null;

    this.cells = new Map();
    this.path = [];
    this.steps = [];
    this.reset();
  }

  clearPath() {
    for (const [, cell] of this.cells) {
      if (cell.type === "path" || cell.type === "search") {
        cell.type = "empty";
      }
    }

    this.resetPath();
  }

  resetPath() {
    if (!this.end) {
      throw new Error("end is missing");
    }

    this.path = [this.end];
  }

  reset() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (row === 1 && col === 1) {
          const cell = new Node(row, col, "start");
          this.cells.set(cell.key, cell);
          this.start = cell;
          continue;
        }

        if (row === 2 && col === 5) {
          const cell = new Node(row, col, "end");
          this.cells.set(cell.key, cell);
          this.end = cell;
          continue;
        }

        // if (row === this.height - 2 && col === this.width - 2) {
        //   const cell = new Cell(row, col, "end");
        //   this.cells.set(cell.key, cell);
        //   this.end = cell;
        //   continue;
        // }

        const cell = new Node(row, col);
        this.cells.set(cell.key, cell);
      }
    }

    this.resetPath();
    this.steps = [];
  }

  getCell(row: number, col: number) {
    const key = Node.toKey(row, col);

    const cell = this.cells.get(key);
    if (!cell) {
      throw new Error("cell is not found");
    }

    return cell;
  }

  setCell(row: number, col: number, type: NodeType) {
    // const currentCell = this.getCell(row, col);
    // if (
    //   type === "wall" &&
    //   (currentCell.type === "start" || currentCell.type === "end")
    // ) {
    //   return;
    // }

    const cell = new Node(row, col, type);
    this.cells.set(cell.key, cell);

    if (type === "start" && this.start) {
      this.start.type = "empty";
      this.start = cell;
    }

    if (type === "end" && this.end) {
      this.end.type = "empty";
      this.end = cell;
      this.resetPath();
    }

    return cell;
  }

  isEmptyCell(row: number, col: number) {
    return this.getCell(row, col)?.type === "empty";
  }

  isSameCell(a: Node, b: Node) {
    return a.row === b.row && a.col === b.col;
  }

  getNeighbors(cell: Node) {
    const directions = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    const cells = [];
    for (const [posRow, posCol] of directions) {
      const row = cell.row + posRow;
      const col = cell.col + posCol;
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        cells.push(this.getCell(row, col));
      }
    }
    return cells;
  }

  reconstructPath(cameFrom: Map<string, string>) {
    if (!this.start || !this.end) {
      return -1;
    }

    let pathLength = 0;
    let key = cameFrom.get(this.end.key);
    while (key && cameFrom.has(key)) {
      const [row, col] = Node.fromKey(key);
      if (row !== this.start.row || col !== this.start.col) {
        this.path.push(new Node(row, col, "path"));
        pathLength++;
      }

      key = cameFrom.get(Node.toKey(row, col));
    }

    this.path.push(this.start);
    return pathLength;
  }

  searchPath(algorithm: string, onFinishSearch: (results: any) => void) {
    if (!this.start || !this.end) {
      return;
    }

    let result: { visited: number; pathLength: number } | undefined;
    const startTime = performance.now();

    switch (algorithm) {
      case "DFS":
        result = this.DFS(this.start, this.end);
        break;
      case "BFS":
        result = this.BFS(this.start, this.end);
        break;
      case "A_STAR":
        result = this.A_Star(this.start, this.end);
        break;
    }

    if (!result) {
      throw new Error("missing search result");
    }

    const endTime = performance.now();

    //TODO: fixme
    onFinishSearch([
      algorithm,
      timeDiff(startTime, endTime),
      result?.visited,
      result?.pathLength,
    ]);
  }

  BFS(start: Node, end: Node) {
    const queue: Node[] = [];
    const visited = new Set();
    const cameFrom = new Map();

    queue.push(start);
    visited.add(start.key);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (!this.isSameCell(current, end) && !this.isSameCell(current, start)) {
        this.steps.push({ ...current, type: "search" });
      }

      if (this.isSameCell(current, end)) {
        const pathLength = this.reconstructPath(cameFrom);
        return { visited: visited.size, pathLength };
      }

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
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

  DFS(start: Node, end: Node) {
    const cameFrom = new Map();

    const stack: Node[] = [start];

    const visited = new Set();
    visited.add(start.key);

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (!this.isSameCell(current, end) && !this.isSameCell(current, start)) {
        this.steps.push({ ...current, type: "search" });
      }

      if (this.isSameCell(current, end)) {
        const pathLength = this.reconstructPath(cameFrom);

        return {
          visited: visited.size,
          pathLength,
        };
      }

      if (!visited.has(current.key)) {
        visited.add(current.key);
      }
      const neighbors = this.getNeighbors(current);

      for (const neighbor of neighbors) {
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

  heuristic(row: number, col: number) {
    if (!this.end) {
      throw new Error("this.end cell is missing");
    }

    //manhattan distance
    // return Math.abs(this.end!.row - row) + Math.abs(this.end!.col - col);

    return Math.floor(
      Math.sqrt((this.end.row - row) ** 2 + (this.end.col - col) ** 2),
    );
  }

  A_Star(start: Node, end: Node) {
    let visited = 0;
    const openSet = [start];
    const cameFrom = new Map();

    const gScore = new Map();
    gScore.set(start.key, 0);

    const fScore = new Map<string, number>();
    fScore.set(start.key, this.heuristic(start.row, start.col));

    //TODO: use priority queue
    function getCurrent() {
      let lowestFscore = Infinity;
      let lowestIndex = -1;

      for (let i = 0; i < openSet.length; i++) {
        const cell = openSet[i];
        const f = fScore.get(cell.key);
        if (f !== undefined && f < lowestFscore) {
          lowestIndex = i;
          lowestFscore = f;
        }
      }

      visited++;
      return openSet.splice(lowestIndex, 1)[0];
    }

    while (openSet.length > 0) {
      const current = getCurrent();

      if (!this.isSameCell(current, end) && !this.isSameCell(current, start)) {
        this.steps.push({ ...current, type: "search" });
      }

      if (this.isSameCell(current, end)) {
        const pathLength = this.reconstructPath(cameFrom);

        return { visited, pathLength };
      }

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        //TODO: move weight to Cell class
        const weight = neighbor.type === "hill" ? 5 : 1;
        const tentativeGscore = gScore.get(current.key) + weight;

        const g = gScore.get(neighbor.key) ?? Infinity;
        if (tentativeGscore < g) {
          cameFrom.set(neighbor.key, current.key);
          gScore.set(neighbor.key, tentativeGscore);
          fScore.set(
            neighbor.key,
            tentativeGscore + this.heuristic(neighbor.row, neighbor.col),
          );

          if (
            neighbor.type !== "wall" &&
            openSet.filter((cell) => this.isSameCell(neighbor, cell)).length ===
              0
          ) {
            openSet.push(neighbor);
          }
        }
      }
    }
  }

  createMaze() {
    this.reset();

    //border
    for (const [, cell] of this.cells) {
      if (
        cell.row === 0 ||
        cell.row === this.rows - 1 ||
        cell.col === 0 ||
        cell.col === this.cols - 1
      ) {
        this.steps.push({ ...cell, type: "wall" });
      }
    }

    this.recursiveDivision(2, 2, this.cols - 3, this.rows - 3, "VERTICAL");
  }

  recursiveDivision(
    row: number,
    col: number,
    width: number,
    height: number,
    orientation: "HORIZONTAL" | "VERTICAL",
  ) {
    if (width < row || height < col) {
      return;
    }

    if (orientation === "VERTICAL") {
      const wallX = getRandomEvenNumber(row, width);
      const passageY = getRandomOddNumber(col, height);

      for (let i = col - 1; i < height + 2; i++) {
        if (i !== passageY) {
          this.steps.push(new Node(i, wallX, "wall"));
        }
      }

      if (height - col > wallX - 2 - row) {
        this.recursiveDivision(row, col, wallX - 2, height, "HORIZONTAL");
      } else {
        this.recursiveDivision(row, col, wallX - 2, height, orientation);
      }

      if (height - col > width - (wallX + 2)) {
        this.recursiveDivision(wallX + 2, col, width, height, "HORIZONTAL");
      } else {
        this.recursiveDivision(wallX + 2, col, width, height, orientation);
      }
    } else {
      const wallY = getRandomEvenNumber(col, height);
      const passageX = getRandomOddNumber(row, width);

      for (let i = row - 1; i < width + 2; i++) {
        if (i !== passageX) {
          this.steps.push(new Node(wallY, i, "wall"));
        }
      }

      if (wallY - 2 - col > width - row) {
        this.recursiveDivision(row, col, width, wallY - 2, orientation);
      } else {
        this.recursiveDivision(row, col, width, wallY - 2, "VERTICAL");
      }
      if (height - (wallY + 2) > width - row) {
        this.recursiveDivision(row, wallY + 2, width, height, orientation);
      } else {
        this.recursiveDivision(row, wallY + 2, width, height, "VERTICAL");
      }
    }
  }
}
