addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
* Fetch and process a given webhook request
* @param {Request} request
*/
async function handleRequest(request) {
  // We only care about POSTs. Pass everything else straight through to the origin
  if(request.method !== 'POST') {
    return await fetch(request)
  }

  // store the request body
  let body = await request.formData()
  body = await JSON.parse(body.get('payload'));
  console.log(body)
  // store an object of parameters
  const params = await getParams(request)
  // an array of events we actually care about. we'll ignore everything else
  const acceptedEvents = ['media.scrobble', 'media.play','media.resume', 'media.listen']

  if(body.Metadata.type !== 'track') {
    return new Response('Not a track!', { status: 200})
  }

  // Ignore the request if it's not in our list of accepted events
  if (!acceptedEvents.includes(body.event)) {
    return new Response('Nothing to do', { status: 200 })
  }

  // If the username from Plex doesn't match the username in the query string
  if (body.Account.title.toLowerCase() !== params.user.toLowerCase()) {
    return new Response('Plex user does not match query string', { status: 200 })
  }

  // Send the user's ListenBrainz token to LB for validation, and reject the request if it's invalid
  try {
    await validateUser(params.id)
  } catch (error) {
    return new Response(error, { status: 500 })
  }

  // Submit the event to ListenBrainz
  try {
    await submitListen(generateObject(body),params.id)
  } catch (error) {
    return new Response(error, { status: 500 })
  }

  // And finally, return our success message :)
  return new Response('success', { status: 200 })
}

/**
* Get a list of parameters from the URL and return them as an object
* @param {Request} request
*/
async function getParams(request) {
  let params = {}
  const url = new URL(request.url)
  const queryString = url.search.slice(1).split('&')
  queryString.forEach(item => {
    const [key, value] = item.split('=')
    if(key === 'id') {
      params['id'] = value
    } else if(key === 'user') {
      params['user'] = value
    }
  })
  return params
}

/**
* Send the user's LB Token to ListenBrainz for verification
* @param {String} listenBrainzToken
*/
async function validateUser(listenBrainzToken) {
  return await fetch('https://api.listenbrainz.org/1/validate-token?token=' + listenBrainzToken)
  .then(response => {
    if(!response.ok) {
      throw Error('Something went wrong when we tried looking up the ListenBrainz token')
    }
    return response.json()
  }).then(responseJson => {
    if(responseJson.message !== 'Token valid.') {
      throw Error('ListenBrainz token is not valid')
    }
    return responseJson
  }).catch(error => {
    throw error
  })
}

/**
* Build out our payload for the submission to LB
* @param {Object} body
*/
function generateObject(body) {
  const now = new Date()
  const timestamp = Math.round(now.getTime() / 1000)
  const object = {
    "listen_type": body.event === 'media.scrobble' ? 'single' : 'playing_now',
    "payload": [
      {
        "track_metadata": {
          "additional_info": {
            "listening_from": "Plex",
          },
          "artist_name": body.Metadata.grandparentTitle,
          "track_name": body.Metadata.title,
          "release_name": body.Metadata.parentTitle
        }
      }
    ]
  }
  if (body.event === 'media.scrobble') {
    object.payload[0].listened_at = timestamp
  }
  return JSON.stringify(object)
}

/**
* Send the user's LB Token to ListenBrainz for verification
* @param {Object} payload
* @param {String} listenBrainzToken
*/
async function submitListen(payload,listenBrainzToken) {
  return await fetch('https://api.listenbrainz.org/1/submit-listens', {
    method: 'POST',
    headers: {
      "Content-type": "application/json",
      "Authorization": "Token " + listenBrainzToken
    },
    body: payload
  }).then(response => {
    if(!response.ok) {
      throw Error('Submission was unsuccessful')
    }
    return response.json()
  })
}
