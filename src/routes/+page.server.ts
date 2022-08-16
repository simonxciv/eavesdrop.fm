import generateListenbrainzBody from '$lib/helpers/generateListenbrainzBody';
import requestIsValid from '$lib/helpers/requestIsValid';
import statusCheck from '$lib/helpers/statusCheck';
import userIsValid from '$lib/helpers/userIsValid';
import type Params from '$lib/typing/params';
import type Payload from '$lib/typing/payload';
import type { PageServerLoad } from './$types';

// ListenBrainz API base url.
const LB_BASE_URL = 'https://api.listenbrainz.org/1';

export const POST: PageServerLoad = async ({ request }) => {
	const body: Payload = await request
		.formData()
		.then((r) => JSON.parse(r.get('payload')?.toString() ?? ''));

	const url = new URL(request.url);

	const params: Params = {
		token: url.searchParams.get('token') ?? '',
		ignore: url.searchParams.get('ignore') ?? '',
		userName: url.searchParams.get('user') ?? ''
	};

	if (!requestIsValid(body, params) || !userIsValid(params, LB_BASE_URL)) {
		return { status: 200 };
	}

	try {
		await fetch(`${LB_BASE_URL}/submit-listens`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Token ${params.token}`
			},
			body: generateListenbrainzBody(body)
		})
			.then(statusCheck)
			.then((r) => r.json())
			.catch((e) => {
				throw new Error(e);
			});
	} catch (e) {
		return { status: 200 };
	}

	const plausiblePayload = {
		name: 'listen',
		url: 'https://eavesdrop.fm/listen',
		domain: 'eavesdrop.fm'
	};

	try {
		await fetch(`https://plausible.io/api/event`, {
			method: 'POST',
			headers: {
				'user-agent': request.headers.get('user-agent')?.toString() + body.Player.uuid,
				'X-Forwarded-For': body.Player.publicAddress ?? '0.0.0.0',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(plausiblePayload)
		})
			.then(statusCheck)
			.catch((e) => {
				throw new Error(e);
			});
	} catch (e) {
		return { status: 200 };
	}

	return { status: 200 };
};
