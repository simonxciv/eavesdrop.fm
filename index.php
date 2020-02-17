<?php

    /* -------------------------------------------------------------------
       EDIT HERE
    ------------------------------------------------------------------- */

    // Your Plex Server's unique identifier. Go to your server's General Settings page to see this in the URL.
    $server_uuid = '';

    // ListenBrainz user token from https://listenbrainz.org/profile/ to attribute listens to your profile
    $lb_token = '';

    /* -------------------------------------------------------------------
       END THE EDIT SPACE
    ------------------------------------------------------------------- */
    
    // Timestamp to use in our API submission
    $timeStamp = time();

    // ListenBrainz API root URL
    $lb_api_root_url = 'https://api.listenbrainz.org';

    // If the request isn't a POST request, do nothing
    if($_SERVER['REQUEST_METHOD'] !== 'POST') {
        die();
    }

    // Implode the request to a string, decode the json
    $plex_data = json_decode(implode('', $_REQUEST));

    // If the server uuid is not present or doesn't match the uuid above, do nothing
    if (!$plex_data->Server && !$plex_data->Server->uuid === $server_uuid) {
        die();
    }

    // Ignore the event if it's not the right type of media
    if (!$plex_data->Metadata->type === 'track') {
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

    // Construct the JSON for 'playing_now' events
    if($listen_type === 'playing_now') {
        $lb_data = array(
            'listen_type' => $listen_type,
            'payload' => array(array(
                'track_metadata' => array(
                    'artist_name' => $plex_data->Metadata->grandparentTitle,
                    'track_name' => $plex_data->Metadata->title,
                    'release_name' => $plex_data->Metadata->parentTitle
                )
            ))
        );
    } 

    // If not a 'playing_now' event, construct the JSON for a 'listen' event
    else {
        $lb_data = array(
            'listen_type' => $listen_type,
            'payload' => array(array(
                'listened_at' => $timeStamp,
                'track_metadata' => array(
                    'artist_name' => $plex_data->Metadata->grandparentTitle,
                    'track_name' => $plex_data->Metadata->title,
                    'release_name' => $plex_data->Metadata->parentTitle
                )
            ))
        );
    }

    // Initialise curl
    $ch = curl_init($lb_api_root_url . '/1/submit-listens');

    // Set curl options, including the ListenBrainz token
    curl_setopt_array($ch, array(
        CURLOPT_POST => TRUE,
        CURLOPT_RETURNTRANSFER => TRUE,
        CURLOPT_HTTPHEADER => array(
            'Authorization: Token ' .$lb_token,
            'Content-Type: application/json'
        ),
        CURLOPT_POSTFIELDS => json_encode($lb_data)
    ));

    // Send the request
    $response = curl_exec($ch);