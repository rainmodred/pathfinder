export type CellType =
  | "start"
  | "end"
  | "path"
  | "search"
  | "empty"
  | "wall"
  | "current";

export class Cell {
  public row: number;
  public col: number;
  public type: CellType;
  public key: string;

  constructor(row: number, col: number, state: CellType = "empty") {
    this.row = row;
    this.col = col;
    this.type = state;
    this.key = Cell.toKey(row, col);
  }

  static toKey(row: number, col: number) {
    return `${row}:${col}`;
  }

  static fromKey(key: string) {
    return key.split(":").map((i) => Number(i));
  }
}
