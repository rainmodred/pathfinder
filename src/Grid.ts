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

        // if (row === 2 && col === 5) {
        //   this.nodes[row][col] = new Node({
        //     row,
        //     col,
        //     type: "end",
        //   });
        //   this.end = { row, col };
        //   continue;
        // }

        if (row === this.rows - 2 && col === this.cols - 2) {
          this.nodes[row][col] = new Node({
            row,
            col,
            type: "end",
          });
          this.end = { row, col };
          continue;
        }

        this.nodes[row][col] = new Node({ row, col, type: "empty" });
      }
    }
  }

  getNodeAt(row: number, col: number) {
    return this.nodes[row][col];
  }

  setNode(row: number, col: number, type: NodeType) {
    const currentNode = this.getNodeAt(row, col);

    switch (type) {
      case "start":
        if (!this.isEmptyNode(row, col)) {
          return;
        }

        //clear prev start node
        this.nodes[this.start.row][this.start.col].type = "empty";
        currentNode.type = type;

        this.start = { row, col };
        break;

      case "end":
        if (!this.isEmptyNode(row, col)) {
          return;
        }

        this.nodes[this.end.row][this.end.col].type = "empty";
        currentNode.type = type;
        this.end = { row, col };
        break;
      default:
        if (currentNode.type === "start" || currentNode.type === "end") {
          return;
        }

        currentNode.type = type;
    }
  }

  isEmptyNode(row: number, col: number) {
    return this.getNodeAt(row, col).type === "empty";
  }

  isSameNode(a: Node, b: Node) {
    return a.row === b.row && a.col === b.col;
  }

  getNeighbors(node: Node) {
    const directions = [
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 0],
    ];

    const nodes = [];
    for (const [posRow, posCol] of directions) {
      const row = node.row + posRow;
      const col = node.col + posCol;
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        nodes.push(this.getNodeAt(row, col));
      }
    }
    return nodes;
  }
}
