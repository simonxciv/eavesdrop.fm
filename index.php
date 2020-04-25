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

    </head>
    <body>
        <header>
            <h1>Eavesdrop.FM</h1>
            <p>ListenBrainz + Plex = <i class="fas fa-heart"></i></p>
        </header>
        <main>
            <p><em>Eavesdrop.FM</em> connects your <a href="https://plex.tv">Plex</a> music library to <a href="https://listenbrainz.org">the ListenBrainz project</a> for you; automagically taking Plex Webhooks and transmogrifying them into ListenBrainz... listens? It's like scrobbling, but without using someone else's trademark!</p>

            <h2>Requirements</h2>
            <p>To use this service, you'll need a Plex Media Server with a <a href="https://www.plex.tv/en-au/your-media/music/">Music library</a> set up. Additionally, as webhooks are a premium Plex feature, you'll need a <a href="https://www.plex.tv/en-au/plex-pass/">Plex Pass</a>.</p>
            <p>To use ListenBrainz, a free <a href="https://musicbrainz.org/register?uri=%2F">MusicBrainz account</a> is required.</p>

            <h2>Get started</h2>
            <ol>
                <li>Ensure you meet the requirements above.</li>
                <li>From your <a href="https://listenbrainz.org/profile/#auth-token">ListenBrainz profile page</a>, copy your <strong>User token</strong>, shown (redacted) below: <br><img src="img/token.png"></li>
                <li>Paste your ListenBrainz ID in the field below (don't worry, we won't store it):<br>
                    <input id="lbid" type="text" placeholder="e.g. 152be636-bc70-4c86-9d0d-ba5bfb79fb65">
                </li>
                <li>Enter your Plex username below to ensure shared user listens aren't submitted on your behalf:<br>
                    <input id="username" type="text" placeholder="e.g. simon">
                </li>
                <li>Copy this URL: <span id="lboutput" class="url"></span></li>
                <li>And finally, paste the copied URL into a new <a href="https://app.plex.tv/desktop#!/settings/webhooks">webhook here</a> using the "Add Webhook" button.</p>
            </ol>
            
            <h2>About this project</h2>
            <p>I created this project for myself primarily, but it worked well, so I figured I'd make it public! The project is in no way affiliated with or endorsed by Plex or MetaBrainz. If you find it useful, feel free to star it on <a href="https://github.com/simonxciv/listenbrainz-plex">Github</a>. Likewise, if you find any issues, please let me know!</p>

            <h2>Known limitations</h2>
            <p>Due to the way Plex webhooks work, listens that occurred historically can not be submitted. For example if your device was not connected to the internet at the time you listened to a track, the track will not be processed.</p>
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
            var lbid = document.getElementById("lbid"),
                username = document.getElementById("username"),
                output = document.getElementById("lboutput");

            var url = 'https://eavesdrop.fm/?id=';

            lbid.addEventListener("input", function() {
                url = 'https://eavesdrop.fm/?id=' + encodeURIComponent(lbid.value);
                output.innerHTML = DOMPurify.sanitize(url);
            });
            username.addEventListener("input", function() {
                if(lbid.value != '') {
                    url = 'https://eavesdrop.fm/?id=' + encodeURIComponent(lbid.value) + '&user=' + encodeURIComponent(username.value)
                    output.innerHTML = DOMPurify.sanitize(url);
                }
            });
        </script>
        <script src="https://kit.fontawesome.com/9773f88366.js" crossorigin="anonymous"></script>
    </body>
</html>
<?php endif ?>