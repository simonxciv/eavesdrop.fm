<?php
    require_once('process.php');
?>
<?php if(showFrontend()): ?>
<!DOCTYPE html>
<html>
    <head>
        <title>Eavesdrop.FM - Sync your Plex listens with ListenBrainz</title>
        <link href="styles/main.css" rel="stylesheet">
        <link href="styles/dark.css" rel="stylesheet" media="(prefers-color-scheme:dark)">

        <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.0.8/purify.min.js"></script>

        <meta name="description" content="Convert Plex track plays to ListenBrainz listens via webhooks and the ListenBrainz API. Like scrobbling, but not really.">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        
        <meta property="og:title" content="Sync your Plex listens with ListenBrainz">
        <meta property="og:description" content="Convert Plex track plays to ListenBrainz listens via webhooks and the ListenBrainz API. Like scrobbling, but not really.">
        <meta property="og:url" content="https://eavesdrop.fm">

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
    </head>
    <body>
        <div id="swup" class="transition-fade">
            <div id="home" class="content">
                <?php include("pieces/header.php") ?>
                <main>
                    <section class="about grid">
                        <div>
                            <h2>About Eavesdrop.FM</h2>
                            <p>As a heavy user of Plex music, I built Eavesdrop.FM to simplify submitting listening data to ListenBrainz. Follow the guide below to get started. Check out the <a href="/faq">FAQ</a> if you have any questions.</p>
                        </div>
                        <img src="img/hero.svg" class="hero" alt="Stylised person listening to music">
                    </section>
                    <section class="get-started">
                        <h2>Get started</h2>
                        <p>Make sure you have a Plex Media Server with a <a href="https://www.plex.tv/en-au/your-media/music/">Music library</a>, an active <a href="https://www.plex.tv/plex-pass/">Plex Pass</a>, and a free <a href="https://musicbrainz.org/register?uri=%2F">MusicBrainz account</a>.</p>
                        <div id="jsOnly">
                            <div>
                                <h4>Step 1</h4>
                                Enter your <a href="https://listenbrainz.org/profile/">ListenBrainz User Token</a> in the field below (don't worry, we won't store it):<br>
                                <input id="lbid" type="text" placeholder="e.g. 152be636-bc70-4c86-9d0d-ba5bfb79fb65">
                            </div>
                            <div id="usernamewrapper" class="hidden">
                                <h4>Step 2</h4>
                                Enter your Plex username below to ensure shared users don't submit on your behalf:<br>
                                <input id="username" type="text" placeholder="e.g. simon">
                            </div>
                            <div id="copybutton" class="hidden">
                                <h4>Step 3</h4>
                                <button id="copier" class="btn" data-clipboard-text="">
                                    <i class="fas fa-clone"></i> Copy to clipboard
                                </button><span id="clipboardsuccess"><i class="fad fa-check-circle icon"></i> copied!</span>
                            </div>
                            <div id="fifth" class="hidden">
                                <h4>Step 4</h4>
                                And finally, paste your unique URL into a new <a href="https://app.plex.tv/desktop#!/settings/webhooks">webhook here</a> using the "Add Webhook" button.
                            </div>
                        </div>
                        <noscript>
                            <ol>
                                <li>
                                    <p>Copy the URL below. Replace the 'token' and 'user' values with your <a href="https://listenbrainz.org/profile/">ListenBrainz User Token</a> and Plex username, respectively:</p>
                                    <p>https://eavesdrop.fm/?id=<strong>token</strong>&user=<strong>user</strong></p>
                                </li>
                                <li>Paste this new, unique URL into a new <a href="https://app.plex.tv/desktop#!/settings/webhooks">webhook here</a> using the "Add Webhook" button.</li>
                            </ol>
                        </noscript>
                    </section>
                </main>
            </div>
            <?php include("pieces/footer.php") ?>
        </div>
    </body>
</html>
<?php endif ?>