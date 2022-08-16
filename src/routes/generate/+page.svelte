<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import UrlHolder from '$lib/components/UrlHolder.svelte';

  export let data;

  // todo: fix this mess
  $: ({ url } = data);
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
