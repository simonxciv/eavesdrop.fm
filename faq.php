<!DOCTYPE html>
<html>
    <head>

        <title>Eavesdrop.FM - FAQ</title>
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
            <div class="content">
                <?php include("pieces/header.php") ?>
                <main class="faq">
                    <h2>FAQ</h2>

                    <h4>Why do I need a Plex Pass?</h4>
                    <p>Eavesdrop.FM leverages Plex <a href="https://www.plex.tv/plex-labs/#section7">webhooks</a> to submit listens. Webhooks are a premium Plex feature, available to Plex Pass holders.</p>

                    <h4>How do I find my ListenBrainz token?</h4>
                    <p>Your ListenBrainz token is available from your ListenBrainz <a href="https://listenbrainz.org/profile/">user profile</a> page, under the User Token heading.</p>

                    <h4>Why aren't offline listens submitted?</h4>
                    <p>Due to the way Plex webhooks work, listens that occurr historically can not be submitted. If your device is not able to connect to your Plex Server at the time that you listen to a track, it won't be submitted.</p>

                    <h4>My listens aren't being submitted! Halp!</h4>
                    <p>Check the following:</p>
                    <ul>
                        <li>Both the Plex username and ListenBrainz token you entered above are correct.</li>
                        <li>The webhook is saved in your <a href="https://app.plex.tv/desktop#!/settings/webhooks">account settings.</a></li>
                        <li>In your Plex Server's network settings (under Settings > Network), ensure the server is permitted to send webhooks.</li>
                        <li>Your Plex server is able to reach the internet.</li>
                    </ul>
                    <p>If you've checked all of the above and still can't submit your listens, raise a Github issue <a title="Eavesdrop.FM on Github" href="https://github.com/simonxciv/eavesdrop.fm">here</a> with as much information as possible.</p>

                    <h4>What about my privacy?</h4>
                    <p>We <strong>do not</strong> store any of your personal information. Your listening history, Plex username, and ListenBrainz token are encrypted in transit, and not retained by us.</p>
                </main>
            </div>
            <?php include("pieces/footer.php") ?>
        </div>
    </body>
</html>