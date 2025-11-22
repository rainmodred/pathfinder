import type { Grid } from '../Grid.svelte';
import { Node } from '../Node.ts';
import { MinHeap } from './MinHeap.ts';
import { reconstructPath } from './utils';

export function dijkstra(grid: Grid, nodesToAnimate: Node[]) {
	let dist = new Map();
	let visited = 0;

	let queue: Node[] = [];

	// let queue = new MinHeap<Node>();

	for (let row of grid.nodes) {
		for (let node of row) {
			dist.set(node.key, Infinity);
			queue.push(node);
		}
	}

	dist.set(grid.start.key, 0);

	//TODO: use priority queue
	function getCurrent() {
		let lowest = Infinity;
		let lowestIndex = -1;

		for (let i = 0; i < queue.length; i++) {
			const node = queue[i];
			const d = dist.get(node.key);
			if (d !== undefined && d < lowest) {
				lowestIndex = i;
				lowest = d;
			}
		}

		return queue.splice(lowestIndex, 1)[0];
	}

	while (queue.length > 0) {
		const current = getCurrent()!;
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
			if (neighbor.type === 'wall') {
				continue;
			}

			const pathLen = dist.get(current.key) + neighbor.weight;
			if (pathLen < dist.get(neighbor.key)) {
				dist.set(neighbor.key, pathLen);
				neighbor.parent = current;
			}
		}
	}

	return { path: [], visited };
}
