<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import jsIsEnabled from '$lib/stores/jsIsEnabled';
	import state from '$lib/stores/state';
	import { onMount } from 'svelte';

	onMount(() => {
		$jsIsEnabled = true;
	});
</script>

<Header jsIsEnabled={$jsIsEnabled} isMinimised={!!$state?.token} />

<slot />

<style lang="scss" global>
	@import '../app.scss';
</style>
