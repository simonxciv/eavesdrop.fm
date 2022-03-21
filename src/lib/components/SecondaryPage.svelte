<script lang="ts">
  import { slide } from 'svelte/transition';
  export let title: string = 'Title';
</script>

<div transition:slide|local>
  <h3>{title}</h3>
  <slot />
</div>

<style lang="scss">
  h3 {
    margin: 0;
  }
</style>
