import type Payload from '$lib/typing/payload';

// generate the body required by LB: https://listenbrainz.readthedocs.io/en/latest/dev/json/#submission-json
const generateListenbrainzBody = (body: Payload) => {
	return JSON.stringify({
		listen_type: body.event === 'media.scrobble' ? 'single' : 'playing_now',
		payload: [
			{
				listened_at: body.event === 'media.scrobble' ? Math.floor(Date.now() / 1000) : undefined,
				track_metadata: {
					additional_info: {
						listening_from: 'Plex'
					},
					artist_name: body.Metadata.originalTitle ?? body.Metadata.grandparentTitle,
					track_name: body.Metadata.title,
					release_name: body.Metadata.parentTitle
				}
			}
		]
	});
};

export default generateListenbrainzBody;
