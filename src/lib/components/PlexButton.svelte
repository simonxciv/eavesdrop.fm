<script lang="ts">
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import Button from './Button.svelte';

	export let jsIsEnabled: boolean;

	let isActioned: boolean;
</script>

<div transition:slide|local>
	<Button
		type={jsIsEnabled ? 'button' : 'submit'}
		isPlex
		bind:isActioned
		on:click={() => goto('https://app.plex.tv/desktop#!/settings/webhooks')}
	>
		Add webhook to Plex
	</Button>
</div>
