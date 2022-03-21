import uri from '$lib/helpers/uri';
import type State from '$lib/typing/state';
import type { RequestHandler } from '@sveltejs/kit';

export const put: RequestHandler = async ({ request }) => {
  const body = await request.formData();
  const state: State = {
    token: body.get('token')?.toString(),
    userName: body.get('userName')?.toString(),
    ignore: body.get('ignore').toString(),
    isCopied: false
  };

  const url = uri(state);

  return {
    status: 303,
    headers: {
      Location: `/generate?url=${encodeURIComponent(url.href)}`
    }
  };
};
