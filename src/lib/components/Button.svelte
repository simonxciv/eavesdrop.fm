<script lang="ts">
  export let isActioned: boolean = false;
  export let isPlex: boolean = false;
</script>

<button class:isPlex class:isActioned {...$$restProps} on:click|preventDefault>
  <slot />
</button>

<style lang="scss">
  button {
    --plexGrey: #202629;
    --plexOrange: #f9be03;
    color: white;
    background: $highlight;
    width: 100%;
    border-radius: $cardRadius;
    border: 3px solid transparent;
    outline: none;
    font-size: 0.7rem;
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
    margin-bottom: 1rem;
    box-shadow: $boxShadow;
    cursor: pointer;
    &:hover {
      background: lighten($highlight, 10);
    }
    &:focus,
    &:active {
      background: desaturate(darken($highlight, 20), 20);
    }
    &.isPlex {
      color: var(--plexOrange);
      background: var(--plexGrey);
      &:hover {
        background: #373c3f;
      }
      &:focus,
      &:active {
        background: black;
      }
    }
    &.isActioned {
      background: var(--background);
      color: desaturate(darken($highlight, 20), 20);
      border: 3px solid white;
      cursor: default;
    }
  }
  @media (prefers-color-scheme: dark) {
    button {
      &.isPlex {
        background: rgba(0, 0, 0, 0.9);
      }
    }
  }
</style>
