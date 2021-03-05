<script lang="typescript">
  import { fade } from "svelte/transition";
  import { link } from "svelte-spa-router";
</script>

<style>
  .prose li {
    margin: 0;
  }
</style>

<div in:fade class="flex flex-col justify-center items-center my-4 mx-4">
  <article class="prose">
    <h1 style="margin-bottom: 0.5em;">Buddy Chess Utopia</h1>
    <h2 style="margin-top: 0.5em;">
      A friendly place for your
      <a target="_blank" href="https://en.wikipedia.org/wiki/Bughouse_chess" rel="nofollow">bughouse chess</a>
      needs
    </h2>
    <h3>How to start a game?</h3>
    <ol>
      <li><a href="/room/create" use:link>Create a game room</a></li>
      <li>
        Share invitation with your buddies.
        <ul style="margin: 0;">
          <li>
            Try in
            <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/uYq5BVqccX">our discord server</a>
          </li>
          <li>
            Or the
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://kiwiirc.com/nextclient/irc.freenode.net/?nick=buglife%3F#buddy-chess-utopia"
            >global invites</a>
            to the right.
          </li>
        </ul>
      </li>
      <li>Collect 4 players.</li>
      <li>Start playing and enjoy!</li>
    </ol>
    <h3 style="margin-top: 0;">Features</h3>
    <ul style="margin: 0.5em;">
      <li>Fischer random starting positions.</li>
      <li>No fuss with accounts.</li>
      <li>No ads.</li>
      <li>Pre-moving.</li>
      <li>No central server</li>
      <li>
        Like what you see?
        <a target="_blank" rel="noopener noreferrer" href="https://ko-fi.com/sransara">A supportive coffee will be
          appreciated</a>.
      </li>
    </ul>
    <ul style="margin: 0.5em;">
      <li><i>Planned:</i> Voice chat.</li>
      <li><i>Planned:</i> Touch friendly UI.</li>
      <li><i>Planned:</i> Invest in a real backend.</li>
    </ul>
    <ul style="margin: 0.5em;">
      <li>
        See straggler bugs?
        <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/uYq5BVqccX">Report it in discord</a>.
      </li>
      <li>
        Like what you see?
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.google.com/forms/d/e/1FAIpQLSeHoTQ7JBww-fqRIXnynVbX6G_DQoLNXbSHo6Q5NEboNsIzUQ/viewform?usp=sf_link"
        >Subscribe to stay upto date</a>.
      </li>
      <li><a href="https://github.com/sransara/buddy-chess-utopia">Source at Github</a>.</li>
    </ul>
  </article>
  <p class="my-10">
    <a target="_blank" rel="noopener noreferrer" href="/front/screenshot_full.png">
      <img src="/front/screenshot.png" alt="Buddy Chess Utopia screenshot" style="max-width:100%;" />
    </a>
  </p>
  <article class="prose">
    <h3>What's with the Utopia?</h3>
    <p>
      There's no central arbiter server. Hence no complex anti cheat mechanisms. We assume all players are good citizens
      in our utopia.
    </p>
    <h3>What is Bughouse Chess?</h3>
    <div class="clearfix">
      <a class="float-left" target="_blank" rel="noopener noreferrer" href="/front/bughouse_irl.jpg">
        <img
          src="/front/bughouse_irl.jpg"
          alt="Bughouse being played over the board"
          style="max-width:100%; margin: 0 1em 0 0;"
        />
      </a>
      <p>Bughouse is the funnest of chess variations (citation not needed).</p>
      <p>
        Breaking the solitary mold of chess, bughouse is a chess variation that let's you team up with a buddy for a
        fast paced chess game where you use your superior strategy and communication to slip through the cracks of
        opponents defenses.
      </p>
    </div>
    <h3>I'm sold. What are the rules? How is it played?</h3>
    <p>
      Bughouse is usually played in teams of two. In the seating layout, your team mate sits to your side and holds the
      same color pieces as your opponent.
    </p>
    <p>
      <a target="_blank" rel="noopener noreferrer" href="/front/bughouse_layout.png">
        <img src="/front/bughouse_layout.png" alt="Bughouse layout" style="max-width:100%;" />
      </a>
    </p>
    <p>Two main twists are introduced to the usual chess rules.</p>
    <ol>
      <li>
        All pieces that you capture on your board will be passed to your team mate. You can think of it as these pieces
        go to your team mate's spare piece stash.
      </li>
      <li>
        On your turn you can drop a piece from your spare stash on to your board (Pawns cannot be dropped on the first
        or last rank).
      </li>
    </ol>
    <p>
      That's pretty much it. Read more thoroughly about Bughouse on
      <a href="https://en.wikipedia.org/wiki/Bughouse_chess" rel="nofollow">Wikipedia</a>
      .
    </p>
    <h3>How is this implemented?</h3>
    <p>
      The source of code this implementation is out in the wild:
      <a href="https://github.com/sransara/buddy-chess-utopia">https://github.com/sransara/buddy-chess-utopia</a>
    </p>
    <p>Standing on the shoulders of giants:</p>
    <ul>
      <li>
        WebRTC : for P2P -
        <a target="_blank" href="https://github.com/feross/simple-peer">https://github.com/feross/simple-peer</a>
      </li>
      <li>
        Firebase : for discovery and signaling -
        <a target="_blank" href="https://firebase.google.com/" rel="nofollow">https://firebase.google.com/</a>
      </li>
      <li>
        Assymetric encryption -
        <a target="_blank" href="https://github.com/dchest/tweetnacl-js">https://github.com/dchest/tweetnacl-js</a>
      </li>
      <li>
        Chessboard -
        <a target="_blank" href="https://github.com/ornicar/chessground/">https://github.com/ornicar/chessground/</a>
      </li>
      <li>
        Original chess rules -
        <a target="_blank" href="https://github.com/jhlywa/chess.js/">https://github.com/jhlywa/chess.js/</a>
      </li>
      <li>
        Frontend -
        <a target="_blank" href="https://svelte.dev/">Svelte</a>
        and
        <a target="_blank" href="https://tailwindcss.com/">Tailwind</a>
      </li>
      <li>Embeddings - <a target="_blank" href="https://github.com/kiwiirc/kiwiirc">Kiwi IRC</a></li>
    </ul>
  </article>
</div>
