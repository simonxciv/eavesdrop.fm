<?php

function showFrontend() {
    if($_SERVER['REQUEST_METHOD'] === 'POST') {
        return false;
    } else {
        return true;
    }
}

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

// If the request isn't a POST request, do nothing
if(!showFrontend()) {
    // Timestamp to use in our API submission
    $timeStamp = time();

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
    return curl_exec($ch);
}