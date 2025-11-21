<script lang="ts">
	import { aStar } from '$lib/algorithms/aStar';
	import { bfs } from '$lib/algorithms/bfs';
	import { dfs } from '$lib/algorithms/dfs';
	import Canvas from '$lib/components/Canvas.svelte';
	import type { TableData } from '$lib/components/Table.svelte';
	import Table from '$lib/components/Table.svelte';
	import { Grid } from '$lib/Grid.svelte';
	import { createMaze } from '$lib/maze';
	import type { NodeType, Node } from '$lib/Node';
	import { timeDiff } from '$lib/utils';

	const algorithms = [
		{ label: 'DFS', value: 'DFS' },
		{ label: 'BFS', value: 'BFS' },
		{ label: 'A*', value: 'A*' }
	] as const;

	type Algorithm = (typeof algorithms)[number]['value'];

	const speed = [
		{
			label: 'Fast',
			value: 10
		},
		{ label: 'Average', value: 30 },
		{ label: 'Slow', value: 50 }
	];

	const nodeTypes = [
		{ label: 'Wall', value: 'wall' },
		{ label: 'Start', value: 'start' },
		{ label: 'End', value: 'end' },
		{ label: 'Empty', value: 'empty' }
	];

	let selectedAlorithm = $state(algorithms[2].value as Algorithm);
	let selectedSpeed = $state(speed[0].value);
	let selectedNodeType = $state(nodeTypes[0].value as NodeType);

	let appState = $state<'IDLE' | 'ANIMATE_MAZE' | 'ANIMATE_SEARCH' | 'FINISHED'>('IDLE');

	let tableData = $state<TableData[]>([]);

	let header = $state<HTMLHeadElement>();
	const cellSize = 30;

	//derived?
	let rows = $derived(
		header && window ? Math.floor((window.innerHeight - header.clientHeight - 16) / cellSize) : 0
	);
	let cols = $derived(header && window ? Math.floor(window.innerWidth / cellSize) : 0);

	let grid = $derived(new Grid(rows, cols));
	let canvas: Canvas;

	function onpointerdown(row: number, col: number) {
		if (appState !== 'IDLE') {
			return false;
		}

		grid?.setNode(row, col, selectedNodeType);
		return true;
	}

	function findPath() {
		appState = 'ANIMATE_SEARCH';

		const nodesToAnimate: Node[] = [];

		let start = performance.now();

		let result: { path: Node[]; visited: number };
		switch (selectedAlorithm) {
			case 'BFS':
				result = bfs(grid, nodesToAnimate);
				break;
			case 'DFS':
				result = dfs(grid, nodesToAnimate);
				break;
			case 'A*':
				result = aStar(grid, nodesToAnimate);
				break;
		}

		let time = timeDiff(start, performance.now());

		canvas.animate(nodesToAnimate, 0, () => {
			canvas.drawPath(result.path);
			appState = 'FINISHED';

			tableData.push({
				//TODO: FIXME
				algorithm: selectedAlorithm,
				pathLength: result.path.length,
				visited: result.visited,
				time
			});
		});
	}

	function animateMaze() {
		reset();
		appState = 'ANIMATE_MAZE';

		const nodesToAnimate: Node[] = [];
		createMaze(grid, nodesToAnimate);

		for (const node of nodesToAnimate) {
			grid.setNode(node.row, node.col, node.type);
		}

		canvas.animate(nodesToAnimate, 0, () => {
			appState = 'IDLE';
		});
	}

	function clearPath() {
		appState = 'IDLE';
		canvas.stopAnimation();
		canvas.drawGrid();
		canvas.drawNodes();
	}

	function reset() {
		grid.reset();
		clearPath();
	}
</script>

<div class="flex h-full flex-col items-center gap-2 p-2">
	<header class="flex flex-col gap-2 bg-white p-1" bind:this={header}>
		<div class="flex gap-4">
			<h1 class="text-3xl">Pathfinder</h1>
			<div class="flex gap-2">
				<select class="select" bind:value={selectedAlorithm} onchange={() => clearPath()}>
					{#each algorithms as { value, label }}
						<option {value}>{label}</option>
					{/each}
				</select>
				<select class="select min-w-24" bind:value={selectedNodeType}>
					{#each nodeTypes as { value, label }}
						<option {value}>{label}</option>
					{/each}
				</select>
				<button disabled={appState !== 'IDLE'} class="btn" onclick={animateMaze}>Create maze</button
				>
				<button disabled={appState !== 'IDLE'} class="btn" onclick={findPath}>Find path</button>
				<button disabled={appState !== 'FINISHED'} class="btn" onclick={clearPath}
					>Clear path</button
				>
				<button class="btn" onclick={reset}>Reset</button>

				<select class="select" bind:value={selectedSpeed}>
					{#each speed as { value, label }}
						<option {value}>{label}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="h-[78px] overflow-y-scroll">
			<Table data={tableData} />
		</div>
	</header>
	<Canvas
		bind:this={canvas}
		{rows}
		{cols}
		{cellSize}
		speed={selectedSpeed}
		nodes={grid.nodes}
		{onpointerdown}
	/>
</div>
