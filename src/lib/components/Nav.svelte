<script lang="ts">
  import { page } from '$app/stores';
</script>

<nav>
  <a class:active={$page.url.pathname === '/about'} href="/about">About</a>
  <a class:active={$page.url.pathname === '/faq'} href="/faq">FAQ</a>
  <a class:active={$page.url.pathname === '/stats'} href="/stats">Stats</a>
</nav>

<style lang="scss">
  nav {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.2rem;
    padding-bottom: 0.2rem;
    a {
      display: block;
      background: var(--cardBackground);
      box-shadow: $boxShadow;
      text-align: center;
      border: 0;
      border-radius: 0.3rem;
      text-decoration: none;
      background-size: 30px 30px;
      &:hover,
      &.active {
        background: $highlight;
        color: white;
        border-color: $highlight;
      }
    }
  }
</style>
