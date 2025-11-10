export type CellType =
  | "start"
  | "end"
  | "path"
  | "search"
  | "empty"
  | "wall"
  | "current"
  | "hill";

export class Cell {
  public row: number;
  public col: number;
  public cost: number;
  public type: CellType;
  public key: string;

  constructor(row: number, col: number, state: CellType = "empty") {
    this.row = row;
    this.col = col;
    this.type = state;
    this.key = Cell.toKey(row, col);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    row: number,
    col: number,
    cellSize: number,
  ) {
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

    ctx.fillStyle = colorScheme[this.type];

    ctx.fillRect(
      col * cellSize + 1,
      row * cellSize + 1,
      cellSize - 2,
      cellSize - 2,
    );
  }

  static toKey(row: number, col: number) {
    return `${row}:${col}`;
  }

  static fromKey(key: string) {
    return key.split(":").map((i) => Number(i));
  }
}
