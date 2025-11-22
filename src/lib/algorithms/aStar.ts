import type { Grid } from '../Grid.svelte';
import { Node } from '../Node.ts';
import { MinHeap } from './MinHeap.ts';
import { euclideanDistance, manhattanDistance, reconstructPath } from './utils';

// export function aStar(grid: Grid, nodesToAnimate: Node[], heuristic = manhattanDistance) {
// 	let visited = 0;
//
// 	const start = grid.start;
// 	const end = grid.end;
//
// 	const openSet = new MinHeap<Node>();
// 	openSet.push([0, start]);
//
// 	const gScore = new Map();
// 	gScore.set(start.key, 0);
//
// 	// const fScore = new Map<string, number>();
// 	// fScore.set(start.key, heuristic(start, end));
//
// 	// //TODO: use priority queue
// 	// function getCurrent() {
// 	// 	let lowestFscore = Infinity;
// 	// 	let lowestIndex = -1;
// 	//
// 	// 	for (let i = 0; i < openSet.length; i++) {
// 	// 		const cell = openSet[i];
// 	// 		const f = fScore.get(cell.key);
// 	// 		if (f !== undefined && f < lowestFscore) {
// 	// 			lowestIndex = i;
// 	// 			lowestFscore = f;
// 	// 		}
// 	// 	}
// 	//
// 	// 	visited++;
// 	// 	return openSet.splice(lowestIndex, 1)[0];
// 	// }
//
// 	while (!openSet.isEmpty()) {
// 		const [, current] = openSet.pop()!;
// 		visited++;
// 		debugger;
//
// 		if (grid.isEmptyNode(current.row, current.col)) {
// 			nodesToAnimate.push(new Node({ row: current.row, col: current.col, type: 'search' }));
// 		}
//
// 		if (grid.isSameNode(current, end)) {
// 			const path = reconstructPath(current);
//
// 			return { path, visited };
// 		}
//
// 		const neighbors = grid.getNeighbors(current);
// 		for (const neighbor of neighbors) {
// 			const tentativeGscore = gScore.get(current.key) + neighbor.weight;
//
// 			const g = gScore.get(neighbor.key) ?? Infinity;
// 			if (tentativeGscore < g) {
// 				neighbor.parent = current;
// 				gScore.set(neighbor.key, tentativeGscore);
//
// 				let fScore = tentativeGscore + heuristic(neighbor, end);
//
// 				console.log('wut:', !openSet.contains((node) => grid.isSameNode(neighbor, node)));
// 				if (
// 					neighbor.type !== 'wall' &&
// 					// openSet.filter((cell) => grid.isSameNode(neighbor, cell)).length === 0
// 					!openSet.contains((node) => grid.isSameNode(neighbor, node))
// 				) {
// 					openSet.push([fScore, neighbor]);
// 					// openSet.push(neighbor);
// 				}
// 			}
// 		}
// 	}
//
// 	return { path: [], visited: 0 };
// }

export function aStar(grid: Grid, nodesToAnimate: Node[], heuristic = manhattanDistance) {
	let visited = 0;

	const start = grid.start;
	const end = grid.end;

	const openSet = new MinHeap<Node>();
	openSet.push([0, start]);

	const closedSet = new Set();

	const gScore = new Map();
	gScore.set(start.key, 0);

	while (!openSet.isEmpty()) {
		const [, current] = openSet.pop()!;
		visited++;

		if (grid.isEmptyNode(current.row, current.col)) {
			nodesToAnimate.push(new Node({ row: current.row, col: current.col, type: 'search' }));
		}

		if (grid.isSameNode(current, end)) {
			const path = reconstructPath(current);

			return { path, visited };
		}

		const neighbors = grid.getNeighbors(current);
		for (const neighbor of neighbors) {
			const cost = gScore.get(current.key) + neighbor.weight;
			if (!gScore.has(neighbor.key) || cost < gScore.get(neighbor.key)) {
				gScore.set(neighbor.key, cost);

				//https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#breaking-ties
				const dx1 = neighbor.col - end.col;
				const dy1 = neighbor.row - end.row;
				const dx2 = start.col - end.col;
				const dy2 = start.row - end.row;
				const cross = Math.abs(dx1 * dy2 - dx2 * dy1);
				//

				let fScore = cost + heuristic(neighbor, end) + cross * 0.001;
				openSet.push([fScore, neighbor]);
				neighbor.parent = current;
			}
		}
	}

	return { path: [], visited: 0 };
}
