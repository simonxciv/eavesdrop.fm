<script lang="ts">
  import { fade } from 'svelte/transition';
  import Card from '$lib/components/Card.svelte';
  import CopyButton from '$lib/components/CopyButton.svelte';
  import Input from '$lib/components/Input.svelte';
  import PlexButton from '$lib/components/PlexButton.svelte';
  import state from '$lib/stores/state';
  import jsIsEnabled from '$lib/stores/jsIsEnabled';
  import parsedUri from '$lib/stores/parsedUri';
</script>

<svelte:head>
  <title>eavesdrop.fm | sync your Plex listens with ListenBrainz</title>
</svelte:head>

<form
  method="post"
  action={'/generate.json?_method=PUT'}
  on:input={() => ($state.isCopied = false)}
>
  <Card>
    <slot slot="heading">Step 1.</slot>
    <slot slot="subheading">
      Enter your <a href="https://listenbrainz.org/profile/" title="ListenBrainz profile page">
        ListenBrainz user token
      </a>
    </slot>
    <Input
      required
      name="token"
      bind:value={$state.token}
      placeholder="e.g. 152be636-bc70-4c86-9d0d-ba5bfb79fb65"
    />
  </Card>

  {#if !$jsIsEnabled || $state.token}
    <Card>
      <slot slot="heading">Step 2.</slot>
      <slot slot="subheading">Enter your Plex username</slot>
      <Input required name="userName" bind:value={$state.userName} placeholder="e.g. user_name" />
    </Card>
  {/if}

  {#if !$jsIsEnabled || ($state.token && $state.userName)}
    <Card optional>
      <slot slot="heading">Step 3.</slot>
      <slot slot="subheading">Enter a comma separated list of Plex library names to ignore</slot>
      <Input name="ignore" bind:value={$state.ignore} placeholder="e.g. Audiobooks, Recordings" />
    </Card>

    <CopyButton
      jsIsEnabled={$jsIsEnabled}
      value={$parsedUri.href}
      bind:isCopied={$state.isCopied}
    />
  {/if}

  {#if $state.token && $state.userName && $state.isCopied}
    <div in:fade>
      <PlexButton jsIsEnabled={$jsIsEnabled} />
    </div>
  {/if}
</form>

<style lang="scss" global>
  form:invalid {
    button {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
