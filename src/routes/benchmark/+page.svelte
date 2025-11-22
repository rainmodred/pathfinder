<script lang="ts">
	import { aStar } from '$lib/algorithms/aStar';
	import { aStar as _aStar } from '$lib/algorithms/_aStar';
	import { dijkstra } from '$lib/algorithms/dijkstra';
	import { Grid } from '$lib/Grid.svelte';
	import { Node } from '$lib/Node';
	import { timeDiff } from '$lib/utils';

	let grid = $derived(new Grid(200, 200));

	function benchmark() {
		let times = [];

		for (let i = 0; i < 10; i++) {
			let start = performance.now();
			let result = aStar(grid, []);
			let time = performance.now() - start;
			console.log('time', time);

			times.push(time);
		}

		console.log(
			'total time: ',
			times.reduce((acc, curr) => acc + curr, 0)
		);
	}
</script>

<h1>Benchmark</h1>

<button class="btn" onclick={benchmark}>test</button>
