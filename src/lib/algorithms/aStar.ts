import type { Grid } from '../Grid.svelte';
import { Node } from '../Node.ts';
import { MinHeap } from './MinHeap.ts';
import { manhattanDistance, reconstructPath } from './utils';

export function aStar(grid: Grid, nodesToAnimate: Node[], heuristic = manhattanDistance) {
	let visited = 0;

	const start = grid.start;
	const end = grid.end;

	const openSet = new MinHeap<Node>();
	openSet.push(start, 0);

	const gScore = new Map();
	gScore.set(start.key, 0);

	while (!openSet.isEmpty()) {
		const [current] = openSet.pop()!;
		visited++;

		if (grid.isSameNode(current, end)) {
			const path = reconstructPath(current);

			return { path, visited };
		}

		const neighbors = grid.getNeighbors(current);
		for (const neighbor of neighbors) {
			const cost = gScore.get(current.key) + neighbor.weight;
			if (neighbor.type === 'wall') {
				continue;
			}

			if (!gScore.has(neighbor.key) || cost < gScore.get(neighbor.key)) {
				if (grid.isEmptyNode(neighbor.row, neighbor.col)) {
					nodesToAnimate.push(new Node({ row: neighbor.row, col: neighbor.col, type: 'search' }));
				}

				gScore.set(neighbor.key, cost);

				//https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#breaking-ties
				const dx1 = neighbor.col - end.col;
				const dy1 = neighbor.row - end.row;
				const dx2 = start.col - end.col;
				const dy2 = start.row - end.row;
				const cross = Math.abs(dx1 * dy2 - dx2 * dy1);
				//

				let fScore = cost + heuristic(neighbor, end) + cross * 0.001;
				openSet.push(neighbor, fScore);
				neighbor.parent = current;
			}
		}
	}
	return { path: [], visited: 0 };
}
