<script lang="ts">
	import { navigating } from '$app/stores';
	import { slide } from 'svelte/transition';
	import H1 from './H1.svelte';
	import Nav from './Nav.svelte';
	export let isMinimised = false;
	export let jsIsEnabled: boolean;
</script>

<header class:isMinimised>
	<H1>
		<img
			class:jsIsEnabled
			alt="eavesdrop.fm logo"
			aria-label="the eavesdrop.fm logo, a music note above a stylised list"
			style="position:relative;top:12px"
			src="./list-music-solid.svg"
			width="64"
			height="64"
		/>&nbsp;{#if !isMinimised}eavesdrop.fm{/if}
	</H1>
	{#if !isMinimised}
		<h2 transition:slide|local>
			Submit your <a href="https://plex.tv" title="Plex's homepage">Plex</a> listening activity to
			<span>
				<a href="https://listenbrainz.org" title="ListenBrainz hoempage">ListenBrainz</a><img
					class:jsIsEnabled
					class="brain pink-mushy"
					alt="brain cicuitry icon"
					aria-label="a stylised icon showing a brain with circuitry within it"
					style="position:relative;top:8px"
					src="./brain.svg"
					width="34"
					height="34"
				/>
			</span>
		</h2>
		<div transition:slide|local>
			<Nav />
		</div>
		<div transition:slide|local class="gradient" class:loading={$navigating} />
	{/if}
</header>

<style lang="scss">
	@keyframes progress-bar-stripes {
		0% {
			background-position-x: -2rem;
		}
	}
	.gradient {
		height: 5px;
		background-image: $gradient;
		border-radius: 2.5px;
		&.loading {
			background-image: linear-gradient(
				135deg,
				#ef4343 25%,
				#7c3bed 25%,
				#7c3bed 50%,
				#ef4343 50%,
				#ef4343 75%,
				#7c3bed 75%,
				#7c3bed 100%
			);
			background-size: 30px 30px;
			-webkit-animation: 1s linear infinite progress-bar-stripes;
			animation: 1s linear infinite progress-bar-stripes;
		}
	}
	header {
		margin-bottom: 1rem;
		&:not(.isMinimised) {
			margin-bottom: 2rem;
		}
	}
	h2 {
		margin: 0.5rem 0 1rem 0;
		font-size: 0.9rem;
	}
	span {
		white-space: nowrap;
	}
	.pink-mushy {
		margin-left: 0.2rem;
	}
</style>
