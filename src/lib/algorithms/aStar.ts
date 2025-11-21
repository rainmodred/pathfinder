import type { Grid } from '../Grid.svelte';
import { Node } from '../Node.ts';
import { euclideanDistance, reconstructPath } from './utils';

export function aStar(grid: Grid, nodesToAnimate: Node[], heuristic = euclideanDistance) {
	let visited = 0;

	const start = grid.start;
	const end = grid.end;

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

		if (grid.isEmptyNode(current.row, current.col)) {
			nodesToAnimate.push(new Node({ row: current.row, col: current.col, type: 'search' }));
		}

		if (grid.isSameNode(current, end)) {
			const path = reconstructPath(current);

			return { path, visited };
		}

		const neighbors = grid.getNeighbors(current);
		for (const neighbor of neighbors) {
			const weight = neighbor.weight;
			const tentativeGscore = gScore.get(current.key) + weight;

			const g = gScore.get(neighbor.key) ?? Infinity;
			if (tentativeGscore < g) {
				neighbor.parent = current;
				gScore.set(neighbor.key, tentativeGscore);
				fScore.set(neighbor.key, tentativeGscore + heuristic(neighbor, end));

				if (
					neighbor.type !== 'wall' &&
					openSet.filter((cell) => grid.isSameNode(neighbor, cell)).length === 0
				) {
					openSet.push(neighbor);
				}
			}
		}
	}

	return { path: [], visited: 0 };
}
