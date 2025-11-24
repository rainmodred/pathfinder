import type { Grid } from '../Grid.svelte';
import { Node } from '../Node.ts';
import { MinHeap } from './MinHeap.ts';
import { reconstructPath } from './utils';

export function dijkstra(grid: Grid, nodesToAnimate: Node[]) {
	let queue = new MinHeap<Node>();
	queue.push(grid.start, 0);

	let dist = new Map();
	dist.set(grid.start.key, 0);

	let visited = 0;

	while (!queue.isEmpty()) {
		const [current] = queue.pop()!;
		visited++;

		if (grid.isEmptyNode(current.row, current.col)) {
			nodesToAnimate.push(new Node({ row: current.row, col: current.col, type: 'search' }));
		}

		if (grid.isSameNode(current, grid.end)) {
			const path = reconstructPath(current);

			return { path, visited };
		}

		const neighbors = grid.getNeighbors(current);
		for (const neighbor of neighbors) {
			let cost = dist.get(current.key) + neighbor.weight;
			if (!dist.has(neighbor.key) || cost < dist.get(neighbor.key)) {
				dist.set(neighbor.key, cost);
				queue.push(neighbor, cost);
				neighbor.parent = current;
			}
		}
	}

	return { path: [], visited };
}
