<script lang="ts">
  export let value;
</script>

<input type="text" {...$$restProps} bind:value on:blur />

<style lang="scss">
  input {
    border-radius: 0.5rem;
    border: 3px solid hsl(0, 84%, 90%);
    background: var(--background);
    padding: 0.4rem;
    width: 100%;
    font-size: 1rem;
    outline: 0;
    color: var(--default);
    margin-top: 0.8rem;
    &:focus {
      border-color: var(--default);
    }
  }
</style>
