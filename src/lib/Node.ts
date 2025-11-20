export type NodeType = "start" | "end" | "empty" | "wall" | "hill" | "search";

type Options = {
  row: number;
  col: number;
  type: NodeType;
};

export class Node {
  public row: number;
  public col: number;
  public type: NodeType;
  public key: string;
  public parent: Node | null;

  // public weight: number;
  // public isSearched: boolean;

  constructor({ row, col, type }: Options) {
    this.row = row;
    this.col = col;
    this.type = type;
    this.key = Node.toKey(row, col);
    this.parent = null;

    // this.weight = 1;
    // this.isSearched = true;
    // this.key = Cell.toKey(row, col);
  }

  static toKey(row: number, col: number) {
    return `${row}:${col}`;
  }

  static fromKey(key: string) {
    return key.split(":").map((i) => Number(i));
  }
}
