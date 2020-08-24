<script lang="typescript">
  const digitToCrystals = [
    [1, 1, 1, 0, 1, 1, 1], // 0
    [0, 0, 1, 0, 0, 1, 0], // 1
    [1, 0, 1, 1, 1, 0, 1], // 2
    [1, 0, 1, 1, 0, 1, 1], // 3
    [0, 1, 1, 1, 0, 1, 0], // 4
    [1, 1, 0, 1, 0, 1, 1], // 5
    [1, 1, 0, 1, 1, 1, 1], // 6
    [1, 0, 1, 0, 0, 1, 0], // 7
    [1, 1, 1, 1, 1, 1, 1], // 8
    [1, 1, 1, 1, 0, 1, 1], // 9
  ];

  // just super premature optimization
  // rational: because timer needs to update every second
  // keep division logic out of the reactive loop
  const numToDigits = Array.apply(0, new Array(60)).map((_, i) => {
    const firstDigit = ~~(i / 10); // most significant
    const secondDigit = i % 10;
    return [firstDigit, secondDigit];
  });

  const crystalCache: { [id: string]: HTMLElement } = {};

  let clocksvg: any;
  function displayClockPart(clockPart: "s" | "m", number: number) {
    const digits = number >= 0 && number < 60 ? numToDigits[number] : [8, 8];
    for (let di = 0; di < digits.length; di++) {
      const crystals = digitToCrystals[digits[di]];
      for (let ci = 0; ci < crystals.length; ci++) {
        const crystalId = `${clockPart}-${di}-${ci}`;
        let crystal = crystalCache[crystalId];
        if (crystal === undefined) {
          crystal = clocksvg.querySelector(`[data-id="${clockPart}-${di}-${ci}"]`);
        }
        if (crystals[ci] === 0) {
          crystal.style.opacity = "0.125";
        } else {
          crystal.style.opacity = "1";
        }
      }
    }
  }

  export let state: string;

  export let seconds: number;
  $: clocksvg && displayClockPart("s", seconds);
  export let minutes: number;
  $: clocksvg && displayClockPart("m", minutes);
</script>

<style>
  .waiting {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      background-color: #2f855a;
    }
    50% {
      background-color: #1c4d37;
    }
    100% {
      background-color: #2f855a;
    }
  }
</style>

<!-- Adapted design from: https://codepen.io/dustindowell/pen/rxjxVp -->
<div class="{state == 'timeout' ? 'bg-red-500' : 'bg-green-500'} h-full w-full" class:waiting="{state == 'waiting'}">
  <svg
    bind:this="{clocksvg}"
    class="h-full w-full opacity-75"
    viewBox="30 36 102 36"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g data-id="seconds">
      <g>
        <path data-id="s-1-6" d="M106,69l3-3h6l3,3c0,0-1,1-3,1h-6C107,70,106,69,106,69z"></path>
        <path data-id="s-1-5" d="M119,55l-3,2v8l3,3c0,0,1-1,1-3v-7C120,56,119,55,119,55z"></path>
        <path data-id="s-1-4" d="M105,55l3,2v8l-3,3c0,0-1-1-1-3v-7C104,56,105,55,105,55z"></path>
        <polygon data-id="s-1-3" points="109,52 115,52 118,54 115,56 109,56 106,54"></polygon>
        <path data-id="s-1-2" d="M119,40l-3,3v8l3,2c0,0,1-1,1-3v-7C120,41,119,40,119,40z"></path>
        <path data-id="s-1-1" d="M105,40l3,3v8l-3,2c0,0-1-1-1-3v-7C104,41,105,40,105,40z"></path>
        <path data-id="s-1-0" d="M106,39l3,3h6l3-3c0,0-1-1-3-1h-6C107,38,106,39,106,39z"></path>
      </g>
      <g>
        <path data-id="s-0-6" d="M88,69l3-3h6l3,3c0,0-1,1-3,1h-6C89,70,88,69,88,69z"></path>
        <path data-id="s-0-5" d="M101,55l-3,2v8l3,3c0,0,1-1,1-3v-7C102,56,101,55,101,55z"></path>
        <path data-id="s-0-4" d="M87,55l3,2v8l-3,3c0,0-1-1-1-3v-7C86,56,87,55,87,55z"></path>
        <polygon data-id="s-0-3" points="91,52 97,52 100,54 97,56 91,56 88,54"></polygon>
        <path data-id="s-0-2" d="M101,40l-3,3v8l3,2c0,0,1-1,1-3v-7C102,41,101,40,101,40z"></path>
        <path data-id="s-0-1" d="M87,40l3,3v8l-3,2c0,0-1-1-1-3v-7C86,41,87,40,87,40z"></path>
        <path data-id="s-0-0" d="M88,39l3,3h6l3-3c0,0-1-1-3-1h-6C89,38,88,39,88,39z"></path>
      </g>
    </g>
    <g data-id="minutes">
      <g>
        <path data-id="m-1-6" d="M64,69l3-3h6l3,3c0,0-1,1-3,1h-6C65,70,64,69,64,69z"></path>
        <path data-id="m-1-5" d="M77,55l-3,2v8l3,3c0,0,1-1,1-3v-7C78,56,77,55,77,55z"></path>
        <path data-id="m-1-4" d="M63,55l3,2v8l-3,3c0,0-1-1-1-3v-7C62,56,63,55,63,55z"></path>
        <polygon data-id="m-1-3" points="67,52 73,52 76,54 73,56 67,56 64,54"></polygon>
        <path data-id="m-1-2" d="M77,40l-3,3v8l3,2c0,0,1-1,1-3v-7C78,41,77,40,77,40z"></path>
        <path data-id="m-1-1" d="M63,40l3,3v8l-3,2c0,0-1-1-1-3v-7C62,41,63,40,63,40z"></path>
        <path data-id="m-1-0" d="M64,39l3,3h6l3-3c0,0-1-1-3-1h-6C65,38,64,39,64,39z"></path>
      </g>
      <g>
        <path data-id="m-0-6" d="M46,69l3-3h6l3,3c0,0-1,1-3,1h-6C47,70,46,69,46,69z"></path>
        <path data-id="m-0-5" d="M59,55l-3,2v8l3,3c0,0,1-1,1-3v-7C60,56,59,55,59,55z"></path>
        <path data-id="m-0-4" d="M45,55l3,2v8l-3,3c0,0-1-1-1-3v-7C44,56,45,55,45,55z"></path>
        <polygon data-id="m-0-3" points="49,52 55,52 58,54 55,56 49,56 46,54"></polygon>
        <path data-id="m-0-2" d="M59,40l-3,3v8l3,2c0,0,1-1,1-3v-7C60,41,59,40,59,40z"></path>
        <path data-id="m-0-1" d="M45,40l3,3v8l-3,2c0,0-1-1-1-3v-7C44,41,45,40,45,40z"></path>
        <path data-id="m-0-0" d="M46,39l3,3h6l3-3c0,0-1-1-3-1h-6C47,38,46,39,46,39z"></path>
      </g>
    </g>
    <g data-id="dots">
      <g>
        <circle cx="82" cy="50" r="2"></circle>
        <circle cx="82" cy="58" r="2"></circle>
      </g>
    </g>
  </svg>
</div>
