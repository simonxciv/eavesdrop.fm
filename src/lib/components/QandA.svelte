<script>
	import Card from './Card.svelte';
</script>

<details>
	<summary>
		<span>Q: </span><slot name="q" />
	</summary>
	<Card>
		<slot />
	</Card>
</details>

<style lang="scss">
	details {
		margin-bottom: 1rem;
	}
	summary {
		font-weight: bold;
		margin-bottom: 0.5rem;
		cursor: pointer;
		span {
			color: $highlight;
		}
	}
</style>
