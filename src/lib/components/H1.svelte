<a href="/">
  <h1><slot /></h1>
</a>

<style lang="scss">
  a {
    text-decoration: none;
    border: none;
  }
  h1 {
    display: inline-block;
    color: transparent;
    font-weight: 900;
    filter: $dropShadow;
    -webkit-background-clip: text;
    background-clip: text;
    background-image: $gradient;
    white-space: nowrap;
    margin: 0;
  }
</style>
