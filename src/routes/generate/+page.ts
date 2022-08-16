import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const webhookUrl = url.searchParams.get('url');
	if (!webhookUrl) {
		throw error(404, `Not found: ${url.pathname}`);
	}
	return {
		url: new URL(webhookUrl)
	};
};
