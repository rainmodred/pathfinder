export class MinHeap<T> {
	private heap: [number, T][];

	constructor() {
		this.heap = [];
	}

	push(item: [number, T]) {
		this.heap.push(item);
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
		this.heap[0] = this.heap.pop() as [number, T];
		this.down();
		return top;
	}

	private up() {
		let i = this.heap.length - 1;
		while (i > 0) {
			let p = Math.floor((i - 1) / 2);
			if (this.heap[p][0] <= this.heap[i][0]) {
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
			let l = 2 * i + 1,
				r = 2 * i + 2,
				smallest = i;

			if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
			if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;

			if (smallest === i) break;
			[this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
			i = smallest;
		}
	}

	isEmpty() {
		return this.heap.length === 0;
	}

	contains(fn: (item: T) => boolean) {
		for (let [, n] of this.heap) {
			if (fn(n)) {
				return true;
			}
		}
		return false;
	}

	delete(fn: (item: T) => boolean) {
		let i = -1;
		for (let i = 0; i < this.heap.length; i++) {
			let [, item] = this.heap[i];
			if (fn(item)) {
				this.heap.splice(i, 1);
				break;
			}
		}
	}
}
