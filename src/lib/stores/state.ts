import type State from '$lib/typing/state';
import { writable } from 'svelte/store';

const state = writable<State>({
  token: undefined,
  userName: undefined,
  ignore: undefined,
  isCopied: false
});

export default state;
