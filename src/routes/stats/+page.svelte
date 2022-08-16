<script lang="ts">
	import { browser } from '$app/env';
	import SecondaryPage from '$lib/components/SecondaryPage.svelte';
</script>

<svelte:head>
	<title>eavesdrop.fm | stats</title>
</svelte:head>

<SecondaryPage title="Stats">
	{#if browser}
		<p>
			Anonymous, privacy-conscious site statistics provided by
			<a href="https://plausible.io">Plausible</a>.
		</p>
		<iframe
			title="Plausible Analytics for eavesdrop.fm"
			plausible-embed
			src="https://plausible.io/share/eavesdrop.fm?auth=d-1qGtC2HIWr96k7gkmnL&goal=listen&embed=true&theme=system&background=transparent"
			scrolling="no"
			frameborder="0"
			loading="lazy"
			style="width: 1px; min-width: 100%; height: 1600px;"
		/>
		<script async src="https://plausible.io/js/embed.host.js"></script>
	{:else}
		<p>The stats page currently doesn't work without JavaScript, sorry!</p>
	{/if}
</SecondaryPage>
