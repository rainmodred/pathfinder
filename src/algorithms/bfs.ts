export function bfs(start, end, nodes) {
  const queue: Node[] = [];
  const visited = new Set();
  const cameFrom = new Map();

  queue.push(start);
  visited.add(start.key);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (!this.isSameCell(current, end) && !this.isSameCell(current, start)) {
      this.steps.push({ ...current, type: "search" });
    }

    if (this.isSameCell(current, end)) {
      const pathLength = this.reconstructPath(cameFrom);
      return { visited: visited.size, pathLength };
    }

    const neighbors = this.getNeighbors(current);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.key)) {
        visited.add(neighbor.key);

        if (neighbor?.type === "wall") {
          continue;
        }

        queue.push(neighbor);
        cameFrom.set(neighbor.key, current.key);
      }
    }
  }
}
