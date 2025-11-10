import { Cell, type CellType } from "./Cell";

export type Cells = Map<string, Cell>;

export class Grid {
  public cells: Cells;

  public rows: number;
  public cols: number;

  public start: Cell | null;
  public end: Cell | null;

  public path: Cell[];

  constructor(rows: number, cols: number, cellSize: number) {
    this.rows = rows;
    this.cols = cols;
    this.start = null;
    this.end = null;

    this.cells = new Map();
    this.path = [];
    this.reset();
  }

  reset() {}

  getCell(row: number, col: number) {
    const key = Cell.toKey(row, col);

    const cell = this.cells.get(key);
    if (!cell) {
      throw new Error("cell is not found");
    }

    return cell;
  }

  setCell(row: number, col: number, type: CellType) {
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

  isEmptyCell(row: number, col: number) {
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
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        cells.push(this.getCell(row, col));
      }
    }
    return cells;
  }
}
