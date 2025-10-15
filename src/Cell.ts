export type CellState = "start" | "end" | "path" | "search" | "empty" | "wall";

export class Cell {
  public x: number;
  public y: number;
  public state: CellState;

  constructor(x: number, y: number, state: CellState = "empty") {
    this.x = x;
    this.y = y;
    this.state = state;
  }

  static toKey(x: number, y: number) {
    return `${x}:${y}`;
  }

  static fromKey(key: string) {
    return key.split(":").map((i) => Number(i));
  }
}
