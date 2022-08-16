import type Params from '$lib/typing/params';
import type Payload from '$lib/typing/payload';

// an array of events we actually care about. we'll ignore everything else.
const ACCEPTED_EVENTS = ['media.scrobble', 'media.play', 'media.resume', 'media.listen'];

const requestIsValid = (body: Payload, params: Params): boolean => {
	// Ignore the request if it's not a track, and the event is not in our list of accepted events
	if (!body.Metadata || body.Metadata.type !== 'track' || !ACCEPTED_EVENTS.includes(body.event)) {
		return false;
	}
	// If the username from Plex doesn't match the username in the query string
	if (body.Account.title.toLowerCase() !== params.userName?.toLowerCase()) {
		return false;
	}
	// Ignore the request if it's from a media library that's included in the ignore list
	if (
		body.Metadata.librarySectionTitle &&
		params.ignore?.includes(body.Metadata.librarySectionTitle)
	) {
		return false;
	}

	return true;
};

export default requestIsValid;
