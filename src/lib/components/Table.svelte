<script lang="ts">
	export type TableData = {
		algorithm: Algorithm;
		pathLength: number;
		visited: number;
		time: string;
	};

	interface Props {
		data: TableData[];
	}

	let { data }: Props = $props();

	let tableRef: HTMLTableElement;

	$effect(() => {
		if (data.length) {
			scroll();
		}
	});

	function scroll() {
		if (tableRef) {
			tableRef.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}
	}
</script>

<table class="table-pin-rows table table-xs" bind:this={tableRef}>
	<thead>
		<tr>
			<th>Algorithm</th>
			<th>Path length</th>
			<th>Visited</th>
			<th>Time</th>
		</tr>
	</thead>
	<tbody>
		{#each data as result (result)}
			<tr>
				<th>{result.algorithm}</th>
				<td>{result.pathLength}</td>
				<td>{result.visited}</td>
				<td>{result.time}</td>
			</tr>
		{/each}
	</tbody>
</table>
