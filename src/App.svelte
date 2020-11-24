<script>
	import { fade } from 'svelte/transition';
	import Clipboard from 'clipboard';

	let token, user, url;
	let copied = false;
	let success = false;

	let clipboard = new Clipboard('.btn');
	clipboard.on('success', e => {
		success = true
	});

	$: url = encodeURI('https://eavesdrop.fm/?token=' + token + '&user=' + user);
</script>

<div class="container">
	<div class="content">
		<header class="justified">
			<div class="grid">
				<h1>
					<a href="/">Eavesdrop.FM</a>
				</h1>
				<p>ListenBrainz + Plex = <i class="fas fa-heart"></i></p>
			</div>
			<h3>Submit your <a href="https://plex.tv">Plex</a> music listening activity to <a href="https://listenbrainz.org">the ListenBrainz project</a></h3>
		</header>
		<main>
			<section class="about grid justified">
				<div>
					<h2>About Eavesdrop.FM</h2>
					<p>As a heavy user of Plex music, and a fan of what the MetaBrainz people are working towards, I built Eavesdrop.FM to simplify submitting listening data to ListenBrainz, the open last.fm alternative.</p>
				</div>
				<img src="img/hero.svg" class="hero" alt="Stylised person listening to music">
			</section>
			<section class="get-started">
				<div class="justified">
					<h2>Get started</h2>
					<p>Make sure you have a Plex Media Server with a <a href="https://www.plex.tv/your-media/music/">Music library</a>, an active <a href="https://www.plex.tv/plex-pass/">Plex Pass</a>, and a free <a href="https://musicbrainz.org/register">MusicBrainz account</a>.</p>
					<div>
						<div>
							<h4>Step 1</h4>
							Enter your <a href="https://listenbrainz.org/profile/">ListenBrainz User Token</a> in the field below (don't worry, we won't store it):<br>
							<input bind:value={token} type="text" placeholder="e.g. 152be636-bc70-4c86-9d0d-ba5bfb79fb65">
						</div>
						{#if token}
							<div transition:fade>
								<h4>Step 2</h4>
								Enter your Plex username below to ensure shared users don't submit on your behalf:<br>
								<input bind:value={user} type="text" placeholder="e.g. simon">
							</div>
						{/if}
						{#if token && user}
							<div transition:fade>
								<h4>Step 3</h4>
								<button on:click={() => copied = true} class="btn" data-clipboard-text={url}>
									<i class="fas fa-clone"></i> Copy to clipboard
								</button>{#if success === true}<span transition:fade class="clipboardsuccess"><i class="fad fa-check-circle icon"></i> copied!</span>{/if}
							</div>
						{/if}
						{#if token && user && copied}
							<div transition:fade>
								<h4>Step 4</h4>
								And finally, paste your unique URL into a new <a href="https://app.plex.tv/desktop#!/settings/webhooks">webhook here</a> using the "Add Webhook" button.
							</div>
						{/if}
					</div>
				</div>
			</section>
			<section class="faq justified">
				<h2>FAQ</h2>

				<h4>Why do I need a Plex Pass?</h4>
				<p>Eavesdrop.FM leverages Plex <a href="https://www.plex.tv/plex-labs/#section7">webhooks</a> to submit listens. Webhooks are a premium Plex feature, available to Plex Pass holders.</p>

				<h4>How do I find my ListenBrainz token?</h4>
				<p>Your ListenBrainz token is available from your ListenBrainz <a href="https://listenbrainz.org/profile/">user profile</a> page, under the User Token heading.</p>

				<h4>Why aren't offline listens submitted?</h4>
				<p>Due to the way Plex webhooks work, listens that occur historically can not be submitted. If your device is not able to connect to your Plex Server at the time that you listen to a track, it won't be submitted.</p>

				<h4>My listens aren't being submitted! Halp!</h4>
				<p>Check the following:</p>
				<ul>
					<li>Both the Plex username and ListenBrainz token you entered above are correct.</li>
					<li>The webhook is saved in your <a href="https://app.plex.tv/desktop#!/settings/webhooks">account settings.</a></li>
					<li>In your Plex Server's network settings (under Settings &gt; Network), ensure the server is permitted to send webhooks.</li>
					<li>Your Plex server is able to reach the internet.</li>
				</ul>
				<p>If you've checked all of the above and still can't submit your listens, raise a Github issue <a title="Eavesdrop.FM on Github" href="https://github.com/simonxciv/eavesdrop.fm">here</a> with as much information as possible.</p>

				<h4>What about my privacy?</h4>
				<p>Your information <strong>is not</strong> stored by Eavesdrop.FM. Your listening history, Plex username, and ListenBrainz token are encrypted in transit, and not retained by us.</p>
			</section>
		</main>
	</div>
	<footer class="justified">
		<div class="grid">
			<div>
				<i class="fad fa-hammer"></i> Built by <a href="https://smnbkly.co">Simon Buckley</a>
			</div>
			<div class="github">
				<a title="Eavesdrop.FM on Github" href="https://github.com/simonxciv/eavesdrop.fm">
					<i class="fab fa-github"></i>
				</a>
			</div>
		</div>
	</footer>
</div>