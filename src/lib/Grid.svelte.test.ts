import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from './Grid.svelte.ts';
import { Node, type NodeType } from './Node';

describe('Grid', () => {
	let grid: Grid;

	beforeEach(() => {
		grid = new Grid(5, 5);
	});

	it('should initialize with correct rows and columns', () => {
		expect(grid.rows).toBe(5);
		expect(grid.cols).toBe(5);
	});

	it('should initialize nodes as a 2D array', () => {
		expect(grid.nodes).toBeInstanceOf(Array);
		expect(grid.nodes).toHaveLength(5);
		expect(grid.nodes[0]).toHaveLength(5);
	});

	it('should reset grid with default start and end positions', () => {
		grid.reset();

		const startNode = grid.getNodeAt(1, 1);
		expect(startNode.type).toBe('start');
		expect(grid.start?.row).toBe(1);
		expect(grid.start?.col).toBe(1);

		let row = grid.rows - 2;
		let col = grid.cols - 2;

		const endNode = grid.getNodeAt(row, col);
		expect(endNode.type).toBe('end');
		expect(grid.end?.row).toBe(row);
		expect(grid.end?.col).toBe(col);

		expect(grid.getNodeAt(0, 0).type).toBe('empty');
	});

	it('should maintain grid dimensions after reset', () => {
		grid.reset();
		expect(grid.nodes).toHaveLength(5);
		expect(grid.nodes[0]).toHaveLength(5);
	});

	it('should return correct node at valid coordinates', () => {
		const node = grid.getNodeAt(0, 0);
		expect(node).toBeInstanceOf(Node);
		expect(node.row).toBe(0);
		expect(node.col).toBe(0);
	});

	it('should set empty node to wall', () => {
		grid.setNode(0, 0, 'wall');
		expect(grid.getNodeAt(0, 0).type).toBe('wall');
	});

	it('should move start node to new position', () => {
		const oldStart = structuredClone(grid.start);
		grid.setNode(0, 1, 'start');

		// New position should be start
		expect(grid.getNodeAt(0, 1).type).toBe('start');
		expect(grid.start?.row).toBe(0);
		expect(grid.start?.col).toBe(1);

		// Old position should be empty
		expect(grid.getNodeAt(oldStart?.row, oldStart?.col).type).toBe('empty');
	});

	it('should move end node to new position', () => {
		const oldEnd = structuredClone(grid.end);
		grid.setNode(4, 4, 'end');

		// New position should be end
		expect(grid.getNodeAt(4, 4).type).toBe('end');
		expect(grid.end?.row).toBe(4);
		expect(grid.end?.col).toBe(4);

		// Old position should be empty
		expect(grid.getNodeAt(oldEnd?.row, oldEnd?.col).type).toBe('empty');
	});

	it('should not set start/end on non-empty nodes', () => {
		// Try to set start on a wall
		grid.setNode(0, 0, 'wall');
		grid.setNode(0, 0, 'start');

		expect(grid.getNodeAt(0, 0).type).toBe('wall');
	});

	it('should not modify start/end nodes with other types', () => {
		const startNode = grid.getNodeAt(grid.start.row, grid.start.col);
		grid.setNode(grid.start.row, grid.start.col, 'wall');

		expect(startNode.type).toBe('start');
	});

	it('should return true for empty nodes', () => {
		expect(grid.isEmptyNode(0, 0)).toBe(true);
	});

	it('should return false for non-empty nodes', () => {
		expect(grid.isEmptyNode(grid.start.row, grid.start.col)).toBe(false);
		expect(grid.isEmptyNode(grid.end.row, grid.end.col)).toBe(false);

		grid.setNode(0, 0, 'wall');
		expect(grid.isEmptyNode(0, 0)).toBe(false);
	});

	it('should return true for identical nodes', () => {
		const node1 = grid.getNodeAt(0, 0);
		const node2 = grid.getNodeAt(0, 0);
		expect(grid.isSameNode(node1, node2)).toBe(true);
	});

	it('should return false for different nodes', () => {
		const node1 = grid.getNodeAt(0, 0);
		const node2 = grid.getNodeAt(1, 1);
		expect(grid.isSameNode(node1, node2)).toBe(false);
	});

	it('should return correct neighbors for center node', () => {
		const centerNode = grid.getNodeAt(2, 2);
		const neighbors = grid.getNeighbors(centerNode);

		expect(neighbors).toHaveLength(4);
		expect(neighbors).toContainEqual(grid.getNodeAt(1, 2)); // up
		expect(neighbors).toContainEqual(grid.getNodeAt(2, 3)); // right
		expect(neighbors).toContainEqual(grid.getNodeAt(3, 2)); // down
		expect(neighbors).toContainEqual(grid.getNodeAt(2, 1)); // left
	});

	it('should return correct neighbors for corner node', () => {
		const cornerNode = grid.getNodeAt(0, 0);
		const neighbors = grid.getNeighbors(cornerNode);

		// Only right and down neighbors should exist
		expect(neighbors).toHaveLength(2);
		expect(neighbors).toContainEqual(grid.getNodeAt(0, 1)); // right
		expect(neighbors).toContainEqual(grid.getNodeAt(1, 0)); // down
	});

	it('should return correct neighbors for edge node', () => {
		const edgeNode = grid.getNodeAt(0, 2);
		const neighbors = grid.getNeighbors(edgeNode);

		// Should have 3 neighbors: right, left, down
		expect(neighbors).toHaveLength(3);
		expect(neighbors).toContainEqual(grid.getNodeAt(0, 1)); // left
		expect(neighbors).toContainEqual(grid.getNodeAt(0, 3)); // right
		expect(neighbors).toContainEqual(grid.getNodeAt(1, 2)); // down
	});

	it('should not include out-of-bounds neighbors', () => {
		const cornerNode = grid.getNodeAt(0, 0);
		const neighbors = grid.getNeighbors(cornerNode);

		const hasOutOfBounds = neighbors.some(
			(node) => node.row < 0 || node.row >= grid.rows || node.col < 0 || node.col >= grid.cols
		);
		expect(hasOutOfBounds).toBe(false);
	});
});
