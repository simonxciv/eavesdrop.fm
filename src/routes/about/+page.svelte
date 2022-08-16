<script lang="ts">
	import SecondaryPage from '$lib/components/SecondaryPage.svelte';
</script>

<svelte:head>
	<title>eavesdrop.fm | about</title>
</svelte:head>

<SecondaryPage title="About">
	<p>
		Do you use Plex Music? Want to learn more about your listening habits, and maybe help engineers
		around the world build cool stuff?
	</p>

	<p>
		ListenBrainz is an open alternative to <a href="https://last.fm">last.fm</a>, so you can do just
		that. As a heavy user of Plex Music, and a fan of what the team behind ListenBrainz is up to, I
		built eavesdrop.fm to simplify the process of submitting your listening data to ListenBrainz.
	</p>

	<h3>License</h3>
	<p>
		This site (and accompanying webhook listener) is proudly open source software, released under
		the <a href="https://github.com/simonxciv/eavesdrop.fm/blob/main/LICENSE">MIT license</a>.
	</p>

	<h3>Source code</h3>
	<p>
		The source for eavesdrop.fm can be found in the official
		<a href="https://github.com/simonxciv/eavesdrop.fm/">Github repository</a>. Contributions are
		welcome!
	</p>
	<div>
		<small>
			Built by <a href="https://twitter.com/SimonXCIV">@simonxciv</a> with
			<a href="https://kit.svelte.dev/">SvelteKit</a>
			and
			<img
				alt="love"
				aria-label="a heart icon"
				style="position:relative;top:4px"
				src="./heart.svg"
				width="27"
				height="27"
			/>
		</small>
	</div>
</SecondaryPage>

<style lang="scss">
	div {
		background: $secondaryHighlight;
		color: #ffffff;
		border-radius: 0.5rem;
		text-align: center;
		padding: 0.3rem 0;
		a {
			color: #ffffff;
		}
	}
</style>
