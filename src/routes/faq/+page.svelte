<script lang="ts">
  import QandA from '$lib/components/QandA.svelte';
  import SecondaryPage from '$lib/components/SecondaryPage.svelte';
</script>

<svelte:head>
  <title>eavesdrop.fm | FAQ</title>
</svelte:head>

<SecondaryPage title="FAQ">
  <p class="blurb">Got questions? Seek and ye shall find.</p>

  <QandA>
    <slot slot="q">What are the prerequisites?</slot>
    <p>
      eavesdrop.fm leverages
      <a href="https://support.plex.tv/articles/115002267687-webhooks/">Plex Webhooks </a> to submit
      your listens to ListenBrainz. The relevant prerequisites apply, including network access and an
      active Plex Pass.
    </p>
  </QandA>

  <QandA>
    <slot slot="q">Why do I need a Plex Pass?</slot>
    <p>Webhooks are a premium Plex feature, available only to Plex Pass holders.</p>
  </QandA>

  <QandA>
    <slot slot="q">How do I find my ListenBrainz token?</slot>
    <p>
      Your ListenBrainz token is available from your ListenBrainz
      <a href="https://listenbrainz.org/profile/">user profile</a>
      page, under the User Token heading.
    </p>
  </QandA>

  <QandA>
    <slot slot="q">How do I find my Plex username?</slot>
    <p>
      Your Plex username can be found on your
      <a href="https://app.plex.tv/desktop/#!/settings/account">account settings</a> page in Plex Web.
    </p>
  </QandA>

  <QandA>
    <slot slot="q">Why aren't offline listens submitted?</slot>
    <p>Due to the way Plex webhooks work, listens that occur historically can not be submitted.</p>
    <p>
      If your device is not able to connect to your Plex Server at the time that you listen to a
      track, it won't be submitted.
    </p>
  </QandA>

  <QandA>
    <slot slot="q">Why isn't it working? Help!</slot>
    <p style="margin-bottom: 0;">Check the following:</p>
    <ul>
      <li>Both the Plex username and ListenBrainz token you entered above are correct.</li>
      <li>
        The webhook is saved in your
        <a href="https://app.plex.tv/desktop#!/settings/webhooks">account settings</a>.
      </li>
      <li>
        In your Plex Server's network settings (under Settings > Network), ensure the server is
        permitted to send webhooks.
      </li>
      <li>Your Plex server is able to reach the internet.</li>
    </ul>
    <p>
      If everything above looks okay and you still can't submit your listens, raise a Github issue
      <a href="https://github.com/simonxciv/eavesdrop.fm">here</a> with as much information as
      possible, or create a post in the
      <a href="https://forums.plex.tv/c/testing/plex-labs/16">Plex Forums</a>
      and tag me (<strong>@simonxciv</strong>).
    </p>
  </QandA>

  <QandA>
    <slot slot="q">What about my privacy?</slot>
    <p>
      Your information is not stored by eavesdrop.fm. Your listening history, Plex username, and
      ListenBrainz token are encrypted in transit, and not retained by us.
    </p>
    <p>
      We collect minimal, anonymous statistics to keep track of hosting costs and associated
      bandwidth limitations. You can see what we're capturing
      <a href="/stats">here</a>.
    </p>
    <p>
      Should you have concerns, the source code is open and auditable
      <a href="https://github.com/simonxciv/eavesdrop.fm">here</a>.
    </p>
  </QandA>

  <QandA>
    <slot slot="q">This FAQ sucks!</slot>
    <p>
      Why don't you <a href="https://github.com/simonxciv/eavesdrop.fm">build me a better one</a>?
    </p>
  </QandA>
</SecondaryPage>

<style lang="scss">
  p:not(.blurb) {
    &:last-of-type {
      margin-bottom: 0;
    }
    &:first-of-type {
      margin-top: 0;
    }
  }
  ul {
    li {
      margin-bottom: 0.3rem;
    }
  }
</style>
