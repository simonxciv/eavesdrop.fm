addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// ListenBrainz API base url
const LB_BASE_URL = 'https://api.listenbrainz.org/1'
// how long to retain KV entries
const KV_TTL = 604800
// an array of events we actually care about. we'll ignore everything else
const ACCEPTED_EVENTS = ['media.scrobble', 'media.play', 'media.resume', 'media.listen']
// generate the body required by LB: https://listenbrainz.readthedocs.io/en/latest/dev/json/#submission-json
const bodyObject = body => {
  return JSON.stringify({
    listen_type: body.event === 'media.scrobble' ? 'single' : 'playing_now',
    payload: [
      {
        listened_at: body.event === 'media.scrobble' ? Math.floor(Date.now() / 1000) : undefined,
        track_metadata: {
          additional_info: {
            listening_from: 'Plex',
          },
          artist_name: body.Metadata.originalTitle ?? body.Metadata.grandparentTitle,
          track_name: body.Metadata.title,
          release_name: body.Metadata.parentTitle,
        },
      },
    ],
  })
}
// generate a hash
const sha = async text => {
  const buffer = new TextEncoder('utf-8').encode(text)
  return await crypto.subtle
    .digest(
      {
        name: 'SHA-512',
      },
      buffer,
    )
    .then(buffer => {
      let hexCodes = []
      const view = new DataView(buffer)
      for (let i = 0; i < view.byteLength; i += 4) {
        // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        const value = view.getUint32(i)
        // toString(16) will give the hex representation of the number without padding
        const stringValue = value.toString(16)
        // We use concatenation and slice for padding
        const padding = '00000000'
        const paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue)
      }
      // Join all the hex strings into one
      return hexCodes.join('')
    })
}
// generic helper to check for error responses
const status = response => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

/**
 * Fetch and process a given webhook request
 * @param {Request} request
 */
const handleRequest = async request => {
  // if we're not getting a POST, we can pass the request straight through
  if (request.method !== 'POST') return fetch(request)

  const body = await request.formData().then(r => JSON.parse(r.get('payload')))
  const url = new URL(request.url)
  const params = {
    id: url.searchParams.get('token') ?? url.searchParams.get('id') ?? '',
    ignore: url.searchParams.get('ignore') ?? [],
    user: url.searchParams.get('user') ?? '',
  }

  // Ignore the request if it's not a track, and the event is not in our list of accepted events
  if (!body.Metadata || body.Metadata.type !== 'track' || !ACCEPTED_EVENTS.includes(body.event)) {
    return new Response(null, { status: 204 })
  }
  // If the username from Plex doesn't match the username in the query string
  if (body.Account.title.toLowerCase() !== params.user.toLowerCase()) {
    return new Response('Plex user does not match query string', { status: 401 })
  }
  // Ignore the request if it's from a media library that's included in the ignore list
  if (
    body.Metadata.librarySectionTitle &&
    params.ignore.includes(body.Metadata.librarySectionTitle)
  ) {
    return new Response(null, { status: 204 })
  }

  const hash = await sha(JSON.stringify(params))
  const user_approved = await EAVESDROP_FM.get(hash)

  if (user_approved === 'false') {
    return new Response('Invalid ListenBrainz token', { status: 403 })
  }

  if (user_approved === null) {
    const approvalState = await validateUser(params.id)
    await EAVESDROP_FM.put(hash, approvalState, { expirationTtl: KV_TTL })
    if (!approvalState) {
      return new Response('Invalid ListenBrainz token', { status: 403 })
    }
  }

  // Submit the event to ListenBrainz
  try {
    await submitListen(params.id, bodyObject(body))
  } catch (error) {
    return new Response(error, { status: 500 })
  }

  // And finally, return our success message :)
  return new Response('success', { status: 200 })
}

/**
 * Send the user's LB Token to ListenBrainz for verification
 * @param {String} listenBrainzToken
 */
const validateUser = lbToken => {
  return fetch(`${LB_BASE_URL}/validate-token`, {
    headers: {
      Authorization: `Token ${lbToken}`,
    },
  })
    .then(status)
    .then(r => r.json())
    .then(r => r.valid)
    .catch(() => false)
}

/**
 * Send the user's LB Token to ListenBrainz for verification
 * @param {String} lbToken
 * @param {Object} body
 */
const submitListen = (lbToken, body) => {
  return fetch(`${LB_BASE_URL}/submit-listens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${lbToken}`,
    },
    body: body,
  })
    .then(status)
    .then(r => r.json())
    .catch(e => {
      throw new Error(e)
    })
}
