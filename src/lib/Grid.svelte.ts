import { Node, type NodeType } from './Node';
import { getRandomEvenNumber, getRandomOddNumber, timeDiff } from './utils';

export class Grid {
	public rows: number = $state(0);
	public cols: number = $state(0);
	public nodes: Node[][] = $state([]);

	public start: Node;
	public end: Node;

	constructor(rows: number, cols: number) {
		this.rows = rows;
		this.cols = cols;
		this.nodes = [];

		this.start = new Node({ row: 1, col: 1, type: 'start' });
		this.end = new Node({ row: this.rows - 2, col: this.cols - 2, type: 'end' });

		this.reset();
	}

	reset() {
		for (let row = 0; row < this.rows; row++) {
			this.nodes[row] = [];
			for (let col = 0; col < this.cols; col++) {
				if (row === 1 && col === 1) {
					this.start = new Node({
						row,
						col,
						type: 'start'
					});
					this.nodes[row][col] = this.start;
					continue;
				}

				if (row === this.rows - 2 && col === this.cols - 2) {
					this.end = new Node({
						row,
						col,
						type: 'end'
					});

					this.nodes[row][col] = this.end;
					continue;
				}

				this.nodes[row][col] = new Node({ row, col, type: 'empty' });
			}
		}
	}

	getNodeAt(row: number, col: number) {
		return this.nodes[row][col];
	}

	setNode(row: number, col: number, type: NodeType) {
		const currentNode = this.getNodeAt(row, col);

		switch (type) {
			case 'start':
				if (!this.isEmptyNode(row, col) || !this.start) {
					return;
				}

				//clear prev start node
				this.nodes[this.start.row][this.start.col].type = 'empty';
				currentNode.type = type;
				this.start = currentNode;
				break;

			case 'end':
				if (!this.isEmptyNode(row, col) || !this.end) {
					return;
				}

				this.nodes[this.end.row][this.end.col].type = 'empty';
				currentNode.type = type;
				this.end = currentNode;
				break;
			default:
				if (currentNode.type === 'start' || currentNode.type === 'end') {
					return;
				}

				currentNode.type = type;
		}
	}

	isEmptyNode(row: number, col: number) {
		return this.getNodeAt(row, col).type === 'empty';
	}

	isSameNode(a: Node, b: Node) {
		return a.row === b.row && a.col === b.col;
	}

	getNeighbors(node: Node) {
		const directions = [
			[-1, 0],
			[0, 1],
			[0, -1],
			[1, 0]
		];

		const nodes = [];
		for (const [posRow, posCol] of directions) {
			const row = node.row + posRow;
			const col = node.col + posCol;
			if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
				nodes.push(this.getNodeAt(row, col));
			}
		}
		return nodes;
	}
}
