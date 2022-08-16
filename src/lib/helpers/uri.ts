import type State from '$lib/typing/state';

const uri = (state: State): URL => {
	const uri = new URL('https://eavesdrop.fm/');

	state.token ? uri.searchParams.append('token', state.token) : null;

	state.userName ? uri.searchParams.append('user', state.userName) : null;

	const ignore =
		state.ignore?.indexOf(',') > -1
			? state.ignore
					.split(',')
					.map((i) => i.trim())
					.toString()
			: state.ignore;

	ignore ? uri.searchParams.append('ignore', ignore) : null;

	return uri;
};

export default uri;
