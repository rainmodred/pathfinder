export type CellType =
  | "start"
  | "end"
  | "path"
  | "search"
  | "empty"
  | "wall"
  | "current";

export class Cell {
  public x: number;
  public y: number;
  public type: CellType;
  public key: string;

  constructor(x: number, y: number, state: CellType = "empty") {
    this.x = x;
    this.y = y;
    this.type = state;
    this.key = Cell.toKey(x, y);
  }

  static toKey(x: number, y: number) {
    return `${x}:${y}`;
  }

  static fromKey(key: string) {
    return key.split(":").map((i) => Number(i));
  }
}
