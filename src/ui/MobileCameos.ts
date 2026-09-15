/** Command illustrations framed like the retail sidebar's 60 × 48 cameos. */
type MobileCameo = 'select' | 'pan' | 'attack' | 'stop' | 'build';

const pictures: Record<MobileCameo, string> = {
  select: `
    <path fill="#474e36" d="M0 31 18 21 39 27 61 19 80 27V54H0Z"/>
    <path fill="#85855b" d="m0 45 25-13 29 8 26-7v21H0Z"/>
    <path fill="#202d35" stroke="#0c151c" stroke-width="2" d="m22 52 2-17 8-6h12l10 7 5 16Z"/>
    <path fill="#6992b1" d="m26 35 8-4 9 1 8 6-9 6-2 10H29Z"/>
    <path fill="#c5b99b" d="m31 19 15-2-1 10-5 7-8-5Z"/>
    <path fill="#263e56" stroke="#94adc0" d="m28 20 3-10 12-2 7 8v5H28Z"/>
    <path fill="#8eafbd" d="m31 11 10-2 5 3H32Z"/>
    <path fill="#192b3e" d="m26 22 26-3v4l-19 2Z"/>
    <path stroke="#18232c" stroke-width="5" d="m43 49 14-20"/>
    <path stroke="#afbdc4" stroke-width="2" d="m46 43 14-21"/>
    <path fill="none" stroke="#e5f7ca" stroke-width="2" d="M12 20v-8h8m39 0h8v8M12 39v8h8m39 0h8v-8"/>
  `,
  pan: `
    <path fill="#526448" d="M0 14 23 8 48 17 80 3v51H0Z"/>
    <path fill="#8e9771" d="m0 43 22-22 23 9L80 14v14L48 43 23 34 3 54H0Z"/>
    <path fill="#273e47" d="m0 30 22 8 23-18L80 35v9L46 30 24 48 0 39Z"/>
    <path fill="none" stroke="#c0bca0" d="m0 8 80 39M0 27l62 27M17 0l63 23M0 42 35 0M22 54 66 0M54 54l26-34"/>
    <path fill="#202929" stroke="#132024" stroke-width="2" d="m31 45-9-11 3-4 7 5V18l4-2 3 2v10-12l4-1 3 2v12-9l4-1 3 3v11l3-3 4 2-8 18-7 4Z"/>
    <path fill="#d0c8a8" d="m31 42-7-9 2-1 7 5V19h4v16h3V18h4v17h3V22h4v18l-5 10h-9Z"/>
    <path fill="#9c9984" d="m39 50 5-13 7-7v10l-5 10Z"/>
    <path fill="#f1e6c6" d="m8 12 6-6 6 6h-4v7h-4v-7Zm51 5 6-6 6 6h-4v7h-4v-7Z"/>
  `,
  attack: `
    <path fill="#725c3e" d="M0 33 22 26 45 29 63 18 80 24v30H0Z"/>
    <path fill="#a48c55" d="m0 46 31-11 23 6 26-4v17H0Z"/>
    <path fill="#232a29" stroke="#111914" stroke-width="2" d="m10 40 8-8 44-1 8 10-9 9H17Z"/>
    <path fill="#a8a68b" d="m13 39 9-7 38 1 7 7-9 4H23Z"/>
    <path fill="#4d6473" d="m22 31 8-11h20l8 14-23 6Z"/>
    <path fill="#9aadb1" d="m31 21 17 1 6 8-19 5-10-5Z"/>
    <path fill="#263e58" d="m36 23 6-6 10 1 4 8-13 4Z"/>
    <path stroke="#202c32" stroke-width="5" d="m49 21 23-11"/>
    <path stroke="#bcc7c5" stroke-width="2" d="m49 20 23-11"/>
    <path stroke="#687576" stroke-width="3" stroke-dasharray="4 3" d="M20 45h38"/>
    <g fill="none" stroke="#ffbd86" stroke-width="1.5"><circle cx="40" cy="28" r="18"/><path d="M40 4v13m0 22v13M15 28h13m24 0h13"/></g>
  `,
  stop: `
    <path fill="#535349" d="M0 21 16 16 41 22 63 12 80 24v30H0Z"/>
    <path fill="#2b3030" d="M0 39h80v15H0Z"/>
    <path fill="#d4b956" d="M0 43h80v8H0Z"/>
    <path stroke="#363831" stroke-width="7" d="m-3 51 8-8m9 8 8-8m9 8 8-8m9 8 8-8m9 8 8-8m9 8 8-8"/>
    <path fill="#263340" stroke="#0c1822" stroke-width="2" d="m23 37-9-11 3-5 9 7V12l4-3 4 3V7l5-2 4 3v5-5l5 1 2 4v7-6l5 2v20l-9 15H31Z"/>
    <path fill="#b2bfbd" d="m25 36-9-11 2-2 10 10V13l4-1 1 20h3V9l4-1 1 24h3V13h4v20h3V20h2v16l-9 14H32Z"/>
    <path fill="#657d8d" d="M32 38h15l-5 12H33Z"/>
    <path fill="#d8e1d8" d="M30 34h18v3H30Z"/>
  `,
  build: `
    <path fill="#567152" d="M0 32 28 26 44 32 66 25 80 28v26H0Z"/>
    <path fill="#8e9970" d="m0 48 22-11 37 2 21 8v7H0Z"/>
    <path fill="#26384d" stroke="#162535" d="M13 42V22l27-9 26 12v20l-25 8Z"/>
    <path fill="#b6c7cc" d="m13 22 27-9 26 12-24 9Z"/>
    <path fill="#617f99" d="m13 24 29 11v18L13 42Z"/>
    <path fill="#7898b1" d="m43 34 23-9v20l-23 8Z"/>
    <path fill="#101c2b" d="m46 37 15-6v13l-15 6Z"/>
    <path fill="#31588f" d="m17 25 23-7 21 9-20 7Z"/>
    <path stroke="#d1d8cd" d="m21 25 19-5 16 7m-32 0 16-4 12 6m-25 0 13-3 7 4"/>
    <path fill="#bbcaaf" d="M18 13h6v20h-6Zm3-4h3v10h-3Z"/>
    <path stroke="#d2bb67" stroke-width="3" d="M60 27V6H37"/>
    <path stroke="#353e38" d="m59 6-8 9V6m-7 0v10"/>
    <path fill="#e7c85c" d="M40 15h8v4h-8Z"/>
  `,
};

export function mobileCameo(name: MobileCameo): string {
  return `<span class="command-cameo" aria-hidden="true"><svg viewBox="0 0 80 54" preserveAspectRatio="xMidYMax meet" focusable="false" shape-rendering="crispEdges"><defs><linearGradient id="command-sky-${name}" x2="0" y2="1"><stop stop-color="#839994"/><stop offset=".6" stop-color="#b6ba9e"/><stop offset="1" stop-color="#4a564d"/></linearGradient></defs><path fill="url(#command-sky-${name})" d="M0 0h80v54H0Z"/>${pictures[name]}</svg></span>`;
}
