import { error } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';

export const load: PageLoad = ({ url }) => {
  const webhookUrl = url.searchParams.get('url');
  if (!webhookUrl) {
    throw error(404, `Not found: ${url.pathname}`);
  }
  return {
  url: new URL(webhookUrl)
};
};
