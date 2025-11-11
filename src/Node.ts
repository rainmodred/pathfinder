export type NodeType = "start" | "end" | "empty" | "wall" | "hill";

type Options = {
  row: number;
  col: number;
  type: NodeType;
};

export class Node {
  public row: number;
  public col: number;
  public type: NodeType;

  // public key: string;
  public weight: number;
  public isSearched: boolean;

  constructor({ row, col, type }: Options) {
    this.row = row;
    this.col = col;
    this.type = type;

    this.weight = 1;
    this.isSearched = true;
    // this.key = Cell.toKey(row, col);
  }
}
