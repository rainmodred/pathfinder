export type NodeType = 'start' | 'end' | 'empty' | 'wall' | 'hill' | 'search';

type Options = {
	row: number;
	col: number;
	type: NodeType;
};

const weights: Partial<Record<NodeType, number>> = {
	hill: 5
};

export class Node {
	#type: NodeType;

	public row: number;
	public col: number;
	public key: string;
	public parent: Node | null;
	public weight: number;

	constructor({ row, col, type }: Options) {
		this.row = row;
		this.col = col;
		this.#type = type;
		this.key = Node.toKey(row, col);
		this.parent = null;
		this.weight = weights[type] || 1;
	}

	get type() {
		return this.#type;
	}

	set type(newType: NodeType) {
		this.weight = weights[newType] || 1;
		this.#type = newType;
	}

	static toKey(row: number, col: number) {
		return `${row}:${col}`;
	}

	static fromKey(key: string) {
		return key.split(':').map((i) => Number(i));
	}
}
