<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import jsIsEnabled from '$lib/stores/jsIsEnabled';
  import state from '$lib/stores/state';
  import { onMount } from 'svelte';

  onMount(() => {
    $jsIsEnabled = true;
  });
</script>

<svelte:head>
  <script defer src="https://kit.fontawesome.com/8d4a6f3787.js" crossorigin="anonymous"></script>
</svelte:head>

<Header jsIsEnabled={$jsIsEnabled} isMinimised={!!$state?.token} />

<slot />

<style lang="scss" global>
  @import '../app.scss';
</style>
