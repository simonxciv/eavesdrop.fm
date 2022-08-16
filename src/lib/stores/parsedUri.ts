import uri from '$lib/helpers/uri';
import { derived, type Readable } from 'svelte/store';
import state from './state';

const parsedUri: Readable<URL> = derived(state, ($state) => {
	return uri($state);
});

export default parsedUri;
