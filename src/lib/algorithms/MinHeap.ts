export class MinHeap<T> {
	private heap: [T, number][];

	constructor() {
		this.heap = [];
	}

	push(item: T, priority: number) {
		this.heap.push([item, priority]);
		this.up();
	}

	pop() {
		if (this.heap.length === 0) {
			return undefined;
		}

		if (this.heap.length === 1) {
			return this.heap.pop();
		}

		const top = this.heap[0];
		this.heap[0] = this.heap.pop() as [T, number];
		this.down();
		return top;
	}

	private up() {
		let i = this.heap.length - 1;
		while (i > 0) {
			let p = Math.floor((i - 1) / 2);
			if (this.heap[p][1] < this.heap[i][1]) {
				break;
			}

			[this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
			i = p;
		}
	}

	private down() {
		let i = 0;
		const n = this.heap.length;
		while (true) {
			let l = 2 * i + 1;
			let r = 2 * i + 2;
			let smallest = i;

			if (l < n && this.heap[l][1] < this.heap[smallest][1]) smallest = l;
			if (r < n && this.heap[r][1] < this.heap[smallest][1]) smallest = r;

			if (smallest === i) break;
			[this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
			i = smallest;
		}
	}

	isEmpty() {
		return this.heap.length === 0;
	}

	contains(fn: (item: T) => boolean) {
		for (let [item] of this.heap) {
			if (fn(item)) {
				return true;
			}
		}
		return false;
	}

	delete(fn: (item: T) => boolean) {
		for (let i = 0; i < this.heap.length; i++) {
			let [item] = this.heap[i];
			if (fn(item)) {
				this.heap.splice(i, 1);
				break;
			}
		}
	}
}
