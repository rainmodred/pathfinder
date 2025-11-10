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
  public isSearched: boolean;

  constructor(row: number, col: number, state: CellType = "empty") {
    this.row = row;
    this.col = col;
    this.type = state;
    this.key = Cell.toKey(row, col);
    this.cost = 1;
    this.isSearched = true;
  }

  draw(ctx: CanvasRenderingContext2D, cellSize: number) {
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

    //TODO
    if (this.isSearched) {
      ctx.fillStyle = colorScheme[this.type];
      ctx.fillStyle = "rgba(105, 35, 35, 0.8)";
    } else {
      ctx.fillStyle = colorScheme[this.type];
    }

    ctx.fillRect(
      this.col * cellSize + 1,
      this.row * cellSize + 1,
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
