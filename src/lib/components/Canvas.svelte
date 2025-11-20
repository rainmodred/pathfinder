<script lang="ts">
	import type { Node } from '$lib/Node';
	import { onMount } from 'svelte';

	interface Props {
		rows: number;
		cols: number;
		cellSize: number;
		nodes: Node[][];
		speed: number;
		onpointerdown: (row: number, col: number) => boolean;
	}

	let { rows, cols, cellSize, nodes, speed: animationSpeed, onpointerdown }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();
	let ctx = $state<CanvasRenderingContext2D | null>();

	let isPlacing = $state(false);
	let timeoutId: NodeJS.Timeout;

	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d');
			resize();
			drawGrid();
			drawNodes();
		}
	});

	function resize(): void {
		if (canvas) {
			canvas.width = cols * cellSize;
			canvas.height = rows * cellSize;
		}
	}

	export function drawGrid() {
		if (!ctx || !canvas) {
			return;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = 'cyan';

		for (let i = 0; i <= cols; i++) {
			const x = i * cellSize;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}

		for (let i = 0; i <= rows; i++) {
			const y = i * cellSize;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
	}

	export function drawNodes() {
		for (let row = 0; row < nodes.length; row++) {
			for (let col = 0; col < nodes[0].length; col++) {
				const node = nodes[row][col];
				drawNode(node);
			}
		}
	}

	function drawNode(node: Node) {
		if (!ctx || !canvas) {
			return;
		}

		const colorScheme = {
			start: '#10B981',
			end: '#EF4444',
			search: 'lightblue',
			path: 'yellow',
			wall: '#283140',
			current: 'orange',
			empty: 'white',
			hill: 'brown'
		};

		ctx.fillStyle = colorScheme[node.type];
		ctx.fillRect(node.col * cellSize + 1, node.row * cellSize + 1, cellSize - 2, cellSize - 2);
	}

	export function drawPath(path: Node[]) {
		if (!ctx) {
			return;
		}

		function getMidpoint(row: number, col: number, size: number) {
			const x = col * size;
			const y = row * size;

			const x1 = x + size;
			const y1 = y + size;

			const mx = (x + x1) / 2;
			const my = (y + y1) / 2;

			return { x: mx, y: my };
		}

		ctx.lineWidth = 8;
		ctx.strokeStyle = 'yellow';
		ctx.beginPath();

		for (let i = 0; i < path.length; i++) {
			const { row, col } = path[i];
			const { x, y } = getMidpoint(row, col, cellSize);

			if (i === 0) {
				ctx.moveTo(x, y);
				continue;
			}

			ctx.lineTo(x, y);
		}

		ctx.stroke();
	}

	export function stopAnimation() {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
		}
	}

	export function animate(nodesToAnimate: Node[], animationIndex: number, onFinish: () => void) {
		if (animationIndex >= nodesToAnimate.length) {
			stopAnimation();
			onFinish();
			return;
		}

		const currentNode = nodesToAnimate[animationIndex];
		drawNode(currentNode);

		timeoutId = setTimeout(() => {
			animate(nodesToAnimate, animationIndex + 1, onFinish);
		}, animationSpeed);
	}

	function getRowCol(e: PointerEvent) {
		if (!ctx || !canvas) {
			return { row: -1, col: -1 };
		}

		const rect = ctx.canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const col = Math.floor(((e.clientX - rect.left) * scaleX) / cellSize);
		const row = Math.floor(((e.clientY - rect.top) * scaleY) / cellSize);

		return { row, col };
	}
</script>

<div class="w-full grow overflow-hidden">
	<canvas
		class="w-full"
		bind:this={canvas}
		onpointerdown={(e) => {
			let { row, col } = getRowCol(e);
			const result = onpointerdown(row, col);

			if (result) {
				isPlacing = true;
				drawNodes();
			}
		}}
		onpointermove={(e) => {
			if (!isPlacing) {
				return;
			}

			let { row, col } = getRowCol(e);
			onpointerdown(row, col);
			drawNodes();
		}}
		onpointerup={() => {
			isPlacing = false;
		}}
	></canvas>
</div>
