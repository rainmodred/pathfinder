import type { Grid } from "../Grid";
import type { Node } from "../Node.ts";
import { euclideanDistance, reconstructPath } from "./utils";

export function aStar(
  grid: Grid,
  nodesToAnimate: Node[],
  heuristic = euclideanDistance,
) {
  let visited = 0;

  const start = grid.getNodeAt(grid.start.row, grid.start.col);
  const end = grid.getNodeAt(grid.end.row, grid.end.col);

  const openSet = [start];

  const gScore = new Map();
  gScore.set(start.key, 0);

  const fScore = new Map<string, number>();
  fScore.set(start.key, heuristic(start, end));

  //TODO: use priority queue
  function getCurrent() {
    let lowestFscore = Infinity;
    let lowestIndex = -1;

    for (let i = 0; i < openSet.length; i++) {
      const cell = openSet[i];
      const f = fScore.get(cell.key);
      if (f !== undefined && f < lowestFscore) {
        lowestIndex = i;
        lowestFscore = f;
      }
    }

    visited++;
    return openSet.splice(lowestIndex, 1)[0];
  }

  while (openSet.length > 0) {
    const current = getCurrent();

    if (!grid.isSameNode(current, end) && !grid.isSameNode(current, start)) {
      nodesToAnimate.push({ ...current, type: "search" });
    }

    if (grid.isSameNode(current, end)) {
      const path = reconstructPath(current);

      return { path, visited };
    }

    const neighbors = grid.getNeighbors(current);
    for (const neighbor of neighbors) {
      //TODO: move weight to Cell class
      const weight = neighbor.type === "hill" ? 5 : 1;
      const tentativeGscore = gScore.get(current.key) + weight;

      const g = gScore.get(neighbor.key) ?? Infinity;
      if (tentativeGscore < g) {
        neighbor.parent = current;
        gScore.set(neighbor.key, tentativeGscore);
        fScore.set(neighbor.key, tentativeGscore + heuristic(neighbor, end));

        if (
          neighbor.type !== "wall" &&
          openSet.filter((cell) => grid.isSameNode(neighbor, cell)).length === 0
        ) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return { path: [], visited: 0 };
}
