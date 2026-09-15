import { IFV_TURRET_FILES } from './IFVArtwork';
import {
  nativeTerrainFiles,
  nativeDecorationNames,
  NATIVE_THEATERS,
  THEATER_EXTENSION,
  THEATER_LETTER,
  type NativeTheater,
} from '../game/maps/theater';

export interface AssetSpec {
  sprite: string;
  cameo: string;
  kind: 'building' | 'infantry' | 'vehicle' | 'spriteVehicle';
  noBuildup?: boolean;
  overlays?: string[];
  bib?: string;
  turret?: string;
  footprint?: [number, number];
}

export interface AssetCatalog {
  [name: string]: AssetSpec;
}

export const CATALOG: AssetCatalog = {
  hornet: { sprite: 'hornet', cameo: 'proicon', kind: 'vehicle' },
  sniper: { sprite: 'snipe', cameo: 'snipicon', kind: 'infantry' },
  battlelab: {
    sprite: 'gatech',
    cameo: 'techicon',
    kind: 'building',
    footprint: [3, 2],
    overlays: ['gatech_a'],
  },
  service_depot: {
    sprite: 'gadept',
    cameo: 'fixicon',
    kind: 'building',
    footprint: [3, 3],
    overlays: ['gadept_d'],
    bib: 'gadeptbb',
  },
  shipyard: {
    sprite: 'gayard',
    cameo: 'ayaricon',
    kind: 'building',
    footprint: [4, 4],
    overlays: ['gayard_a', 'gayard_c'],
  },
  ore_purifier: {
    sprite: 'gaorep',
    cameo: 'gorep',
    kind: 'building',
    footprint: [3, 3],
    overlays: ['gaorep_a'],
  },
  patriot: { sprite: 'nasam', cameo: 'samicon', kind: 'building', footprint: [1, 1] },
  prism_tower: {
    sprite: 'gapris',
    cameo: 'prisicon',
    kind: 'building',
    footprint: [1, 1],
    overlays: ['gapris_b'],
  },
  // ART.INI names GAGAP_A, but the original archives contain no such SHP.
  gap_generator: { sprite: 'gagap', cameo: 'gapicon', kind: 'building', footprint: [1, 1] },
  chronosphere: {
    sprite: 'gacsph',
    cameo: 'csphicon',
    kind: 'building',
    footprint: [4, 3],
    overlays: ['gacsph_e', 'gacsph_f', 'gacsph_g', 'gacsph_h'],
  },
  weather_control: {
    sprite: 'gaweth',
    cameo: 'wethicon',
    kind: 'building',
    footprint: [3, 3],
    overlays: ['gaweth_e', 'gaweth_f', 'gaweth_g', 'gaweth_h'],
  },
  wall: {
    sprite: 'gawall',
    cameo: 'wallicon',
    kind: 'building',
    footprint: [1, 1],
    noBuildup: true,
  },
  attack_dog: { sprite: 'adog', cameo: 'adogicon', kind: 'infantry' },
  spy: { sprite: 'spy', cameo: 'spyicon', kind: 'infantry' },
  tanya: { sprite: 'tany', cameo: 'tanyicon', kind: 'infantry' },
  chrono_legionnaire: { sprite: 'cleg', cameo: 'clegicon', kind: 'infantry' },
  prism_tank: { sprite: 'sref', cameo: 'sreficon', kind: 'vehicle' },
  mirage_tank: { sprite: 'rtnk', cameo: 'rtnkicon', kind: 'vehicle' },
  mcv: { sprite: 'mcv', cameo: 'mcvicon', kind: 'vehicle' },
  nighthawk: { sprite: 'shad', cameo: 'shadicon', kind: 'vehicle' },
  harrier: { sprite: 'falc', cameo: 'falcicon', kind: 'vehicle' },
  destroyer: { sprite: 'dest', cameo: 'desticon', kind: 'vehicle' },
  aegis: { sprite: 'aegis', cameo: 'agisicon', kind: 'vehicle' },
  carrier: { sprite: 'carrier', cameo: 'carricon', kind: 'vehicle' },
  dolphin: { sprite: 'dlph', cameo: 'dlphicon', kind: 'spriteVehicle' },
  transport: { sprite: 'lcrf', cameo: 'landicon', kind: 'vehicle' },
  conyard: {
    sprite: 'gacnst',
    cameo: 'mcvicon',
    kind: 'building',
    overlays: ['gacnst_a', 'gacnst_b'],
    footprint: [4, 4],
  },
  // Draw the crane/tower before the beacon: the production SHP includes the
  // whole building and otherwise paints over NACNST_A's flashing light.
  conyard_soviet: {
    sprite: 'nacnst',
    cameo: 'smcvicon',
    kind: 'building',
    overlays: ['nacnst_b', 'nacnst_c', 'nacnst_a'],
    footprint: [4, 4],
  },
  power: {
    sprite: 'gapowr',
    cameo: 'powricon',
    kind: 'building',
    overlays: ['gapowr_a'],
    footprint: [2, 2],
  },
  // art.ini also mentions GAREFNL4, but the original archive has no such SHP.
  refinery: {
    sprite: 'garefn',
    cameo: 'reficon',
    kind: 'building',
    bib: 'garefnbb',
    overlays: ['garefnl1', 'garefnl2', 'garefnl3'],
    footprint: [4, 3],
  },
  barracks: {
    sprite: 'gapile',
    cameo: 'brrkicon',
    kind: 'building',
    overlays: ['gapile_a'],
    footprint: [3, 2],
  },
  warfactory: {
    sprite: 'gaweap',
    cameo: 'gwepicon',
    kind: 'building',
    bib: 'gaweapbb',
    overlays: ['gaweap_1', 'gaweap_2', 'gaweap_a', 'gaweap_b'],
    footprint: [5, 3],
  },
  radar: {
    sprite: 'gaairc',
    cameo: 'heliicon',
    kind: 'building',
    bib: 'gaaircbb',
    overlays: ['gaairc_a', 'gaairc_b', 'gaairc_c'],
    footprint: [3, 2],
  },
  pillbox: { sprite: 'gapill', cameo: 'pillicon', kind: 'building', footprint: [1, 1] },
  power_soviet: {
    sprite: 'napowr',
    cameo: 'npwricon',
    kind: 'building',
    overlays: ['napowr_a'],
    footprint: [3, 2],
  },
  refinery_soviet: {
    sprite: 'narefn',
    cameo: 'nreficon',
    kind: 'building',
    bib: 'narefnbb',
    overlays: ['narefnl1', 'narefnl2', 'narefnl3', 'narefnl4'],
    footprint: [4, 3],
  },
  barracks_soviet: { sprite: 'nahand', cameo: 'handicon', kind: 'building', footprint: [2, 2] },
  warfactory_soviet: {
    sprite: 'naweap',
    cameo: 'nwepicon',
    kind: 'building',
    bib: 'naweapbb',
    overlays: ['naweap_1', 'naweap_2', 'naweap_a'],
    footprint: [5, 3],
  },
  radar_soviet: {
    sprite: 'naradr',
    cameo: 'nradicon',
    kind: 'building',
    overlays: ['naradr_a'],
    footprint: [2, 2],
  },
  sentry: {
    sprite: 'nalasr',
    cameo: 'plticon',
    kind: 'building',
    turret: 'laser',
    footprint: [1, 1],
  },
  gi: { sprite: 'gi', cameo: 'giicon', kind: 'infantry' },
  engineer: { sprite: 'engineer', cameo: 'engnicon', kind: 'infantry' },
  rocketeer: { sprite: 'rock', cameo: 'jjeticon', kind: 'infantry' },
  conscript: { sprite: 'cons', cameo: 'e2icon', kind: 'infantry' },
  grizzly: { sprite: 'gtnk', cameo: 'gtnkicon', kind: 'vehicle' },
  ifv: { sprite: 'fv', cameo: 'fvicon', kind: 'vehicle' },
  miner: { sprite: 'cmin', cameo: 'ahrvicon', kind: 'vehicle' },
  rhino: { sprite: 'htnk', cameo: 'htnkicon', kind: 'vehicle' },
  flak: { sprite: 'htk', cameo: 'htkicon', kind: 'vehicle' },
  warminer: { sprite: 'harv', cameo: 'harvicon', kind: 'vehicle' },
};

export function theaterNames(name: string, theater: NativeTheater = 'TEMPERATE'): string[] {
  name = name.toLowerCase();

  // FinalAlert/RA2 NewTheater: current theater first, then G (generic).
  // The INI's A name is Arctic artwork, never a fallback on a dry map.
  return /^[cgn]a/.test(name) && !name.endsWith('icon')
    ? [name[0] + THEATER_LETTER[theater] + name.slice(2), name[0] + 'g' + name.slice(2)]
    : [name];
}

export const NESTED_MIXES = [
  'ra2.mix',
  'language.mix',
  'theme.mix',
  'audio.mix',
  'cache.mix',
  'local.mix',
  'conquer.mix',
  'generic.mix',
  'neutral.mix',
  'isogen.mix',
  'isotemp.mix',
  'isosnow.mix',
  'isourb.mix',
  'temperat.mix',
  'snow.mix',
  'urban.mix',
  'tem.mix',
  'sno.mix',
  'urb.mix',
  'cameo.mix',
  'cameomd.mix',
  'sidec01.mix',
  'sidec02.mix',
  'sidec03.mix',
  'sidecd01.mix',
  'sidecd02.mix',
];

export const EFFECT_ANIMATIONS = [
  'wclbolt1',
  'wclbolt2',
  'wclbolt3',
  'chronofd',
  'chronotg',
  'warpin',
  'warpout',
  'piffpiff',
  's_clsn22',
  'xgrysml2',
  'htrkpuff',
  'twlt070',
  's_bang48',
  's_brnl58',
  's_clsn58',
  's_tumu60',
];

export const PROJECTILE_SPRITES = ['dragon'];

export const DIALOG_SPRITE_FILES = ['bkgdsm', 'bkgdmd', 'bkgdlg', 'sidebttn'];

export const DIALOG_PCX_FILES = {
  'options-checkbox-on': 'cce_i.pcx',
  'options-checkbox-off': 'cue_i.pcx',
  'options-slider-thumb': 'trakgrip.pcx',
};

export const UI_FILES = [
  'sidebar.pal',
  'uibkgd.pal',
  ...[
    'top',
    'credits',
    'tabs',
    'radar',
    'side1',
    'side2',
    'side2b',
    'side3',
    'tab00',
    'tab01',
    'tab02',
    'tab03',
    'sell',
    'repair',
    'power',
    'powerp',
    ...DIALOG_SPRITE_FILES,
  ].map((name) => name + '.shp'),
];

// Descriptive aliases for the original ADDON, DIPLOBTN, OPTBTN, R-UP and R-DN
// sidebar artwork, addressed by their original MIX identifiers.
export const UI_HASH_FILES = {
  'bottom.shp': 0x7aebae6b,
  'menu-left.shp': 0x4a2edf14,
  'menu-right.shp': 0xfe67e97e,
  'scroll-up.shp': 0xc5c7f91c,
  'scroll-down.shp': 0xd29d01c1,
  'command-team1.shp': 0x0d2b157d,
  'command-team2.shp': 0x304b3ccd,
  'command-type.shp': 0x4a8b6fad,
  'command-deploy.shp': 0xf8abb3bd,
  'command-guard.shp': 0x826be0dd,
  'command-planning.shp': 0x003b770c,
  'command-background.shp': 0x26034352,
  'command-left.shp': 0x593cbe20,
  'command-right.shp': 0xbc1580c2,
};

export function wantedFiles(): Set<string> {
  const names = new Set([
    'palette.pal',
    'pips.shp',
    'pips2.shp',
    'oregath.shp',
    'unittem.pal',
    'unitsno.pal',
    'isotem.pal',
    'temperat.pal',
    'cameo.pal',
    'anim.pal',
    'voxels.vpl',
    'art.ini',
    'rules.ini',
    'sound.ini',
    'eva.ini',
    'game.fnt',
    'mouse.shp',
    'mousepal.pal',
    ...Object.values(DIALOG_PCX_FILES),
    ...EFFECT_ANIMATIONS.map((name) => name + '.shp'),
  ]);

  for (const name of PROJECTILE_SPRITES) names.add(`${name}.shp`);

  for (const name of IFV_TURRET_FILES) names.add(name);

  for (const spec of Object.values(CATALOG)) {
    const variants = (name: string) =>
      NATIVE_THEATERS.flatMap((theater) => theaterNames(name, theater));

    if (spec.kind === 'building')
      for (const variant of variants(spec.sprite + 'mk')) names.add(variant + '.shp');

    for (const name of [
      spec.sprite,
      ...(spec.overlays ?? []),
      ...(spec.bib ? [spec.bib] : []),
      ...(spec.turret ? [spec.turret] : []),
    ])
      for (const variant of variants(name)) {
        names.add(`${variant}.shp`);
        names.add(`${variant}.vxl`);
        names.add(`${variant}.hva`);
        names.add(`${variant}tur.vxl`);
        names.add(`${variant}tur.hva`);
        names.add(`${variant}barl.vxl`);
        names.add(`${variant}barl.hva`);
      }

    names.add(spec.cameo + '.shp');
  }

  // Alternate names in original art.ini / language archive.
  for (const name of [
    'e1',
    'e2',
    'jumpjet',
    'engn',
    'sreficon',
    'nradicon',
    'radranicon',
    'radrnam',
    'aoreicon',
    'soreicon',
    'nricon',
    'cameo',
  ])
    names.add(name + '.shp');

  for (const prefix of [
    'clear01',
    'rough01',
    'rough02',
    'water01',
    'water02',
    'sand01',
    'green01',
    'pave01',
  ])
    names.add(prefix + '.tem');

  for (const prefix of ['ruff01', 'sandy01', 'proad01', 'proad02', 'proad03'])
    names.add(prefix + '.tem');

  for (let i = 1; i <= 16; i++)
    for (const prefix of ['glat', 'clat']) names.add(`${prefix}${String(i).padStart(2, '0')}.tem`);

  for (let i = 1; i <= 20; i++) names.add(`clear${String(i).padStart(2, '0')}.tem`);

  for (const name of [
    'tib01',
    'tib02',
    'tib03',
    'tib04',
    'tib05',
    'tib06',
    'gem01',
    'tree01',
    'tree02',
    'tree03',
    'tree04',
    'tree05',
    'tree06',
    'tree07',
    'tree08',
    'gtree01',
    'gtree02',
    'explosml',
    'explomed',
    'explolrg',
    's_bang16',
    's_bang24',
    's_bang34',
  ]) {
    names.add(name + '.shp');
    names.add(name + '.tem');
  }

  for (const file of nativeTerrainFiles()) names.add(file);

  for (const theater of NATIVE_THEATERS) {
    const extension = THEATER_EXTENSION[theater];
    names.add(`iso${extension}.pal`);
    names.add(`unit${extension}.pal`);

    for (const name of [
      'caoild',
      'caoild_a',
      'caoild_ad',
      'caoild_f',
      'caairp',
      'caairp_a',
      'caairp_ad',
      'caairp_f',
    ])
      for (const variant of theaterNames(name, theater)) names.add(variant + '.shp');

    for (const name of nativeDecorationNames(theater)) names.add(`${name}.${extension}`);

    for (let i = 1; i <= 6; i++) names.add(`tib${String(i).padStart(2, '0')}.${extension}`);
    names.add(`gem01.${extension}`);
  }

  for (const file of ['temperat.ini', 'snow.ini', 'urban.ini', 'snow.pal', 'urban.pal'])
    names.add(file);

  return names;
}
