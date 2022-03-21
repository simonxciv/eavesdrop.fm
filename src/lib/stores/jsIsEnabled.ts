import { writable } from 'svelte/store';

const jsIsEnabled = writable<boolean>(false);

export default jsIsEnabled;
