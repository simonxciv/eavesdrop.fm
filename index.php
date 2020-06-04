<?php
    function validateID($id) {
        // Initialise curl
        $ch = curl_init();

        // Set curl options, including the ListenBrainz token
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => TRUE,
            CURLOPT_URL => 'https://api.listenbrainz.org/1/validate-token?token=' . $id
        ));

        // Send the curl request to check the token validity
        $response = json_decode(curl_exec($ch));

        // If the request is successful
        if($response->code == '200') {
            // Get the message
            $response = $response->message;
            if($response == 'Token valid.') {
                return true;
            } else {
                return false;
            }
        } 
        // If the request is unsuccessful
        else {
            return false;
        }
    }

    // Timestamp to use in our API submission
    $timeStamp = time();

    // Hide the front-end by default
    $frontend = false;

    // If the request isn't a POST request, do nothing
    if($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Decode the request's json
        $plex_data = json_decode($_REQUEST["payload"]);

        // Ignore the request if the ListenBrainz ID isn't valid or isn't provided
        if(!isset($_REQUEST["id"]) || validateID($_REQUEST["id"]) != true) {
            $frontend = true;
            die();
        } else {
            $lbid = rawurldecode($_REQUEST["id"]);
        }

        // Ignore the event if it's not the right type of media
        if (!$plex_data || !$plex_data->Metadata || $plex_data->Metadata->type !== 'track') {
            $frontend = true;
            die();
        }

        // Check whether request includes a filter for users. If the user doesn't match the filter, ignore the request
        if(isset($_REQUEST['user']) && strtolower(rawurldecode($_REQUEST['user'])) !== strtolower($plex_data->Account->title)) {
            $frontend = true;
            die();
        }

        // Check what kind of event the request is. We care only about Play, Resume, and Scrobble events.
        switch ($plex_data->event) {
            case 'media.play':
                $listen_type = 'playing_now';
                break;
            case 'media.resume': 
                $listen_type = 'playing_now';
                break;
            case 'media.scrobble':
                $listen_type = 'single';
                break;
            default:
                die();
        }

        // Construct the payload
        $lb_data = array(
            'listen_type' => $listen_type,
            'payload' => array(array(
                'track_metadata' => array(
                    'artist_name' => (isset($plex_data->Metadata->originalTitle) ? $plex_data->Metadata->originalTitle : $plex_data->Metadata->grandparentTitle),
                    'track_name' => $plex_data->Metadata->title,
                    'release_name' => $plex_data->Metadata->parentTitle,
                    'additional_info' => array(
                        'listening_from' => 'Plex'
                    )
                )
            ))
        );

        // If the listen type is 'single' (a scrobble), attach a play time to the payload
        if($listen_type === 'single') {
            $lb_data['payload'][0]['listened_at'] = $timeStamp;
        }

        // Initialise curl
        $ch = curl_init('https://api.listenbrainz.org/1/submit-listens');

        // Set curl options, including the ListenBrainz token
        curl_setopt_array($ch, array(
            CURLOPT_POST => TRUE,
            CURLOPT_RETURNTRANSFER => TRUE,
            CURLOPT_HTTPHEADER => array(
                'Authorization: Token ' . $lbid,
                'Content-Type: application/json'
            ),
            CURLOPT_POSTFIELDS => json_encode($lb_data)
        ));

        // Send the request
        $response = curl_exec($ch);
        return $response;
    } else {
        $frontend = true;
    }
?>
<?php if($frontend): ?>
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

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">

        <script src="https://unpkg.com/clipboard@2/dist/clipboard.min.js"></script>

    </head>
    <body>
        <header>
            <h1>Eavesdrop.FM</h1>
            <p>ListenBrainz + Plex = <i class="fas fa-heart"></i></p>
        </header>
        <main>
            <p>Submit your <a href="https://plex.tv">Plex</a> music listening activity to <a href="https://listenbrainz.org">the ListenBrainz project</a>. It's like scrobbling, but without using someone else's trademark!</p>

            <h2>Get started</h2>
            <ol>
                <li>Make sure you have a Plex Media Server with a <a href="https://www.plex.tv/en-au/your-media/music/">Music library</a>, an active Plex Pass, and a free <a href="https://musicbrainz.org/register?uri=%2F">MusicBrainz account</a>
                <li>Paste your ListenBrainz User Token in the field below (don't worry, we won't store it):<br>
                    <input id="lbid" type="text" placeholder="e.g. 152be636-bc70-4c86-9d0d-ba5bfb79fb65">
                </li>
                <li id="usernamewrapper" class="hidden">Enter your Plex username below to ensure shared users don't submit on your behalf:<br>
                    <input id="username" type="text" placeholder="e.g. simon">
                </li>
                <li id="copybutton" class="hidden">
                    <button id="copier" class="btn" data-clipboard-text="">
                        <i class="fas fa-clone"></i> Copy to clipboard
                    </button><span id="clipboardsuccess"><i class="fad fa-check-circle"></i> copied!</span>
                </li>
                <li id="fifth" class="hidden">
                    And finally, paste your unique URL into a new <a href="https://app.plex.tv/desktop#!/settings/webhooks">webhook here</a> using the "Add Webhook" button.
                </li>
            </ol>

            <h2>About this project</h2>
            <p>I started this project because I believe in the MetaBrainz vision, and ListenBrainz is an important part of that. As a heavy Plex music user, I wanted an easy way to submit my listening data to Listenbrainz. The project worked well for me, so I opened it up to the public! If you like what I've done, star the project on <a href="https://github.com/simonxciv/listenbrainz-plex">Github</a>. If you hate it, go complain on Reddit.</p>

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
        <footer>
            <div>
                <i class="fad fa-hammer"></i> Built by <a href="https://smnbkly.co">Simon Buckley</a>
            </div>
            <div class="github">
                <a title="Eavesdrop.FM on Github" href="https://github.com/simonxciv/eavesdrop.fm"><i class="fab fa-github"></i></a>
            </div>
        </footer>
        <script>
            var clipboard = new ClipboardJS('.btn');
            var lbidEl = document.getElementById("lbid"),
                usernameEl = document.getElementById("username"),
                lbid, username;

            clipboard.on('success', function(e) {
                document.getElementById('fifth').classList.remove('hidden');
                document.getElementById('clipboardsuccess').classList.add('shown');
            });

            lbidEl.addEventListener("input", function() {
                lbid = lbidEl.value;
                if(lbid.length > 0) {
                    document.getElementById('usernamewrapper').classList.remove('hidden');
                } else {
                    document.getElementById('usernamewrapper').classList.add('hidden');
                }
                handleInput()
            });

            usernameEl.addEventListener("input", function() {
                username = usernameEl.value;
                handleInput()
            });

            function handleInput() {
                var url;
                document.getElementById('clipboardsuccess').classList.remove('shown');
                if(lbid.length > 0 && username.length > 0) {
                    url = 'https://eavesdrop.fm/?id=' + encodeURIComponent(lbid) + '&user=' + encodeURIComponent(username);
                    document.getElementById('copybutton').classList.remove('hidden');
                } else {
                    url = '';
                    document.getElementById('copybutton').classList.add('hidden');
                    document.getElementById('fifth').classList.add('hidden');
                }
                document.getElementById('copier').setAttribute("data-clipboard-text", url);
            }
        </script>
        <script src="https://kit.fontawesome.com/9773f88366.js" crossorigin="anonymous"></script>
    </body>
</html>
<?php endif ?>