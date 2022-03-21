<script lang="ts">
  import { slide } from 'svelte/transition';
  export let optional: boolean = false;
</script>

<div on:click transition:slide|local class:noTitle={!$$slots.heading}>
  {#if $$slots.heading}
    <h3 class:optional>
      <slot name="heading" />
      {#if optional}
        <span>(optional)</span>
      {/if}
    </h3>
  {/if}
  {#if $$slots.subheading}
    <p>
      <slot name="subheading" />
    </p>
  {/if}
  <slot />
</div>

<style lang="scss">
  div {
    border-radius: $cardRadius;
    padding: 1.2rem;
    background: var(--cardBackground);
    margin-bottom: 1rem;
    box-shadow: $boxShadow;
    &:not(.noTitle) {
      padding: 0.7rem 1.2rem 1.2rem;
    }
  }
  h3 {
    display: block;
    font-size: 0.8rem;
    color: $highlight;
    font-weight: 900;
    margin: 0;
  }
  p {
    margin: 0;
  }
  span {
    color: $secondaryHighlight;
    font-size: 0.55rem;
  }
</style>
