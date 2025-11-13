import type { Grid } from "../Grid";
import type { Node } from "../Node.ts";
import { reconstructPath } from "./utils";

export function bfs(grid: Grid, nodesToAnimate: Node[]) {
  const queue: Node[] = [];
  const visited = new Set();
  const cameFrom = new Map();

  //TODO:
  const start = grid.getNodeAt(grid.start.row, grid.start.col);
  const end = grid.getNodeAt(grid.end.row, grid.end.col);

  queue.push(start);
  visited.add(start.key);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (!grid.isSameNode(current, end) && !grid.isSameNode(current, start)) {
      nodesToAnimate.push({ ...current, type: "search" });
    }

    if (grid.isSameNode(current, end)) {
      const path = reconstructPath(current);

      return { path, visited: visited.size };
    }

    const neighbors = grid.getNeighbors(current);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.key)) {
        visited.add(neighbor.key);

        if (neighbor.type === "wall") {
          continue;
        }

        queue.push(neighbor);

        // cameFrom.set(neighbor.key, current.key);
        neighbor.parent = current;
        // current.parent = neighbor;
      }
    }
  }
  return { path: [], visited: [] };
}
