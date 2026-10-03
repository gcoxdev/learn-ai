<script lang="ts">
  let { type = "language" }: { type?: string } = $props();
  const cells = Array.from({ length: 64 }, (_, i) => ({
    x: i % 8,
    y: Math.floor(i / 8),
    noise: (i * 37 + 13) % 100,
  }));
  const waveform = [
    12, 21, 15, 37, 58, 29, 74, 101, 67, 39, 83, 53, 27, 43, 21, 12,
  ];
  const spectrum = [30, 53, 78, 98, 86, 64, 43, 27];
</script>

<div
  class={[
    "path-art",
    type === "images"
      ? "art-image"
      : type === "language"
        ? "art-language"
        : "art-system",
    `art-${type}`,
  ]}
  aria-hidden="true"
>
  {#if type === "images"}
    <svg viewBox="0 0 440 160" fill="none">
      <g transform="translate(63 26)"
        >{#each cells as cell (cell.x + cell.y * 8)}<rect
            x={cell.x * 13}
            y={cell.y * 13}
            width="12"
            height="12"
            rx="2"
            fill={`hsl(30 25% ${35 + cell.noise * 0.52}%)`}
          />{/each}</g
      >
      <path d="M196 80h43m-7-6 7 6-7 6" stroke="#a17b56" stroke-width="1.5" />
      <rect x="270" y="22" width="115" height="115" rx="9" fill="#f7d99e" />
      <circle cx="348" cy="51" r="14" fill="#d88953" />
      <path d="m270 115 33-40 31 30 24-17 27 27v22H270Z" fill="#729079" />
      <path d="m270 128 49-30 35 23 31-15v31H270Z" fill="#3b6753" />
      <path
        d="m290 9 4 8m104 15-8 4M253 49l-8-1"
        stroke="#b78c62"
        stroke-width="1.5"
      />
    </svg>
  {:else if type === "language"}
    <div class="token-example">
      <span>The</span><span>world</span><span>is</span><span class="empty-token"
        >?</span
      >
    </div>
    <div
      class="probabilities"
      title="Example top continuations; other tokens total 0.17"
    >
      <div><span>full</span><i style="--bar: 74%"></i><small>0.42</small></div>
      <div>
        <span>changing</span><i style="--bar: 45%"></i><small>0.26</small>
      </div>
      <div>
        <span>beautiful</span><i style="--bar: 26%"></i><small>0.15</small>
      </div>
    </div>
  {:else}
    <svg
      class="system-illustration"
      viewBox="0 0 440 160"
      fill="none"
      focusable="false"
    >
      {#if type === "video"}
        <path class="faint-line" d="M62 128h316" />
        {#each [0, 1, 2] as frame (frame)}
          <g transform={`translate(${59 + frame * 112} 29)`}>
            <rect class="paper outlined" width="98" height="80" rx="9" />
            <path
              class="soft-fill"
              d="M1 58 28 37 56 62 75 47 97 63v8a8 8 0 0 1-8 8H9a8 8 0 0 1-8-8Z"
            />
            <circle
              class="ochre-fill"
              cx={29 + frame * 19}
              cy={29 - frame * 3}
              r="10"
            />
            <path
              class="dark-fill"
              d="m1 68 29-13 34 15 33-10v11a8 8 0 0 1-8 8H9a8 8 0 0 1-8-8Z"
            />
            <path class="line" d="M9 7h8m64 0h8" />
            <circle class="leaf-fill" cx="49" cy="99" r="3" />
          </g>
        {/each}
        <path class="line" d="m371 122 7 6-7 6" />
      {:else if type === "audio"}
        <path class="faint-line" d="M46 80h348" />
        <path class="faint-line dashed" d="M46 28v104m177-104v104" />
        {#each waveform as height, i (i)}
          <rect
            class={i > 5 && i < 11 ? "dark-fill" : "leaf-fill"}
            x={58 + i * 10}
            y={80 - height / 2}
            width="5"
            {height}
            rx="2.5"
          />
        {/each}
        <path class="line" d="M237 80h24m-6-5 6 5-6 5" />
        {#each spectrum as height, i (i)}
          <rect
            class={i < 4 ? "soft-fill" : "ochre-fill"}
            x={282 + i * 12}
            y={130 - height}
            width="8"
            {height}
            rx="4"
          />
        {/each}
        <path class="line" d="M280 136h96" />
        <path
          class="faint-line"
          d="M287 20c20-11 47-11 67 0m-58 5c15-7 30-7 46 0"
        />
      {:else if type === "robotics"}
        <ellipse class="soft-fill" cx="218" cy="132" rx="142" ry="10" />
        <path class="faint-line dashed" d="M109 68a112 112 0 0 1 207-3" />
        <path class="line" d="m310 61 7 5 3-8" />
        <path class="leaf-fill outlined" d="M115 112h61l10 20h-81Z" />
        <path class="arm-shadow" d="m144 115 20-54 66-30 52 41" />
        <path class="arm" d="m144 115 20-54 66-30 52 41" />
        <circle class="paper outlined" cx="164" cy="61" r="12" />
        <circle class="paper outlined" cx="230" cy="31" r="10" />
        <circle class="dark-fill" cx="164" cy="61" r="4" />
        <circle class="dark-fill" cx="230" cy="31" r="3" />
        <path class="line" d="m281 71 12 9-1 13m-9-21 3 14-12 6" />
        <path
          class="ochre-fill outlined"
          d="m299 101 18-10 18 10v22l-18 10-18-10Z"
        />
        <path class="line" d="m299 101 18 10 18-10m-18 10v22" />
        <path class="faint-line dashed" d="m290 92 14 8" />
      {:else if type === "vision"}
        <rect
          class="paper outlined"
          x="100"
          y="22"
          width="240"
          height="116"
          rx="9"
        />
        <circle class="ochre-fill" cx="293" cy="49" r="13" />
        <path
          class="soft-fill"
          d="m101 112 53-41 40 31 62-44 83 55v16a8 8 0 0 1-8 8H109a8 8 0 0 1-8-8Z"
        />
        <path class="leaf-fill" d="m154 108 20-43 21 43Z" />
        <path class="dark-fill" d="M171 101h6v20h-6zm73 15 25-53 26 53Z" />
        <path class="dark-fill" d="M266 108h6v22h-6z" />
        <rect class="line" x="149" y="60" width="51" height="66" rx="4" />
        <rect class="line" x="238" y="56" width="63" height="77" rx="4" />
        <path class="paper-line" d="M156 69v-2h7m130-3h-7m7 0v7" />
        <path
          class="line"
          d="M86 40V16h24m220 0h24v24M86 120v24h24m220 0h24v-24"
        />
      {:else if type === "agents"}
        <path
          class="faint-line"
          d="M149 46c33-31 100-31 134 0m19 20c16 35-9 63-48 72m-31 1c-45 0-81-17-86-49"
        />
        <path
          class="line"
          d="m274 43 10 4-2-11m-35 99 7 3-7 6M133 98l3-9 8 6"
        />
        <circle class="soft-fill" cx="220" cy="79" r="35" />
        <circle class="paper outlined" cx="220" cy="79" r="26" />
        <path class="line" d="m207 80 9 9 18-19" />
        <g transform="translate(112 40)">
          <rect class="paper outlined" width="46" height="42" rx="9" />
          <path class="line" d="m17 12-7 9 7 9m12-18 7 9-7 9" />
        </g>
        <g transform="translate(282 40)">
          <rect class="paper outlined" width="46" height="42" rx="9" />
          <ellipse class="soft-fill outlined" cx="23" cy="13" rx="11" ry="5" />
          <path
            class="line"
            d="M12 13v15c0 7 22 7 22 0V13M12 21c0 7 22 7 22 0"
          />
        </g>
        <rect
          class="paper outlined"
          x="197"
          y="119"
          width="46"
          height="27"
          rx="7"
        />
        <path class="line" d="M208 129h23m-23 7h15" />
        <path
          class="faint-line dashed"
          d="M159 63 187 73m66 0 28-10m-61 43v12"
        />
      {:else if type === "retrieval"}
        <rect
          class="soft-fill outlined"
          x="71"
          y="24"
          width="81"
          height="97"
          rx="7"
          transform="rotate(-9 111 73)"
        />
        <rect
          class="paper outlined"
          x="88"
          y="32"
          width="81"
          height="97"
          rx="7"
        />
        <path
          class="faint-line"
          d="M101 49h47m-47 9h38m-38 34h48m-48 9h34m-34 10h43"
        />
        <rect class="soft-fill" x="98" y="68" width="61" height="16" rx="3" />
        <path class="line" d="M104 76h45m15 0h31" />
        <circle class="paper outlined" cx="222" cy="70" r="22" />
        <path class="strong-line" d="m238 87 13 14" />
        <path class="line" d="m213 71 6 6 11-13m15 12h25m-6-5 6 5-6 5" />
        <rect
          class="paper outlined"
          x="284"
          y="38"
          width="86"
          height="87"
          rx="9"
        />
        <path class="line" d="M298 55h37m-37 10h54m-54 10h43m-43 10h49" />
        <rect class="soft-fill" x="297" y="100" width="19" height="12" rx="3" />
        <rect class="soft-fill" x="322" y="100" width="19" height="12" rx="3" />
        <path class="line" d="M303 106h7m18 0h7" />
      {:else if type === "prediction"}
        <path
          class="faint-line"
          d="M80 28v103h276M80 97h276M80 62h276m-207 69V28m69 103V28m69 103V28"
        />
        <path
          class="soft-fill"
          d="M81 29h210c-22 22-65 25-76 47-12 22-48 35-72 54H81Z"
        />
        <path
          class="line dashed"
          d="M143 130c24-19 60-32 72-54 11-22 54-25 76-47"
        />
        {#each [[109, 49], [143, 66], [176, 42], [119, 103], [184, 85], [223, 45]] as point (point)}
          <circle class="leaf-fill" cx={point[0]} cy={point[1]} r="5" />
        {/each}
        {#each [[216, 111], [265, 90], [295, 56], [323, 106], [298, 121], [325, 74]] as point (point)}
          <path
            class="ochre-line"
            d={`m${point[0] - 4} ${point[1] - 4} 8 8m0-8-8 8`}
          />
        {/each}
        <circle class="paper outlined" cx="245" cy="65" r="13" />
        <circle class="leaf-fill" cx="245" cy="65" r="5" />
      {:else if type === "forecasting"}
        <path
          class="faint-line"
          d="M66 32v100h310M66 103h310M66 73h310M66 43h310"
        />
        <path
          class="soft-fill"
          d="M228 74c25-24 58-42 132-56v91c-61-7-110-11-132-35Z"
        />
        <path class="faint-line dashed" d="M228 22v110" />
        <path
          class="strong-line"
          d="m78 111 23-12 21 5 21-29 22 11 21-29 22 9 20 8"
        />
        <path class="line dashed" d="M228 74c32-12 84-25 132-30" />
        <circle class="paper outlined" cx="228" cy="74" r="5" />
        <path class="line" d="M72 139h137m-5-4 5 4-5 4m39-4h113m-5-4 5 4-5 4" />
      {:else if type === "recommendation"}
        <path
          class="faint-line"
          d="M138 80c54 0 61-45 119-45m-119 45c54 0 61 45 119 45"
        />
        <path class="strong-line" d="M138 80h139" />
        <circle class="soft-fill" cx="106" cy="80" r="35" />
        <circle class="paper outlined" cx="106" cy="80" r="28" />
        <circle class="leaf-fill" cx="106" cy="72" r="8" />
        <path class="leaf-fill" d="M91 94c1-18 29-18 30 0Z" />
        <circle class="paper outlined" cx="202" cy="80" r="10" />
        <path class="line" d="m198 80 3 3 6-6" />
        <rect
          class="paper outlined"
          x="258"
          y="19"
          width="89"
          height="33"
          rx="7"
        />
        <rect class="soft-fill" x="267" y="27" width="18" height="17" rx="3" />
        <path class="faint-line" d="M294 31h41m-41 8h27" />
        <rect
          class="paper outlined"
          x="279"
          y="59"
          width="101"
          height="43"
          rx="7"
        />
        <rect class="leaf-fill" x="288" y="68" width="25" height="25" rx="4" />
        <path class="paper-line" d="m295 80 4 4 8-9" />
        <path class="line" d="M323 75h44m-44 10h30" />
        <rect
          class="paper outlined"
          x="258"
          y="109"
          width="89"
          height="33"
          rx="7"
        />
        <circle class="ochre-fill" cx="276" cy="126" r="8" />
        <path class="faint-line" d="M294 121h41m-41 8h27" />
      {:else if type === "decisions"}
        <path
          class="faint-line"
          d="M100 80h34c35 0 25-42 62-42h23m-85 42c35 0 25 42 62 42h23M239 38h15c31 0 26-17 58-17h20m-78 17c31 0 26 17 58 17h20M239 122h15c31 0 26-17 58-17h20m-78 17c31 0 26 17 58 17h20"
        />
        <path
          class="strong-line"
          d="M100 80h34c35 0 25-42 62-42h58c31 0 26 17 58 17h20"
        />
        <path class="soft-fill outlined" d="m79 80 17-17 17 17-17 17Z" />
        <path
          class="paper outlined"
          d="m214 38 14-14 14 14-14 14Zm0 84 14-14 14 14-14 14Z"
        />
        <circle class="paper outlined" cx="340" cy="21" r="7" />
        <circle class="leaf-fill" cx="340" cy="55" r="12" />
        <path class="paper-line" d="m335 55 3 3 7-7" />
        <circle class="paper outlined" cx="340" cy="105" r="7" />
        <circle class="paper outlined" cx="340" cy="139" r="7" />
        <path class="faint-line dashed" d="M74 104v35h103" />
      {:else if type === "decision-models"}
        <!-- Messages in, one scoring pass, typed options with probabilities out. -->
        {#each [32, 70, 108] as y (y)}
          <rect class="paper outlined" x="62" y={y} width="62" height="22" rx="5" />
          <path class="paper-line" d={`M71 ${y + 8}h40M71 ${y + 15}h26`} />
        {/each}
        <path class="faint-line" d="M124 43c30 0 34 37 58 37M124 81h58M124 119c30 0 34-39 58-39" />
        <rect class="soft-fill outlined" x="182" y="58" width="64" height="44" rx="10" />
        <path class="strong-line" d="M198 80h32m-9-9 9 9-9 9" />
        <path class="faint-line" d="M246 80c22 0 22-42 44-42M246 80h44M246 80c22 0 22 42 44 42" />
        <rect class="leaf-fill" x="290" y="30" width="86" height="16" rx="4" />
        <rect class="ochre-fill" x="290" y="72" width="26" height="16" rx="4" />
        <rect class="faint-line" x="290" y="114" width="12" height="16" rx="4" />
        <circle class="paper outlined" cx="392" cy="38" r="9" />
        <path class="line" d="m387 38 3.5 3.5 6.5-7" />
      {:else if type === "science"}
        <circle class="soft-fill" cx="138" cy="81" r="54" />
        <path
          class="strong-line"
          d="m107 56 40-17 32 31-15 41-45 8-29-28 17-35m40-17 17 72m-57-55 57 55m-45 8 28-80"
        />
        <circle class="paper outlined" cx="107" cy="56" r="10" />
        <circle class="leaf-fill" cx="147" cy="39" r="12" />
        <circle class="paper outlined" cx="179" cy="70" r="9" />
        <circle class="dark-fill" cx="164" cy="111" r="13" />
        <circle class="ochre-fill" cx="119" cy="119" r="9" />
        <circle class="paper outlined" cx="90" cy="91" r="8" />
        <path class="faint-line dashed" d="M191 76h42" />
        <rect
          class="paper outlined"
          x="245"
          y="30"
          width="118"
          height="103"
          rx="9"
        />
        <path class="faint-line" d="M260 47v70h87m-87-26h87m-87-26h87" />
        <path class="line" d="M263 105c20 0 20-55 38-55s18 53 43 53" />
        <circle class="ochre-fill" cx="278" cy="84" r="3" />
        <circle class="ochre-fill" cx="298" cy="54" r="3" />
        <circle class="ochre-fill" cx="323" cy="87" r="3" />
        <path class="faint-line" d="M72 142h297" />
      {:else if type === "multimodal"}
        <path
          class="faint-line"
          d="M114 35h24c45 0 39 45 82 45m-106 0h106m-106 45h24c45 0 39-45 82-45m27 0h53"
        />
        <rect
          class="paper outlined"
          x="63"
          y="17"
          width="51"
          height="35"
          rx="6"
        />
        <path class="line" d="M73 28h29m-29 7h23m-23 7h16" />
        <rect
          class="paper outlined"
          x="63"
          y="62"
          width="51"
          height="35"
          rx="6"
        />
        <circle class="ochre-fill" cx="99" cy="73" r="5" />
        <path class="leaf-fill" d="m68 91 13-16 10 11 8-7 10 12Z" />
        <rect
          class="paper outlined"
          x="63"
          y="107"
          width="51"
          height="35"
          rx="6"
        />
        <path class="line" d="M74 122v5m7-13v21m7-16v11m7-17v24m7-16v7" />
        <circle class="soft-fill" cx="222" cy="80" r="33" />
        <path
          class="line"
          d="m206 69 27-5 7 26-27 10-7-31 34 21m-27 10 20-36"
        />
        <circle class="dark-fill" cx="206" cy="69" r="5" />
        <circle class="ochre-fill" cx="233" cy="64" r="5" />
        <circle class="leaf-fill" cx="240" cy="90" r="5" />
        <circle class="dark-fill" cx="213" cy="100" r="5" />
        <path class="line" d="m292 75 7 5-7 5" />
        <rect
          class="paper outlined"
          x="311"
          y="40"
          width="68"
          height="82"
          rx="9"
        />
        <rect class="soft-fill" x="322" y="51" width="46" height="31" rx="4" />
        <path class="leaf-fill" d="m327 76 10-16 11 12 9-7 7 11Z" />
        <path class="line" d="M323 94h43m-43 9h32" />
      {:else if type === "edge"}
        <rect
          class="soft-fill outlined"
          x="94"
          y="42"
          width="89"
          height="77"
          rx="11"
        />
        <rect
          class="paper outlined"
          x="106"
          y="54"
          width="65"
          height="42"
          rx="6"
        />
        <circle class="leaf-fill" cx="138" cy="75" r="14" />
        <circle class="paper outlined" cx="138" cy="75" r="7" />
        <path class="line" d="M119 108h38m-40 12v12m43-12v12m-57 0h73" />
        <path
          class="line dashed"
          d="M196 72h44m-6-5 6 5-6 5m6 20h-44m6-5-6 5 6 5"
        />
        <rect
          class="paper outlined"
          x="260"
          y="16"
          width="83"
          height="129"
          rx="13"
        />
        <path class="line" d="M287 25h30m-33 111h35" />
        <rect class="soft-fill" x="269" y="35" width="65" height="91" rx="6" />
        <rect class="dark-fill" x="284" y="62" width="35" height="35" rx="5" />
        <rect class="leaf-fill" x="293" y="71" width="17" height="17" rx="2" />
        <path
          class="line"
          d="M290 56v6m11-6v6m12-6v6m-23 35v6m11-6v6m12-6v6m-35-35h6m-6 11h6m-6 12h6m35-23h6m-6 11h6m-6 12h6"
        />
        <path class="faint-line" d="M74 145h291" />
      {:else}
        <circle class="soft-fill" cx="220" cy="80" r="48" />
        <path class="line" d="m194 65 38-12 19 39-39 15-18-42 57 27" />
        <circle class="dark-fill" cx="194" cy="65" r="7" />
        <circle class="ochre-fill" cx="232" cy="53" r="7" />
        <circle class="leaf-fill" cx="251" cy="92" r="7" />
        <circle class="dark-fill" cx="212" cy="107" r="7" />
      {/if}
    </svg>
  {/if}
</div>

<style>
  .art-system {
    background: #e9eee2;
  }
  .art-video,
  .art-retrieval,
  .art-science {
    background: #f1eadf;
  }
  .art-audio,
  .art-vision,
  .art-multimodal {
    background: #e5ece5;
  }
  .system-illustration {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 560px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .paper {
    fill: #f8f9f1;
  }
  .soft-fill {
    fill: #cbd8c1;
  }
  .leaf-fill {
    fill: #789780;
  }
  .dark-fill {
    fill: #3b6753;
  }
  .ochre-fill {
    fill: #c8a675;
  }
  .outlined,
  .line {
    stroke: #69816b;
    stroke-width: 1.5;
  }
  .faint-line {
    stroke: #aab9a1;
    stroke-width: 1;
  }
  .strong-line {
    stroke: #3b6753;
    stroke-width: 2.5;
  }
  .paper-line {
    stroke: #f8f9f1;
    stroke-width: 1.5;
  }
  .ochre-line {
    stroke: #b18d5f;
    stroke-width: 2;
  }
  .dashed {
    stroke-dasharray: 4 5;
  }
  .arm-shadow {
    stroke: #69816b;
    stroke-width: 17;
  }
  .arm {
    stroke: #f8f9f1;
    stroke-width: 13;
  }
</style>
