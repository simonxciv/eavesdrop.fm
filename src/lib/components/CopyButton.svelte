<script lang="ts">
	import { slide } from 'svelte/transition';
	import Button from './Button.svelte';

	export let isCopied: boolean;
	export let value: string;
	export let jsIsEnabled: boolean;

	let buttonText = jsIsEnabled ? 'Copy to clipboard' : 'Generate Webhook URL';
	let buttonAlt = jsIsEnabled
		? 'Copy the webhook URL to your clipboard'
		: 'Generate a unique URL to forward listen events to';

	const copyToClipboard = () => {
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			isCopied = true;
			return navigator.clipboard.writeText(value);
		}
		return Promise.reject('The Clipboard API is not available.');
	};
</script>

<div transition:slide|local>
	<Button
		type="submit"
		title={!isCopied ? buttonAlt : 'URL already copied'}
		bind:isActioned={isCopied}
		on:click={copyToClipboard}
	>
		{!isCopied ? buttonText : 'Copied!'}
	</Button>
</div>
