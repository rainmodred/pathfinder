import type { Grid } from "../Grid";
import type { Node } from "../Node";
import { reconstructPath } from "./utils";

export function dfs(grid: Grid, nodesToAnimate: Node[]) {
  const start = grid.getNodeAt(grid.start.row, grid.start.col);
  const end = grid.getNodeAt(grid.end.row, grid.end.col);

  const stack: Node[] = [start];

  const visited = new Set();
  visited.add(start.key);

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (!grid.isSameNode(current, end) && !grid.isSameNode(current, start)) {
      nodesToAnimate.push({ ...current, type: "search" });
    }

    if (grid.isSameNode(current, end)) {
      const path = reconstructPath(current);

      return { path, visited: visited.size };
    }

    if (!visited.has(current.key)) {
      visited.add(current.key);
    }
    const neighbors = grid.getNeighbors(current);

    for (const neighbor of neighbors) {
      if (neighbor?.type === "wall") {
        continue;
      }

      if (!visited.has(neighbor.key)) {
        stack.push(neighbor);
        neighbor.parent = current;
      }
    }
  }

  return { path: [], visited: 0 };
}
