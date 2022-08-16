import type Params from '$lib/typing/params';
import statusCheck from './statusCheck';

const userIsValid = (params: Params, baseUrl: string): boolean => {
	try {
		// check with ListenBrainz that the provided token is valid
		fetch(`${baseUrl}/validate-token`, {
			headers: {
				Authorization: `Token ${params.token}`
			}
		})
			.then(statusCheck)
			.then((r) => r.json())
			.then((r) => {
				if (r.valid) return true;
			})
			.catch((e) => {
				throw new Error(e);
			});

		return true;
	} catch (e) {
		return false;
	}
};

export default userIsValid;
