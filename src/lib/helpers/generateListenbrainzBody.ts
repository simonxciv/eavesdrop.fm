import type Payload from '$lib/typing/payload';

// generate the body required by LB: https://listenbrainz.readthedocs.io/en/latest/dev/json/#submission-json
const generateListenbrainzBody = (body: Payload) => {
	let track_mbid = body.Metadata?.Guid?.find((v) => v.id?.startsWith("mbid://"))?.id?.substring(7);
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
					release_name: body.Metadata.parentTitle,
					...(track_mbid !== undefined && { track_mbid: track_mbid })
				}
			}
		]
	})
};

export default generateListenbrainzBody;
