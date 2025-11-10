import { Cell, type CellType } from "./Cell.ts";
import { getRandomEvenNumber, getRandomOddNumber, timeDiff } from "./utils.ts";

export type Cells = Map<string, Cell>;

export const speed = {
  fast: 10,
  average: 50,
  slow: 100,
};

export type Speed = keyof typeof speed;

export class Grid {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public cells: Cells;
  public width: number;
  public height: number;

  public start: Cell | null;
  public end: Cell | null;

  public cellSize: number;

  public isAnimationStarted: boolean;
  private animations: Cell[];
  private animationIndex: number;
  private animationSpeed: number = speed.fast;
  private animationId: number | null = null;

  private selectedCellType: CellType;
  private isPlacing: boolean;

  private path: Cell[];

  constructor(
    canvas: HTMLCanvasElement,
    {
      width,
      height,
      cellSize,
    }: { width: number; height: number; cellSize: number },
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.width = width;
    this.height = height;
    this.start = null;
    this.end = null;

    this.cells = new Map();
    this.path = [];
    this.reset();

    this.cellSize = cellSize;
    this.canvas.width = this.cellSize * this.width;
    this.canvas.height = this.cellSize * this.height;

    this.drawGrid();
    this.drawCells();

    this.isAnimationStarted = false;
    this.animations = [];
    this.animationIndex = 0;

    this.selectedCellType = "wall";
    this.isPlacing = false;
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
      this.setCellState(row, col, this.selectedCellType);

      this.drawCells();
    });

    this.ctx.canvas.addEventListener("mousemove", (e) => {
      if (!this.isPlacing) {
        return;
      }

      const { row, col } = this.getRowCol(e);
      this.setCellState(row, col, this.selectedCellType);

      this.drawCells();
    });

    this.ctx.canvas.addEventListener("mouseup", () => {
      this.isPlacing = false;
    });
  }

  setSelectedCellType(type: CellType) {
    this.selectedCellType = type;
  }

  createMaze(onCreate: () => void) {
    this.reset();

    //border
    for (const [, cell] of this.cells) {
      if (
        cell.row === 0 ||
        cell.row === this.height - 1 ||
        cell.col === 0 ||
        cell.col === this.width - 1
      ) {
        this.animations.push({ ...cell, type: "wall" });
      }
    }

    this.recursiveDivision(2, 2, this.width - 3, this.height - 3, "VERTICAL");
    this.animateCreateMaze(onCreate);
  }

  animateCreateMaze(onCreate: () => void) {
    this.isAnimationStarted = true;

    if (this.animationIndex >= this.animations.length) {
      this.drawCells();
      this.stopAnimation();
      onCreate();
      return;
    }

    const currentAnimation = this.animations[this.animationIndex];

    this.setCellState(
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

  clearPath() {
    this.stopAnimation();

    for (const [, cell] of this.cells) {
      if (cell.type === "path" || cell.type === "search") {
        cell.type = "empty";
      }
    }

    this.drawCells();
  }

  changeSpeed(name: Speed) {
    this.animationSpeed = speed[name];
  }

  stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimationStarted = false;
    this.animations = [];
    this.animationIndex = 0;
  }

  reset() {
    this.stopAnimation();

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (row === 1 && col === 1) {
          const cell = new Cell(row, col, "start");
          this.cells.set(cell.key, cell);
          this.start = cell;
          continue;
        }

        if (row === 2 && col === 5) {
          const cell = new Cell(row, col, "end");
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

        const cell = new Cell(row, col);
        this.cells.set(cell.key, cell);
      }
    }

    if (!this.end) {
      throw new Error("start is missing");
    }
    this.path = [this.end];
    this.drawCells();
  }

  animate(onFinishAnimation: () => void) {
    this.isAnimationStarted = true;

    if (this.animationIndex >= this.animations.length) {
      this.drawCells();
      this.isAnimationStarted = false;

      this.drawPath();

      onFinishAnimation();
      return;
    }

    const currentAnimation = this.animations[this.animationIndex];

    this.setCellState(
      currentAnimation.row,
      currentAnimation.col,
      currentAnimation.type,
    );

    this.drawCells(currentAnimation);

    this.animationIndex++;

    setTimeout(() => {
      this.animationId = requestAnimationFrame(() =>
        this.animate(onFinishAnimation),
      );
    }, this.animationSpeed);
  }

  drawGrid() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.strokeStyle = "cyan";

    for (let i = 0; i <= this.width; i++) {
      const x = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let i = 0; i <= this.height; i++) {
      const y = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
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

  drawCell({ type, row, col }: Cell) {
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

    this.ctx.fillStyle = colorScheme[type];

    this.ctx.fillRect(
      col * this.cellSize + 1,
      row * this.cellSize + 1,
      this.cellSize - 2,
      this.cellSize - 2,
    );
  }

  drawPath() {
    if (!this.start) {
      throw new Error("end is missing");
    }
    console.log("path", this.path);

    function getMidpoint(row: number, col: number, size: number) {
      const x = col * size;
      const y = row * size;

      const x1 = x + size;
      const y1 = y + size;

      const mx = (x + x1) / 2;
      const my = (y + y1) / 2;

      return { x: mx, y: my };
    }

    this.path.push(this.start);
    this.ctx.lineWidth = 8;
    this.ctx.strokeStyle = "yellow";
    this.ctx.beginPath();

    for (let i = 0; i < this.path.length; i++) {
      const { row, col } = this.path[i];
      const { x, y } = getMidpoint(row, col, this.cellSize);

      if (i === 0) {
        this.ctx.moveTo(x, y);
        continue;
      }

      this.ctx.lineTo(x, y);
    }

    this.ctx.stroke();
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
          this.animations.push(new Cell(i, wallX, "wall"));
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
          this.animations.push(new Cell(wallY, i, "wall"));
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

  setCellState(row: number, col: number, type: CellType) {
    const oldCell = this.getCell(row, col);
    if (
      type === "wall" &&
      (oldCell.type === "start" || oldCell.type === "end")
    ) {
      return;
    }

    const cell = new Cell(row, col, type);
    this.cells.set(cell.key, cell);

    if (type === "start" && this.start) {
      this.start.type = "empty";
      this.start = cell;
    }

    if (type === "end" && this.end) {
      this.end.type = "empty";
      this.end = cell;
    }

    return cell;
  }

  getCell(row: number, col: number) {
    const key = Cell.toKey(row, col);

    const cell = this.cells.get(key);
    if (!cell) {
      throw new Error("cell is not found");
    }

    return cell;
  }

  isCellEmpty(row: number, col: number) {
    return this.getCell(row, col)?.type === "empty";
  }

  isSameCell(a: Cell, b: Cell) {
    return a.row === b.row && a.col === b.col;
  }

  getNeighbors(cell: Cell) {
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
      if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
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
      const [row, col] = Cell.fromKey(key);
      if (row !== this.start.row || col !== this.start.col) {
        this.path.push(new Cell(row, col, "path"));
        pathLength++;
      }

      key = cameFrom.get(Cell.toKey(row, col));
    }
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

    onFinishSearch([
      algorithm,
      timeDiff(startTime, endTime),
      result?.visited,
      result?.pathLength,
    ]);
  }

  BFS(start: Cell, end: Cell) {
    const queue: Cell[] = [];
    const visited = new Set();
    const cameFrom = new Map();

    queue.push(start);
    visited.add(start.key);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (!this.isSameCell(current, end) && !this.isSameCell(current, start)) {
        this.animations.push({ ...current, type: "search" });
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

  DFS(start: Cell, end: Cell) {
    const cameFrom = new Map();

    const stack: Cell[] = [start];

    const visited = new Set();
    visited.add(start.key);

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (!this.isSameCell(current, end) && !this.isSameCell(current, start)) {
        this.animations.push({ ...current, type: "search" });
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

  A_Star(start: Cell, end: Cell) {
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
        this.animations.push({ ...current, type: "search" });
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
}
