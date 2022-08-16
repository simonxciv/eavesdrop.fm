<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = ({ url }) => {
    const webhookUrl = url.searchParams.get('url');
    if (!webhookUrl) {
      return {
        status: 404,
        error: `Not found: ${url.pathname}`
      };
    }
    return {
      props: {
        url: new URL(webhookUrl)
      }
    };
  };
</script>

<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import UrlHolder from '$lib/components/UrlHolder.svelte';

  export let url: URL;
</script>

<svelte:head>
  <title>eavesdrop.fm | copy your unique webhook URL</title>
</svelte:head>

<Card>
  <slot slot="heading">Copy URL</slot>
  <slot slot="subheading">Copy the following URL to your clipboard:</slot>
  <UrlHolder>
    {url.href}
  </UrlHolder>
</Card>

<Card>
  <slot slot="heading">Deploy webhook</slot>
  <slot slot="subheading">
    And finally, paste your unique URL into a <a
      href="https://app.plex.tv/desktop#!/settings/webhooks">new webhook here</a
    > using the "Add Webhook" button.
  </slot>
</Card>
