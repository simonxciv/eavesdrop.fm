import type State from '$lib/typing/state';
import { writable } from 'svelte/store';

const state = writable<State>({
	token: '',
	userName: '',
	ignore: '',
	isCopied: false
});

export default state;
