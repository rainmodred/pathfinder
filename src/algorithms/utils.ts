import type { Grid } from "../Grid.ts";
import type { Node } from "../Node.ts";

export function reconstructPath(node: Node) {
  const path: Node[] = [];

  while (node.parent) {
    path.push(node);
    node = node.parent;
  }

  path.push(node);
  return path;
}

export function manhattanDistance(a: Node, b: Node) {
  return Math.abs(b.row - a.row) + Math.abs(b.col - a.col);
}

export function euclideanDistance(a: Node, b: Node) {
  return Math.floor(Math.sqrt((b.row - a.row) ** 2 + (b.col - a.col) ** 2));
}

export function timeDiff(startTime: number, endTime: number) {
  return `${endTime - startTime} ms`;
}
