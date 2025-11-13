import type { Node } from "../Node.ts";

export function reconstructPath(node: Node) {
  const path: Node[] = [];
  let pathLength = 0;
  // let key = cameFrom.get(this.end.key);

  while (node.parent) {
    path.push(node);
    node = node.parent;
    // const [row, col] = Node.fromKey(key);
    //
    // if (row !== this.start.row || col !== this.start.col) {
    //   this.path.push(new Node(row, col, "path"));
    //   pathLength++;
    // }
    //
    // key = cameFrom.get(Node.toKey(row, col));
  }

  // this.path.push(this.start);
  return path;
}
