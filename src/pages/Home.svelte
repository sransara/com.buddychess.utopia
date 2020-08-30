<script lang="typescript">
  import { fade } from "svelte/transition";
</script>

<div in:fade class="flex flex-col justify-center items-center my-4 mx-4">
  <article class="prose">
    <h1>Buddy Chess Utopia</h1>
    <h2>A friendly place for your bughouse chess needs</h2>
  </article>
  <p class="my-10">
    <a target="_blank" rel="noopener noreferrer" href="/front/screenshot_full.png">
      <img src="/front/screenshot.png" alt="Buddy Chess Utopia screenshot" style="max-width:100%;" />
    </a>
  </p>
  <article class="prose">
    <h3>What is this?</h3>
    <p>
      Buddy Chess Utopia is a place that lets you and your friends to get together and play some
      <a href="https://en.wikipedia.org/wiki/Bughouse_chess" rel="nofollow">Bughouse Chess</a>
      online.
    </p>
    <h3>What is Bughouse Chess?</h3>
    <p>Bughouse is the funnest of chess variations (citation not needed).</p>
    <p>
      Breaking the solitary mold of chess, bughouse is a chess variation that let's you team up with a buddy for a fast
      paced chess game where you use your superior strategy and communication to slip through the cracks of opponents
      defenses.
    </p>
    <p>
      <a target="_blank" rel="noopener noreferrer" href="/front/bughouse_irl.jpg">
        <img src="/front/bughouse_irl.jpg" alt="Bughouse being played over the board" style="max-width:100%;" />
      </a>
    </p>
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
    <h3>Why Buddy Chess Utopia?</h3>
    <ul>
      <li>There is no logins, no accounts. You create a room, share the link and start playing.</li>
      <li>No central servers.</li>
      <li>No tracking.</li>
    </ul>
    <h3>And what's with the Utopia?</h3>
    <p>There is no anti cheat mechanisms. We assume all players are good citizens in our utopia.</p>
    <h3>How is it implemented?</h3>
    <p>
      The source of code this implementation is out in the wild:
      <a href="https://github.com/sransara/buddy-chess-utopia">https://github.com/sransara/buddy-chess-utopia</a>
    </p>
    <p>Standing on the shoulders of giants:</p>
    <ul>
      <li>
        WebRTC : for P2P -
        <a href="https://github.com/feross/simple-peer">https://github.com/feross/simple-peer</a>
      </li>
      <li>
        Firebase : for discovery and signaling -
        <a href="https://firebase.google.com/" rel="nofollow">https://firebase.google.com/</a>
      </li>
      <li>
        Assymetric encryption for public communication -
        <a href="https://github.com/dchest/tweetnacl-js">https://github.com/dchest/tweetnacl-js</a>
      </li>
      <li>
        Chessboard -
        <a href="https://github.com/ornicar/chessground/">https://github.com/ornicar/chessground/</a>
      </li>
      <li>
        Original chess rules -
        <a href="https://github.com/jhlywa/chess.js/">https://github.com/jhlywa/chess.js/</a>
      </li>
      <li>Frontend - Svelte and Tailwind</li>
    </ul>
  </article>
</div>
