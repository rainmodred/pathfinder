import type { Grid } from '../Grid.svelte';
import { Node } from '../Node.ts';
import { reconstructPath } from './utils';

export function bfs(grid: Grid, nodesToAnimate: Node[]) {
	const queue: Node[] = [];
	const visited = new Set();

	const start = grid.start;
	const end = grid.end;

	queue.push(start);
	visited.add(start.key);

	while (queue.length > 0) {
		const current = queue.shift()!;

		if (grid.isEmptyNode(current.row, current.col)) {
			nodesToAnimate.push(new Node({ row: current.row, col: current.col, type: 'search' }));
		}

		if (grid.isSameNode(current, end)) {
			const path = reconstructPath(current);

			return { path, visited: visited.size };
		}

		const neighbors = grid.getNeighbors(current);
		for (const neighbor of neighbors) {
			if (!visited.has(neighbor.key)) {
				visited.add(neighbor.key);

				if (neighbor.type === 'wall') {
					continue;
				}

				queue.push(neighbor);
				neighbor.parent = current;
			}
		}
	}
	return { path: [], visited: 0 };
}
