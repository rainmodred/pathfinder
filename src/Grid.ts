import { Node, type NodeType } from "./Node";
import { getRandomEvenNumber, getRandomOddNumber, timeDiff } from "./utils";

export type Nodes = Node[][];

export class Grid {
  public rows: number;
  public cols: number;
  public nodes: Nodes;

  //TODO:fix type
  public start: Record<string, number>;
  public end: Record<string, number>;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.nodes = new Array(rows)
      .fill(0)
      .map((_, row) =>
        new Array(cols).map((_, col) => new Node({ row, col, type: "empty" })),
      );

    this.start = {};
    this.end = {};

    this.reset();
  }

  reset() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (row === 1 && col === 1) {
          this.nodes[row][col] = new Node({
            row,
            col,
            type: "start",
          });
          this.start = { row, col };
          continue;
        }

        if (row === 2 && col === 5) {
          this.nodes[row][col] = new Node({
            row,
            col,
            type: "end",
          });
          this.end = { row, col };
          continue;
        }

        // if (row === this.height - 2 && col === this.width - 2) {
        //   const cell = new Cell(row, col, "end");
        //   this.cells.set(cell.key, cell);
        //   this.end = cell;
        //   continue;
        // }

        this.nodes[row][col] = new Node({ row, col, type: "empty" });
      }
    }
  }

  getNodeAt(row: number, col: number) {
    return this.nodes[row][col];
  }

  setNode(row: number, col: number, type: NodeType) {
    //TODO: remove
    // const currentCell = this.getCell(row, col);
    // if (
    //   type === "wall" &&
    //   (currentCell.type === "start" || currentCell.type === "end")
    // ) {
    //   return;
    // }

    this.nodes[row][col] = new Node({ row, col, type });

    if (type === "start") {
      this.start = { row, col };
    }

    if (type === "end" && this.end) {
      this.end = { row, col };
    }
  }

  isEmptyCell(row: number, col: number) {
    return this.getNodeAt(row, col).type === "empty";
  }

  isSameCell(a: Node, b: Node) {
    return a.row === b.row && a.col === b.col;
  }

  getNeighbors(cell: Node) {
    const directions = [
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 0],
    ];

    const cells = [];
    for (const [posRow, posCol] of directions) {
      const row = cell.row + posRow;
      const col = cell.col + posCol;
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        cells.push(this.getNodeAt(row, col));
      }
    }
    return cells;
  }
}
