(() => {
  'use strict';

  const STORAGE_SONGS = 'ethereal-drum-songs-v1';
  const STORAGE_INSTRUMENT = 'ethereal-drum-instrument-v1';
  const STORAGE_VIEW = 'ethereal-drum-view-v2';
  const STORAGE_GUIDE = 'ethereal-drum-song-sound-v1';
  const STORAGE_WAIT = 'ethereal-drum-wait-pref-v1';
  const STORAGE_WAIT_STYLE = 'ethereal-drum-wait-style-v2';
  const STORAGE_ROTATION = 'ethereal-drum-rotation-v1';
  const STORAGE_PARTICLES = 'ethereal-drum-particles-v1';
  const STORAGE_EDITOR_DRAFTS = 'ethereal-drum-editor-drafts-v2';
  // Shared with the other Ethereal trainers: app-files/ethereal-common.js.
  const COMMON = window.EtherealCommon;
  const BEST = COMMON.createBestStore('ethereal-drum-best-v1');
  const MIC_CHECK_KEY = 'ethereal-drum-mic-check-v1';
  const STORAGE_EDITOR_PITCH_NAMES = 'ethereal-drum-editor-pitch-names-v1';
  const STORAGE_EDITOR_EXPRESSIVE_TIMING = 'ethereal-drum-editor-expressive-timing-v2';
  const STORAGE_EDITOR_DRAFT = 'ethereal-drum-editor-draft-v1';
  const STORAGE_HIDDEN_DEMOS = 'ethereal-drum-hidden-demos-v1';
  const STORAGE_WALKTHROUGH_COMPLETE = 'ethereal-drum-walkthrough-hidden-v2';
  const STORAGE_MODE_WALKTHROUGHS = 'ethereal-drum-mode-walkthroughs-hidden-v2';
  const COMMUNITY_REVIEW_FINGERPRINT_VERSION = 'v1';
  const SONG_FORMAT = 'ethereal-drum-song-v3';
  const LEGACY_SONG_FORMAT = 'ethereal-drum-song-v2';
  const COMMUNITY_UPLOAD_URL = String(window.ETHEREAL_COMMUNITY_UPLOAD_URL || '').trim();
  const COMMUNITY_STATUS_CALLBACK = 'etherealCommunityUploadStatus';
  const NOTE_COLORS = ['#a78bfa', '#5eead4', '#fbbf24', '#fb7185', '#60a5fa', '#f472b6', '#34d399', '#f97316', '#c084fc', '#22d3ee', '#eab308', '#a3e635', '#fda4af', '#67e8f9', '#bef264'];
  const PARTICLE_QUALITY_ORDER = ['none', 'half', 'full'];

  const SCALE_INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    'major-pentatonic': [0, 2, 4, 7, 9],
    'minor-pentatonic': [0, 3, 5, 7, 10]
  };
  const SCALE_NAMES = {
    major: 'major',
    'major-pentatonic': 'major pentatonic',
    'minor-pentatonic': 'minor pentatonic',
    custom: 'custom tuning',
    any: 'any tuning'
  };
  const ROOT_PITCH_CLASS = { C: 0, D: 2 };
  const KEY_NOTE_MAP = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '0': 9, q: 10, w: 11, e: 12, r: 13, t: 14, y: 15, u: 16, i: 17, o: 18, p: 19 };
  // Playback tuning standard. The 432 Hz option was removed from the UI: it confused
  // beginners and only affects synthesised pitch, never the notes, layout or songs.
  const REFERENCE_PITCH = 440;
  const DOT_ABOVE = '̇';
  const DOT_BELOW = '̣';
  // Companion notes are stored as scale-degree offsets so C and D instruments
  // transpose together instead of leaving the companion fixed in D major.
  const HIGH_DRUM_SPEC = [
    { label: `1${DOT_ABOVE}`, offset: 12 },
    { label: `2${DOT_ABOVE}`, offset: 14 },
    { label: `3${DOT_ABOVE}`, offset: 16 },
    { label: `4${DOT_ABOVE}`, offset: 17 },
    { label: `5${DOT_ABOVE}`, offset: 19 },
    { label: `6${DOT_ABOVE}`, offset: 21 },
    { label: `7${DOT_ABOVE}`, offset: 23 },
    { label: `1${DOT_ABOVE}${DOT_ABOVE}`, offset: 24 }
  ];
  const NOTE_GUIDE_SPEC = [
    { label: `3${DOT_BELOW}`, offset: -8 },
    { label: `4${DOT_BELOW}`, offset: -7 },
    { label: `5${DOT_BELOW}`, offset: -5 },
    { label: `6${DOT_BELOW}`, offset: -3 },
    { label: `7${DOT_BELOW}`, offset: -1 },
    { label: '1', offset: 0 },
    { label: '2', offset: 2 },
    { label: '3', offset: 4 },
    { label: '4', offset: 5 },
    { label: '5', offset: 7 },
    { label: '6', offset: 9 },
    { label: '7', offset: 11 },
    { label: `1${DOT_ABOVE}`, offset: 12 },
    { label: `2${DOT_ABOVE}`, offset: 14 },
    { label: `3${DOT_ABOVE}`, offset: 16 },
    { label: `4${DOT_ABOVE}`, offset: 17, companionOnly: true },
    { label: `5${DOT_ABOVE}`, offset: 19, companionOnly: true },
    { label: `6${DOT_ABOVE}`, offset: 21, companionOnly: true },
    { label: `7${DOT_ABOVE}`, offset: 23, companionOnly: true },
    { label: `1${DOT_ABOVE}${DOT_ABOVE}`, offset: 24, companionOnly: true }
  ];
  // CSS width of .stage-drum-wrap / .drum-body in the centre-drum view (see styles.css).
  const STAGE_DRUM_BASE = 360;
  const COUNT_IN_INTERVAL_MS = 1000;
  const AUDIO_LOOKAHEAD_SECONDS = 0.12;
  const AUDIO_SCHEDULER_INTERVAL_MS = 25;
  const INSTRUMENT_SETTINGS_FORMAT = 'ethereal-drum-settings-v1';
  const WALKTHROUGH_STEPS = [
    {
      target: '#noteStage',
      title: 'Watch the song come to life',
      text: 'The Wind Rises is playing as a visual preview. Notes fly towards the matching tongues, so you can see what comes next.'
    },
    {
      target: '#songList',
      title: 'Demo songs and My songs',
      text: 'Demo songs come from the owner-curated demo folder. Your own created and imported songs appear directly underneath in My songs.'
    },
    {
      target: '#libraryBtn',
      title: 'Community songs',
      text: 'Open the Community gallery to browse approved songs by difficulty. Your own songs stay private in this browser unless you submit one for review.'
    },
    {
      target: '#editBtn',
      title: 'Song Builder',
      text: 'Edit the selected song or choose New song to create your own. Add numbers, chords, rests, timing, and Jianpu notation.'
    },
    {
      target: '#helpTourBtn',
      title: 'Help when you need it',
      text: 'Click ? in Listen to replay this tour. In Practice, Wait for note, or Tuner, the same button replays help for that mode.'
    }
  ];
  const MODE_WALKTHROUGH_STEPS = {
    practice: [
      {
        target: '[data-mode="practice"]',
        title: 'Practice mode',
        text: 'Play along with the moving song. Use the screen, computer keyboard, or microphone with your real drum.'
      },
      {
        target: '#noteStage',
        title: 'Follow the incoming notes',
        text: 'Play each number as it reaches the drum. Correct notes light up; an incorrect note leaves the song running so you can continue.'
      },
      {
        target: '.stat-pills',
        title: 'Build your score and streak',
        text: 'Score shows your accuracy. Streak counts consecutive correct notes, and notes left shows how much of the song remains.'
      }
    ],
    wait: [
      {
        target: '#waitToggleLabel',
        title: 'Wait for note mode',
        text: 'Tick Wait for note in Practice when you want to learn slowly. The song stops at each step until you play the correct note.'
      },
      {
        target: '#noteStage',
        title: 'One note at a time',
        text: 'The expected tongue is highlighted. Tap it on screen, press its keyboard key, or play it through the microphone.'
      },
      {
        target: '#micBtn',
        title: 'Use your real drum',
        text: 'Turn on the microphone if you want the trainer to recognise your drum. You can still use the screen or keyboard without it.'
      }
    ],
    tuner: [
      {
        target: '[data-mode="tuner"]',
        title: 'Tuner mode',
        text: 'Tuner listens to one tongue at a time and compares its pitch with the selected instrument setup.'
      },
      {
        target: '#micBtn',
        title: 'Allow microphone access',
        text: 'Turn on the microphone, then strike one tongue clearly. A quiet room gives the most stable result.'
      },
      {
        target: '#tunerPanel',
        title: 'Read the pitch meter',
        text: 'The centre is in tune. The left side is flat and the right side is sharp. Small differences are normal while a tongue rings out.'
      }
    ]
  };

  const DRUM_LAYOUTS = {
    // 6-note C major pentatonic: tonic at the bottom, then left/right pairs climbing to the
    // octave at the top.
    6: [
      { xp: 0, yp: 32.50, size: 'large', rotate: 180 },       // 1   tonic  (bottom)
      { xp: -28.15, yp: 16.25, size: 'large', rotate: -120 }, // 2
      { xp: 28.15, yp: 16.25, size: 'large', rotate: 120 },   // 3
      { xp: -28.15, yp: -16.25, size: 'large', rotate: -60 }, // 5
      { xp: 28.15, yp: -16.25, size: 'large', rotate: 60 },   // 6
      { xp: 0, yp: -32.50, size: 'large', rotate: 0 }         // 1̇  octave (top)
    ],
    // Satori 8-note, C major from the tonic. Cardinals carry 1 2 3 4, diagonals 5 6 7 1̇,
    // exactly as they are stamped on the drum.
    8: [
      { xp: 0, yp: 33.0, size: 'large', rotate: 180 },        // 1   tonic  (bottom)
      { xp: -33.0, yp: 0, size: 'large', rotate: -90 },       // 2          (left)
      { xp: 33.0, yp: 0, size: 'large', rotate: 90 },         // 3          (right)
      { xp: 0, yp: -33.0, size: 'large', rotate: 0 },         // 4          (top)
      { xp: 25.10, yp: 25.10, size: 'small', rotate: 135 },   // 5
      { xp: -25.10, yp: 25.10, size: 'small', rotate: -135 }, // 6
      { xp: 25.10, yp: -25.10, size: 'small', rotate: 45 },   // 7
      { xp: -25.10, yp: -25.10, size: 'small', rotate: -45 }  // 1̇  octave
    ],
    // Satori 11-note, C major. Centre tongue is the lowest note; the next two sit at 12 and
    // 6 o'clock; the remaining eight alternate right/left while climbing towards the top.
    11: [
      { xp: 0, yp: -3.50, size: 'centerlarge', rotate: 0 },   // 5̣  lowest (centre)
      { xp: 0, yp: -34.00, size: 'large', rotate: 0 },        // 6̣         (top)
      { xp: 0, yp: 34.00, size: 'large', rotate: 180 },       // 7̣         (bottom)
      { xp: 21.75, yp: 29.93, size: 'small', rotate: 144 },   // 1   tonic
      { xp: -21.75, yp: 29.93, size: 'small', rotate: -144 }, // 2
      { xp: 35.19, yp: 11.43, size: 'small', rotate: 108 },   // 3
      { xp: -35.19, yp: 11.43, size: 'small', rotate: -108 }, // 4
      { xp: 35.19, yp: -11.43, size: 'small', rotate: 72 },   // 5
      { xp: -35.19, yp: -11.43, size: 'small', rotate: -72 }, // 6
      { xp: 21.75, yp: -29.93, size: 'small', rotate: 36 },   // 7
      { xp: -21.75, yp: -29.93, size: 'small', rotate: -36 }  // 1̇  octave
    ],
    // 13-note C major drum from the reference: G3 occupies the middle tongue.
    // The twelve outer tongues mirror the physical petal placement.
    13: [
      { xp: 0, yp: 0, size: 'centerlarge', rotate: 0 },       // 5̣  G3, centre
      { xp: 0, yp: -34.0, size: 'large', rotate: 0 },         // 6̣  A3
      { xp: 29.45, yp: -17.0, size: 'large', rotate: 60 },    // 7̣  B3
      { xp: -29.45, yp: -17.0, size: 'large', rotate: -60 },  // 1   C4
      { xp: -34.0, yp: 0, size: 'large', rotate: -90 },       // 2   D4
      { xp: 17.0, yp: 29.45, size: 'large', rotate: 150 },    // 3   E4
      { xp: -17.0, yp: 29.45, size: 'large', rotate: -150 },  // 4   F4
      { xp: 29.45, yp: 17.0, size: 'large', rotate: 120 },    // 5   G4
      { xp: -29.45, yp: 17.0, size: 'large', rotate: -120 },  // 6   A4
      { xp: 0, yp: 34.0, size: 'large', rotate: 180 },        // 7   B4
      { xp: 34.0, yp: 0, size: 'large', rotate: 90 },         // 1̇  C5
      { xp: 17.0, yp: -29.45, size: 'large', rotate: 30 },    // 2̇  D5
      { xp: -17.0, yp: -29.45, size: 'large', rotate: -30 }   // 3̇  E5
    ],
    // 15-note layout is expressed as a percentage of the drum diameter (xp/yp) so the
    // arrangement is identical at every drum size (sidebar, stage, mobile).
    // 14 tongues are spaced evenly at 360/14 = 25.714 deg (index 2 at 12 o'clock) and each
    // one is pushed out until its OUTER TIP sits at 48.9% of the diameter, so every tongue
    // keeps the same margin from the rim regardless of its length (like a real drum, see
    // the reference diagram). The seven long tongues reach further in, giving the
    // alternating long/short pattern of a real 15-note drum. Ring radius by class:
    //   small 41.42  topsmall 41.34  toplarge 36.00  large 34.30
    // The five long tongues carry the five lowest ring notes (G3 A3 B3 C#4 D4), mirrored
    // left/right, exactly as they sit on the physical drum.
    // Inner edges land at 19.70 (large) and 23.10 (toplarge).
    // Result: every edge-to-edge gap is 3.35-3.88%, nothing overlaps, nothing crosses 50%.
    // Index order follows DRUM_TUNINGS['15-major']: 2̇ 2 3̇ 3 1̇ 1 6 6̣ 4 4̣ 5 5̣ 7̣ 7 3̣
    15: [
      { xp: -32.39, yp: -25.83, size: 'small', rotate: -51.43 },    // 2̇  E5
      { xp: -15.62, yp: -32.44, size: 'toplarge', rotate: -25.71 }, // 2   E4
      { xp: 0, yp: -41.34, size: 'topsmall', rotate: 0 },           // 3̇  F#5
      { xp: 15.62, yp: -32.44, size: 'toplarge', rotate: 25.71 },   // 3   F#4
      { xp: 32.39, yp: -25.83, size: 'small', rotate: 51.43 },      // 1̇  D5
      { xp: 33.44, yp: -7.63, size: 'large', rotate: 77.14 },       // 1   D4
      { xp: 40.39, yp: 9.22, size: 'small', rotate: 102.86 },       // 6   B4
      { xp: 26.82, yp: 21.39, size: 'large', rotate: 128.57 },      // 6̣  B3
      { xp: 17.97, yp: 37.32, size: 'small', rotate: 154.29 },      // 4   G4
      { xp: 0, yp: 34.30, size: 'large', rotate: 180 },             // 4̣  G3
      { xp: -17.97, yp: 37.32, size: 'small', rotate: -154.29 },    // 5   A4
      { xp: -26.82, yp: 21.39, size: 'large', rotate: -128.57 },    // 5̣  A3
      { xp: -33.44, yp: -7.63, size: 'large', rotate: -77.14 },     // 7̣  C#4
      { xp: -40.39, yp: 9.22, size: 'small', rotate: -102.86 },     // 7   C#5
      { xp: 0, yp: -3.60, size: 'centerlarge', rotate: 0 }          // 3̣  F#3 (centre)
    ]
  };

  function defaultNoteColor(index) {
    return NOTE_COLORS[index % NOTE_COLORS.length];
  }

  function normaliseColor(value, index = 0) {
    return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value).toLowerCase() : defaultNoteColor(index);
  }

  function noteColor(index) {
    return normaliseColor(playableNoteAt(index)?.color, index);
  }

  function hexToRgb(hex) {
    const clean = normaliseColor(hex).slice(1);
    return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
  }

  const renderColorDataCache = new Map();
  const noteSpriteCache = new Map();
  const noteLabelSpriteCache = new Map();
  const glowTextureCache = new Map();
  const soundBufferCache = new Map();
  const drumPlacementCache = new Map();
  const padFlashTimers = new WeakMap();
  let companionNotesCache = null;
  let highDrumNotesCache = null;
  let playableNotesCache = null;
  let highDrumRouteCache = null;
  let soundCacheGeneration = 0;

  function invalidateInstrumentRuntimeCaches() {
    companionNotesCache = null;
    highDrumNotesCache = null;
    playableNotesCache = null;
    highDrumRouteCache = null;
    drumPlacementCache.clear();
    noteSpriteCache.clear();
    noteLabelSpriteCache.clear();
    if (typeof state !== 'undefined') {
      state.staticGuideCanvas = null;
      state.staticGuideKey = '';
      state.laneGuideCanvas = null;
      state.laneGuideKey = '';
    }
  }

  function renderColorData(hex) {
    const color = normaliseColor(hex);
    if (renderColorDataCache.has(color)) return renderColorDataCache.get(color);
    const { r, g, b } = hexToRgb(color);
    const mix = amount => ({
      r: Math.round(r + (255 - r) * amount),
      g: Math.round(g + (255 - g) * amount),
      b: Math.round(b + (255 - b) * amount)
    });
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const data = { r, g, b, highlight: mix(.56), light: mix(.3), trail: mix(.38), ink: luminance > .58 ? '#101521' : '#ffffff' };
    renderColorDataCache.set(color, data);
    return data;
  }

  function noteInkColor(hex) {
    return renderColorData(hex).ink;
  }

  function setNoteColorVars(element, color) {
    const safe = normaliseColor(color);
    const { r, g, b } = hexToRgb(safe);
    element.style.setProperty('--note-color', safe);
    element.style.setProperty('--note-rgb', `${r}, ${g}, ${b}`);
    element.style.setProperty('--note-ink', noteInkColor(safe));
  }

  // Factory tunings of the physical drums, in tongue order (entry i sits in DRUM_LAYOUTS
  // slot i). Each entry is [jianpu number, semitones from the middle-octave tonic, octave
  // mark]. Changing key or lowest octave just slides the whole set.
  const DRUM_TUNINGS = {
    // C major pentatonic: C D E G A C'
    '6-major-pentatonic': [['1', 0], ['2', 2], ['3', 4], ['5', 7], ['6', 9], ['1', 12, 'up']],
    // Satori 8: one octave of the major scale, C..C'
    '8-major': [['1', 0], ['2', 2], ['3', 4], ['4', 5], ['5', 7], ['6', 9], ['7', 11], ['1', 12, 'up']],
    // Satori 11: G below the tonic up to the octave above, i.e. G3 A3 B3 C4..C5 in C major
    '11-major': [
      ['5', -5, 'down'], ['6', -3, 'down'], ['7', -1, 'down'],
      ['1', 0], ['2', 2], ['3', 4], ['4', 5], ['5', 7], ['6', 9], ['7', 11], ['1', 12, 'up']
    ],
    // 13-note C major: G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5.
    // The order follows the physical tongue positions in DRUM_LAYOUTS[13].
    '13-major': [
      ['5', -5, 'down'], ['6', -3, 'down'], ['7', -1, 'down'],
      ['1', 0], ['2', 2], ['3', 4], ['4', 5], ['5', 7], ['6', 9], ['7', 11],
      ['1', 12, 'up'], ['2', 14, 'up'], ['3', 16, 'up']
    ],
    // 15-note: 3̣ 4̣ 5̣ 6̣ 7̣ | 1 2 3 4 5 6 7 | 1̇ 2̇ 3̇, laid out to match the drum's tongues
    '15-major': [
      ['2', 14, 'up'], ['2', 2], ['3', 16, 'up'], ['3', 4], ['1', 12, 'up'], ['1', 0],
      ['6', 9], ['6', -3, 'down'], ['4', 5], ['4', -7, 'down'], ['5', 7], ['5', -5, 'down'],
      ['7', -1, 'down'], ['7', 11], ['3', -8, 'down']
    ]
  };

  const COUNT_DEFAULTS = {
    6: { key: 'C', scale: 'major-pentatonic', octave: 5 },
    8: { key: 'C', scale: 'major', octave: 5 },
    11: { key: 'C', scale: 'major', octave: 4 },
    13: { key: 'C', scale: 'major', octave: 4 },
    15: { key: 'D', scale: 'major', octave: 4 }
  };

  function buildTunedNotes(count, scaleType, key = 'C', rootOctave = 4) {
    const spec = DRUM_TUNINGS[`${count}-${scaleType}`];
    if (!spec) return null;
    const rootMidi = 12 * (Number(rootOctave) + 1) + ROOT_PITCH_CLASS[key];
    return spec.map(([base, offset, mark], i) => ({
      label: applyOctaveMark(base, mark || ''),
      midi: rootMidi + offset,
      color: defaultNoteColor(i)
    }));
  }

  function buildCompanionTunedNotes(key = 'D', rootOctave = 4) {
    const safeKey = ROOT_PITCH_CLASS[key] === undefined ? 'D' : key;
    const rootMidi = 12 * (Number(rootOctave) + 1) + ROOT_PITCH_CLASS[safeKey];
    return HIGH_DRUM_SPEC.map((preset, slot) => ({
      label: preset.label,
      midi: rootMidi + preset.offset,
      color: defaultNoteColor(15 + slot)
    }));
  }

  // Combining dots (U+0307 / U+0323) are positioned by the font, so their offset changes
  // from digit to digit. Split the mark off the label so it can be drawn as a centred dot.
  // `-` stays the rest so every saved song keeps its meaning; `0` is accepted as an
  // easier-to-type alias, and is what the numbered sheet has always drawn for a rest.
  // Jianpu keeps these apart and so do we. A 0 is a rest: nothing sounds for that beat. A
  // dash holds the note before it for another beat instead of striking it again. Neither
  // is struck, which is what isSilentCore covers.
  function isRestCore(core) {
    return core === '0';
  }

  function isHoldCore(core) {
    return core === '-';
  }

  function isSilentCore(core) {
    return isRestCore(core) || isHoldCore(core);
  }
  function splitOctaveMark(label) {
    const text = String(label ?? '');
    const upCount = [...text].filter(character => character === DOT_ABOVE).length;
    const downCount = [...text].filter(character => character === DOT_BELOW).length;
    if (upCount) return { base: text.split(DOT_ABOVE).join(''), mark: 'up', count: upCount };
    if (downCount) return { base: text.split(DOT_BELOW).join(''), mark: 'down', count: downCount };
    return { base: text, mark: '', count: 0 };
  }

  function applyOctaveMark(base, mark) {
    if (mark === 'up') return `${base}${DOT_ABOVE}`;
    if (mark === 'down') return `${base}${DOT_BELOW}`;
    return base;
  }

  function octaveMarkClass(octave) {
    if (!octave?.mark) return '';
    if (octave.mark === 'up' && octave.count > 1) return 'oct-up oct-up-double';
    return `oct-${octave.mark}`;
  }

  function highDrumEnabled() {
    return state.instrument?.count === 15 && Boolean(state.instrument?.highDrumEnabled);
  }

  function normaliseCompanionNotes(
    notes = [],
    key = state.instrument?.key || 'D',
    rootOctave = state.instrument?.rootOctave ?? 4
  ) {
    const presets = buildCompanionTunedNotes(key, rootOctave);
    return presets.map((preset, slot) => {
      const saved = notes[slot] || {};
      return {
        label: String(saved.label || preset.label),
        midi: Number(saved.midi) || preset.midi,
        color: normaliseColor(saved.color, 15 + slot)
      };
    });
  }

  function configuredCompanionNotes() {
    if (companionNotesCache) return companionNotesCache;
    companionNotesCache = normaliseCompanionNotes(
      state.instrument?.companionNotes,
      state.instrument?.key,
      state.instrument?.rootOctave
    );
    return companionNotesCache;
  }

  function companionMatchesPreset(notes, key, rootOctave) {
    if (!Array.isArray(notes) || notes.length !== HIGH_DRUM_SPEC.length) return false;
    const preset = buildCompanionTunedNotes(key, rootOctave);
    return preset.every((note, i) =>
      note.label.toLowerCase() === String(notes[i]?.label || '').toLowerCase()
      && note.midi === Number(notes[i]?.midi)
    );
  }

  function highDrumNotes() {
    if (highDrumNotesCache) return highDrumNotesCache;
    const mainNotes = state.instrument?.notes || [];
    let extraIndex = mainNotes.length;
    highDrumNotesCache = configuredCompanionNotes().map((preset, slot) => {
      const mainIndex = mainNotes.findIndex(note => note.label.toLowerCase() === preset.label.toLowerCase());
      if (mainIndex >= 0) {
        return {
          ...preset,
          noteIndex: mainIndex,
          slot,
          shared: true,
          source: 'high'
        };
      }
      const noteIndex = extraIndex++;
      return {
        ...preset,
        // Keep the companion tongue's configured color. The previous fallback replaced
        // custom companion colors with a palette color as soon as the note was routed
        // into the playable-note list.
        color: normaliseColor(preset.color, 15 + slot),
        noteIndex,
        slot,
        shared: false,
        source: 'high'
      };
    });
    return highDrumNotesCache;
  }

  function playableNotes() {
    if (playableNotesCache) return playableNotesCache;
    const main = (state.instrument?.notes || []).map((note, noteIndex) => ({
      ...note,
      noteIndex,
      source: 'main'
    }));
    playableNotesCache = highDrumEnabled()
      ? main.concat(highDrumNotes().filter(note => !note.shared))
      : main;
    return playableNotesCache;
  }

  function playableNoteAt(noteIndex) {
    return playableNotes()[noteIndex] || null;
  }

  function highDrumSlotForLabel(label) {
    if (!highDrumEnabled()) return -1;
    const normalisedLabel = String(label || '').toLowerCase();
    if (!highDrumRouteCache) {
      const mainLabels = new Set((state.instrument?.notes || []).map(note => String(note.label || '').toLowerCase()));
      highDrumRouteCache = new Map();
      configuredCompanionNotes().forEach((note, slot) => {
        const key = String(note.label || '').toLowerCase();
        highDrumRouteCache.set(key, mainLabels.has(key) ? -1 : slot);
      });
    }
    return highDrumRouteCache.get(normalisedLabel) ?? -1;
  }

  // The tonic ("1") of the middle octave, from the key + lowest-octave selects.
  function settingsTonicMidi() {
    const key = els.instrumentKeySelect?.value || 'C';
    const octave = Number(els.rootOctaveSelect?.value ?? 4);
    return 12 * (octave + 1) + (ROOT_PITCH_CLASS[key] ?? 0);
  }

  // Which octave dot a pitch calls for. Above the middle octave -> dot above,
  // below it -> dot below, inside it -> no dot. This is decided by the pitch, so the
  // editor only has to ask "dot or no dot", never "which dot".
  function octaveMarkForMidi(midi, tonicMidi = settingsTonicMidi()) {
    if (!Number.isFinite(midi)) return '';
    if (midi > tonicMidi + 11) return 'up';
    if (midi < tonicMidi) return 'down';
    return '';
  }

  function hasCenterTongue(count = state.instrument?.count) {
    return count === 11 || count === 13 || count === 15;
  }

  const fallbackPresets = [
    {
      id: 'moonlit-steps',
      title: 'Moonlit Steps',
      bpm: 72,
      scaleType: 'major',
      builtIn: true,
      sequence: '1 3 5 3 | 2 4 6 4 | 1 3 5 6 | 5 3 2 -'
    },
    {
      id: 'little-star',
      title: 'Twinkle Twinkle Little Star',
      bpm: 82,
      scaleType: 'major',
      builtIn: true,
      sequence: '1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 - | 5 5 4 4 | 3 3 2 - | 5 5 4 4 | 3 3 2 - | 1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 -'
    },
    {
      id: 'calm-water',
      title: 'Calm Water',
      bpm: 60,
      scaleType: 'major',
      builtIn: true,
      sequence: '1+5 - 3 2 | 4 - 6 5 | 3 2 1 - | 2+5 - 4 3'
    },
    {
      id: 'note-scale-practice',
      title: 'Note Scale Practice',
      bpm: 72,
      scaleType: 'major-pentatonic',
      builtIn: true,
      sequence: '1 2 3 5 | 6 1̇ 6 5 | 3 2 1 -'
    },
    {
      id: 'the-wind-rises',
      title: 'The Wind Rises 起风了',
      bpm: 130,
      scaleType: 'major',
      builtIn: true,
      sequence: '- - | 1:0.5 2:0.5 3:0.5 1:0.5 | 6+4̣ 5:0.5 6:0.5 -:0.25 -:0.25 -:0.25 1:0.25 | 7+5̣ 6:0.5 7:0.5 - | 7+3̣ 6:0.5 7:0.5 -:0.25 -:0.25 -:0.25 3:0.25 | 1̇+6̣ 2:0.25 1:0.25 7:0.25 6:0.25 5 | 6+4̣ 5:0.5 6:0.5 -:0.25 5:0.25 6:0.25 5:0.25 | 6+5̣ 5:0.5 2:0.5 - 5:0.5 -:0.5 | 3+3̣ 5̣:0.5 1 - | 1̇+5̣ 2:0.5 3:0.5 1:0.5 | 6+4̣ 5:0.5 6:0.5 -:0.25 -:0.25 -:0.25 1:0.25 | 7+5̣ 6:0.5 7:0.5 - | 7+3̣ 6:0.5 7:0.5 -:0.25 -:0.25 -:0.25 3:0.25 | 1̇+6̣ 2:0.25 1:0.25 7:0.25 6:0.25 5 | 6+4̣ 3̇:0.5 3̇:0.5 -:0.25 -:0.25 5:0.25 -:0.25 | 6+4̣ 3̇:0.5 3̇:0.5 - 5:0.5 6:0.5 | 6+6̣ 1 3 - - - - - |'
    }
  ];

  function demoCatalogId(song, index) {
    const source = String(song?.id || song?.title || `demo-${index + 1}`);
    return source.toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `demo-${index + 1}`;
  }

  const hasDemoCatalog = Array.isArray(window.ETHEREAL_DEMO_SONGS);
  const discoveredDemos = hasDemoCatalog
    ? window.ETHEREAL_DEMO_SONGS
      .filter(song => song && song.title && song.sequence && Number(song.bpm))
      .map((song, index) => ({
        ...song,
        id: demoCatalogId(song, index),
        builtIn: true,
        folder: 'demo'
      }))
    : [];

  const presets = hasDemoCatalog ? discoveredDemos : fallbackPresets;
  const discoveredCommunity = Array.isArray(window.ETHEREAL_COMMUNITY_SONGS)
    ? window.ETHEREAL_COMMUNITY_SONGS
      .filter(song => song && song.title && song.sequence && Number(song.bpm))
      .map((song, index) => ({
        ...song,
        id: `community-${demoCatalogId(song, index)}`,
        builtIn: true,
        folder: 'community'
      }))
    : [];
  let curatedSongs = [...presets, ...discoveredCommunity];
  let activeDemoCatalogVersion = String(window.ETHEREAL_DEMO_CATALOG_VERSION || '');
  let demoCatalogPollBusy = false;
  let walkthroughStepIndex = 0;
  let walkthroughKind = 'main';
  let activeWalkthroughSteps = WALKTHROUGH_STEPS;
  let walkthroughPreviewState = null;
  let communityUploadRequest = null;


  function catalogSongsFromGlobals() {
    const demos = Array.isArray(window.ETHEREAL_DEMO_SONGS)
      ? window.ETHEREAL_DEMO_SONGS
        .filter(song => song && song.title && song.sequence && Number(song.bpm))
        .map((song, index) => ({ ...song, id: demoCatalogId(song, index), builtIn: true, folder: 'demo' }))
      : [];
    const community = Array.isArray(window.ETHEREAL_COMMUNITY_SONGS)
      ? window.ETHEREAL_COMMUNITY_SONGS
        .filter(song => song && song.title && song.sequence && Number(song.bpm))
        .map((song, index) => ({ ...song, id: `community-${demoCatalogId(song, index)}`, builtIn: true, folder: 'community' }))
      : [];
    return [...demos, ...community];
  }

  function applyCatalogGlobals({ announce = false } = {}) {
    const nextCurated = catalogSongsFromGlobals();
    const customSongs = state.songs.filter(song => !song.builtIn);
    const selectedBefore = state.selectedId;
    curatedSongs = nextCurated;
    state.songs = [
      ...curatedSongs.filter(song => !state.hiddenDemoIds.has(song.id)).map(song => normaliseSong(song, 'major')),
      ...customSongs
        .filter(song => !curatedSongs.some(publicSong => publicSong.id === song.id))
        .filter(song => !isBundledScalePractice(song))
        .map(song => normaliseSong(song, 'any'))
    ];
    if (!state.songs.some(song => song.id === selectedBefore)) {
      state.selectedId = state.songs[0]?.id || null;
      if (state.selectedId) selectSong(state.selectedId);
      else { renderSongList(); renderSongLibrary(); }
    } else {
      state.selectedId = selectedBefore;
      renderSongList();
      renderSongLibrary();
    }
    if (announce) showToast('Song folders updated.', 'success');
  }

  const state = {
    songs: [],
    selectedId: null,
    instrument: null,
    parsedNotes: [],
    duration: 0,
    currentTime: 0,
    playing: false,
    countInActive: false,
    countInRemaining: 0,
    playbackStartedAt: 0,
    pausedAt: 0,
    speed: 1,
    mode: 'demo',
    visualMode: 'radial',
    metronome: false,
    loop: false,
    loopTimer: 0,
    loopA: null,
    loopB: null,
    sectionLoop: false,
    animationId: 0,
    audioContext: null,
    masterGain: null,
    lastScheduledIndex: -1,
    lastVisualFlashIndex: -1,
    lastMetronomeBeat: -1,
    audioSchedulerId: 0,
    scheduledAudioNodes: new Set(),
    score: 0,
    attempts: 0,
    streak: 0,
    bestStreak: 0,
    hitNotes: new Set(),
    missedNoteIds: new Set(),
    lastResultMissed: [],
    recommendedSongId: null,
    waitingIndex: 0,
    waitStyle: 'game',
    rhythmBoxesEnabled: false,
    rhythmBoxesQueued: false,
    drumRotation: 0,
    particleCanUpgrade: false,
    micLastNote: -1,
    micLastAt: 0,
    focusModeIgnorePop: false,
    focusMode: false,
    libraryTab: 'all',
    editorSongId: null,
    editorDraftKey: 'new',
    editorSelectionStart: 0,
    editorSelectionEnd: 0,
    editorTimeline: [],
    editorTimingSelectionIndex: -1,
    editorTimingSelection: [],
    editorRangeSelectArmed: false,
    scanResult: null,
    draftSaveTimer: 0,
    expressiveTimingEnabled: false,
    showPitchNames: false,
    collapsedSongGroups: new Set(),
    hiddenDemoIds: new Set(),
    resizeObserver: null,
    colourTargetRow: null,
    stars: [],
    ambientId: 0,
    lastFrameAt: 0,
    lastVisualAt: 0,
    lastUiAt: 0,
    lastAmbientAt: 0,
    lastBackdropAt: 0,
    lastCompanionUiAt: 0,
    backdropMode: '',
    performanceProfile: null,
    backgroundRateScale: 1,
    particleQuality: '',
    particleProfileName: '',
    visualMonitorStartedAt: 0,
    visualMonitorSamples: 0,
    visualMonitorSlowSamples: 0,
    visualMonitorCostAverage: 0,
    visualMonitorLastFrameAt: 0,
    staticGuideCanvas: null,
    staticGuideKey: '',
    laneGuideCanvas: null,
    laneGuideKey: '',
    stageDrumGeometryKey: '',
    expectedPadSignature: '',
    expectedPadAnchor: null,
    particlePhaseCache: new Map(),
    stageTonguePads: [],
    tonguePadsByNote: new Map(),
    companionGeometryCache: null,
    companionGuideGeometryKey: '',
    micEnabled: false,
    micStream: null,
    micSource: null,
    micAnalyser: null,
    micTimeData: null,
    micAnimationId: 0,
    micPendingTimer: 0,
    micNoiseFloor: 0.008,
    micWasLoud: false,
    micLastTrigger: 0,
    tunerResult: null,
    perfEnabled: new URLSearchParams(window.location.search).has('perf'),
    perfOverlay: null,
    perfFrameCount: 0,
    perfRenderTotal: 0,
    perfLastReportAt: 0,
    perfVisibleNotes: 0,
    catalogPollTimer: 0
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    startupLoader: $('startupLoader'), startupLoaderStatus: $('startupLoaderStatus'), startupLoaderFill: $('startupLoaderFill'), startupLoaderCount: $('startupLoaderCount'),
    sidebar: $('sidebar'), sidebarClose: $('sidebarClose'), sidebarScrim: $('sidebarScrim'), menuBtn: $('menuBtn'), songList: $('songList'), songSearch: $('songSearch'),
    newSongBtn: $('newSongBtn'), importBtn: $('importBtn'), importFile: $('importFile'), libraryBtn: $('libraryBtn'), libraryCountBadge: $('libraryCountBadge'), exportBtn: $('exportBtn'), deleteBtn: $('deleteBtn'), restoreDemosBtn: $('restoreDemosBtn'),
    currentTitle: $('currentTitle'), currentCollection: $('currentCollection'), currentDifficulty: $('currentDifficulty'), editBtn: $('editBtn'), settingsBtn: $('settingsBtn'), helpTourBtn: $('helpTourBtn'), mobileViewToggleBtn: $('mobileViewToggleBtn'), instrumentTitle: $('instrumentTitle'),
    noteCanvas: $('noteCanvas'), noteCanvasBack: $('noteCanvasBack'), noteStage: $('noteStage'), playBtn: $('playBtn'), loopBtn: $('loopBtn'), metronomeBtn: $('metronomeBtn'), focusModeBtn: $('focusModeBtn'),
    progress: $('progress'), elapsedLabel: $('elapsedLabel'), durationLabel: $('durationLabel'), speedSelect: $('speedSelect'), countInToggle: $('countInToggle'),
    setABtn: $('setABtn'), setBBtn: $('setBBtn'), abLoopBtn: $('abLoopBtn'), clearABBtn: $('clearABBtn'), abLoopStatus: $('abLoopStatus'), abMarkerA: $('abMarkerA'), abMarkerB: $('abMarkerB'),
    totalNotesLabel: $('totalNotesLabel'), tempoLabel: $('tempoLabel'), countIn: $('countIn'), scorePill: $('scorePill'), scoreValue: $('scoreValue'), streakPill: $('streakPill'), streakValue: $('streakValue'), notesLeftValue: $('notesLeftValue'), mobileScorePill: $('mobileScorePill'), mobileScoreValue: $('mobileScoreValue'), mobileStreakPill: $('mobileStreakPill'), mobileStreakValue: $('mobileStreakValue'), mobileNotesLeftValue: $('mobileNotesLeftValue'), modeHint: $('modeHint'),
    trainerGrid: $('trainerGrid'), practiceCard: $('practiceCard'), drumWrap: $('drumWrap'), stageDrumWrap: $('stageDrumWrap'), highDrumWrap: $('highDrumWrap'), keyboardHint: $('keyboardHint'), nextNoteValue: $('nextNoteValue'), nextNoteTime: $('nextNoteTime'),
    editorDialog: $('editorDialog'), editorForm: $('editorForm'), editorHeading: $('editorHeading'), songTitleInput: $('songTitleInput'), songBpmInput: $('songBpmInput'),
    sequenceInput: $('sequenceInput'), sequenceBackdrop: $('sequenceBackdrop'), copySequenceBtn: $('copySequenceBtn'), exportSheetBtn: $('exportSheetBtn'),
    printSheet: $('printSheet'),
    draftNotice: $('draftNotice'), draftNoticeText: $('draftNoticeText'), discardDraftBtn: $('discardDraftBtn'), songScaleSelect: $('songScaleSelect'), miniPads: $('miniPads'), expressiveTimingToggle: $('expressiveTimingToggle'), timingEditor: $('timingEditor'), timingTokenStrip: $('timingTokenStrip'), timingChoiceGroup: $('timingChoiceGroup'), timingTieBtn: $('timingTieBtn'), timingDotBtn: $('timingDotBtn'), timingRangeBtn: $('timingRangeBtn'), selectedTimingLabel: $('selectedTimingLabel'), appendChordBtn: $('appendChordBtn'), appendRestBtn: $('appendRestBtn'), appendBarBtn: $('appendBarBtn'), clearSequenceBtn: $('clearSequenceBtn'), showPitchNamesToggle: $('showPitchNamesToggle'), saveSongBtn: $('saveSongBtn'), deleteEditorBtn: $('deleteEditorBtn'), editorGuideBtn: $('editorGuideBtn'), songGuideDialog: $('songGuideDialog'), songGuideContent: $('songGuideContent'), communityDialog: $('communityDialog'), communitySelection: $('communitySelection'), submitCommunityBtn: $('submitCommunityBtn'), communityUploadProgress: $('communityUploadProgress'), communityUploadStatus: $('communityUploadStatus'), communityUploadPercent: $('communityUploadPercent'), communityProgressTrack: $('communityProgressTrack'), communityProgressFill: $('communityProgressFill'),
    songLibraryDialog: $('songLibraryDialog'), libraryTabAll: $('libraryTabAll'), libraryTabEasy: $('libraryTabEasy'), libraryTabMedium: $('libraryTabMedium'), libraryTabHard: $('libraryTabHard'), libraryTabExpert: $('libraryTabExpert'), librarySearch: $('librarySearch'), libraryGrid: $('libraryGrid'), libraryEmpty: $('libraryEmpty'), libraryCommunityBanner: $('libraryCommunityBanner'), libraryCommunityInfoBtn: $('libraryCommunityInfoBtn'), communitySongsCount: $('communitySongsCount'), communityEasyCount: $('communityEasyCount'), communityMediumCount: $('communityMediumCount'), communityHardCount: $('communityHardCount'), communityExpertCount: $('communityExpertCount'),
    myDrumDialog: $('myDrumDialog'), myDrumTitle: $('myDrumTitle'), myDrumBadges: $('myDrumBadges'), myDrumPreview: $('myDrumPreview'), myDrumNoteCount: $('myDrumNoteCount'), myDrumNoteList: $('myDrumNoteList'), myDrumCompanion: $('myDrumCompanion'), myDrumCompanionPreview: $('myDrumCompanionPreview'), exportInstrumentBtn: $('exportInstrumentBtn'), exportInstrumentFromSettingsBtn: $('exportInstrumentFromSettingsBtn'), importInstrumentBtn: $('importInstrumentBtn'), importInstrumentFile: $('importInstrumentFile'), editInstrumentBtn: $('editInstrumentBtn'),
    settingsDialog: $('settingsDialog'), settingsForm: $('settingsForm'), instrumentKeySelect: $('instrumentKeySelect'), scaleTypeSelect: $('scaleTypeSelect'), noteCountSelect: $('noteCountSelect'), rootOctaveSelect: $('rootOctaveSelect'), highDrumOption: $('highDrumOption'), highDrumAvailability: $('highDrumAvailability'), highDrumToggle: $('highDrumToggle'), highDrumAlwaysToggle: $('highDrumAlwaysToggle'), companionTuningSection: $('companionTuningSection'), companionTuningGrid: $('companionTuningGrid'), colourPopover: $('colourPopover'), pitchInfoBtn: $('pitchInfoBtn'), pitchInfo: $('pitchInfo'), noteGuideBody: $('noteGuideBody'), noteGuideOctave: $('noteGuideOctave'), tuningGrid: $('tuningGrid'), saveSettingsBtn: $('saveSettingsBtn'),
    scanSheetBtn: $('scanSheetBtn'), scanDialog: $('scanDialog'), scanDrop: $('scanDrop'), scanFile: $('scanFile'),
    scanCanvas: $('scanCanvas'), scanStatus: $('scanStatus'), scanGroups: $('scanGroups'), scanApplyBtn: $('scanApplyBtn'), scanStage: $('scanStage'),
    toast: $('toast'), catalogUpdateBanner: $('catalogUpdateBanner'), catalogUpdateRefreshBtn: $('catalogUpdateRefreshBtn'), catalogUpdateLaterBtn: $('catalogUpdateLaterBtn'), micBtn: $('micBtn'), micStatus: $('micStatus'), stopBtn: $('stopBtn'), guideBtn: $('guideBtn'), installBtn: $('installBtn'), installDialog: $('installDialog'), installHelpText: $('installHelpText'), waitToggle: $('waitToggle'), fullscreenBtn: $('fullscreenBtn'), soundWakeBtn: $('soundWakeBtn'), hintPop: $('hintPop'), learnBtn: $('learnBtn'), topNewSongBtn: $('topNewSongBtn'), stageDock: $('stageDock'), dockLoopBtn: $('dockLoopBtn'), dockPlayBtn: $('dockPlayBtn'), dockMetronomeBtn: $('dockMetronomeBtn'), speedCycleBtn: $('speedCycleBtn'), speedCycleValue: $('speedCycleValue'), rotateLeftBtn: $('rotateLeftBtn'), rotateRightBtn: $('rotateRightBtn'), waitStyleSelect: $('waitStyleSelect'), stagePracticeChips: $('stagePracticeChips'), stageWaitBtn: $('stageWaitBtn'), stageMicBtn: $('stageMicBtn'), allDraftsBtn: $('allDraftsBtn'), draftsDialog: $('draftsDialog'), draftsList: $('draftsList'), draftsEmpty: $('draftsEmpty'), editChoiceDialog: $('editChoiceDialog'), choiceEditBtn: $('choiceEditBtn'), choiceEditNote: $('choiceEditNote'), choiceNewBtn: $('choiceNewBtn'), choiceDraftsBtn: $('choiceDraftsBtn'), resultBest: $('resultBest'), resultFasterBtn: $('resultFasterBtn'), resultSlowerBtn: $('resultSlowerBtn'), micCheckBtn: $('micCheckBtn'), songSwitchDialog: $('songSwitchDialog'), switchKeepBtn: $('switchKeepBtn'), switchChooseBtn: $('switchChooseBtn'), rhythmBoxesToggle: $('rhythmBoxesToggle'), rhythmBoxes: $('rhythmBoxes'),
    tourOverlay: $('tourOverlay'), tourShadeTop: $('tourShadeTop'), tourShadeRight: $('tourShadeRight'), tourShadeBottom: $('tourShadeBottom'), tourShadeLeft: $('tourShadeLeft'), tourFocusRing: $('tourFocusRing'), tourCard: $('tourCard'), tourProgress: $('tourProgress'), tourTitle: $('tourTitle'), tourText: $('tourText'), tourSkipBtn: $('tourSkipBtn'), tourBackBtn: $('tourBackBtn'), tourNextBtn: $('tourNextBtn'), tourDontShowAgain: $('tourDontShowAgain'),
    tunerPanel: $('tunerPanel'), tunerLabel: $('tunerLabel'), tunerNoteName: $('tunerNoteName'), tunerCents: $('tunerCents'), tunerMeter: $('tunerMeter'), tunerNeedle: $('tunerNeedle'),
    resultDialog: $('resultDialog'), resultTitle: $('resultTitle'), resultSummary: $('resultSummary'), resultStats: $('resultStats'), resultHitValue: $('resultHitValue'), resultAccuracyValue: $('resultAccuracyValue'), resultStreakValue: $('resultStreakValue'), resultMistakes: $('resultMistakes'), resultRecommendation: $('resultRecommendation'), resultRecommendedBtn: $('resultRecommendedBtn'), resultReplayBtn: $('resultReplayBtn'), practiceMistakesBtn: $('practiceMistakesBtn'), resultNextBtn: $('resultNextBtn')
  };

  function makePresetInstrument(count = 6, key = 'C', rootOctave = 4, referencePitch = REFERENCE_PITCH, scaleType = 'major') {
    const safeKey = ROOT_PITCH_CLASS[key] === undefined ? 'C' : key;
    const safeScale = SCALE_INTERVALS[scaleType] ? scaleType : 'major';
    let notes = buildTunedNotes(count, safeScale, safeKey, Number(rootOctave));
    if (!notes) {
      const intervals = SCALE_INTERVALS[safeScale];
      const rootMidi = 12 * (Number(rootOctave) + 1) + ROOT_PITCH_CLASS[safeKey];
      notes = Array.from({ length: count }, (_, i) => ({
        label: String(i + 1),
        midi: rootMidi + Math.floor(i / intervals.length) * 12 + intervals[i % intervals.length],
        color: defaultNoteColor(i)
      }));
    }
    return {
      count,
      key: safeKey,
      scaleType: safeScale,
      rootOctave: Number(rootOctave),
      referencePitch: Number(referencePitch),
      name: `${count}-note ${safeKey} ${SCALE_NAMES[safeScale]} drum`,
      notes
    };
  }

  function makeDefaultInstrument(count = 15) {
    if (count === 15) {
      return {
        ...makePresetInstrument(15, 'D', 4, 440, 'major'),
        highDrumEnabled: true,
        highDrumAlwaysVisible: false,
        companionNotes: buildCompanionTunedNotes('D', 4)
      };
    }
    if (count === 8 || count === 11 || count === 13) return makePresetInstrument(count, 'C', 4, 440, 'major');
    return makePresetInstrument(count, 'C', 4, 440, 'major-pentatonic');
  }

  function detectPreset(notes) {
    if (!notes?.length) return { key: 'C', scaleType: 'custom' };
    for (const key of ['C', 'D']) {
      for (const scaleType of Object.keys(SCALE_INTERVALS)) {
        const octave = Math.floor(Number(notes[0].midi) / 12) - 1;
        const expected = makePresetInstrument(notes.length, key, octave, 440, scaleType).notes;
        if (expected.every((note, i) => note.midi === Number(notes[i]?.midi))) return { key, scaleType };
      }
    }
    const firstPitchClass = ((Number(notes[0]?.midi) % 12) + 12) % 12;
    return { key: firstPitchClass === ROOT_PITCH_CLASS.D ? 'D' : 'C', scaleType: 'custom' };
  }

  function normaliseInstrument(instrument) {
    if (!instrument || !Array.isArray(instrument.notes)) return makeDefaultInstrument(15);
    const count = Number(instrument.count) || instrument.notes.length;
    if (count === 12) {
      const replacement = makeDefaultInstrument(13);
      replacement.notes.forEach((note, i) => {
        note.color = normaliseColor(instrument.notes[i]?.color, i);
      });
      return replacement;
    }
    const detected = detectPreset(instrument.notes);
    const key = ['C', 'D'].includes(instrument.key) ? instrument.key : detected.key;
    const scaleType = ['major', 'major-pentatonic', 'minor-pentatonic', 'custom'].includes(instrument.scaleType)
      ? instrument.scaleType
      : detected.scaleType;
    const rootOctave = Number.isFinite(Number(instrument.rootOctave))
      ? Number(instrument.rootOctave)
      : Math.floor((Number(instrument.notes[0]?.midi) || 60) / 12) - 1;
    const referencePitch = REFERENCE_PITCH;
    const savedCompanion = instrument.companionNotes;
    const shouldMigrateCompanion = count === 15
      && key === 'C'
      && scaleType !== 'custom'
      && companionMatchesPreset(savedCompanion, 'D', rootOctave);
    const companionNotes = shouldMigrateCompanion
      ? buildCompanionTunedNotes('C', rootOctave).map((note, i) => ({
          ...note,
          color: normaliseColor(savedCompanion[i]?.color, 15 + i)
        }))
      : normaliseCompanionNotes(savedCompanion, key, rootOctave);
    return {
      ...instrument,
      count,
      key,
      scaleType,
      rootOctave,
      referencePitch,
      highDrumEnabled: count === 15 && (instrument.highDrumEnabled === undefined ? true : Boolean(instrument.highDrumEnabled)),
      highDrumAlwaysVisible: count === 15
        && (instrument.highDrumEnabled === undefined ? true : Boolean(instrument.highDrumEnabled))
        && Boolean(instrument.highDrumAlwaysVisible),
      companionNotes: count === 15 ? companionNotes : [],
      name: instrument.name || `${count}-note ${scaleType === 'custom' ? 'custom tuning' : `${key} ${SCALE_NAMES[scaleType]}`} drum`,
      notes: instrument.notes.slice(0, count).map((note, i) => ({
        label: String(note.label || i + 1),
        midi: Number(note.midi) || 60,
        color: normaliseColor(note.color, i)
      }))
    };
  }

  function normaliseSong(song, fallbackScale = 'any') {
    const scaleType = ['major', 'major-pentatonic', 'minor-pentatonic', 'any'].includes(song?.scaleType)
      ? song.scaleType
      : fallbackScale;
    const folder = song?.folder === 'community'
      ? 'community'
      : song?.builtIn
        ? 'demo'
        : 'library';
    return { ...song, scaleType, folder };
  }

  function isBundledScalePractice(song) {
    const title = String(song?.title || '').trim().toLocaleLowerCase();
    return title === '15-note scale practice' || title === 'note scale practice';
  }

  function loadData() {
    try {
      const hidden = JSON.parse(localStorage.getItem(STORAGE_HIDDEN_DEMOS) || '[]');
      state.hiddenDemoIds = new Set(Array.isArray(hidden) ? hidden.map(String) : []);
    } catch {
      state.hiddenDemoIds = new Set();
    }
    try {
      const customSongs = JSON.parse(localStorage.getItem(STORAGE_SONGS) || '[]');
      state.songs = [
        ...curatedSongs.filter(song => !state.hiddenDemoIds.has(song.id)).map(song => normaliseSong(song, 'major')),
        ...customSongs
          .filter(song => !curatedSongs.some(preset => preset.id === song.id))
          .filter(song => !isBundledScalePractice(song))
          .map(song => normaliseSong(song, 'any'))
      ];
    } catch {
      state.songs = curatedSongs.filter(song => !state.hiddenDemoIds.has(song.id)).map(song => normaliseSong(song, 'major'));
    }
    try {
      const instrument = JSON.parse(localStorage.getItem(STORAGE_INSTRUMENT) || 'null');
      state.instrument = normaliseInstrument(instrument);
    } catch {
      state.instrument = makeDefaultInstrument(15);
    }
    invalidateInstrumentRuntimeCaches();
    const savedView = localStorage.getItem(STORAGE_VIEW);
    state.visualMode = savedView === 'lanes' ? 'lanes' : 'radial';
    state.showPitchNames = localStorage.getItem(STORAGE_EDITOR_PITCH_NAMES) === 'true';
    state.expressiveTimingEnabled = localStorage.getItem(STORAGE_EDITOR_EXPRESSIVE_TIMING) === 'true';
    state.selectedId = state.songs[0]?.id || null;
  }

  function saveCustomSongs() {
    const customSongs = state.songs.filter(s => !s.builtIn);
    localStorage.setItem(STORAGE_SONGS, JSON.stringify(customSongs));
  }

  function saveHiddenDemos() {
    localStorage.setItem(STORAGE_HIDDEN_DEMOS, JSON.stringify([...state.hiddenDemoIds]));
  }

  function saveInstrument() {
    localStorage.setItem(STORAGE_INSTRUMENT, JSON.stringify(state.instrument));
  }

  function selectedSong() {
    return state.songs.find(s => s.id === state.selectedId) || state.songs[0];
  }

  // A trailing ~ marks a tie: this note is held into the next one instead of being struck
  // again. It is the only way to write a note that carries across a bar line.
  function timedTokenParts(token) {
    let value = String(token || '').trim();
    if (!value || value === '|') return { core: value, durationBeats: 0, tie: false, valid: value === '|' };
    let tie = false;
    if (value.endsWith('~')) { tie = true; value = value.slice(0, -1); }
    const match = value.match(/^(.*?)(?::([0-9]+(?:\.[0-9]+)?))?$/u);
    if (!match || !match[1] || match[1].includes(':')) return { core: value, durationBeats: 1, tie, valid: false };
    const durationBeats = match[2] === undefined ? 1 : Number(match[2]);
    return {
      core: match[1],
      durationBeats,
      tie,
      valid: Number.isFinite(durationBeats) && durationBeats >= 0.125 && durationBeats <= 16
    };
  }

  function durationText(value) {
    return Number(value).toFixed(3).replace(/\.?0+$/, '');
  }

  function makeTimedToken(core, durationBeats = 1, tie = false) {
    const duration = Number(durationBeats);
    const base = Math.abs(duration - 1) < 0.0001 ? core : `${core}:${durationText(duration)}`;
    return tie ? `${base}~` : base;
  }

  function timelineFromStoredSequence(sequence) {
    return sequenceInputItems(sequence).map(item => {
      if (item.core === '|') return { core: '|', durationBeats: 0, lyric: '', tie: false };
      const timed = timedTokenParts(item.core);
      return {
        core: timed.core,
        durationBeats: item.durationOverride ?? (timed.valid ? timed.durationBeats : 1),
        lyric: '',
        tie: Boolean(timed.tie)
      };
    });
  }

  function cleanSequenceFromTimeline(timeline = state.editorTimeline) {
    return timeline.map(item => item.core).join(' ');
  }

  // The note box accepts two readable Jianpu keyboard shortcuts. They belong to the
  // timing of the note immediately before them; they are never notes themselves.
  function sequenceInputItems(value = els.sequenceInput?.value || '') {
    return String(value).trim().split(/\s+/).filter(Boolean).map(raw => {
      if (raw === '|') return { raw, core: '|', durationOverride: 0 };
      let core = raw;
      let durationOverride = null;
      const shorthand = core.match(/([_=])$/u);
      if (shorthand) {
        core = core.slice(0, -1);
        durationOverride = shorthand[1] === '=' ? 0.25 : 0.5;
      }
      return { raw, core, durationOverride };
    });
  }

  function syncEditorTimelineFromCleanInput() {
    const inputItems = sequenceInputItems();
    const cores = inputItems.map(item => item.core);
    const previous = state.editorTimeline;

    // Rhythm is separate from pitch. If the user changes a number or octave mark while
    // keeping the same number of sequence tokens, preserve the existing Jianpu duration
    // at that position. Previously a pitch edit made the changed region look like brand
    // new notes, which reset Quick / Very quick underlines back to Regular.
    const sameShape = cores.length === previous.length;

    let prefix = 0;
    while (prefix < cores.length && prefix < previous.length && cores[prefix] === previous[prefix].core) prefix += 1;
    let suffix = 0;
    while (suffix < cores.length - prefix && suffix < previous.length - prefix
      && cores[cores.length - 1 - suffix] === previous[previous.length - 1 - suffix].core) suffix += 1;

    state.editorTimeline = cores.map((core, index) => {
      if (core === '|') return { core, durationBeats: 0, lyric: '', tie: false };
      const explicitDuration = inputItems[index].durationOverride;

      // A one-for-one pitch replacement keeps the rhythm and lyric attached to the same
      // musical position. Do not inherit from a bar line because bars have duration 0.
      if (sameShape && previous[index] && previous[index].core !== '|') return {
        core,
        durationBeats: explicitDuration ?? previous[index].durationBeats,
        lyric: previous[index].lyric || '',
        tie: Boolean(previous[index].tie)
      };

      if (index < prefix) return {
        core,
        durationBeats: explicitDuration ?? previous[index].durationBeats,
        lyric: previous[index].lyric || '',
        tie: Boolean(previous[index].tie)
      };
      if (index >= cores.length - suffix) {
        const previousIndex = previous.length - (cores.length - index);
        return {
          core,
          durationBeats: explicitDuration ?? previous[previousIndex].durationBeats,
          lyric: previous[previousIndex].lyric || '',
          tie: Boolean(previous[previousIndex].tie)
        };
      }
      return { core, durationBeats: explicitDuration ?? 1, lyric: '', tie: false };
    });
    if (state.editorTimingSelectionIndex >= state.editorTimeline.length
      || state.editorTimeline[state.editorTimingSelectionIndex]?.core === '|') {
      setTimingSelection(timingSelectionIndices(), null);
    }
  }

  function editorSequenceWithDurations() {
    syncEditorTimelineFromCleanInput();
    return state.editorTimeline.map(item => item.core === '|'
      ? '|'
      : makeTimedToken(item.core, item.durationBeats, item.tie)).join(' ');
  }

  function timingWord(durationBeats) {
    const duration = Number(durationBeats);
    if (duration <= 0.375) return 'Very quick';
    if (duration <= 0.75) return 'Quick';
    if (duration <= 1.25) return 'Regular';
    if (duration <= 2.5) return 'Half note';
    return 'Whole note';
  }

  function timingDescription(durationBeats) {
    const word = timingWord(durationBeats);
    if (word === 'Very quick') return 'four notes fit into one regular beat';
    if (word === 'Quick') return 'two notes fit into one regular beat';
    if (word === 'Regular') return 'one note fills one regular beat';
    if (word === 'Half note') return 'the note lasts for two regular beats';
    return 'the note is held for four normal beats';
  }

  function jianpuBeamCount(durationBeats) {
    const duration = Number(durationBeats);
    if (duration <= 0.375) return 2;
    if (duration <= 0.75) return 1;
    return 0;
  }


  // Mirrors the textarea's text into the backdrop layer, swapping each combining octave
  // mark for a span that draws its own dot clear of the digit. Combining marks take no
  // horizontal space, so removing them leaves the two layers perfectly in step.
  // Mirrors the textarea into the backdrop layer: octave marks become drawn dots, and
  // each note carries the length mark the timing sheet gave it. Whitespace-separated
  // tokens line up 1:1 with state.editorTimeline, which is how the marks find their note.
  function renderSequenceBackdrop() {
    queueRhythmBoxes();
    if (!els.sequenceBackdrop || !els.sequenceInput) return;
    const text = els.sequenceInput.value;
    const timeline = state.editorTimeline || [];
    // Where each note falls in its bar, so beams can break on whole beats like the sheet.
    const beatPositions = [];
    let runningBeat = 0;
    timeline.forEach((item, index) => {
      if (item.core === '|') { beatPositions[index] = undefined; runningBeat = 0; return; }
      beatPositions[index] = runningBeat;
      runningBeat += Math.max(0.25, Math.min(4, Number(item.durationBeats) || 1));
    });
    let html = '';
    let tokenIndex = -1;
    let inToken = false;
    let previousTokenEnd = 0;
    let i = 0;
    while (i < text.length) {
      const character = text[i];
      if (/\s/.test(character)) {
        if (inToken) { html += '</span>'; inToken = false; }
        html += escapeHtml(character);
        i += 1;
        continue;
      }
      if (!inToken) {
        tokenIndex += 1;
        const item = timeline[tokenIndex];
        let tokenEnd = i;
        while (tokenEnd < text.length && !/\s/.test(text[tokenEnd])) tokenEnd += 1;
        let nextStart = tokenEnd;
        while (nextStart < text.length && /\s/.test(text[nextStart])) nextStart += 1;
        const beams = item && item.core !== '|' ? jianpuBeamCount(item.durationBeats) : 0;
        const dotted = Boolean(item) && item.core !== '|' && isDottedDuration(item.durationBeats);
        const previous = timeline[tokenIndex - 1];
        const next = timeline[tokenIndex + 1];
        const previousBeams = previous?.core !== '|' ? jianpuBeamCount(previous?.durationBeats) : 0;
        const nextBeams = next?.core !== '|' ? jianpuBeamCount(next?.durationBeats) : 0;
        // Same beat grouping the sheet uses, so the marks under the text match the beams.
        const beatOf = beatPositions[tokenIndex];
        const sameBeatAs = other => beatOf !== undefined && other !== undefined
          && Math.floor(beatOf + 0.0001) === Math.floor(other + 0.0001);
        const canJoinLeft = beams > 0 && previousBeams > 0 && sameBeatAs(beatPositions[tokenIndex - 1])
          && !text.slice(previousTokenEnd, i).includes('\n');
        const canJoinRight = beams > 0 && nextBeams > 0 && sameBeatAs(beatPositions[tokenIndex + 1])
          && nextStart < text.length && !text.slice(tokenEnd, nextStart).includes('\n');
        const classes = ['seq-token'];
        if (canJoinLeft && previousBeams >= 1) classes.push('join-l1-left');
        if (canJoinRight && nextBeams >= 1) classes.push('join-l1-right');
        if (beams >= 2 && canJoinLeft && previousBeams >= 2) classes.push('join-l2-left');
        if (beams >= 2 && canJoinRight && nextBeams >= 2) classes.push('join-l2-right');
        html += `<span class="${classes.join(' ')}" data-sequence-start="${i}" data-sequence-end="${tokenEnd}"${beams ? ` data-beams="${beams}"` : ''}>${dotted ? '<i class="seq-dot"></i>' : ''}`;
        inToken = true;
        previousTokenEnd = tokenEnd;
      }
      let up = 0;
      let down = 0;
      let j = i + 1;
      while (j < text.length) {
        if (text[j] === DOT_ABOVE) { up += 1; j += 1; continue; }
        if (text[j] === DOT_BELOW) { down += 1; j += 1; continue; }
        break;
      }
      if (up || down) {
        const classes = ['seq-oct', up ? 'up' : 'down'];
        if (up > 1 || down > 1) classes.push('double');
        html += `<span class="${classes.join(' ')}">${escapeHtml(character)}</span>`;
      } else {
        html += escapeHtml(character);
      }
      i = j;
    }
    if (inToken) html += '</span>';
    // A trailing newline collapses in a div, which would knock the last line out of sync.
    els.sequenceBackdrop.innerHTML = `${html}\n`;
    els.sequenceBackdrop.scrollTop = els.sequenceInput.scrollTop;
    els.sequenceBackdrop.scrollLeft = els.sequenceInput.scrollLeft;
  }

  // The visible Jianpu layer and the native textarea can wrap a few pixels apart on
  // mobile browsers. Map a tap against the visible tokens so the caret lands where the
  // person tapped, including directly after the final note.
  function placeSequenceCaretFromBackdropPoint(event) {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    if (event.clientX === 0 && event.clientY === 0) return;
    const input = els.sequenceInput;
    const tokens = Array.from(els.sequenceBackdrop?.querySelectorAll('.seq-token[data-sequence-start]') || [])
      .map(element => ({
        element,
        start: Number(element.dataset.sequenceStart),
        end: Number(element.dataset.sequenceEnd),
        rect: element.getBoundingClientRect()
      }))
      .filter(token => Number.isFinite(token.start) && Number.isFinite(token.end) && token.rect.width > 0);
    if (!tokens.length) return;

    const lineHeight = Number.parseFloat(getComputedStyle(input).lineHeight) || 48;
    const firstTop = Math.min(...tokens.map(token => token.rect.top));
    const lastBottom = Math.max(...tokens.map(token => token.rect.bottom));
    let caret = null;
    if (event.clientY < firstTop - lineHeight * .35) caret = 0;
    if (event.clientY > lastBottom + lineHeight * .35) caret = input.value.length;

    if (caret === null) {
      const closest = tokens.reduce((best, token) => {
        const distance = Math.abs(event.clientY - (token.rect.top + token.rect.height / 2));
        return !best || distance < best.distance ? { token, distance } : best;
      }, null);
      const lineCentre = closest.token.rect.top + closest.token.rect.height / 2;
      const lineTokens = tokens
        .filter(token => Math.abs((token.rect.top + token.rect.height / 2) - lineCentre) < lineHeight * .42)
        .sort((left, right) => left.rect.left - right.rect.left);
      const first = lineTokens[0];
      const last = lineTokens[lineTokens.length - 1];
      if (event.clientX <= first.rect.left) {
        caret = first.start;
      } else if (event.clientX >= last.rect.right) {
        caret = last.end;
      } else {
        for (let index = 0; index < lineTokens.length; index += 1) {
          const token = lineTokens[index];
          if (event.clientX <= token.rect.right) {
            caret = event.clientX < token.rect.left + token.rect.width / 2 ? token.start : token.end;
            break;
          }
          const next = lineTokens[index + 1];
          if (next && event.clientX < next.rect.left) {
            caret = event.clientX < (token.rect.right + next.rect.left) / 2 ? token.end : next.start;
            break;
          }
        }
      }
    }

    if (caret === null) return;
    const placeCaret = () => {
      input.setSelectionRange(caret, caret);
      state.editorSelectionStart = caret;
      state.editorSelectionEnd = caret;
    };
    placeCaret();
    requestAnimationFrame(placeCaret);
  }

  function createJianpuDigit(label, className = 'jianpu-digit') {
    const octave = splitOctaveMark(label);
    const digit = document.createElement('span');
    const markClass = octaveMarkClass(octave);
    digit.className = `${className}${markClass ? ` ${markClass}` : ''}`;
    digit.textContent = octave.base;
    return digit;
  }

  function createTimingValueContent(core) {
    if (isSilentCore(core)) {
      const mark = document.createElement('strong');
      mark.textContent = isHoldCore(core) ? '–' : '0';
      return mark;
    }
    const parts = String(core).split('+').map(v => v.trim()).filter(Boolean);
    if (parts.length <= 1) {
      const number = document.createElement('strong');
      number.appendChild(createJianpuDigit(parts[0] || core));
      return number;
    }
    const chord = document.createElement('strong');
    chord.className = 'jianpu-chord-stack';
    parts.forEach(part => {
      const line = document.createElement('span');
      line.className = 'jianpu-chord-line';
      line.appendChild(createJianpuDigit(part));
      chord.appendChild(line);
    });
    return chord;
  }


  function coreHasLowerOctave(core) {
    if (!core || isSilentCore(core)) return false;
    return String(core).split('+').some(part => splitOctaveMark(part.trim()).mark === 'down');
  }

  // Timing selection is a set so a run of notes can be re-timed in one go. The anchor is
  // the last plainly-clicked token, which is what shift+click measures its range from.
  function timingSelectionIndices() {
    return Array.isArray(state.editorTimingSelection) ? state.editorTimingSelection : [];
  }

  function isTimingSelectable(index) {
    const item = state.editorTimeline[index];
    return Boolean(item) && item.core !== '|';
  }

  function setTimingSelection(indices, anchor = null) {
    const clean = [...new Set(indices)]
      .filter(index => Number.isInteger(index) && isTimingSelectable(index))
      .sort((a, b) => a - b);
    state.editorTimingSelection = clean;
    state.editorTimingSelectionIndex = anchor !== null && clean.includes(anchor)
      ? anchor
      : (clean.length ? clean[clean.length - 1] : -1);
  }

  function clearTimingSelection() {
    state.editorTimingSelection = [];
    state.editorTimingSelectionIndex = -1;
    state.editorRangeSelectArmed = false;
  }

  // Builds the numbered sheet into any container. The print path uses this too, so a
  // PDF never depends on what the on-screen editor happens to be showing.
  function buildSheetInto(target, { interactive = true } = {}) {
    target.innerHTML = '';
    const selectedIndices = interactive ? new Set(timingSelectionIndices()) : new Set();
    const notesByLabel = new Map(playableNotes().map(note => [String(note.label), note]));
    const measures = [[]];
    let beatPosition = 0;

    state.editorTimeline.forEach((item, index) => {
      if (item.core === '|') {
        if (measures[measures.length - 1].length) measures.push([]);
        beatPosition = 0;
        return;
      }
      const duration = Math.max(0.25, Math.min(4, Number(item.durationBeats) || 1));
      measures[measures.length - 1].push({ item, index, duration, startBeat: beatPosition });
      beatPosition += duration;
    });
    while (measures.length > 1 && !measures[measures.length - 1].length) measures.pop();

    const measuresPerRow = 2;
    const consecutive = (a, b) => Math.abs((a.startBeat + a.duration) - b.startBeat) < 0.001;
    const sameBeatGroup = (a, b) => Math.floor(a.startBeat + 0.0001) === Math.floor(b.startBeat + 0.0001);

    for (let rowStart = 0; rowStart < measures.length; rowStart += measuresPerRow) {
      const row = document.createElement('div');
      row.className = 'timing-sheet-row';
      measures.slice(rowStart, rowStart + measuresPerRow).forEach((measure, measureOffset, rowMeasures) => {
        const measureEl = document.createElement('div');
        measureEl.className = 'timing-measure';
        if (measureOffset === rowMeasures.length - 1) measureEl.classList.add('last-in-row');

        measure.forEach((entry, measureIndex) => {
          const { item, index, duration } = entry;
          const button = document.createElement('button');
          button.type = 'button';
          const isSelected = selectedIndices.has(index);
          button.className = `timing-token${isSilentCore(item.core) ? ' is-rest' : ''}${isSelected ? ' selected' : ''}${index === state.editorTimingSelectionIndex && selectedIndices.size > 1 ? ' is-anchor' : ''}`;
          button.dataset.timelineIndex = String(index);
          button.dataset.timingWord = timingWord(duration).toLowerCase().replace(/\s+/g, '-');
          button.setAttribute('aria-pressed', String(isSelected));
          if (coreHasLowerOctave(item.core)) button.classList.add('has-lower-octave');
          if (item.tie && tieTargetIndex(index) >= 0) button.classList.add('is-tied');
          if (isDottedDuration(item.durationBeats)) button.classList.add('is-dotted');
          if (String(item.core).includes('+')) button.classList.add('is-chord');

          const firstLabel = item.core.split('+')[0];
          const note = notesByLabel.get(firstLabel);
          if (note) setNoteColorVars(button, note.color || defaultNoteColor(note.noteIndex));

          const valueRow = document.createElement('span');
          valueRow.className = 'jianpu-value-row';
          valueRow.appendChild(createTimingValueContent(item.core));

          const extensionCount = duration >= 3.5 ? 3 : duration >= 1.5 ? 1 : 0;
          if (extensionCount) {
            const extensions = document.createElement('span');
            const rest = isSilentCore(item.core);
            extensions.className = rest ? 'jianpu-rest-repeats' : 'jianpu-extensions';
            extensions.setAttribute('aria-hidden', 'true');
            for (let extension = 0; extension < extensionCount; extension++) {
              const extensionMark = document.createElement('i');
              if (rest) extensionMark.textContent = '0';
              extensions.appendChild(extensionMark);
            }
            valueRow.appendChild(extensions);
          }
          button.appendChild(valueRow);

          const beamCount = jianpuBeamCount(duration);
          if (beamCount) {
            const beams = document.createElement('span');
            beams.className = 'jianpu-beams';
            beams.setAttribute('aria-hidden', 'true');
            const previous = measure[measureIndex - 1];
            const next = measure[measureIndex + 1];
            for (let level = 1; level <= beamCount; level++) {
              const beam = document.createElement('i');
              beam.className = `jianpu-beam level-${level}`;
              const previousBeamCount = previous ? jianpuBeamCount(previous.duration) : 0;
              const nextBeamCount = next ? jianpuBeamCount(next.duration) : 0;
              // Join each underline level independently. Quick beside Very quick shares
              // the first underline; the second underline only joins when both have it.
              // Beams also break on every whole beat, so four quick notes read as two
              // pairs rather than one long line, matching printed jianpu.
              const joinsLeft = previous
                && previousBeamCount >= level
                && consecutive(previous, entry)
                && sameBeatGroup(previous, entry);
              const joinsRight = next
                && nextBeamCount >= level
                && consecutive(entry, next)
                && sameBeatGroup(entry, next);
              beam.classList.toggle('joins-left', Boolean(joinsLeft));
              beam.classList.toggle('joins-right', Boolean(joinsRight));
              beams.appendChild(beam);
            }
            button.appendChild(beams);
          } else {
            const spacer = document.createElement('span');
            spacer.className = 'jianpu-beam-spacer';
            spacer.setAttribute('aria-hidden', 'true');
            button.appendChild(spacer);
          }

          if (interactive && item.core !== '|') {
            const lyric = document.createElement('input');
            lyric.className = 'timing-lyric';
            lyric.type = 'text';
            lyric.maxLength = 12;
            lyric.value = item.lyric || '';
            lyric.dataset.timelineIndex = String(index);
            lyric.placeholder = '+ lyrics';
            lyric.title = 'Add a lyric for this note';
            lyric.setAttribute('aria-label', `Lyric under note ${item.core}`);
            button.appendChild(lyric);
          }

          const timingLabel = timingWord(duration);
          const what = isHoldCore(item.core) ? 'Hold' : isRestCore(item.core) ? 'Rest' : `Note ${item.core}`;
          button.title = `${what}: ${timingLabel} (${timingDescription(duration)})`;
          button.setAttribute('aria-label', `${what}, ${timingLabel}; ${timingDescription(duration)}`);
          measureEl.appendChild(button);
        });

        if (!measure.length) {
          const empty = document.createElement('span');
          empty.className = 'timing-empty-measure';
          empty.setAttribute('aria-hidden', 'true');
          measureEl.appendChild(empty);
        }
        row.appendChild(measureEl);
      });
      target.appendChild(row);
    }
    return target.children.length > 0;
  }

  // A tie needs a following note that repeats at least one of the same numbers. Anything
  // else (a rest, a bar-line at the end, a different pitch) cannot be held into.
  // The arcs on printed jianpu are usually SLURS over different pitches, not ties over the
  // same one. So an arc may join any two sounding notes; it only merges them into one
  // longer note when the pitches actually match, which is what a tie means.
  function tieTargetIndex(index) {
    const item = state.editorTimeline[index];
    if (!item || item.core === '|' || isSilentCore(item.core)) return -1;
    for (let next = index + 1; next < state.editorTimeline.length; next += 1) {
      const candidate = state.editorTimeline[next];
      if (candidate.core === '|') continue;      // an arc may cross a bar line
      if (isSilentCore(candidate.core)) return -1; // but not a silence
      return next;
    }
    return -1;
  }

  function tieHoldsSamePitch(index) {
    const next = tieTargetIndex(index);
    if (next < 0) return false;
    const mine = new Set(String(state.editorTimeline[index].core).split('+').map(v => v.trim()));
    return String(state.editorTimeline[next].core).split('+').map(v => v.trim()).some(l => mine.has(l));
  }

  // A dot to the right of a number makes it half as long again: 1 beat becomes 1.5, a
  // quick note becomes 0.75. Printed jianpu writes these constantly.
  const DOTTABLE = [0.25, 0.5, 1, 2, 4];
  function isDottedDuration(durationBeats) {
    return DOTTABLE.some(base => Math.abs(Number(durationBeats) - base * 1.5) < 0.0001);
  }

  function updateDotButton() {
    if (!els.timingDotBtn) return;
    const chosen = timingSelectionIndices().map(i => state.editorTimeline[i]).filter(item => item && item.core !== '|');
    const usable = chosen.filter(item => isDottedDuration(item.durationBeats)
      || DOTTABLE.some(base => Math.abs(Number(item.durationBeats) - base) < 0.0001));
    els.timingDotBtn.disabled = usable.length === 0;
    const allDotted = usable.length > 0 && usable.every(item => isDottedDuration(item.durationBeats));
    els.timingDotBtn.classList.toggle('active', allDotted);
    els.timingDotBtn.setAttribute('aria-pressed', String(allDotted));
    els.timingDotBtn.title = allDotted
      ? 'Remove the dot and return these notes to their plain length'
      : 'Dotted note: the dot to the right makes the note half as long again';
  }

  function updateTieButton() {
    if (!els.timingTieBtn) return;
    const chosen = timingSelectionIndices();
    const usable = chosen.filter(index => tieTargetIndex(index) >= 0);
    els.timingTieBtn.disabled = usable.length === 0;
    els.timingTieBtn.title = usable.length
      ? 'Draw an arc to the next note. Same number: it is held as one longer note. Different number: it is a phrase mark.'
      : 'Select a note that is followed by another note. An arc cannot start on a rest or on the last note.';
    const allTied = usable.length > 0 && usable.every(index => state.editorTimeline[index]?.tie);
    els.timingTieBtn.classList.toggle('active', allTied);
    els.timingTieBtn.setAttribute('aria-pressed', String(allTied));
  }

  function renderTimingEditor() {
    queueRhythmBoxes();
    if (!els.timingEditor || !els.timingTokenStrip) return;
    const enabled = Boolean(state.expressiveTimingEnabled);
    const workspace = els.sequenceInput?.closest('.sequence-workspace');
    els.expressiveTimingToggle.checked = enabled;
    els.timingEditor.hidden = !enabled;
    workspace?.classList.toggle('timing-visible', enabled);
    if (!enabled) return;

    buildSheetInto(els.timingTokenStrip);

    const chosen = timingSelectionIndices().map(index => state.editorTimeline[index]).filter(Boolean);
    const choiceButtons = Array.from(els.timingChoiceGroup?.querySelectorAll('[data-duration]') || []);
    choiceButtons.forEach(button => {
      button.disabled = !chosen.length;
      const word = button.textContent.trim();
      button.classList.toggle('active', chosen.length > 0
        && chosen.every(item => timingWord(item.durationBeats) === word));
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
    if (els.timingRangeBtn) {
      const hasAnchor = state.editorTimingSelectionIndex >= 0;
      els.timingRangeBtn.disabled = !hasAnchor;
      els.timingRangeBtn.classList.toggle('active', Boolean(state.editorRangeSelectArmed));
      els.timingRangeBtn.setAttribute('aria-pressed', String(Boolean(state.editorRangeSelectArmed)));
      const picked = timingSelectionIndices().length;
      els.timingRangeBtn.textContent = !state.editorRangeSelectArmed
        ? '↔ Select range'
        : picked > 1 ? 'Tap to add · Done' : 'Tap last note';
    }
    updateTieButton();
    updateDotButton();
    if (chosen.length > 1) {
      const words = new Set(chosen.map(item => timingWord(item.durationBeats).toLowerCase()));
      els.selectedTimingLabel.textContent = words.size === 1
        ? `${chosen.length} notes selected, all ${[...words][0]}. Pick a rhythm to change them together.`
        : `${chosen.length} notes selected. Pick a rhythm to apply it to all of them.`;
    } else if (chosen.length === 1) {
      const only = chosen[0];
      els.selectedTimingLabel.textContent = state.editorRangeSelectArmed
        ? `Now tap the last note in the range. Everything between the two notes will be selected.`
        : `${isHoldCore(only.core) ? 'Hold' : isRestCore(only.core) ? 'Rest' : `Note ${only.core}`} is ${timingWord(only.durationBeats).toLowerCase()}: ${timingDescription(only.durationBeats)}. Tap Select range, then tap the last note. On desktop, Shift-click also works.`;
    } else {
      els.selectedTimingLabel.textContent = 'Tap a number to select it. To select several notes on mobile, tap the first note, choose Select range, then tap the last note. One underline means quick; two mean very quick.';
    }
  }

  function setExpressiveTimingEnabled(enabled) {
    state.expressiveTimingEnabled = Boolean(enabled);
    clearTimingSelection();
    localStorage.setItem(STORAGE_EDITOR_EXPRESSIVE_TIMING, String(state.expressiveTimingEnabled));
    syncEditorTimelineFromCleanInput();
    renderTimingEditor();
  }

  function sequenceStats(sequence) {
    const raw = String(sequence || '').trim().split(/\s+/).filter(Boolean);
    let beats = 0;
    let noteCount = 0;
    let chordCount = 0;
    let playableTokenCount = 0;
    const invalidTokens = [];
    raw.forEach(token => {
      if (token === '|') return;
      const timed = timedTokenParts(token);
      if (!timed.valid || (!timed.core && !isSilentCore(timed.core))) {
        invalidTokens.push(token);
        return;
      }
      beats += timed.durationBeats;
      if (isSilentCore(timed.core)) return;
      const chordLabels = timed.core.split('+').map(value => value.trim()).filter(Boolean);
      if (!chordLabels.length) {
        invalidTokens.push(token);
        return;
      }
      playableTokenCount += 1;
      noteCount += chordLabels.length;
      if (chordLabels.length > 1) chordCount += 1;
    });
    return { beats, noteCount, chordCount, playableTokenCount, invalidTokens };
  }

  function parseSequence(sequence, bpm) {
    const secondsPerBeat = 60 / Math.max(30, Number(bpm) || 72);
    const raw = String(sequence || '').trim().split(/\s+/).filter(Boolean);
    const notes = [];
    const invalidTokens = [];
    const playableByLabel = new Map(playableNotes().map(note => [String(note.label).toLowerCase(), note]));
    let beat = 0;
    let bar = 1;
    const heldFrom = new Map();   // label -> the note still sounding through a tie

    raw.forEach(token => {
      if (token === '|') {
        bar += 1;
        return;
      }
      const timed = timedTokenParts(token);
      if (!timed.valid) {
        invalidTokens.push(token);
        return;
      }
      if (isHoldCore(timed.core)) {
        // Let the last note ring on rather than striking anything. On a tongue drum that
        // is exactly what a hold is, so there is nothing to sustain - only the next strike
        // to postpone.
        const ringing = notes[notes.length - 1];
        if (ringing) {
          ringing.duration += timed.durationBeats * secondsPerBeat;
          ringing.durationBeats += timed.durationBeats;
        }
        beat += timed.durationBeats;
        return;
      }
      if (isRestCore(timed.core)) {
        beat += timed.durationBeats;
        return;
      }
      const chordLabels = timed.core.split('+').map(v => v.trim()).filter(Boolean);
      if (!chordLabels.length) invalidTokens.push(token);
      if (heldFrom.size) {
        // This note is the tail of a tie: lengthen the note already sounding rather than
        // striking it again. Anything not tied over is played normally.
        const stillHeld = new Map();
        chordLabels.forEach(label => {
          const held = heldFrom.get(label.toLowerCase());
          if (!held) return;
          held.duration += timed.durationBeats * secondsPerBeat;
          held.durationBeats += timed.durationBeats;
          if (timed.tie) stillHeld.set(label.toLowerCase(), held);
        });
        const carried = new Set(heldFrom.keys());
        heldFrom.clear();
        stillHeld.forEach((value, key) => heldFrom.set(key, value));
        const fresh = chordLabels.filter(label => !carried.has(label.toLowerCase()));
        if (!fresh.length) { beat += timed.durationBeats; return; }
        chordLabels.length = 0;
        fresh.forEach(label => chordLabels.push(label));
      }
      chordLabels.forEach(label => {
        const playable = playableByLabel.get(label.toLowerCase());
        if (playable) {
          notes.push({
            id: `${beat}-${playable.noteIndex}-${notes.length}`,
            label,
            noteIndex: playable.noteIndex,
            time: beat * secondsPerBeat,
            duration: timed.durationBeats * secondsPerBeat,
            durationBeats: timed.durationBeats,
            beat,
            bar
          });
          if (timed.tie) heldFrom.set(label.toLowerCase(), notes[notes.length - 1]);
        }
      });
      beat += timed.durationBeats;
    });

    return { notes, duration: Math.max(beat * secondsPerBeat, secondsPerBeat), totalBeats: beat, secondsPerBeat, invalidTokens };
  }

  function songTitleParts(title) {
    const fullTitle = String(title || '').trim();
    const match = fullTitle.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
    if (!match || !match[1].trim() || !match[2].trim()) {
      return { fullTitle, displayTitle: fullTitle, collection: '' };
    }
    return {
      fullTitle,
      displayTitle: match[1].trim(),
      collection: match[2].trim()
    };
  }

  function isCommunitySong(song) {
    return song?.folder === 'community';
  }

  function isDemoSong(song) {
    return !isCommunitySong(song) && (song?.builtIn || song?.folder === 'demo');
  }

  function songFolderInfo(song, title = songTitleParts(song?.title)) {
    if (isDemoSong(song)) return { key: 'folder:demo', label: 'Demo songs', order: 0 };
    if (isCommunitySong(song)) return { key: 'folder:community', label: 'Community gallery', order: 1 };
    const collection = title.collection.trim();
    return {
      key: collection
        ? `folder:library:${collection.toLocaleLowerCase().replace(/\s+/g, ' ')}`
        : 'folder:library',
      label: collection || 'My songs',
      order: 2
    };
  }

  function songMetrics(song) {
    const stats = sequenceStats(song?.sequence || '');
    const bpm = Math.max(30, Number(song?.bpm) || 72);
    return {
      bpm,
      beats: stats.beats,
      noteCount: stats.noteCount,
      chordCount: stats.chordCount,
      durationSeconds: stats.beats * 60 / bpm,
      chordRatio: stats.playableTokenCount ? stats.chordCount / stats.playableTokenCount : 0
    };
  }

  function songDifficulty(song) {
    const metrics = songMetrics(song);
    let score = 0;
    score += metrics.bpm >= 180 ? 3 : metrics.bpm >= 140 ? 2 : metrics.bpm >= 105 ? 1 : 0;
    score += metrics.durationSeconds >= 300 ? 3 : metrics.durationSeconds >= 180 ? 2 : metrics.durationSeconds >= 90 ? 1 : 0;
    score += metrics.noteCount >= 300 ? 2 : metrics.noteCount >= 150 ? 1 : 0;
    if (metrics.chordRatio >= 0.12) score += 1;

    let level = 'easy';
    if (metrics.bpm >= 210 || score >= 6) level = 'expert';
    else if (metrics.bpm >= 175 || metrics.durationSeconds >= 240 || score >= 4) level = 'hard';
    else if (score >= 2) level = 'medium';

    return {
      level,
      label: level[0].toUpperCase() + level.slice(1),
      metrics
    };
  }

  function preparePlaybackNotes(notes) {
    return notes.map(note => {
      // Song data stores musical labels, not display colors. Resolve every playback note
      // against the currently configured physical tongue so flying notes, particles,
      // labels and impact effects always inherit that tongue's color.
      const playable = playableNoteAt(note.noteIndex);
      const color = normaliseColor(playable?.color, note.noteIndex);
      return {
        ...note,
        color,
        inkColor: noteInkColor(color),
        highDrumSlot: highDrumSlotForLabel(note.label),
        placement: getDrumPlacement(note.noteIndex),
        midi: playable?.midi ?? 60
      };
    });
  }

  function selectSong(id) {
    stopPlayback(false);
    state.selectedId = id;
    state.currentTime = 0;
    state.pausedAt = 0;
    state.score = 0;
    state.attempts = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.hitNotes.clear();
    state.missedNoteIds.clear();
    resetTapeRun();
    state.lastResultMissed = [];
    state.loopA = null;
    state.loopB = null;
    state.sectionLoop = false;
    if (els.resultDialog?.open) els.resultDialog.close();
    state.waitingIndex = 0;
    const song = selectedSong();
    if (!song) return;
    const parsed = parseSequence(song.sequence, song.bpm);
    state.parsedNotes = preparePlaybackNotes(parsed.notes);
    state.particlePhaseCache.clear();
    state.duration = parsed.duration;
    state.secondsPerBeat = parsed.secondsPerBeat;
    state.totalBeats = parsed.totalBeats;
    const title = songTitleParts(song.title);
    const folder = songFolderInfo(song, title);
    const difficulty = songDifficulty(song);
    els.currentTitle.textContent = title.displayTitle;
    if (tapeEls.stageSongName) tapeEls.stageSongName.innerHTML = `<b>${escapeHtml(title.displayTitle)}</b>${folder.label ? `<small>${escapeHtml(folder.label)}</small>` : ''}`;
    if (els.currentCollection) {
      els.currentCollection.textContent = folder.label;
      els.currentCollection.hidden = false;
    }
    if (els.currentDifficulty) {
      els.currentDifficulty.textContent = `${difficulty.label} difficulty`;
      els.currentDifficulty.dataset.level = difficulty.level;
    }
    els.tempoLabel.innerHTML = `<b>${song.bpm}</b> BPM`;
    els.durationLabel.textContent = formatTime(state.duration);
    els.progress.value = 0;
    syncProgressFill();
    renderSongList();
    updateTransportUI();
    updateABLoopUI();
    updatePracticeUI();
    renderFrame();
  }

  function renderSidebarSongItem(song, sourceLabel) {
    const title = songTitleParts(song.title);
    const difficulty = songDifficulty(song);
    const metrics = difficulty.metrics;
    const button = document.createElement('button');
    button.className = `song-item ${song.id === state.selectedId ? 'active' : ''}`;
    button.title = title.fullTitle;
    button.innerHTML = `
      <span class="song-item-title"><strong>${escapeHtml(title.displayTitle)}</strong><em class="difficulty-badge" data-level="${difficulty.level}">${difficulty.label}</em></span>
      <span>${song.bpm} BPM · ${metrics.noteCount} notes${sourceLabel ? ` · ${escapeHtml(sourceLabel)}` : ''}${BEST.badge(song.id)}</span>
      ${song.description ? `<span class="song-item-about">${escapeHtml(capitalise(song.description))}</span>` : ''}`;
    button.addEventListener('click', () => {
      selectSong(song.id);
      els.sidebar.classList.remove('open');
    });
    return button;
  }

  function renderSongList() {
    const q = els.songSearch.value.trim().toLowerCase();
    els.songList.innerHTML = '';
    if (els.restoreDemosBtn) els.restoreDemosBtn.hidden = state.hiddenDemoIds.size === 0;
    const matchesSearch = song => {
      const title = songTitleParts(song.title);
      return `${title.fullTitle} ${title.displayTitle} ${title.collection}`.toLowerCase().includes(q);
    };

    const demos = state.songs.filter(isDemoSong).filter(matchesSearch).filter(songMatchesLevel);
    const demoGroup = document.createElement('section');
    demoGroup.className = 'song-group catalogue-collection demo-collection';
    const demoHeading = document.createElement('div');
    demoHeading.className = 'song-group-heading static-heading';
    demoHeading.innerHTML = `<span>Demo songs</span><small>${demos.length}</small>`;
    demoGroup.appendChild(demoHeading);
    const demoItems = document.createElement('div');
    demoItems.className = 'song-group-items';
    demos.forEach(song => demoItems.appendChild(renderSidebarSongItem(song, '')));
    if (!demos.length) {
      const empty = document.createElement('p');
      empty.className = 'community-empty';
      empty.textContent = q ? 'No demo songs match that search.' : 'No demo songs are available.';
      demoItems.appendChild(empty);
    }
    demoGroup.appendChild(demoItems);
    els.songList.appendChild(demoGroup);

    const mine = personalSongs().filter(matchesSearch).filter(songMatchesLevel);
    const myGroup = document.createElement('section');
    myGroup.className = 'song-group catalogue-collection personal-collection';
    const myHeading = document.createElement('div');
    myHeading.className = 'song-group-heading static-heading';
    myHeading.innerHTML = `<span>My songs</span><small>${mine.length}</small>`;
    myGroup.appendChild(myHeading);
    const myItems = document.createElement('div');
    myItems.className = 'song-group-items';
    mine.forEach(song => {
      const title = songTitleParts(song.title);
      myItems.appendChild(renderSidebarSongItem(song, title.collection || ''));
    });
    if (!mine.length) {
      const empty = document.createElement('p');
      empty.className = 'community-empty';
      empty.textContent = q ? 'No My songs match that search.' : 'Create or import a song and it will appear here.';
      myItems.appendChild(empty);
    }
    myGroup.appendChild(myItems);
    els.songList.appendChild(myGroup);
    const startHere = q ? null : startHereCard();
    if (startHere) els.songList.prepend(startHere);
    updateLibraryCounts();
  }

  function personalSongs() { return state.songs.filter(song => !song.builtIn && !isCommunitySong(song)); }
  function communitySongs() { return state.songs.filter(isCommunitySong); }

  function updateLibraryCounts() {
    const community = communitySongs();
    const counts = { easy:0, medium:0, hard:0, expert:0 };
    community.forEach(song => {
      const level = songDifficulty(song).level;
      if (Object.prototype.hasOwnProperty.call(counts, level)) counts[level] += 1;
    });
    if (els.libraryCountBadge) els.libraryCountBadge.textContent = String(community.length);
    if (els.communitySongsCount) els.communitySongsCount.textContent = String(community.length);
    if (els.communityEasyCount) els.communityEasyCount.textContent = String(counts.easy);
    if (els.communityMediumCount) els.communityMediumCount.textContent = String(counts.medium);
    if (els.communityHardCount) els.communityHardCount.textContent = String(counts.hard);
    if (els.communityExpertCount) els.communityExpertCount.textContent = String(counts.expert);
  }

  function stableSongHash(song) {
    const value = String(song?.id || song?.title || 'song');
    let hash = 2166136261;
    for (let i=0;i<value.length;i+=1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash,16777619); }
    return hash >>> 0;
  }

  function songCoverMarkup(song) {
    const hash = stableSongHash(song), theme = hash % 8;
    const symbols = ['✦','☾','✿','♫','✧','☁','❋','♪'];
    const symbol = symbols[(hash >>> 3) % symbols.length];
    return `<span class="album-cover cover-theme-${theme}" aria-hidden="true"><i>${symbol}</i><b></b></span>`;
  }

  function normaliseDifficultyFilter(value) { return ['all','easy','medium','hard','expert'].includes(value) ? value : 'all'; }

  function renderSongLibrary() {
    if (!els.libraryGrid) return;
    updateLibraryCounts();
    const tab = normaliseDifficultyFilter(state.libraryTab);
    const q = String(els.librarySearch?.value || '').trim().toLowerCase();
    const songs = communitySongs().filter(song => {
      const title = songTitleParts(song.title), difficulty = songDifficulty(song);
      return (tab === 'all' || difficulty.level === tab) && `${title.fullTitle} ${title.displayTitle} ${title.collection}`.toLowerCase().includes(q);
    });
    const tabMap = { all:els.libraryTabAll, easy:els.libraryTabEasy, medium:els.libraryTabMedium, hard:els.libraryTabHard, expert:els.libraryTabExpert };
    Object.entries(tabMap).forEach(([key,button]) => { button?.classList.toggle('active',key===tab); button?.setAttribute('aria-selected',String(key===tab)); });
    if (els.libraryCommunityBanner) els.libraryCommunityBanner.hidden = false;
    els.libraryGrid.innerHTML = '';
    songs.forEach(song => {
      const title = songTitleParts(song.title), difficulty = songDifficulty(song), metrics = difficulty.metrics;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `album-card ${song.id === state.selectedId ? 'selected' : ''}`;
      card.innerHTML = `${songCoverMarkup(song)}<span class="album-copy"><span class="album-title-row"><strong>${escapeHtml(title.displayTitle)}</strong><em class="difficulty-badge" data-level="${difficulty.level}">${difficulty.label}</em></span><small>${song.bpm} BPM · ${metrics.noteCount} notes</small><span class="album-source">${escapeHtml(title.collection || 'Community gallery')}</span>${song.description ? `<span class="album-about">${escapeHtml(capitalise(song.description))}</span>` : ''}</span>`;
      card.addEventListener('click', () => { selectSong(song.id); els.songLibraryDialog?.close(); els.sidebar.classList.remove('open'); });
      els.libraryGrid.appendChild(card);
    });
    if (els.libraryEmpty) {
      els.libraryEmpty.hidden = songs.length > 0;
      if (!songs.length) {
        if (q) els.libraryEmpty.innerHTML = '<strong>No matches</strong><span>Try another song name or difficulty.</span>';
        else if (tab !== 'all') { const label = tab[0].toUpperCase()+tab.slice(1); els.libraryEmpty.innerHTML = `<strong>No ${label} community songs yet</strong><span>Try another difficulty or check back after more songs are approved.</span>`; }
        else els.libraryEmpty.innerHTML = '<strong>No approved community songs yet</strong><span>Approved files in community-songs appear after the starter indexes the folder. Keep START_TRAINER_Win.bat open while editing the local collection.</span>';
      }
    }
  }

  function setLibraryTab(tab) { state.libraryTab = normaliseDifficultyFilter(tab); renderSongLibrary(); }
  function openSongLibrary(tab='all') { if (!els.songLibraryDialog) return; state.libraryTab = normaliseDifficultyFilter(tab); if (els.librarySearch) els.librarySearch.value=''; renderSongLibrary(); els.songLibraryDialog.showModal(); }

  function instrumentDisplayName(instrument = state.instrument) {
    if (!instrument) return 'My Drum';
    const scaleName = instrument.scaleType === 'custom' ? 'Custom tuning' : `${instrument.key} ${SCALE_NAMES[instrument.scaleType]}`;
    return `${instrument.count}-note ${scaleName}`;
  }

  function renderMyDrumCompanion() {
    if (!els.myDrumCompanion || !els.myDrumCompanionPreview) return;
    const visible = highDrumEnabled();
    els.myDrumCompanion.hidden = !visible;
    els.myDrumCompanionPreview.innerHTML = '';
    if (!visible) return;
    highDrumNotes().forEach(note => {
      const pad = document.createElement('span');
      pad.className = 'my-companion-note';
      pad.style.setProperty('--slot-angle', `${note.slot * 45}deg`);
      setNoteColorVars(pad, note.color);
      const octave = splitOctaveMark(note.label);
      const markClass = octaveMarkClass(octave);
      pad.innerHTML = `<strong${markClass ? ` class="${markClass}"` : ''}>${escapeHtml(octave.base)}</strong><small>${escapeHtml(midiToName(note.midi))}</small>`;
      els.myDrumCompanionPreview.appendChild(pad);
    });
    const centre = document.createElement('span');
    centre.className = 'my-companion-centre';
    centre.textContent = 'HIGH';
    els.myDrumCompanionPreview.appendChild(centre);
  }

  function renderMyDrum() {
    if (!els.myDrumDialog || !state.instrument) return;
    const instrument = state.instrument;
    const scaleLabel = instrument.scaleType === 'custom' ? 'Custom tuning' : SCALE_NAMES[instrument.scaleType];
    els.myDrumTitle.textContent = instrumentDisplayName(instrument);
    els.myDrumBadges.innerHTML = `
      <span>${escapeHtml(instrument.key || 'Custom')} key</span>
      <span>${escapeHtml(scaleLabel)}</span>
      <span>${instrument.count} tongues</span>
      <span>${highDrumEnabled() ? 'Companion on' : 'Main drum only'}</span>`;
    els.myDrumNoteCount.textContent = `${instrument.count} tongues`;
    createDrum(els.myDrumPreview, false);
    els.myDrumNoteList.innerHTML = '';
    instrument.notes.forEach((note, index) => {
      const chip = document.createElement('div');
      chip.className = 'my-drum-note-chip';
      setNoteColorVars(chip, note.color || defaultNoteColor(index));
      const octave = splitOctaveMark(note.label);
      const markClass = octaveMarkClass(octave);
      chip.innerHTML = `<i aria-hidden="true"></i><strong${markClass ? ` class="${markClass}"` : ''}>${escapeHtml(octave.base)}</strong><span>${escapeHtml(midiToName(note.midi))}</span>`;
      els.myDrumNoteList.appendChild(chip);
    });
    renderMyDrumCompanion();
  }

  function openMyDrum() {
    renderMyDrum();
    els.myDrumDialog?.showModal();
  }

  function instrumentSettingsDocument() {
    return {
      format: INSTRUMENT_SETTINGS_FORMAT,
      exportedAt: new Date().toISOString(),
      instrument: state.instrument
    };
  }

  function exportInstrumentSettings() {
    if (!state.instrument) return;
    const payload = instrumentSettingsDocument();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(instrumentDisplayName(state.instrument))}.drumsettings`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Drum settings exported.', 'success');
  }

  async function importInstrumentSettings(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data?.format !== INSTRUMENT_SETTINGS_FORMAT || !data?.instrument || !Array.isArray(data.instrument.notes)) {
        throw new Error('Unsupported drum settings file');
      }
      state.instrument = normaliseInstrument(data.instrument);
      invalidateInstrumentRuntimeCaches();
      saveInstrument();
      preCacheInstrumentSounds().catch(error => console.warn('Could not refresh the sound cache:', error));
      renderInstrument();
      selectSong(state.selectedId);
      renderMyDrum();
      showToast('Drum settings restored.', 'success');
    } catch (error) {
      console.error(error);
      showToast('That drum settings file could not be imported.', 'warning');
    } finally {
      if (els.importInstrumentFile) els.importInstrumentFile.value = '';
    }
  }

  function getDrumPlacement(noteIndex, count = state.instrument.count) {
    const turn = state.drumRotation || 0;
    const cacheKey = `${count}:${noteIndex}:${turn}`;
    if (drumPlacementCache.has(cacheKey)) return drumPlacementCache.get(cacheKey);
    const layout = DRUM_LAYOUTS[count];
    let placement = layout?.[noteIndex]
      ? { ...layout[noteIndex], manual: true, ring: 'single' }
      : { angle: (360 / count) * noteIndex, ring: 'single', size: 'regular' };
    if (turn) placement = rotatePlacement(placement, turn);
    drumPlacementCache.set(cacheKey, placement);
    return placement;
  }

  function createDrum(container, isStage = false) {
    if (!container) return;
    container.innerHTML = '';
    const body = document.createElement('div');
    const centreTongue = hasCenterTongue(state.instrument.count) ? ' has-center-tongue' : '';
    body.className = `drum-body drum-${state.instrument.count}${centreTongue}${isStage ? ' stage-drum-body' : ''}`;
    state.instrument.notes.forEach((note, i) => {
      const placement = getDrumPlacement(i);
      const pad = document.createElement('button');
      pad.type = 'button';
      pad.className = 'tongue';
      pad.dataset.noteIndex = String(i);
      if (placement.manual) {
        pad.classList.add('manual-placement');
        // xp/yp are percentages of the drum diameter; x/y are absolute pixels (legacy layouts).
        const offsetX = placement.xp !== undefined ? `${placement.xp}%` : `${placement.x}px`;
        const offsetY = placement.yp !== undefined ? `${placement.yp}%` : `${placement.y}px`;
        pad.style.left = `calc(50% + ${offsetX})`;
        pad.style.top = `calc(50% + ${offsetY})`;
        pad.style.setProperty('--rotation', `${placement.rotate || 0}deg`);
      } else {
        pad.style.setProperty('--angle', `${placement.angle}deg`);
      }
      if (placement.size) pad.classList.add(`tone-${placement.size}`);
      setNoteColorVars(pad, note.color || defaultNoteColor(i));
      pad.setAttribute('aria-label', `Play note ${note.label}, ${midiToName(note.midi)}`);
      const octave = splitOctaveMark(note.label);
      const markClassName = octaveMarkClass(octave);
      const markClass = markClassName ? ` class="${markClassName}"` : '';
      pad.innerHTML = `<span class="tongue-face"><strong${markClass}>${escapeHtml(octave.base)}</strong><small>${midiToName(note.midi)}</small></span>`;
      pad.addEventListener('pointerdown', () => handleUserNote(i));
      body.appendChild(pad);
    });
    if (!hasCenterTongue(state.instrument.count)) {
      const center = document.createElement('div');
      center.className = 'center-dome';
      center.textContent = 'Ethereal';
      body.appendChild(center);
    }
    container.appendChild(body);
  }

  function renderHighDrum() {
    if (!els.highDrumWrap) return;
    els.highDrumWrap.innerHTML = '';
    els.highDrumWrap.classList.remove('visible', 'always-visible');
    if (!highDrumEnabled()) return;

    const heading = document.createElement('div');
    heading.className = 'companion-zone-heading';
    heading.innerHTML = '<span>Companion drum</span><small>high notes</small>';

    const guides = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    guides.classList.add('companion-guides');
    guides.setAttribute('aria-hidden', 'true');
    for (let slot = 0; slot < 8; slot++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.dataset.slot = String(slot);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      guides.appendChild(line);
    }

    const body = document.createElement('div');
    body.className = 'high-drum-body';
    highDrumNotes().forEach(note => {
      const pad = document.createElement('button');
      pad.type = 'button';
      pad.className = 'tongue high-tongue';
      pad.dataset.noteIndex = String(note.noteIndex);
      pad.dataset.highSlot = String(note.slot);
      pad.style.setProperty('--angle', `${note.slot * 45}deg`);
      setNoteColorVars(pad, note.color);
      const octave = splitOctaveMark(note.label);
      const markClass = octaveMarkClass(octave);
      pad.innerHTML = `<span class="tongue-face"><strong${markClass ? ` class="${markClass}"` : ''}>${escapeHtml(octave.base)}</strong><small>${midiToName(note.midi)}</small></span>`;
      pad.setAttribute('aria-label', `Play high note ${note.label}, ${midiToName(note.midi)}`);
      pad.addEventListener('pointerdown', () => handleUserNote(note.noteIndex));
      body.appendChild(pad);
    });
    const center = document.createElement('div');
    center.className = 'high-drum-center';
    body.appendChild(center);
    els.highDrumWrap.append(heading, guides, body);
  }

  function renderInstrument() {
    const scaleName = state.instrument.scaleType === 'custom'
      ? 'custom tuning'
      : `${state.instrument.key} ${SCALE_NAMES[state.instrument.scaleType]}`;
    els.instrumentTitle.textContent = `${state.instrument.count}-note ${scaleName}${highDrumEnabled() ? ' + high 8-note drum' : ''}`;
    createDrum(els.drumWrap, false);
    createDrum(els.stageDrumWrap, true);
    renderHighDrum();
    state.stageTonguePads = [
      ...els.stageDrumWrap.querySelectorAll('.tongue'),
      ...els.highDrumWrap.querySelectorAll('.tongue')
    ];
    state.tonguePadsByNote = new Map();
    [els.drumWrap, els.stageDrumWrap, els.highDrumWrap].forEach(container => {
      container?.querySelectorAll('.tongue').forEach(pad => {
        const noteIndex = Number(pad.dataset.noteIndex);
        if (!state.tonguePadsByNote.has(noteIndex)) state.tonguePadsByNote.set(noteIndex, []);
        state.tonguePadsByNote.get(noteIndex).push(pad);
      });
    });
    state.companionGeometryCache = null;
    state.companionGuideGeometryKey = '';
    state.particlePhaseCache.clear();
    if (els.keyboardHint) {
      els.keyboardHint.textContent = highDrumEnabled()
        ? 'Keys 1-9, 0, Q-P'
        : state.instrument.count >= 15
          ? 'Keys 1-9, 0, Q-T'
        : state.instrument.count >= 13
          ? 'Keys 1-9, 0, Q-E'
          : state.instrument.count >= 11
            ? 'Keys 1-9, 0, Q'
            : state.instrument.count >= 10
              ? 'Keys 1-9, 0'
              : 'Keys 1-9';
    }
    renderMiniPads();
    applyVisualMode();
    updatePracticeUI();
    renderFrame();
  }

  function makeMiniPad(note, index) {
    const pad = document.createElement('button');
    pad.type = 'button';
    pad.className = 'mini-pad';
    const octave = splitOctaveMark(note.label);
    // Same drawn dot as the tongues. The raw combining character is invisible at this size.
    const markClass = octaveMarkClass(octave);
    pad.innerHTML = `
      <span class="mini-pad-number${markClass ? ` ${markClass}` : ''}">${escapeHtml(octave.base)}</span>
      <small class="mini-pad-note-name">${escapeHtml(midiToName(note.midi))}</small>`;
    pad.title = `Insert ${note.label} (${midiToName(note.midi)}) at the cursor`;
    setNoteColorVars(pad, note.color || defaultNoteColor(index));
    pad.addEventListener('click', () => insertTokenAtCursor(note.label));
    return pad;
  }

  // Grouped middle / high / low rather than tongue order, so the pads read like a keyboard.
  function renderMiniPads() {
    els.miniPads.innerHTML = '';
    els.miniPads.classList.toggle('show-pitch-names', state.showPitchNames);
    if (els.showPitchNamesToggle) els.showPitchNamesToggle.checked = state.showPitchNames;
    const tagged = playableNotes().map(note => ({ note, index: note.noteIndex, mark: splitOctaveMark(note.label).mark }));
    const group = mark => tagged.filter(item => item.mark === mark).sort((a, b) => a.note.midi - b.note.midi);
    const middle = group('');
    const high = group('up');
    const low = group('down');

    const addRow = groups => {
      const filled = groups.filter(g => g.items.length);
      if (!filled.length) return;
      const row = document.createElement('div');
      row.className = 'mini-pad-row';
      filled.forEach(({ items, caption }) => {
        const cluster = document.createElement('div');
        cluster.className = 'mini-pad-group';
        const label = document.createElement('span');
        label.className = 'mini-pad-caption';
        label.textContent = caption;
        cluster.appendChild(label);
        const pads = document.createElement('div');
        pads.className = 'mini-pad-pads';
        pads.style.setProperty('--mini-pad-count', String(items.length));
        items.forEach(item => pads.appendChild(makeMiniPad(item.note, item.index)));
        cluster.appendChild(pads);
        row.appendChild(cluster);
      });
      els.miniPads.appendChild(row);
    };
    addRow([{ items: middle, caption: 'Middle notes' }, { items: high, caption: 'High notes' }]);
    addRow([{ items: low, caption: 'Low notes' }]);
  }

  function setTextIfChanged(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function setToneIfChanged(element, value) {
    if (element && element.dataset.tone !== value) element.dataset.tone = value;
  }

  function updatePracticeUI() {
    const current = state.currentTime;
    let next;
    if (state.mode === 'wait') {
      next = state.parsedNotes[state.waitingIndex];
    } else {
      let nextIndex = noteIndexAtOrAfter(current - 0.06);
      while (nextIndex < state.parsedNotes.length && state.hitNotes.has(state.parsedNotes[nextIndex].id)) nextIndex += 1;
      next = state.parsedNotes[nextIndex];
    }
    if (next) {
      setTextIfChanged(els.nextNoteValue, next.label);
      const delta = Math.max(0, next.time - current);
      setTextIfChanged(els.nextNoteTime, delta < .05 ? 'Now' : `in ${delta.toFixed(1)}s`);
    } else {
      setTextIfChanged(els.nextNoteValue, '✓');
      setTextIfChanged(els.nextNoteTime, state.playing ? 'Finishing' : 'Complete');
    }
    const firstFutureIndex = noteIndexAtOrAfter(current - 0.06);
    const sectionEndIndex = state.sectionLoop && Number.isFinite(state.loopB)
      ? noteIndexAtOrAfter(state.loopB + 0.02)
      : state.parsedNotes.length;
    const notesLeft = state.mode === 'wait'
      ? Math.max(0, state.parsedNotes.length - state.waitingIndex)
      : Math.max(0, sectionEndIndex - firstFutureIndex);
    const totalNotes = state.parsedNotes.length;
    setTextIfChanged(els.totalNotesLabel, `${totalNotes} ${totalNotes === 1 ? 'note' : 'notes'} total`);
    setTextIfChanged(els.notesLeftValue, String(notesLeft));
    setTextIfChanged(els.mobileNotesLeftValue, String(notesLeft));
    setTextIfChanged(els.elapsedLabel, formatTime(current));
    const progressValue = state.duration ? Math.round((current / state.duration) * 1000) : 0;
    if (Number(els.progress.value) !== progressValue) { els.progress.value = progressValue; syncProgressFill(); }
    const scorePercent = state.attempts ? Math.round((state.score / state.attempts) * 100) : 0;
    setTextIfChanged(els.scoreValue, `${scorePercent}%`);
    setTextIfChanged(els.streakValue, String(state.streak));
    setTextIfChanged(els.mobileScoreValue, `${scorePercent}%`);
    setTextIfChanged(els.mobileStreakValue, String(state.streak));
    const scoreTone = !state.attempts || scorePercent === 0
      ? 'neutral'
      : scorePercent >= 80
        ? 'success'
        : scorePercent >= 40
          ? 'warning'
          : 'danger';
    const streakTone = state.streak === 0 ? 'neutral' : state.streak >= 3 ? 'success' : 'building';
    setToneIfChanged(els.scorePill, scoreTone);
    setToneIfChanged(els.streakPill, streakTone);
    setToneIfChanged(els.mobileScorePill, scoreTone);
    setToneIfChanged(els.mobileStreakPill, streakTone);
  }

  // Keep musical timing independent from drawing cost. Phones use a deliberately lean
  // canvas profile, tablets keep a little more detail, and desktop retains the full scene.
  // The profile is refreshed by resizeCanvas, so these checks do not run inside every
  // particle loop.
  function performanceProfileFor(width) {
    const coarsePointer = Boolean(window.matchMedia?.('(pointer: coarse)').matches);
    const viewportShortEdge = Math.min(window.innerWidth || width, window.innerHeight || width);
    const phoneLayout = width <= 600 || (coarsePointer && viewportShortEdge <= 600);
    if (phoneLayout) {
      return {
        name: 'phone', dpr: 1, visualInterval: 34, uiInterval: 100,
        backdropInterval: 100, ambientInterval: 100, stars: 52,
        particleQualityCap: 'none', fallingParticles: 27,
        radialParticles: 36, companionParticles: 18,
        particleBudget: 0, particleShadows: false
      };
    }
    if (width <= 1100 || coarsePointer) {
      return {
        name: 'tablet', dpr: 1.25, visualInterval: 25, uiInterval: 80,
        backdropInterval: 67, ambientInterval: 80, stars: 78,
        particleQualityCap: 'half', fallingParticles: 27,
        radialParticles: 36, companionParticles: 18,
        particleBudget: 144, particleShadows: false
      };
    }
    return {
      name: 'desktop', dpr: 1.75, visualInterval: 0, uiInterval: 33,
      backdropInterval: 33, ambientInterval: 66, stars: 110,
      particleQualityCap: 'full',
      fallingParticles: 27, radialParticles: 36, companionParticles: 18,
      particleBudget: 432, particleShadows: true
    };
  }

  function visualPerformanceProfile(width = els.noteCanvas?.clientWidth || window.innerWidth) {
    return state.performanceProfile || performanceProfileFor(width);
  }

  function particleQualityIndex(quality) {
    return Math.max(0, PARTICLE_QUALITY_ORDER.indexOf(quality));
  }

  function setParticleQuality(quality) {
    state.particleQuality = PARTICLE_QUALITY_ORDER.includes(quality) ? quality : 'none';
    document.documentElement.dataset.particleQuality = state.particleQuality;
  }

  function resetVisualPerformanceMonitor(now = performance.now()) {
    state.visualMonitorStartedAt = now;
    state.visualMonitorSamples = 0;
    state.visualMonitorSlowSamples = 0;
    state.visualMonitorCostAverage = 0;
    state.visualMonitorLastFrameAt = 0;
  }

  const STORAGE_PARTICLES_AGE = 3 * 24 * 3600 * 1000;

  function rememberedParticleQuality(profileName) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_PARTICLES) || '{}')[profileName];
      if (!saved || !PARTICLE_QUALITY_ORDER.includes(saved.quality)) return '';
      // A level settled on long ago gets one more chance to step up.
      if (Date.now() - (saved.at || 0) > STORAGE_PARTICLES_AGE) return '';
      return saved.quality;
    } catch { return ''; }
  }

  function rememberParticleQuality(profileName, quality) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_PARTICLES) || '{}');
      saved[profileName] = { quality, at: Date.now() };
      localStorage.setItem(STORAGE_PARTICLES, JSON.stringify(saved));
    } catch {}
  }

  function configureParticleQuality(profile, force = false) {
    if (!force && state.particleProfileName === profile.name && state.particleQuality) return;
    state.particleProfileName = profile.name;
    // Start touch devices on the profile they almost always settle on anyway. Previously
    // phones/tablets began too ambitiously, spent the first few seconds dropping frames,
    // then the adaptive monitor reduced backdrop work. Starting at the proven baseline
    // keeps the very first walkthrough notes as smooth as later ones.
    state.backgroundRateScale = profile.name === 'phone' ? 2 : profile.name === 'tablet' ? 1.35 : 1;
    // Computers start one step lower too and step up once the first seconds run smoothly;
    // a level this device settled on before is used straight away.
    const cap = profile.particleQualityCap;
    const remembered = rememberedParticleQuality(profile.name);
    let start = cap;
    if (remembered) start = particleQualityIndex(remembered) < particleQualityIndex(cap) ? remembered : cap;
    else if (profile.name === 'desktop') start = 'half';
    state.particleCanUpgrade = !remembered && particleQualityIndex(start) < particleQualityIndex(cap);
    setParticleQuality(start);
    resetVisualPerformanceMonitor();
  }

  function downgradeParticleQuality(steps = 1) {
    const current = particleQualityIndex(state.particleQuality);
    if (current <= 0) return false;
    setParticleQuality(PARTICLE_QUALITY_ORDER[Math.max(0, current - steps)]);
    state.particleCanUpgrade = false;
    if (state.particleProfileName) rememberParticleQuality(state.particleProfileName, state.particleQuality);
    resetVisualPerformanceMonitor();
    return true;
  }

  function monitorVisualPerformance(frameStartedAt, frameFinishedAt, profile) {
    const targetInterval = profile.visualInterval || 16.7;
    // The first half-second after a start is warm-up (sounds loading); it is not judged.
    if (frameStartedAt - state.visualMonitorStartedAt < 450) {
      state.visualMonitorLastFrameAt = frameStartedAt;
      return;
    }
    const renderCost = Math.max(0, frameFinishedAt - frameStartedAt);
    const frameGap = state.visualMonitorLastFrameAt ? frameStartedAt - state.visualMonitorLastFrameAt : targetInterval;
    state.visualMonitorLastFrameAt = frameStartedAt;
    state.visualMonitorSamples += 1;
    state.visualMonitorCostAverage += (renderCost - state.visualMonitorCostAverage) * .08;
    if (renderCost > targetInterval * .62 || frameGap > targetInterval * 2.1) state.visualMonitorSlowSamples += 1;
    const elapsed = frameFinishedAt - state.visualMonitorStartedAt;
    // Judge after about a second, so a struggling computer is only rough for a moment.
    if (elapsed < 1450 || state.visualMonitorSamples < 24) return;
    const slowRatio = state.visualMonitorSlowSamples / state.visualMonitorSamples;
    const drawingIsHeavy = state.visualMonitorCostAverage > targetInterval * .52;
    if (slowRatio >= .24 || drawingIsHeavy) {
      const reducedParticles = downgradeParticleQuality(slowRatio >= .5 ? 2 : 1);
      if (reducedParticles && profile.name === 'desktop' && state.backgroundRateScale < 2) {
        state.backgroundRateScale = 2;
        state.lastBackdropAt = 0;
      } else if (!reducedParticles && state.backgroundRateScale < 2) {
        state.backgroundRateScale = 2;
        state.lastBackdropAt = 0;
        resetVisualPerformanceMonitor(frameFinishedAt);
      } else if (state.backgroundRateScale >= 2) resetVisualPerformanceMonitor(frameFinishedAt);
    } else if (state.particleCanUpgrade) {
      if (elapsed < 3500) return;
      state.particleCanUpgrade = false;
      if (slowRatio < .05 && state.visualMonitorCostAverage < targetInterval * .3) {
        const next = PARTICLE_QUALITY_ORDER[particleQualityIndex(state.particleQuality) + 1];
        if (next && particleQualityIndex(next) <= particleQualityIndex(profile.particleQualityCap)) {
          setParticleQuality(next);
          rememberParticleQuality(profile.name, next);
        }
      } else rememberParticleQuality(profile.name, state.particleQuality);
      resetVisualPerformanceMonitor(frameFinishedAt);
    } else resetVisualPerformanceMonitor(frameFinishedAt);
  }

  function initialisePerformanceDiagnostics() {
    if (!state.perfEnabled || state.perfOverlay) return;
    const overlay = document.createElement('aside');
    overlay.className = 'performance-hud';
    overlay.setAttribute('aria-label', 'Performance diagnostics');
    document.body.appendChild(overlay);
    state.perfOverlay = overlay;
  }

  function recordPerformanceDiagnostics(frameStartedAt, frameFinishedAt, profile) {
    if (!state.perfEnabled || !state.perfOverlay) return;
    if (!state.perfLastReportAt) state.perfLastReportAt = frameStartedAt;
    state.perfFrameCount += 1;
    state.perfRenderTotal += Math.max(0, frameFinishedAt - frameStartedAt);
    const elapsed = frameFinishedAt - state.perfLastReportAt;
    if (elapsed < 1000) return;
    const fps = Math.round(state.perfFrameCount * 1000 / elapsed);
    const averageRender = state.perfFrameCount ? state.perfRenderTotal / state.perfFrameCount : 0;
    const dpr = Math.min(window.devicePixelRatio || 1, profile.dpr || 2).toFixed(2);
    state.perfOverlay.innerHTML = `<strong>${profile.name}</strong><span>${fps} FPS</span><span>${averageRender.toFixed(1)} ms draw</span><span>${state.perfVisibleNotes} visible notes</span><span>${state.particleQuality || 'none'} particles</span><span>${dpr} DPR</span><span>${soundBufferCache.size} sounds cached</span>`;
    state.perfFrameCount = 0;
    state.perfRenderTotal = 0;
    state.perfLastReportAt = frameFinishedAt;
  }

  function effectiveBackdropInterval(profile) {
    if (!profile.backdropInterval) return state.backgroundRateScale > 1 ? 33 : 0;
    return profile.backdropInterval * state.backgroundRateScale;
  }

  function effectiveAmbientInterval(profile) {
    return profile.ambientInterval * state.backgroundRateScale;
  }

  function particleCountWithinBudget(maximum, visibleNotes, profile) {
    const quality = state.particleQuality || profile.particleQualityCap;
    if (quality === 'none') return 0;
    const multiplier = quality === 'half' ? .5 : 1;
    const qualityMaximum = Math.max(3, Math.floor((maximum * multiplier) / 3) * 3);
    if (!Number.isFinite(profile.particleBudget)) return qualityMaximum;
    const budgeted = Math.floor(profile.particleBudget / Math.max(1, visibleNotes));
    // Multiples of three preserve the three-strand trail. Six remains readable even in
    // a dense passage while being far cheaper than the former 36 particles per note.
    return Math.min(qualityMaximum, Math.max(Math.min(6, qualityMaximum), Math.floor(budgeted / 3) * 3));
  }

  function resizeCanvas() {
    const rect = els.noteCanvas.getBoundingClientRect();
    const previousProfile = state.performanceProfile;
    state.performanceProfile = performanceProfileFor(rect.width);
    if (!previousProfile || previousProfile.name !== state.performanceProfile.name || previousProfile.dpr !== state.performanceProfile.dpr) {
      noteSpriteCache.clear();
      noteLabelSpriteCache.clear();
      glowTextureCache.clear();
    }
    configureParticleQuality(state.performanceProfile);
    // A phone DPR of 1 cuts the two canvas buffers to 44% of their previous DPR-1.5
    // pixel count. The CSS dimensions and all hit targets remain exactly the same.
    const dpr = Math.min(window.devicePixelRatio || 1, state.performanceProfile.dpr);
    [els.noteCanvas, els.noteCanvasBack].forEach(canvas => {
      if (!canvas) return;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    state.companionGeometryCache = null;
    state.companionGuideGeometryKey = '';
    state.stageDrumGeometryKey = '';
    state.lastBackdropAt = 0;
    state.backdropMode = '';
    state.staticGuideCanvas = null;
    state.staticGuideKey = '';
    state.laneGuideCanvas = null;
    state.laneGuideKey = '';
    placeTape(rect.width, rect.height);
    buildStarField(rect.width, rect.height);
    renderFrame();
  }

  // Has the player actually started? Before that the drum stays clean: no expected-note
  // highlight and no note parked on top of a tongue hiding its label.
  function playbackStarted() {
    return state.playing || state.countInActive || state.currentTime > 0.001;
  }

  // parsedNotes is time-sorted. Binary-searching the visible time window means long songs
  // no longer scan every hidden note several times per animation frame.
  function noteIndexAtOrAfter(time) {
    let low = 0;
    let high = state.parsedNotes.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (state.parsedNotes[mid].time < time) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  function noteWindow(startTime, endTime) {
    const start = noteIndexAtOrAfter(startTime);
    let end = start;
    while (end < state.parsedNotes.length && state.parsedNotes[end].time <= endTime) end += 1;
    return { start, end };
  }

  function renderFrame() {
    const canvas = els.noteCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    updateTape();
    const nowMs = performance.now();
    const now = nowMs / 1000;
    const delta = Math.min(0.1, Math.max(0, now - (state.lastFrameAt || now)));
    state.lastFrameAt = now;
    ctx.clearRect(0, 0, width, height);

    const back = els.noteCanvasBack?.getContext('2d');
    const profile = visualPerformanceProfile(width);
    if (!state.playing || !state.lastCompanionUiAt || nowMs - state.lastCompanionUiAt >= profile.uiInterval) {
      state.lastCompanionUiAt = nowMs;
      updateHighDrumCue();
    }

    let activeIndices;
    if (state.visualMode === 'radial') {
      const backdropInterval = effectiveBackdropInterval(profile);
      const refreshBackdrop = back && (
        state.backdropMode !== 'radial'
        || !state.lastBackdropAt
        || !backdropInterval
        || nowMs - state.lastBackdropAt >= backdropInterval
      );
      if (refreshBackdrop) {
        const backdropDelta = Math.min(0.12, Math.max(0, (nowMs - (state.lastBackdropAt || nowMs)) / 1000));
        back.clearRect(0, 0, width, height);
        renderRadialBackdrop(back, width, height, now, backdropDelta || delta);
        state.lastBackdropAt = nowMs;
        state.backdropMode = 'radial';
      }
      activeIndices = state.mode === 'tuner' ? new Set() : renderRadialFrame(ctx, width, height);
    } else {
      const geo = laneFrameGeometry(width, height);
      if (back) {
        const laneGuides = laneGuideLayer(width, height, laneLayout(), profile);
        if (geo.phoneLanes) {
          // Phones: the space backdrop, the glow and the halo around the drum under the lanes.
          const backdropInterval = effectiveBackdropInterval(profile);
          if (state.backdropMode !== 'lanes-drum' || laneGuides.fresh || !state.lastBackdropAt || !backdropInterval || nowMs - state.lastBackdropAt >= backdropInterval) {
            const backdropDelta = Math.min(0.12, Math.max(0, (nowMs - (state.lastBackdropAt || nowMs)) / 1000));
            back.clearRect(0, 0, width, height);
            back.drawImage(laneGuides.canvas, 0, 0, laneGuides.canvas.width, laneGuides.canvas.height, 0, 0, width, height);
            drawStars(back, width, height, now, backdropDelta || delta);
            drawAmoeba(back, geo.drum.cx, geo.drum.cy, geo.drum.drumSize, now);
            drawDrumHalo(back, geo.drum.cx, geo.drum.cy, geo.drum.drumSize, now);
            state.lastBackdropAt = nowMs;
          }
        } else if (state.backdropMode !== 'lanes' || laneGuides.fresh) {
          back.clearRect(0, 0, width, height);
          back.drawImage(laneGuides.canvas, 0, 0, laneGuides.canvas.width, laneGuides.canvas.height, 0, 0, width, height);
        }
      }
      state.backdropMode = geo.phoneLanes ? 'lanes-drum' : 'lanes';
      activeIndices = state.mode === 'tuner' ? new Set() : renderLaneFrame(ctx, width, height);
    }

    const playbackPads = state.stageTonguePads.length
      ? state.stageTonguePads
      : [...els.stageDrumWrap.querySelectorAll('.tongue'), ...els.highDrumWrap.querySelectorAll('.tongue')];
    const expectedSignature = [...activeIndices].sort((a, b) => a - b).join(',');
    if (expectedSignature !== state.expectedPadSignature || playbackPads[0] !== state.expectedPadAnchor) {
      state.expectedPadSignature = expectedSignature;
      state.expectedPadAnchor = playbackPads[0] || null;
      playbackPads.forEach(pad => {
        const idx = Number(pad.dataset.noteIndex);
        if (pad.classList.contains('high-tongue')) {
          const slot = Number(pad.dataset.highSlot);
          const label = highDrumNotes()[slot]?.label;
          const routesToCompanion = highDrumSlotForLabel(label) >= 0;
          pad.classList.toggle('expected', routesToCompanion && activeIndices.has(idx));
        } else {
          pad.classList.toggle('expected', activeIndices.has(idx));
        }
      });
    }
  }

  function updateHighDrumCue() {
    if (!els.highDrumWrap) return;
    const previewSeconds = 4.2 / state.speed;
    const enabled = highDrumEnabled();
    const alwaysVisible = enabled && Boolean(state.instrument?.highDrumAlwaysVisible);

    if (!enabled) {
      els.highDrumWrap.classList.remove('visible', 'always-visible', 'engaged');
      els.highDrumWrap.style.setProperty('--high-cue', '0');
      return;
    }

    let hasApproachingNote = false;
    let nearest = previewSeconds;
    if (state.playing && !state.countInActive) {
      const { start, end } = noteWindow(state.currentTime - 0.35, state.currentTime + previewSeconds);
      for (let index = start; index < end; index += 1) {
        const note = state.parsedNotes[index];
        if (note.highDrumSlot < 0) continue;
        const dt = note.time - state.currentTime;
        hasApproachingNote = true;
        nearest = Math.min(nearest, Math.abs(dt));
      }
    }

    const visible = alwaysVisible || hasApproachingNote;
    const cue = hasApproachingNote ? Math.max(0, Math.min(1, 1 - nearest / previewSeconds)) : 0;
    els.highDrumWrap.classList.toggle('visible', visible);
    els.highDrumWrap.classList.toggle('always-visible', alwaysVisible);
    els.highDrumWrap.classList.toggle('engaged', hasApproachingNote);
    els.highDrumWrap.style.setProperty('--high-cue', cue.toFixed(3));
    if (visible) updateCompanionGuides(previewSeconds);
  }

  function companionGeometry() {
    if (state.companionGeometryCache) return state.companionGeometryCache;
    if (!els.highDrumWrap) return null;
    const body = els.highDrumWrap.querySelector('.high-drum-body');
    if (!body || !body.offsetWidth) return null;
    const zoneX = els.highDrumWrap.offsetLeft;
    const zoneY = els.highDrumWrap.offsetTop;
    const localCx = body.offsetLeft;
    const localCy = body.offsetTop;
    state.companionGeometryCache = {
      zoneX,
      zoneY,
      zoneWidth: els.highDrumWrap.offsetWidth,
      zoneHeight: els.highDrumWrap.offsetHeight,
      localCx,
      localCy,
      cx: zoneX + localCx,
      cy: zoneY + localCy,
      drumSize: body.offsetWidth
    };
    return state.companionGeometryCache;
  }

  function companionGuideStrengths(previewSeconds) {
    const strengths = new Map();
    if (!state.playing || state.countInActive || state.mode === 'tuner') return strengths;
    const { start, end } = noteWindow(state.currentTime - 0.16, state.currentTime + previewSeconds);
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      const slot = note.highDrumSlot;
      if (slot < 0) continue;
      const dt = note.time - state.currentTime;
      const proximity = Math.max(0, Math.min(1, 1 - Math.max(0, dt) / previewSeconds));
      const hitFade = dt < 0 ? Math.max(0, 1 + dt / 0.16) : 1;
      const strength = Math.pow(proximity, 1.55) * hitFade;
      strengths.set(slot, Math.max(strengths.get(slot) || 0, strength));
    }
    return strengths;
  }

  function updateCompanionGuides(previewSeconds = 4.2 / state.speed) {
    const geometry = companionGeometry();
    const svg = els.highDrumWrap?.querySelector('.companion-guides');
    if (!geometry || !svg) return;
    const geometryKey = [geometry.zoneWidth, geometry.zoneHeight, geometry.localCx, geometry.localCy, geometry.drumSize].join(':');
    if (state.companionGuideGeometryKey !== geometryKey) {
      svg.setAttribute('viewBox', `0 0 ${geometry.zoneWidth} ${geometry.zoneHeight}`);
      svg.querySelectorAll('line').forEach(line => {
        const slot = Number(line.dataset.slot);
        const angle = slot * Math.PI / 4;
        const dx = Math.sin(angle);
        const dy = -Math.cos(angle);
        const tongueRadius = geometry.drumSize * .31;
        const startRadius = tongueRadius + geometry.drumSize * .13;
        const edgeRadius = distanceToStageEdge(geometry.localCx, geometry.localCy, dx, dy, geometry.zoneWidth, geometry.zoneHeight, 15);
        line.setAttribute('x1', (geometry.localCx + dx * startRadius).toFixed(2));
        line.setAttribute('y1', (geometry.localCy + dy * startRadius).toFixed(2));
        line.setAttribute('x2', (geometry.localCx + dx * edgeRadius).toFixed(2));
        line.setAttribute('y2', (geometry.localCy + dy * edgeRadius).toFixed(2));
      });
      state.companionGuideGeometryKey = geometryKey;
    }
    const strengths = companionGuideStrengths(previewSeconds);
    svg.querySelectorAll('line').forEach(line => {
      const slot = Number(line.dataset.slot);
      line.style.setProperty('--guide-strength', (strengths.get(slot) || 0).toFixed(3));
    });
  }

  function buildStarField(width, height) {
    if (!width || !height) return;
    const starCount = visualPerformanceProfile(width).stars;
    state.stars = Array.from({ length: starCount }, () => {
      const depth = Math.random() ** 1.4;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        depth,
        r: 0.35 + depth * 1.25,
        base: 0.13 + depth * 0.52,
        speed: 0.3 + Math.random() * 1.9,
        phase: Math.random() * Math.PI * 2,
        wobble: 0.7 + Math.random() * 0.6
      };
    });
  }

  // Parallax: every star slides along the same axis, but near ones move several times
  // faster than far ones, which reads as depth rather than as noise.
  const PARALLAX = { x: -5.2, y: 2.1 };

  function drawStars(ctx, width, height, now, delta) {
    if (!state.stars?.length) buildStarField(width, height);
    const profile = visualPerformanceProfile(width);
    const fixedPositions = profile.name === 'phone';
    const pace = (state.playing ? 1 : 0.32) * delta;
    const bucketCount = 6;
    const buckets = Array.from({ length: bucketCount }, () => []);
    state.stars.forEach(star => {
      if (!fixedPositions) {
        const rate = .18 + star.depth * 1.05;
        star.x = (star.x + PARALLAX.x * rate * star.wobble * pace + width) % width;
        star.y = (star.y + PARALLAX.y * rate * pace + height) % height;
      }
      const twinkle = .5 + .5 * Math.sin(now * star.speed + star.phase);
      const alpha = star.base * (.3 + .7 * twinkle);
      const bucket = Math.min(bucketCount - 1, Math.floor((alpha / .7) * bucketCount));
      buckets[bucket].push(star);
    });
    ctx.save();
    ctx.fillStyle = '#ffffff';
    buckets.forEach((stars, bucket) => {
      if (!stars.length) return;
      ctx.globalAlpha = ((bucket + .5) / bucketCount) * .7;
      ctx.beginPath();
      stars.forEach(star => {
        ctx.moveTo(star.x + star.r, star.y);
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      });
      ctx.fill();
    });
    ctx.restore();
  }

  // Soft overlapping lobes rather than one traced outline. Each lobe is a radial gradient
  // that fades to fully transparent, so there is no edge to go crisp or pixelated, and the
  // lobes orbit at different rates so the combined silhouette keeps crawling.
  const AMOEBA_LOBES = [
    { orbit: 0.11, speed: 0.130, phase: 0.0, size: 0.62, tint: '123,146,255', alpha: 0.15 },
    { orbit: 0.17, speed: -0.092, phase: 1.9, size: 0.53, tint: '99,130,246', alpha: 0.13 },
    { orbit: 0.14, speed: 0.074, phase: 3.4, size: 0.58, tint: '94,234,212', alpha: 0.10 },
    { orbit: 0.21, speed: -0.109, phase: 5.0, size: 0.45, tint: '167,139,250', alpha: 0.11 },
    { orbit: 0.08, speed: 0.161, phase: 2.4, size: 0.70, tint: '110,140,255', alpha: 0.08 }
  ];

  function cachedGlowTexture(key, stops) {
    const profile = visualPerformanceProfile();
    const density = Math.min(window.devicePixelRatio || 1, profile.dpr || 2);
    const cacheKey = `${key}:${density}`;
    const existing = cacheGet(glowTextureCache, cacheKey);
    if (existing) return existing;
    const cssSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(cssSize * density);
    canvas.height = Math.ceil(cssSize * density);
    const textureCtx = canvas.getContext('2d');
    textureCtx.setTransform(density, 0, 0, density, 0, 0);
    const gradient = textureCtx.createRadialGradient(cssSize / 2, cssSize / 2, 0, cssSize / 2, cssSize / 2, cssSize / 2);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    textureCtx.fillStyle = gradient;
    textureCtx.fillRect(0, 0, cssSize, cssSize);
    return cacheSet(glowTextureCache, cacheKey, { canvas, cssSize }, 24);
  }

  function drawGlowTexture(ctx, texture, cx, cy, radius) {
    ctx.drawImage(texture.canvas, cx - radius, cy - radius, radius * 2, radius * 2);
  }

  function drawAmoeba(ctx, cx, cy, size, now) {
    const compactLayout = visualPerformanceProfile(ctx.canvas.clientWidth).name !== 'desktop';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (compactLayout) {
      // Cache the compact glow once. Creating a multi-stop radial gradient during every
      // backdrop refresh caused a noticeable first-play warm-up on some mobile GPUs.
      const breathe = 1 + Math.sin(now * 0.42) * 0.035;
      const radius = size * 0.73 * breathe;
      const texture = cachedGlowTexture('amoeba:compact', [
        [0, 'rgba(112,143,255,.17)'],
        [.34, 'rgba(99,130,246,.115)'],
        [.66, 'rgba(99,130,246,.05)'],
        [.86, 'rgba(94,234,212,.016)'],
        [1, 'rgba(109,130,246,0)']
      ]);
      drawGlowTexture(ctx, texture, cx, cy, radius);
      ctx.restore();
      return;
    }

    AMOEBA_LOBES.forEach(lobe => {
      const breathe = 1 + 0.19 * Math.sin(now * lobe.speed * 2.3 + lobe.phase);
      const ox = cx + Math.cos(now * lobe.speed + lobe.phase) * size * lobe.orbit;
      const oy = cy + Math.sin(now * lobe.speed * 1.27 + lobe.phase * 1.4) * size * lobe.orbit * 0.82;
      const radius = size * lobe.size * breathe;
      const texture = cachedGlowTexture(`amoeba:${lobe.tint}:${lobe.alpha}`, [
        [0, `rgba(${lobe.tint},${lobe.alpha})`],
        [.42, `rgba(${lobe.tint},${(lobe.alpha * .42).toFixed(4)})`],
        [1, `rgba(${lobe.tint},0)`]
      ]);
      drawGlowTexture(ctx, texture, ox, oy, radius);
    });
    ctx.restore();
  }

  function drawDrumHalo(ctx, cx, cy, size, now) {
    const pulse = 1 + Math.sin(now * 0.82) * 0.035;
    const compactLayout = visualPerformanceProfile(ctx.canvas.clientWidth).name !== 'desktop';
    const innerRadius = size * (compactLayout ? 0.45 : 0.47);
    const outerRadius = size * (compactLayout ? 0.72 : 0.76) * pulse;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const innerRatio = Math.max(0, Math.min(.9, innerRadius / outerRadius));
    const haloTexture = cachedGlowTexture(`halo:${compactLayout ? 'compact' : 'desktop'}`, [
      [0, 'rgba(126,156,255,.3)'],
      [innerRatio, 'rgba(126,156,255,.3)'],
      [innerRatio + (1 - innerRatio) * .22, 'rgba(116,147,255,.17)'],
      [innerRatio + (1 - innerRatio) * .58, compactLayout ? 'rgba(109,130,246,.06)' : 'rgba(109,130,246,.07)'],
      [1, 'rgba(109,130,246,0)']
    ]);
    drawGlowTexture(ctx, haloTexture, cx, cy, outerRadius);

    ctx.globalAlpha = 0.36 + Math.sin(now * 0.82) * 0.08;
    ctx.strokeStyle = 'rgba(170,186,255,.72)';
    ctx.lineWidth = Math.max(2, size * 0.009);
    ctx.shadowColor = 'rgba(112,143,255,.85)';
    ctx.shadowBlur = size * 0.07;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.505, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function radialGuideStrengths(previewSeconds) {
    const strengths = new Map();
    if (!state.playing || state.countInActive || state.mode === 'tuner') return strengths;
    const { start, end } = noteWindow(state.currentTime - 0.16, state.currentTime + previewSeconds);
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      if (note.highDrumSlot >= 0) continue;
      const dt = note.time - state.currentTime;
      const proximity = Math.max(0, Math.min(1, 1 - Math.max(0, dt) / previewSeconds));
      const hitFade = dt < 0 ? Math.max(0, 1 + dt / 0.16) : 1;
      const strength = Math.pow(proximity, 1.65) * hitFade;
      strengths.set(note.noteIndex, Math.max(strengths.get(note.noteIndex) || 0, strength));
    }
    return strengths;
  }

  function drawRadialGuide(ctx, width, height, geometry, noteIndex, strength = 0, activeOverlay = false) {
    const target = getPlacementTarget(getDrumPlacement(noteIndex), geometry.scale, geometry.cx, geometry.cy);
    const edgeRadius = distanceToStageEdge(geometry.cx, geometry.cy, target.dx, target.dy, width, height, 12);
    const startX = target.x + target.dx * 16 * geometry.scale;
    const startY = target.y + target.dy * 16 * geometry.scale;
    const edgeX = geometry.cx + target.dx * edgeRadius;
    const edgeY = geometry.cy + target.dy * edgeRadius;
    const lineGradient = ctx.createLinearGradient(startX, startY, edgeX, edgeY);
    if (activeOverlay) {
      lineGradient.addColorStop(0, `rgba(255,255,255,${(strength * .84).toFixed(3)})`);
      lineGradient.addColorStop(.24, `rgba(255,255,255,${(strength * .43).toFixed(3)})`);
      lineGradient.addColorStop(.62, `rgba(255,255,255,${(strength * .12).toFixed(3)})`);
      lineGradient.addColorStop(1, `rgba(255,255,255,${(strength * .012).toFixed(3)})`);
    } else {
      lineGradient.addColorStop(0, 'rgba(255,255,255,.09)');
      lineGradient.addColorStop(.24, 'rgba(255,255,255,.065)');
      lineGradient.addColorStop(.62, 'rgba(255,255,255,.03)');
      lineGradient.addColorStop(1, 'rgba(255,255,255,.006)');
    }
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = activeOverlay ? 1 + strength * 1.25 : 1;
    ctx.shadowColor = 'rgba(255,255,255,.9)';
    ctx.shadowBlur = activeOverlay ? strength * 8 : 0;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(edgeX, edgeY);
    ctx.stroke();
  }

  function staticGuideLayer(width, height, geometry) {
    const profile = visualPerformanceProfile(width);
    const density = Math.min(window.devicePixelRatio || 1, profile.dpr || 2);
    const key = [width, height, geometry.drumSize, state.instrument.count, density].join(':');
    if (state.staticGuideCanvas && state.staticGuideKey === key) return state.staticGuideCanvas;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    const guideCtx = canvas.getContext('2d');
    guideCtx.setTransform(density, 0, 0, density, 0, 0);
    state.instrument.notes.forEach((_note, noteIndex) => drawRadialGuide(guideCtx, width, height, geometry, noteIndex));
    state.staticGuideCanvas = canvas;
    state.staticGuideKey = key;
    return canvas;
  }

  // Everything that belongs behind the drum: stars, amoeba, halo, flight guide lines.
  function renderRadialBackdrop(ctx, width, height, now, delta) {
    drawStars(ctx, width, height, now, delta);
    const geometry = radialGeometry(width, height);
    drawAmoeba(ctx, geometry.cx, geometry.cy, geometry.drumSize, now);
    drawDrumHalo(ctx, geometry.cx, geometry.cy, geometry.drumSize, now);
    const baseGuides = staticGuideLayer(width, height, geometry);
    ctx.drawImage(baseGuides, 0, 0, baseGuides.width, baseGuides.height, 0, 0, width, height);
    const guideStrengths = radialGuideStrengths(4.2 / state.speed);
    ctx.save();
    guideStrengths.forEach((strength, noteIndex) => {
      if (strength > .001) drawRadialGuide(ctx, width, height, geometry, noteIndex, strength, true);
    });
    ctx.restore();
  }

  // Falling lanes: one lane for each note the song uses, low to high, so the lanes stay
  // wide enough to read. Each lane is tinted in its note's colour and ends in a target.
  function laneLayout() {
    const notes = state.parsedNotes || [];
    const count = playableNotes().length;
    const cached = state.laneLayoutCache;
    if (cached && cached.notesRef === notes && cached.count === count) return cached;
    const used = [...new Set(notes.map(note => note.noteIndex))].filter(index => index < count);
    const order = (used.length ? used : playableNotes().map((_, index) => index))
      .sort((a, b) => (playableNoteAt(a)?.midi ?? a) - (playableNoteAt(b)?.midi ?? b));
    state.laneLayoutCache = { notesRef: notes, count, order, pos: new Map(order.map((noteIndex, lane) => [noteIndex, lane])) };
    return state.laneLayoutCache;
  }

  // Falling lanes geometry. Phones: the drum at the bottom, just above the play controls,
  // and the lanes above it as long as they can be (as in the handpan app).
  // Everywhere: the notes start under the stats along the top.
  function laneFrameGeometry(width, height) {
    const phoneLanes = window.innerWidth <= 760;
    const lanesTop = width <= 900 ? 60 : 52;
    if (!phoneLanes) return { phoneLanes, lanesTop, lanesBottom: height, hitY: height - 52, drum: null };
    const drumSize = Math.max(150, Math.min(width - 60, height * 0.31, 300));
    const footprint = drumSize * 1.06;
    const cy = height - 70 - footprint / 2;
    const lanesBottom = Math.round(cy - footprint / 2 - 4);
    return { phoneLanes, lanesTop, lanesBottom, hitY: lanesBottom - 26, drum: { cx: width / 2, cy, drumSize } };
  }

  function laneTint(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function drawLaneTargets(ctx, layout, laneW, hitY, profile) {
    const radius = Math.max(11, Math.min(laneW * 0.34, 19));
    const fontSize = Math.max(11, Math.min(16, radius * 0.95));
    layout.order.forEach((noteIndex, lane) => {
      const x = lane * laneW + laneW / 2;
      const color = noteColor(noteIndex);
      const on = Boolean(state.laneActive?.has(noteIndex));
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, hitY, radius, 0, Math.PI * 2);
      ctx.fillStyle = on ? laneTint(color, .92) : '#131a29';
      if (on) { ctx.shadowColor = color; ctx.shadowBlur = 18; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = laneTint(color, on ? 1 : .75);
      ctx.stroke();
      ctx.restore();
      const label = playableNoteAt(noteIndex)?.label || '';
      drawCachedNoteLabel(ctx, cachedNoteLabel(label, fontSize, on ? noteInkColor(color) : color, profile), x, hitY);
    });
  }

  function drawLaneGuides(ctx, width, height, layout) {
    const lanes = Math.max(1, layout.order.length);
    const laneW = width / lanes;
    const geo = laneFrameGeometry(width, height);
    const hitY = geo.hitY;
    layout.order.forEach((noteIndex, lane) => {
      const color = noteColor(noteIndex);
      const glow = ctx.createLinearGradient(0, geo.lanesTop, 0, hitY);
      glow.addColorStop(0, laneTint(color, .03));
      glow.addColorStop(1, laneTint(color, lane % 2 ? .14 : .2));
      ctx.fillStyle = glow;
      ctx.fillRect(lane * laneW, geo.lanesTop, laneW, hitY - geo.lanesTop);
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath();
    for (let index = 0; index <= lanes; index += 1) {
      const x = Math.round(index * laneW) + .5;
      ctx.moveTo(x, geo.lanesTop);
      ctx.lineTo(x, hitY + 26);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(94,234,212,.7)';
    ctx.shadowColor = 'rgba(94,234,212,.5)';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(width, hitY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function laneGuideLayer(width, height, layout, profile) {
    const density = Math.min(window.devicePixelRatio || 1, profile.dpr || 2);
    const geo = laneFrameGeometry(width, height);
    const key = [width, height, geo.lanesTop, geo.hitY, layout.order.join(','), layout.order.map(noteColor).join(','), density].join(':');
    if (state.laneGuideCanvas && state.laneGuideKey === key) return { canvas: state.laneGuideCanvas, key, fresh: false };
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    const guideCtx = canvas.getContext('2d');
    guideCtx.setTransform(density, 0, 0, density, 0, 0);
    drawLaneGuides(guideCtx, width, height, layout);
    state.laneGuideCanvas = canvas;
    state.laneGuideKey = key;
    return { canvas, key, fresh: true };
  }

  function renderLaneFrame(ctx, width, height) {
    const layout = laneLayout();
    const lanes = Math.max(1, layout.order.length);
    const laneW = width / lanes;
    const geo = laneFrameGeometry(width, height);
    const hitY = geo.hitY;
    const previewSeconds = 4.2 / state.speed;
    const profile = visualPerformanceProfile(width);
    const compactNotes = profile.name !== 'desktop';
    els.noteStage.classList.toggle('lanes-drum', geo.phoneLanes);
    if (geo.phoneLanes && els.stageDrumWrap) {
      // The drum at the bottom, under the lanes and above the play controls.
      const { cx, cy, drumSize } = geo.drum;
      const scale = drumSize / STAGE_DRUM_BASE;
      const key = `lanes:${cx.toFixed(2)}:${cy.toFixed(2)}:${scale.toFixed(4)}`;
      if (state.stageDrumGeometryKey !== key) {
        els.stageDrumWrap.style.left = `${cx}px`;
        els.stageDrumWrap.style.top = `${cy}px`;
        els.stageDrumWrap.style.setProperty('--stage-scale', scale.toFixed(4));
        state.stageDrumGeometryKey = key;
      }
    }
    drawLaneTargets(ctx, layout, laneW, hitY, profile);
    // Notes never fly over the stats along the top; below the hit line they fade away.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, geo.lanesTop, width, height - geo.lanesTop);
    ctx.clip();

    const activeIndices = new Set();
    const { start, end } = noteWindow(state.currentTime - 0.55, state.currentTime + previewSeconds);
    const visibleNotes = Math.max(1, end - start);
    state.perfVisibleNotes = end - start;
    const particleCount = particleCountWithinBudget(profile.fallingParticles, visibleNotes, profile);
    const particleClock = particleCount ? performance.now() / 1000 : 0;
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      const dt = note.time - state.currentTime;
      const y = hitY - (dt / previewSeconds) * (hitY - geo.lanesTop - 14);
      const x = (layout.pos.get(note.noteIndex) ?? 0) * laneW + laneW / 2;
      const travelProgress = Math.max(0, Math.min(1, 1 - dt / previewSeconds));
      const growth = compactNotes
        ? 0.72 + Math.pow(travelProgress, 0.72) * 0.48
        : 1;
      const baseNoteWidth = compactNotes
        ? Math.max(40, Math.min(56, width * .12))
        : Math.max(14, Math.min(56, laneW * .64));
      const radius = baseNoteWidth * growth / 2;
      const baseNoteHeight = compactNotes
        ? Math.max(28, Math.min(36, width * .08))
        : laneW < 30 ? 22 : 28;
      const noteHeight = baseNoteHeight * growth;
      const color = noteColor(note.noteIndex);
      const alpha = dt < -0.2 ? Math.max(0, 1 + dt * 2) : 1;
      const noteIsMoving = state.playing && !state.countInActive && state.mode !== 'wait';
      if (noteIsMoving && particleCount) {
        drawFallingNoteParticles(
          ctx, note, x, y, radius, noteHeight, color, alpha,
          particleCount, profile.particleShadows && state.particleQuality === 'full', particleClock
        );
      }
      const noteSprite = cachedNoteSprite('lane', color, radius * 2, noteHeight, dt < .15 && dt > -.15 ? 24 : 10, profile);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      drawCachedNoteSprite(ctx, noteSprite);
      ctx.restore();
      const labelSize = compactNotes
        ? Math.max(13, Math.min(18, width * .04 * growth))
        : laneW < 30 ? 10 : 13;
      const labelSprite = cachedNoteLabel(note.label, labelSize, note.inkColor, profile);
      drawCachedNoteLabel(ctx, labelSprite, x, y);
      ctx.globalAlpha = 1;
      if (Math.abs(dt) < .14) activeIndices.add(note.noteIndex);
    }
    ctx.restore();
    state.laneActive = activeIndices;
    return activeIndices;
  }

  function getPlacementTarget(placement, scale, cx, cy) {
    if (placement.manual) {
      // xp/yp are percentages of the drum diameter; x/y are pixels at the STAGE_DRUM_BASE size.
      const drumSize = STAGE_DRUM_BASE * scale;
      const x = cx + (placement.xp !== undefined ? (placement.xp / 100) * drumSize : placement.x * scale);
      const y = cy + (placement.yp !== undefined ? (placement.yp / 100) * drumSize : placement.y * scale);
      const vx = x - cx;
      const vy = y - cy;
      const length = Math.max(1, Math.hypot(vx, vy));
      return { x, y, dx: vx / length, dy: vy / length, distance: length };
    }
    const rad = placement.angle * Math.PI / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const distance = getTargetRadius(placement.ring) * scale;
    return { x: cx + dx * distance, y: cy + dy * distance, dx, dy, distance };
  }

  // Keeps the starfield twinkling and the amoeba drifting while the transport is idle.
  // Uses a battery-friendly idle rate and stands aside while playback drives the frames.
  function ambientTick(now) {
    state.ambientId = 0;
    if (!ambientWanted()) return;
    // Wait-for-note mode has no playback clock, so the ambient loop draws those frames too.
    const drivenByPlayback = state.playing && state.mode !== 'wait';
    const profile = visualPerformanceProfile();
    const ambientInterval = effectiveAmbientInterval(profile);
    if (!drivenByPlayback && !document.hidden && now - state.lastAmbientAt > ambientInterval) {
      state.lastAmbientAt = now;
      renderFrame();
    }
    startAmbientLoop();
  }

  function ambientWanted() {
    return state.visualMode === 'radial' || window.innerWidth <= 760;
  }

  function startAmbientLoop() {
    if (state.ambientId || !ambientWanted()) return;
    state.ambientId = requestAnimationFrame(ambientTick);
  }

  function stopAmbientLoop() {
    cancelAnimationFrame(state.ambientId);
    state.ambientId = 0;
  }

  function radialGeometry(width, height) {
    const aspect = width / Math.max(height, 1);
    let drumSize;

    // Phones and tablets previously fell into the 260px minimum because the desktop
    // width ratio is intentionally conservative. Give touch layouts more of the stage
    // while keeping enough breathing room for flying notes around the drum.
    if (width <= 760) {
      const mobileFloor = Math.min(290, Math.max(250, width - 20));
      const mobileTarget = Math.min(360, width * 0.54, height * 0.68);
      drumSize = Math.max(mobileFloor, mobileTarget);
    } else if (width <= 1100) {
      const tabletFloor = Math.min(320, Math.max(280, width - 28));
      const tabletTarget = Math.min(400, width * 0.42, height * 0.64);
      drumSize = Math.max(tabletFloor, tabletTarget);
    } else {
      // Desktop should feel consistent across window shapes, not jump between narrow
      // width presets. Let the drum grow mainly with the available stage height while
      // still respecting the stage width. This preserves the compact drum on short,
      // ultra-wide windows but makes it substantially larger on taller desktop layouts.
      const desktopFromHeight = height * 0.61;
      const desktopFromWidth = width * 0.38;
      drumSize = Math.max(270, Math.min(450, Math.min(desktopFromHeight, desktopFromWidth)));
    }

    const cx = width / 2;
    const cy = height / 2 + Math.min(14, height * .02);

    // Keep the main drum centred on every screen size. The companion drum occupies
    // its own overlay area and must not push the primary instrument off-centre on mobile.
    return fitDrumAboveTape({
      drumSize,
      scale: drumSize / STAGE_DRUM_BASE,
      cx,
      cy
    }, width);
  }

  function getHighDrumTarget(label, cx, cy, knownSlot = null) {
    const slot = Number.isInteger(knownSlot) ? knownSlot : highDrumSlotForLabel(label);
    const geometry = companionGeometry();
    if (slot < 0 || !geometry) return null;
    const angle = slot * Math.PI / 4;
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const tongueRadius = geometry.drumSize * .31;
    const x = geometry.cx + dx * tongueRadius;
    const y = geometry.cy + dy * tongueRadius;
    return {
      x,
      y,
      dx,
      dy,
      distance: tongueRadius,
      high: true,
      slot,
      companion: geometry
    };
  }

  function noteFlightRadius(dt, previewSeconds, targetRadius, startRadius) {
    const progress = Math.max(0, Math.min(1.18, 1 - dt / previewSeconds));
    const eased = 1 - Math.pow(1 - Math.min(progress, 1), 1.25);
    return startRadius + (targetRadius - startRadius) * eased;
  }

  function particleSeed(noteId, index, salt = 0) {
    const value = `${noteId}:${index}:${salt}`;
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  }

  // One reusable particle template is animated for every note. Notes only receive a
  // cached phase offset, so we no longer run four string hashes for every particle on
  // every frame. The trails keep their varied look without repeated random work.
  const PARTICLE_TEMPLATE = Array.from({ length: 36 }, (_, index) => {
    const wave = value => (Math.sin(value * 12.9898 + index * 78.233) * 43758.5453) % 1;
    const unit = value => Math.abs(wave(value));
    return {
      stream: index % 3 - 1,
      streamIndex: Math.floor(index / 3),
      side: unit(1.3),
      size: unit(2.7),
      phase: unit(4.1),
      speed: unit(6.9)
    };
  });

  function particlePhase(noteId) {
    if (state.particlePhaseCache.has(noteId)) return state.particlePhaseCache.get(noteId);
    const phase = particleSeed(noteId, 0, 91);
    state.particlePhaseCache.set(noteId, phase);
    return phase;
  }

  function drawFlyingNoteLabel(ctx, label, x, y, fontSize, inkColor) {
    const octave = splitOctaveMark(label);
    ctx.save();
    ctx.fillStyle = inkColor;
    ctx.font = `850 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(octave.base, x, y + 0.5);
    if (octave.mark) {
      const dotRadius = Math.max(2, Math.min(3, fontSize * 0.17));
      const dotOffset = Math.max(6, fontSize * 0.62);
      const dotY = y + (octave.mark === 'down' ? dotOffset : -dotOffset);
      const count = Math.max(1, octave.count || 1);
      const spacing = dotRadius * 2.65;
      for (let dot = 0; dot < count; dot++) {
        const dotX = x + (dot - (count - 1) / 2) * spacing;
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function cacheGet(cache, key) {
    return cache.has(key) ? cache.get(key) : null;
  }

  function cacheSet(cache, key, value, maximum) {
    cache.set(key, value);
    while (cache.size > maximum) cache.delete(cache.keys().next().value);
    return value;
  }

  function cachedNoteLabel(label, requestedFontSize, inkColor, profile) {
    const fontSize = Math.max(8, Math.round(requestedFontSize));
    const density = Math.min(window.devicePixelRatio || 1, profile.dpr || 2);
    const key = [label, fontSize, inkColor, density].join(':');
    const existing = cacheGet(noteLabelSpriteCache, key);
    if (existing) return existing;
    const cssWidth = Math.ceil(Math.max(24, fontSize * 2.2));
    const cssHeight = Math.ceil(Math.max(28, fontSize * 2.35));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(cssWidth * density));
    canvas.height = Math.max(1, Math.ceil(cssHeight * density));
    const labelCtx = canvas.getContext('2d');
    labelCtx.setTransform(density, 0, 0, density, 0, 0);
    drawFlyingNoteLabel(labelCtx, label, cssWidth / 2, cssHeight / 2, fontSize, inkColor);
    return cacheSet(noteLabelSpriteCache, key, { canvas, cssWidth, cssHeight }, 180);
  }

  function drawCachedNoteLabel(ctx, sprite, x, y) {
    ctx.drawImage(
      sprite.canvas,
      0,
      0,
      sprite.canvas.width,
      sprite.canvas.height,
      x - sprite.cssWidth / 2,
      y - sprite.cssHeight / 2,
      sprite.cssWidth,
      sprite.cssHeight
    );
  }

  function drawFallingNoteParticles(ctx, note, x, y, radius, noteHeight, color, alpha, particleCount, particleShadows, clock) {
    const { r, g, b, trail } = renderColorData(color);
    const notePhase = particlePhase(note.id);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = `rgba(${r},${g},${b},.9)`;
    if (!particleShadows) ctx.shadowBlur = 0;
    for (let particle = 0; particle < particleCount; particle++) {
      const template = PARTICLE_TEMPLATE[particle];
      const stream = template.stream;
      const streamIndex = template.streamIndex;
      const sideSeed = template.side;
      const sizeSeed = template.size;
      const phaseSeed = (template.phase + notePhase) % 1;
      const speedSeed = template.speed;
      const flow = (streamIndex / 9 + clock * (0.58 + speedSeed * 0.26) + phaseSeed * 0.08) % 1;
      const life = Math.sin(flow * Math.PI);
      const tailLength = noteHeight * (0.34 + flow * 2.35) * (stream === 0 ? 1.18 : 1);
      const spread = radius * (0.12 + flow * 0.42);
      const weave = Math.sin(clock * (2 + speedSeed) + phaseSeed * Math.PI * 2) * radius * 0.1;
      const particleX = x + stream * spread + weave + (sideSeed - 0.5) * radius * 0.16;
      const particleY = y - tailLength;
      const twinkle = 0.55 + 0.45 * Math.abs(Math.sin(clock * (3 + sizeSeed * 3) + phaseSeed * Math.PI * 2));
      const particleSize = (0.65 + sizeSeed * 1.45) * (0.62 + life * 0.68);
      ctx.globalAlpha = alpha * (0.14 + life * 0.72) * twinkle;
      ctx.fillStyle = stream === 0 && streamIndex % 3 === 0
        ? '#ffffff'
        : `rgb(${trail.r},${trail.g},${trail.b})`;
      if (particleShadows) ctx.shadowBlur = 5 + life * 7;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function renderRadialFrame(ctx, width, height) {
    const previewSeconds = 4.2 / state.speed;
    const { drumSize, scale, cx, cy } = radialGeometry(width, height);
    const profile = visualPerformanceProfile(width);
    const compactNotes = profile.name !== 'desktop';
    const geometryKey = `${cx.toFixed(2)}:${cy.toFixed(2)}:${scale.toFixed(4)}`;
    if (els.stageDrumWrap && state.stageDrumGeometryKey !== geometryKey) {
      els.stageDrumWrap.style.left = `${cx}px`;
      els.stageDrumWrap.style.top = `${cy}px`;
      els.stageDrumWrap.style.setProperty('--stage-scale', scale.toFixed(4));
      state.stageDrumGeometryKey = geometryKey;
    }

    const started = playbackStarted();
    const activeIndices = new Set();
    const { start, end } = noteWindow(state.currentTime - 0.48, state.currentTime + previewSeconds);
    const visibleNotes = Math.max(1, end - start);
    const particleClock = state.particleQuality === 'none' ? 0 : performance.now() / 1000;
    state.perfVisibleNotes = end - start;
    for (let index = start; index < end; index += 1) {
      const note = state.parsedNotes[index];
      const dt = note.time - state.currentTime;
      // Before the transport rolls, keep notes clear of the drum so every label is legible.
      if (!started && dt < 0.42) continue;
      if (!started && note.highDrumSlot >= 0) continue;

      const target = getHighDrumTarget(note.label, cx, cy, note.highDrumSlot)
        || getPlacementTarget(note.placement, scale, cx, cy);
      const progress = Math.max(0, Math.min(1.18, 1 - dt / previewSeconds));
      const eased = 1 - Math.pow(1 - Math.min(progress, 1), 1.25);

      let x;
      let y;
      let impactX;
      let impactY;
      let trailDx = target.dx;
      let trailDy = target.dy;
      let targetRadius = target.distance + 12 * scale;

      if (target.high) {
        const geometry = target.companion;
        const edgeRadius = distanceToStageEdge(
          geometry.localCx,
          geometry.localCy,
          target.dx,
          target.dy,
          geometry.zoneWidth,
          geometry.zoneHeight,
          17
        );
        const startX = geometry.cx + target.dx * edgeRadius;
        const startY = geometry.cy + target.dy * edgeRadius;
        x = startX + (target.x - startX) * eased;
        y = startY + (target.y - startY) * eased;
        impactX = target.x;
        impactY = target.y;
      } else {
        const startRadius = Math.max(
          targetRadius + 75,
          distanceToStageEdge(cx, cy, target.dx, target.dy, width, height, 22)
        );
        const radius = noteFlightRadius(dt, previewSeconds, targetRadius, startRadius);
        x = cx + target.dx * radius;
        y = cy + target.dy * radius;
        impactX = cx + target.dx * targetRadius;
        impactY = cy + target.dy * targetRadius;
      }

      // Flying notes always stay on the foreground canvas. Sending a main note to the
      // backdrop when it crossed the companion area also placed it behind the main drum.
      const drawCtx = ctx;
      const depthAlpha = 1;

      // Companion animation is clipped to its own panel. It can no longer spill over the
      // main drum, toolbar or neighbouring companion meridians.
      let companionClip = false;
      if (target.high) {
        const geometry = target.companion;
        drawCtx.save();
        roundRect(
          drawCtx,
          geometry.zoneX + 2,
          geometry.zoneY + 2,
          geometry.zoneWidth - 4,
          geometry.zoneHeight - 4,
          22
        );
        drawCtx.clip();
        companionClip = true;
      }

      const color = note.color;
      const { r, g, b, highlight, light } = renderColorData(color);
      const highlightR = highlight.r;
      const highlightG = highlight.g;
      const highlightB = highlight.b;
      const lightR = light.r;
      const lightG = light.g;
      const lightB = light.b;
      const travelProgress = Math.max(0, Math.min(1, 1 - dt / previewSeconds));
      const growth = (compactNotes ? 0.72 : 0.58)
        + Math.pow(travelProgress, 0.72) * (compactNotes ? 0.48 : 0.54);
      const alpha = (dt < -0.18 ? Math.max(0, 1 + dt * 2.5) : 1) * depthAlpha;
      const approach = Math.max(0, Math.min(1, 1 - Math.abs(dt) / 0.6));
      const mainCapsuleW = compactNotes
        ? Math.max(40, Math.min(56, 44 * scale + 10))
        : Math.max(32, Math.min(48, 38 * scale + 8));
      const mainCapsuleH = compactNotes
        ? Math.max(28, Math.min(36, 30 * scale + 7))
        : Math.max(22, Math.min(30, 24 * scale + 5));
      const companionGem = target.high
        ? compactNotes
          ? Math.max(28, Math.min(38, 24 + target.companion.drumSize * .075))
          : Math.max(23, Math.min(34, 20 + target.companion.drumSize * .07))
        : 0;
      const capsuleW = (target.high ? companionGem : mainCapsuleW) * growth * (1 + approach * 0.06);
      const capsuleH = (target.high ? companionGem : mainCapsuleH) * growth * (1 + approach * 0.06);
      const angle = target.high ? 0 : Math.atan2(target.dy, target.dx);
      const noteIsMoving = state.playing && !state.countInActive && state.mode !== 'wait';

      if (noteIsMoving) {
        // Companion trails are intentionally shorter and calmer. The diamond shape plus
        // the cool halo makes them distinct without replacing each tongue's note colour.
        const notePhase = particlePhase(note.id);
        const perpendicularX = -trailDy;
        const perpendicularY = trailDx;
        const maximumParticles = target.high ? profile.companionParticles : profile.radialParticles;
        const particleCount = particleCountWithinBudget(maximumParticles, visibleNotes, profile);
        if (particleCount) {
          drawCtx.save();
          drawCtx.globalCompositeOperation = 'lighter';
          drawCtx.shadowColor = target.high ? 'rgba(103,232,249,.9)' : `rgba(${r},${g},${b},.9)`;
          if (!(profile.particleShadows && state.particleQuality === 'full')) drawCtx.shadowBlur = 0;
          for (let particle = 0; particle < particleCount; particle++) {
          const template = PARTICLE_TEMPLATE[particle];
          const stream = template.stream;
          const streamIndex = template.streamIndex;
          const sideSeed = template.side;
          const sizeSeed = template.size;
          const phaseSeed = (template.phase + notePhase) % 1;
          const speedSeed = template.speed;
          const rows = target.high ? 6 : 12;
          const flow = (streamIndex / rows + particleClock * (0.55 + speedSeed * 0.24) + phaseSeed * 0.08) % 1;
          const life = Math.sin(flow * Math.PI);
          const centreTailStretch = stream === 0 ? (target.high ? 1.16 : 1.38) : 1;
          const along = capsuleW * (target.high ? 0.18 + flow * 0.43 : 0.25 + flow * 0.58) * centreTailStretch;
          const streamGap = capsuleH * (target.high ? 0.2 + flow * 0.13 : 0.3 + flow * 0.2);
          const weave = Math.sin(particleClock * (1.7 + speedSeed * 0.8) + phaseSeed * Math.PI * 2 + stream * 1.9)
            * capsuleH * (target.high ? 0.04 : 0.065);
          const jitter = (sideSeed - 0.5) * capsuleH * (target.high ? 0.09 : 0.16);
          const sideways = stream * streamGap + weave + jitter;
          const particleX = x + trailDx * along + perpendicularX * sideways;
          const particleY = y + trailDy * along + perpendicularY * sideways;
          const twinkle = 0.55 + 0.45 * Math.abs(Math.sin(particleClock * (2.8 + sizeSeed * 3.2) + phaseSeed * Math.PI * 2));
          const particleSize = (0.55 + sizeSeed * 1.5) * (0.6 + life * 0.65) * (0.72 + growth * 0.28);
          drawCtx.globalAlpha = alpha * (target.high ? 0.12 + life * 0.52 : 0.16 + life * 0.7) * twinkle;
          drawCtx.fillStyle = target.high && streamIndex % 3 === 0
            ? 'rgb(165,243,252)'
            : stream === 0 && streamIndex % 4 === 0
              ? `rgb(${highlightR},${highlightG},${highlightB})`
              : `rgb(${lightR},${lightG},${lightB})`;
          if (profile.particleShadows && state.particleQuality === 'full') drawCtx.shadowBlur = target.high ? 4 + life * 5 : 5 + life * 7;
          drawCtx.beginPath();
          drawCtx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          drawCtx.fill();
          }
          drawCtx.restore();
        }
      }

      // Impact ring as the note lands on its tongue.
      if (noteIsMoving && Math.abs(dt) < 0.26) {
        const hit = 1 - Math.abs(dt) / 0.26;
        drawCtx.save();
        drawCtx.globalAlpha = alpha * hit * (target.high ? 0.7 : 0.55);
        drawCtx.strokeStyle = target.high ? 'rgb(103,232,249)' : `rgb(${r},${g},${b})`;
        drawCtx.lineWidth = target.high ? 1.8 * hit : 2.4 * hit;
        drawCtx.beginPath();
        drawCtx.arc(impactX, impactY, (target.high ? 9 + (1 - hit) * 22 : (12 + (1 - hit) * 34) * scale), 0, Math.PI * 2);
        drawCtx.stroke();
        drawCtx.restore();
      }

      drawCtx.save();
      drawCtx.globalAlpha = alpha;
      drawCtx.translate(x, y);
      drawCtx.rotate(angle);
      const spriteBlur = target.high
        ? 8 + approach * 16
        : (10 + approach * 24) * Math.max(0.8, scale);
      const noteSprite = cachedNoteSprite(target.high ? 'high' : 'radial', color, capsuleW, capsuleH, spriteBlur, profile);
      drawCachedNoteSprite(drawCtx, noteSprite);
      drawCtx.restore();

      drawCtx.save();
      drawCtx.globalAlpha = alpha;
      const labelSize = target.high
        ? compactNotes
          ? Math.max(12, Math.min(16, (12 + target.companion.drumSize * .012) * growth))
          : Math.max(8, Math.min(13, (9.5 + target.companion.drumSize * .012) * growth))
        : compactNotes
          ? Math.max(13, Math.min(18, (14 + scale * 3) * growth))
          : Math.max(8, Math.min(15, (11 + scale * 2) * growth));
      const labelSprite = cachedNoteLabel(note.label, labelSize, note.inkColor, profile);
      drawCachedNoteLabel(drawCtx, labelSprite, x, y);
      drawCtx.restore();

      if (companionClip) drawCtx.restore();
      if (started && Math.abs(dt) < .14) activeIndices.add(note.noteIndex);
    }
    return activeIndices;
  }

  function getTargetRadius(ring) {
    if (state.instrument.count === 11 || state.instrument.count === 13) return 126;
    if (state.instrument.count === 8) return 116;
    return 102;
  }

  function distanceToStageEdge(cx, cy, dx, dy, width, height, margin) {
    const values = [];
    if (dx > .0001) values.push((width - margin - cx) / dx);
    if (dx < -.0001) values.push((margin - cx) / dx);
    if (dy > .0001) values.push((height - margin - cy) / dy);
    if (dy < -.0001) values.push((margin - cy) / dy);
    return Math.max(0, Math.min(...values.filter(value => value > 0)));
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function roundedDiamond(ctx, size, corner = 5) {
    const half = size / 2;
    const c = Math.min(corner, half * .32);
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.quadraticCurveTo(c, -half + c, half - c, -c);
    ctx.quadraticCurveTo(half, 0, half - c, c);
    ctx.quadraticCurveTo(c, half - c, 0, half);
    ctx.quadraticCurveTo(-c, half - c, -half + c, c);
    ctx.quadraticCurveTo(-half, 0, -half + c, -c);
    ctx.quadraticCurveTo(-c, -half + c, 0, -half);
    ctx.closePath();
  }

  function cachedNoteSprite(kind, color, requestedWidth, requestedHeight, requestedBlur, profile) {
    const width = Math.max(8, Math.round(requestedWidth / 4) * 4);
    const height = Math.max(8, Math.round(requestedHeight / 4) * 4);
    const shadowBlur = Math.max(0, Math.round(requestedBlur / 4) * 4);
    const density = Math.min(window.devicePixelRatio || 1, profile.dpr || 2);
    const key = [kind, color, width, height, shadowBlur, density].join(':');
    const existing = cacheGet(noteSpriteCache, key);
    if (existing) return existing;
    const padding = Math.ceil(shadowBlur * 1.75 + 4);
    const cssWidth = width + padding * 2;
    const cssHeight = height + padding * 2;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(cssWidth * density));
    canvas.height = Math.max(1, Math.ceil(cssHeight * density));
    const spriteCtx = canvas.getContext('2d');
    spriteCtx.setTransform(density, 0, 0, density, 0, 0);
    spriteCtx.translate(cssWidth / 2, cssHeight / 2);
    const data = renderColorData(color);
    if (kind === 'lane') spriteCtx.fillStyle = color;
    else {
      const gradient = spriteCtx.createLinearGradient(-width * .42, -height * .45, width * .42, height * .45);
      gradient.addColorStop(0, `rgb(${data.highlight.r},${data.highlight.g},${data.highlight.b})`);
      gradient.addColorStop(.3, `rgb(${data.light.r},${data.light.g},${data.light.b})`);
      gradient.addColorStop(.62, `rgb(${data.r},${data.g},${data.b})`);
      gradient.addColorStop(1, `rgb(${data.light.r},${data.light.g},${data.light.b})`);
      spriteCtx.fillStyle = gradient;
    }
    spriteCtx.shadowColor = kind === 'high' ? 'rgba(103,232,249,.95)' : color;
    spriteCtx.shadowBlur = shadowBlur;
    if (kind === 'high') roundedDiamond(spriteCtx, width, Math.max(6, width * .24));
    else roundRect(spriteCtx, -width / 2, -height / 2, width, height, height / 2);
    spriteCtx.fill();
    spriteCtx.shadowBlur = 0;
    if (kind !== 'lane') {
      spriteCtx.strokeStyle = kind === 'high' ? 'rgba(207,250,254,.76)' : 'rgba(255,255,255,.28)';
      spriteCtx.lineWidth = kind === 'high' ? 1.25 : 1;
      spriteCtx.stroke();
    }
    const sprite = { canvas, cssWidth, cssHeight };
    return cacheSet(noteSpriteCache, key, sprite, 320);
  }

  function drawCachedNoteSprite(ctx, sprite) {
    ctx.drawImage(sprite.canvas, 0, 0, sprite.canvas.width, sprite.canvas.height, -sprite.cssWidth / 2, -sprite.cssHeight / 2, sprite.cssWidth, sprite.cssHeight);
  }

  function soundBufferKey(midi, referencePitch = REFERENCE_PITCH) {
    return `${Number(midi)}:${Number(referencePitch).toFixed(3)}`;
  }

  function featuredStartupSong() {
    return state.songs.find(song => String(song.title || '').toLocaleLowerCase().startsWith('the wind rises')) || null;
  }

  async function renderSoundBuffer(midi, referencePitch = REFERENCE_PITCH) {
    const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineContext) return null;
    // Rendered at the speaker's own rate, so playback never has to resample.
    const sampleRate = initialiseAudioGraph()?.sampleRate || 44100;
    const duration = 1.4;
    const context = new OfflineContext(1, Math.ceil(sampleRate * duration), sampleRate);
    const frequency = Number(referencePitch) * Math.pow(2, (Number(midi) - 69) / 12);
    const master = context.createGain();
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const filter = context.createBiquadFilter();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, 0);
    osc2.frequency.setValueAtTime(frequency * 2.003, 0);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3500, frequency * 7), 0);
    filter.Q.value = .8;
    master.gain.setValueAtTime(.0001, 0);
    master.gain.exponentialRampToValueAtTime(.24, .008);
    master.gain.exponentialRampToValueAtTime(.0001, 1.35);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(master);
    master.connect(context.destination);
    osc1.start(0);
    osc2.start(0);
    osc1.stop(duration);
    osc2.stop(duration);
    return context.startRendering();
  }

  function soundCachePlan() {
    const referencePitch = state.instrument?.referencePitch || REFERENCE_PITCH;
    const unique = new Map();
    const addMidi = midi => {
      const value = Number(midi);
      if (Number.isFinite(value)) unique.set(soundBufferKey(value, referencePitch), { midi: value, referencePitch });
    };
    const windRises = featuredStartupSong();
    if (windRises) {
      parseSequence(windRises.sequence, windRises.bpm).notes.forEach(note => addMidi(playableNoteAt(note.noteIndex)?.midi));
    }
    const featuredCount = unique.size;
    (state.instrument?.notes || []).forEach(note => addMidi(note.midi));
    if (state.instrument?.count === 15) configuredCompanionNotes().forEach(note => addMidi(note.midi));
    return { sounds: [...unique.values()], featuredCount, featuredTitle: windRises ? 'The Wind Rises' : '' };
  }

  async function preWarmAllNoteVisuals(onProgress = null) {
    const width = els.noteCanvas?.clientWidth || 0;
    const height = els.noteCanvas?.clientHeight || 0;
    if (!width || !height) return { prepared: 0, total: 0 };

    const profile = visualPerformanceProfile(width);
    const compactNotes = profile.name !== 'desktop';
    const geometry = radialGeometry(width, height);
    const laneWidth = width / Math.max(1, playableNotes().length);
    const companion = companionGeometry();
    const growthSteps = compactNotes ? [.72, .96, 1.2] : [.62, .9, 1.12];

    // Warm the first song first, then every remaining tongue. This keeps The Wind Rises
    // startup-friendly without leaving any other tongue color/label uncached before the tour.
    const ordered = [];
    const seen = new Set();
    const addNote = note => {
      if (!note || !Number.isInteger(note.noteIndex)) return;
      const key = `${note.noteIndex}:${note.label}`;
      if (seen.has(key)) return;
      seen.add(key);
      const playable = playableNoteAt(note.noteIndex);
      const color = normaliseColor(playable?.color, note.noteIndex);
      ordered.push({
        ...note,
        color,
        inkColor: noteInkColor(color),
        highDrumSlot: highDrumSlotForLabel(note.label)
      });
    };

    const featured = featuredStartupSong();
    if (featured) preparePlaybackNotes(parseSequence(featured.sequence, featured.bpm).notes).forEach(addNote);
    playableNotes().forEach(note => addNote({ noteIndex: note.noteIndex, label: note.label }));

    let prepared = 0;
    onProgress?.(prepared, ordered.length);
    for (const note of ordered) {
      for (const growth of growthSteps) {
        const laneBaseWidth = compactNotes
          ? Math.max(40, Math.min(56, width * .12))
          : Math.max(14, Math.min(56, laneWidth * .64));
        const laneBaseHeight = compactNotes
          ? Math.max(28, Math.min(36, width * .08))
          : laneWidth < 30 ? 22 : 28;
        cachedNoteSprite('lane', note.color, laneBaseWidth * growth, laneBaseHeight * growth, growth > 1.05 ? 24 : 10, profile);
        const laneLabelSize = compactNotes
          ? Math.max(13, Math.min(18, width * .04 * growth))
          : laneWidth < 30 ? 10 : 13;
        cachedNoteLabel(note.label, laneLabelSize, note.inkColor, profile);

        const high = note.highDrumSlot >= 0;
        const mainWidth = compactNotes
          ? Math.max(40, Math.min(56, 44 * geometry.scale + 10))
          : Math.max(32, Math.min(48, 38 * geometry.scale + 8));
        const mainHeight = compactNotes
          ? Math.max(28, Math.min(36, 30 * geometry.scale + 7))
          : Math.max(22, Math.min(30, 24 * geometry.scale + 5));
        const highSize = compactNotes
          ? Math.max(28, Math.min(38, 24 + (companion?.drumSize || 120) * .075))
          : Math.max(23, Math.min(34, 20 + (companion?.drumSize || 120) * .07));
        const radialWidth = (high ? highSize : mainWidth) * growth;
        const radialHeight = (high ? highSize : mainHeight) * growth;
        cachedNoteSprite(high ? 'high' : 'radial', note.color, radialWidth, radialHeight, high ? 16 : 18, profile);
        const radialLabelSize = high
          ? compactNotes ? Math.max(12, Math.min(16, 13 * growth)) : Math.max(8, Math.min(13, 10 * growth))
          : compactNotes ? Math.max(13, Math.min(18, (14 + geometry.scale * 3) * growth)) : Math.max(8, Math.min(15, (11 + geometry.scale * 2) * growth));
        cachedNoteLabel(note.label, radialLabelSize, note.inkColor, profile);
      }
      prepared += 1;
      onProgress?.(prepared, ordered.length);
      if (prepared % 4 === 0) await new Promise(resolve => window.setTimeout(resolve, 0));
    }
    return { prepared, total: ordered.length };
  }

  async function preCacheInstrumentSounds(onProgress = null) {
    const generation = ++soundCacheGeneration;
    const plan = soundCachePlan();
    soundBufferCache.clear();
    onProgress?.(0, plan.sounds.length, plan);
    if (!(window.OfflineAudioContext || window.webkitOfflineAudioContext)) return { cached: 0, total: plan.sounds.length, supported: false };
    let cached = 0;
    for (const sound of plan.sounds) {
      if (generation !== soundCacheGeneration) return { cached, total: plan.sounds.length, cancelled: true };
      try {
        const buffer = await renderSoundBuffer(sound.midi, sound.referencePitch);
        if (buffer && generation === soundCacheGeneration) {
          soundBufferCache.set(soundBufferKey(sound.midi, sound.referencePitch), buffer);
          cached += 1;
        }
      } catch (error) {
        console.warn(`Could not cache MIDI note ${sound.midi}:`, error);
      }
      onProgress?.(cached, plan.sounds.length, plan);
    }
    return { cached, total: plan.sounds.length, supported: true };
  }

  function initialiseAudioGraph() {
    if (!state.audioContext || state.audioContext.state === 'closed') {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      state.masterGain = state.audioContext.createGain();
      state.masterGain.gain.value = document.hidden ? 0 : 1;
      // Phone and tablet speakers are small: a little more level there, with a limiter so
      // several ringing notes together never clip and crackle.
      if (window.matchMedia?.('(pointer: coarse)').matches) {
        const boost = state.audioContext.createGain();
        boost.gain.value = 1.35;
        const limiter = state.audioContext.createDynamicsCompressor();
        limiter.threshold.value = -3;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.002;
        limiter.release.value = 0.12;
        state.masterGain.connect(boost).connect(limiter).connect(state.audioContext.destination);
      } else {
        state.masterGain.connect(state.audioContext.destination);
      }
    }
    return state.audioContext;
  }

  function primeAudioFromGesture() {
    const context = initialiseAudioGraph();
    try {
      const source = context.createBufferSource();
      source.buffer = context.createBuffer(1, 1, Math.max(8000, context.sampleRate || 44100));
      source.connect(state.masterGain || context.destination);
      source.start(0);
    } catch {}
    if (context.state !== 'running') context.resume().catch(() => {});
    return context;
  }

  async function ensureAudio(timeoutMs = 500) {
    const context = initialiseAudioGraph();
    if (context.state !== 'running') {
      await new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error('Audio start timed out')), timeoutMs);
        Promise.resolve(context.resume()).then(() => {
          window.clearTimeout(timer);
          resolve();
        }, error => {
          window.clearTimeout(timer);
          reject(error);
        });
      });
    }
    if (context.state !== 'running') throw new Error('Audio is not available yet');
    return context;
  }

  function setAudioMuted(muted) {
    if (!state.audioContext || !state.masterGain) return;
    const now = state.audioContext.currentTime;
    state.masterGain.gain.cancelScheduledValues(now);
    state.masterGain.gain.setValueAtTime(muted ? 0 : 1, now);
  }

  function trackScheduledAudio(nodes, startTime) {
    const record = { nodes, startTime };
    state.scheduledAudioNodes.add(record);
    const finishNode = nodes[0];
    if (finishNode) finishNode.addEventListener('ended', () => state.scheduledAudioNodes.delete(record), { once: true });
  }

  function cancelFutureScheduledAudio() {
    const now = state.audioContext?.currentTime ?? 0;
    state.scheduledAudioNodes.forEach(record => {
      if (record.startTime <= now + .005) return;
      record.nodes.forEach(node => {
        try { node.stop(); } catch {}
      });
      state.scheduledAudioNodes.delete(record);
    });
  }

  // A tongue struck again does not ring twice: the earlier ring is damped. Without this
  // two copies of the same note drift in and out of phase (a whooshing, crackly sound when
  // a note is tapped quickly several times).
  const ringingVoices = new Map();
  function chokeSameNote(midi, voice) {
    const now = state.audioContext.currentTime;
    const list = (ringingVoices.get(midi) || []).filter(v => v.end > now);
    list.forEach(v => {
      if (v.choked) return;
      if (v.start < voice.start - 0.004) {
        v.choked = true;
        try { v.gain.gain.setTargetAtTime(0, voice.start, 0.014); v.source.stop(voice.start + 0.12); } catch {}
      } else if (v.start > voice.start + 0.004 && !voice.choked) {
        voice.choked = true;
        try { voice.gain.gain.setTargetAtTime(0, v.start, 0.014); voice.source.stop(v.start + 0.12); } catch {}
      }
    });
    list.push(voice);
    ringingVoices.set(midi, list);
  }

  async function playMidi(midi, referencePitch = 440, accent = false, delaySeconds = 0, gain = 1) {
    const requestedAt = performance.now();
    let context = state.audioContext;
    if (!context || context.state !== 'running') context = await ensureAudio();
    const elapsedSeconds = (performance.now() - requestedAt) / 1000;
    if (elapsedSeconds > Math.max(0, delaySeconds) + .18) return false;
    const startTime = context.currentTime + Math.max(0, delaySeconds - elapsedSeconds);
    const cachedBuffer = soundBufferCache.get(soundBufferKey(midi, referencePitch));
    if (cachedBuffer) {
      const source = context.createBufferSource();
      source.buffer = cachedBuffer;
      const level = context.createGain();
      level.gain.setValueAtTime((accent ? 4 / 3 : 1) * gain, startTime);
      source.connect(level).connect(state.masterGain || context.destination);
      source.start(startTime);
      trackScheduledAudio([source], startTime);
      chokeSameNote(midi, { source, gain: level, start: startTime, end: startTime + cachedBuffer.duration });
      return true;
    }
    const frequency = Number(referencePitch) * Math.pow(2, (Number(midi) - 69) / 12);
    const master = context.createGain();
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const filter = context.createBiquadFilter();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, startTime);
    osc2.frequency.setValueAtTime(frequency * 2.003, startTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3500, frequency * 7), startTime);
    filter.Q.value = .8;

    const peak = accent ? .32 : .24;
    master.gain.setValueAtTime(.0001, startTime);
    master.gain.exponentialRampToValueAtTime(peak, startTime + .008);
    master.gain.exponentialRampToValueAtTime(.0001, startTime + 1.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(master);
    master.connect(state.masterGain || context.destination);
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 1.4);
    osc2.stop(startTime + 1.4);
    trackScheduledAudio([osc1, osc2], startTime);
    return true;
  }

  async function playTone(noteIndex, accent = false, delaySeconds = 0) {
    const midi = playableNoteAt(noteIndex)?.midi ?? 60;
    return playMidi(midi, state.instrument.referencePitch || 440, accent, delaySeconds);
  }

  async function playClick(accent, delaySeconds = 0) {
    const requestedAt = performance.now();
    let context = state.audioContext;
    if (!context || context.state !== 'running') context = await ensureAudio();
    const elapsedSeconds = (performance.now() - requestedAt) / 1000;
    if (elapsedSeconds > Math.max(0, delaySeconds) + .18) return false;
    const startTime = context.currentTime + Math.max(0, delaySeconds - elapsedSeconds);
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'square';
    osc.frequency.value = accent ? 1300 : 900;
    gain.gain.setValueAtTime(.08, startTime);
    gain.gain.exponentialRampToValueAtTime(.0001, startTime + .045);
    osc.connect(gain).connect(state.masterGain || context.destination);
    osc.start(startTime);
    osc.stop(startTime + .05);
    trackScheduledAudio([osc], startTime);
    return true;
  }

  function flashPad(noteIndex, className = 'active', duration = 190, noteLabel = null) {
    const pads = state.tonguePadsByNote.get(noteIndex)
      || [...document.querySelectorAll(`.tongue[data-note-index="${noteIndex}"]`)];
    const routesToCompanion = noteLabel === null ? null : highDrumSlotForLabel(noteLabel) >= 0;
    pads.forEach(pad => {
      if (routesToCompanion !== null) {
        const isCompanionPad = pad.classList.contains('high-tongue');
        if (isCompanionPad !== routesToCompanion) return;
      }
      pad.classList.add(className);
      let timers = padFlashTimers.get(pad);
      if (!timers) {
        timers = new Map();
        padFlashTimers.set(pad, timers);
      }
      window.clearTimeout(timers.get(className));
      timers.set(className, window.setTimeout(() => {
        pad.classList.remove(className);
        timers.delete(className);
      }, duration));
    });
  }

  function micExpectsNote(noteIndex) {
    if (state.mode === 'wait') return state.parsedNotes[state.waitingIndex]?.noteIndex === noteIndex;
    const windowSize = .42 / state.speed;
    return state.parsedNotes.some(note => note.noteIndex === noteIndex && !state.hitNotes.has(note.id) && Math.abs(note.time - state.currentTime) <= windowSize);
  }

  function handleUserNote(noteIndex, options = {}) {
    if (options.source === 'microphone') {
      // A tongue rings for a while and its swell can sound like a second strike. The same
      // note again within ~1.3 s only counts when the song asks for it.
      const heardAt = performance.now();
      if (noteIndex === state.micLastNote && heardAt - state.micLastAt < 1300 && !micExpectsNote(noteIndex)) return;
      state.micLastNote = noteIndex;
      state.micLastAt = heardAt;
    }
    if (options.source !== 'microphone') {
      primeAudioFromGesture();
      playTone(noteIndex, true).catch(() => {});
      state.micEchoUntil = performance.now() + 380;
    }
    flashPad(noteIndex, 'active');
    if (!state.playing && state.mode !== 'wait') return;

    if (state.mode === 'wait') {
      const expected = state.parsedNotes[state.waitingIndex];
      if (!expected) return;
      state.attempts += 1;
      if (expected.noteIndex === noteIndex) {
        state.score += 1;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        state.hitNotes.add(expected.id);
        tapeJudge(state.missedNoteIds.has(expected.id) ? 'good' : 'hit');
        state.waitingIndex += 1;
        state.currentTime = Math.min(state.duration, (state.parsedNotes[state.waitingIndex]?.time ?? state.duration));
        const chordDone = (state.parsedNotes[state.waitingIndex]?.time ?? Infinity) > expected.time + 0.01;
        if (state.waitStyle === 'game' && chordDone) playChime();
        if (state.waitingIndex >= state.parsedNotes.length) finishPlayback();
        else scheduleWaitHint(expected);
      } else {
        state.missedNoteIds.add(expected.id);
        state.streak = 0;
        flashPad(noteIndex, 'wrong');
        tapeJudge('wrong');
      }
      updatePracticeUI();
      renderFrame();
      return;
    }

    if (state.mode === 'practice') {
      const windowSize = .42 / state.speed;
      const candidates = state.parsedNotes.filter(n => !state.hitNotes.has(n.id) && Math.abs(n.time - state.currentTime) <= windowSize);
      state.attempts += 1;
      const match = candidates.find(n => n.noteIndex === noteIndex);
      if (match) {
        state.hitNotes.add(match.id);
        const timing = Math.abs(match.time - state.currentTime);
        state.score += timing < .16 ? 1 : .75;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        const quality = timing < .16 ? 'perfect' : 'good';
        tape.quality.set(match.id, quality);
        tapeJudge(quality);
      } else {
        const nearestExpected = candidates.slice().sort((a, b) => Math.abs(a.time - state.currentTime) - Math.abs(b.time - state.currentTime))[0];
        if (nearestExpected) state.missedNoteIds.add(nearestExpected.id);
        state.streak = 0;
        flashPad(noteIndex, 'wrong');
        tapeJudge('wrong');
      }
      updatePracticeUI();
    }
  }

  function frequencyForMidi(midi, referencePitch = 440) {
    return Number(referencePitch) * Math.pow(2, (Number(midi) - 69) / 12);
  }

  function setMicStatus(message, stateName = '') {
    if (!els.micStatus) return;
    els.micStatus.textContent = message;
    els.micStatus.classList.remove('listening', 'heard', 'error');
    if (stateName) els.micStatus.classList.add(stateName);
  }

  function resetTunerDisplay(message = 'Turn on the microphone to begin') {
    state.tunerResult = null;
    if (!els.tunerPanel) return;
    els.tunerPanel.dataset.tone = 'neutral';
    els.tunerLabel.textContent = '...';
    els.tunerNoteName.textContent = state.micEnabled ? 'Strike a tongue' : 'Microphone off';
    els.tunerCents.textContent = message;
    els.tunerNeedle.style.left = '50%';
    els.tunerMeter.setAttribute('aria-valuenow', '0');
  }

  function updateTunerDisplay(result) {
    if (!result || !els.tunerPanel) {
      resetTunerDisplay('Pitch unclear. Try one firm strike.');
      return;
    }
    state.tunerResult = result;
    const note = playableNoteAt(result.noteIndex);
    const signedCents = Number.isFinite(result.signedCents) ? result.signedCents : null;
    const roundedCents = signedCents === null ? null : Math.round(signedCents);
    const inTune = roundedCents !== null && Math.abs(roundedCents) <= 12;
    const tone = roundedCents === null ? 'neutral' : inTune ? 'in-tune' : roundedCents < 0 ? 'flat' : 'sharp';
    const direction = inTune ? 'In tune' : roundedCents === null ? 'Pitch unstable' : roundedCents < 0 ? 'Slightly flat' : 'Slightly sharp';
    const centsText = roundedCents === null ? direction : `${roundedCents > 0 ? '+' : ''}${roundedCents} cents, ${direction.toLowerCase()}`;
    const meterCents = Math.max(-50, Math.min(50, roundedCents || 0));

    els.tunerPanel.dataset.tone = tone;
    els.tunerLabel.textContent = note.label;
    els.tunerNoteName.textContent = midiToName(note.midi);
    els.tunerCents.textContent = centsText;
    els.tunerNeedle.style.left = `${50 + meterCents}%`;
    els.tunerMeter.setAttribute('aria-valuenow', String(roundedCents || 0));
  }

  function updateMicUI() {
    if (!els.micBtn) return;
    els.micBtn.classList.toggle('active', state.micEnabled);
    els.micBtn.setAttribute('aria-pressed', String(state.micEnabled));
    els.micBtn.innerHTML = `${MIC_ICON} Mic ${state.micEnabled ? 'on' : 'off'}`;
    if (els.stageMicBtn) {
      els.stageMicBtn.lastElementChild.textContent = `Mic ${state.micEnabled ? 'on' : 'off'}`;
      els.stageMicBtn.classList.toggle('active', state.micEnabled);
      els.stageMicBtn.setAttribute('aria-pressed', String(state.micEnabled));
    }
    if (!state.micEnabled) {
      setMicStatus(state.mode === 'tuner' ? 'Turn on the microphone to tune' : 'Use in Practice, Wait, or Tuner mode');
      if (state.mode === 'tuner') resetTunerDisplay();
    }
  }

  async function toggleMicrophone() {
    state.micByTuner = false;
    if (state.micEnabled) {
      stopMicrophone();
      showToast('Microphone turned off.', 'success');
      return;
    }
    await startMicrophone();
  }

  async function startMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('Microphone unavailable', 'error');
      showToast('Microphone access is unavailable here. Open the app through HTTPS or localhost in Chrome or Edge.', 'warning');
      return;
    }
    try {
      const context = await ensureAudio();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false
      });
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.12;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      state.micStream = stream;
      state.micSource = source;
      state.micAnalyser = analyser;
      state.micTimeData = new Float32Array(analyser.fftSize);
      state.micNoiseFloor = 0.008;
      state.micMinThreshold = COMMON.micThreshold(MIC_CHECK_KEY, 0.018);
      state.micWasLoud = false;
      state.micEnabled = true;
      updateMicUI();
      setMicStatus(state.mode === 'tuner' ? 'Tuner listening... strike one tongue' : 'Listening... strike one tongue at a time', 'listening');
      if (state.mode === 'tuner') resetTunerDisplay('Listening for a clear pitch');
      cancelAnimationFrame(state.micAnimationId);
      state.micAnimationId = requestAnimationFrame(microphoneLoop);
      showToast('Microphone enabled. Strike one tongue at a time.', 'success');
    } catch (error) {
      state.micEnabled = false;
      updateMicUI();
      const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
      setMicStatus(denied ? 'Permission denied' : 'Could not start microphone', 'error');
      showToast(denied
        ? 'Microphone permission was denied. Allow microphone access in the browser and try again.'
        : 'The microphone could not be started. Check that another app is not using it.', 'warning');
    }
  }

  function stopMicrophone() {
    state.micEnabled = false;
    cancelAnimationFrame(state.micAnimationId);
    clearTimeout(state.micPendingTimer);
    state.micPendingTimer = 0;
    try { state.micSource?.disconnect(); } catch {}
    state.micStream?.getTracks().forEach(track => track.stop());
    state.micStream = null;
    state.micSource = null;
    state.micAnalyser = null;
    state.micTimeData = null;
    state.micWasLoud = false;
    updateMicUI();
  }

  function microphoneLoop(now) {
    if (!state.micEnabled || !state.micAnalyser || !state.micTimeData) return;
    state.micAnalyser.getFloatTimeDomainData(state.micTimeData);
    let sum = 0;
    for (let i = 0; i < state.micTimeData.length; i++) sum += state.micTimeData[i] * state.micTimeData[i];
    const rms = Math.sqrt(sum / state.micTimeData.length);
    const quiet = rms < Math.max(0.012, state.micNoiseFloor * 1.6);
    if (quiet) state.micNoiseFloor = state.micNoiseFloor * 0.985 + rms * 0.015;
    const threshold = Math.max(state.micMinThreshold ?? 0.018, state.micNoiseFloor * 2.8);

    if (rms > threshold && !state.micWasLoud && now - state.micLastTrigger > 280) {
      state.micWasLoud = true;
      clearTimeout(state.micPendingTimer);
      state.micPendingTimer = window.setTimeout(analyseMicrophoneStrike, 48);
    } else if (rms < threshold * 0.58) {
      state.micWasLoud = false;
    }
    state.micAnimationId = requestAnimationFrame(microphoneLoop);
  }

  function analyseMicrophoneStrike() {
    if (!state.micEnabled || !state.micAnalyser || !state.micTimeData) return;
    // Listen never uses the microphone, and a note tapped on screen is not heard twice.
    if (state.mode === 'demo') return;
    if (state.mode !== 'tuner' && performance.now() < (state.micEchoUntil || 0)) return;
    state.micAnalyser.getFloatTimeDomainData(state.micTimeData);
    const result = recogniseInstrumentNote(state.micTimeData, state.audioContext.sampleRate);
    if (!result) {
      setMicStatus('Strike heard, pitch unclear', 'error');
      if (state.mode === 'tuner') resetTunerDisplay('Pitch unclear. Try one firm strike.');
      return;
    }
    state.micLastTrigger = performance.now();
    const note = playableNoteAt(result.noteIndex);
    setMicStatus(`Heard ${note.label} · ${midiToName(note.midi)}`, 'heard');
    flashPad(result.noteIndex, 'mic-heard', state.mode === 'tuner' ? 900 : 360);
    if (state.mode === 'tuner') updateTunerDisplay(result);
    if (state.mode === 'practice' || state.mode === 'wait') {
      handleUserNote(result.noteIndex, { source: 'microphone' });
    }
  }

  function recogniseInstrumentNote(samples, sampleRate) {
    let rmsSum = 0;
    for (let i = 0; i < samples.length; i++) rmsSum += samples[i] * samples[i];
    if (Math.sqrt(rmsSum / samples.length) < Math.min(0.012, (state.micMinThreshold ?? 0.018) * 0.7)) return null;

    const pitch = autoCorrelatePitch(samples, sampleRate);
    const candidates = playableNotes().map(note => {
      const noteIndex = note.noteIndex;
      const frequency = frequencyForMidi(note.midi, state.instrument.referencePitch || 440);
      const fundamental = goertzelPower(samples, sampleRate, frequency);
      const harmonic2 = frequency * 2 < sampleRate / 2 ? goertzelPower(samples, sampleRate, frequency * 2) : 0;
      const harmonic3 = frequency * 3 < sampleRate / 2 ? goertzelPower(samples, sampleRate, frequency * 3) : 0;
      const spectral = fundamental + harmonic2 * 0.16 + harmonic3 * 0.06;
      let signedCents = pitch > 0 ? 1200 * Math.log2(pitch / frequency) : null;
      // Steel tongues have strong overtones. Fold an octave-doubled reading back onto
      // the configured fundamental before showing the tuner direction.
      if (signedCents !== null) {
        while (signedCents > 600) signedCents -= 1200;
        while (signedCents < -600) signedCents += 1200;
      }
      const cents = signedCents === null ? 999 : Math.abs(signedCents);
      const pitchBonus = pitch > 0 ? Math.max(0, 1 - Math.min(cents, 180) / 180) : 0;
      return { noteIndex, frequency, detectedPitch: pitch, signedCents, fundamental, spectral, cents, score: Math.log10(spectral + 1e-12) + pitchBonus * 1.35 };
    }).sort((a, b) => b.score - a.score);

    const best = candidates[0];
    const second = candidates[1];
    if (!best || best.spectral <= 1e-8) return null;
    const closePitch = best.cents < 85;
    const clearSpectralLead = !second || best.spectral > second.spectral * 1.18;
    if (!closePitch && !clearSpectralLead) return null;
    return best;
  }

  function goertzelPower(samples, sampleRate, targetFrequency) {
    const omega = 2 * Math.PI * targetFrequency / sampleRate;
    const coefficient = 2 * Math.cos(omega);
    let q0 = 0, q1 = 0, q2 = 0;
    const length = samples.length;
    for (let i = 0; i < length; i++) {
      const windowed = samples[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (length - 1)));
      q0 = coefficient * q1 - q2 + windowed;
      q2 = q1;
      q1 = q0;
    }
    return Math.max(0, q1 * q1 + q2 * q2 - coefficient * q1 * q2) / (length * length);
  }

  function autoCorrelatePitch(buffer, sampleRate) {
    const size = buffer.length;
    let rms = 0;
    for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / size);
    if (rms < Math.min(0.012, (state.micMinThreshold ?? 0.018) * 0.7)) return -1;

    const minFrequency = 80;
    const maxFrequency = 1600;
    const minOffset = Math.floor(sampleRate / maxFrequency);
    const maxOffset = Math.min(Math.floor(sampleRate / minFrequency), Math.floor(size / 2));
    let bestOffset = -1;
    let bestCorrelation = 0;
    const correlations = new Float32Array(maxOffset + 1);

    for (let offset = minOffset; offset <= maxOffset; offset++) {
      let difference = 0;
      const limit = size - offset;
      for (let i = 0; i < limit; i++) difference += Math.abs(buffer[i] - buffer[i + offset]);
      const correlation = 1 - difference / limit;
      correlations[offset] = correlation;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
    if (bestOffset < 0 || bestCorrelation < 0.72) return -1;
    const before = correlations[bestOffset - 1] || bestCorrelation;
    const after = correlations[bestOffset + 1] || bestCorrelation;
    const shift = (after - before) / Math.max(0.0001, 2 * (2 * bestCorrelation - before - after));
    return sampleRate / (bestOffset + Math.max(-1, Math.min(1, shift)));
  }

  function sectionLoopAvailable() {
    return state.mode === 'demo' || state.mode === 'practice';
  }

  function updateABLoopUI() {
    if (!els.abLoopBtn) return;
    const hasA = Number.isFinite(state.loopA);
    const hasB = Number.isFinite(state.loopB);
    const ready = hasA && hasB && state.loopB > state.loopA + 0.05;
    const allowed = sectionLoopAvailable();

    els.setABtn.disabled = !allowed || !state.duration;
    els.setBBtn.disabled = !allowed || !state.duration;
    els.abLoopBtn.disabled = !allowed || !ready;
    els.clearABBtn.disabled = !hasA && !hasB;
    els.abLoopBtn.classList.toggle('active', state.sectionLoop);
    els.abLoopBtn.setAttribute('aria-pressed', String(state.sectionLoop));
    els.abLoopBtn.innerHTML = state.sectionLoop ? 'A-B on' : 'Loop<span class="ab-suffix"> A-B</span>';

    if (els.abMarkerA) {
      els.abMarkerA.hidden = !hasA || !state.duration;
      if (hasA && state.duration) els.abMarkerA.style.left = `${Math.max(0, Math.min(100, state.loopA / state.duration * 100))}%`;
    }
    if (els.abMarkerB) {
      els.abMarkerB.hidden = !hasB || !state.duration;
      if (hasB && state.duration) els.abMarkerB.style.left = `${Math.max(0, Math.min(100, state.loopB / state.duration * 100))}%`;
    }

    if (!allowed) {
      els.abLoopStatus.textContent = state.mode === 'wait'
        ? 'A-B looping is available in Listen and Practice modes.'
        : 'A-B looping is unavailable in Tuner mode.';
    } else if (ready) {
      els.abLoopStatus.textContent = `${state.sectionLoop ? 'Looping' : 'Section'} ${formatTime(state.loopA)} to ${formatTime(state.loopB)}.`;
    } else if (hasA) {
      els.abLoopStatus.textContent = `A is ${formatTime(state.loopA)}. Move the timeline and set B.`;
    } else if (hasB) {
      els.abLoopStatus.textContent = `B is ${formatTime(state.loopB)}. Set A before it.`;
    } else {
      els.abLoopStatus.textContent = '';
    }
  }

  function seekToTime(time, { clearSectionHits = false } = {}) {
    const target = Math.max(0, Math.min(state.duration, Number(time) || 0));
    state.currentTime = target;
    state.parsedNotes.forEach(note => { if (note.time >= target - 0.02) tape.quality.delete(note.id); });
    tape.passiveIdx = 0;
    if (clearSectionHits && Number.isFinite(state.loopA) && Number.isFinite(state.loopB)) {
      state.parsedNotes.forEach(note => {
        if (note.time >= state.loopA - 0.02 && note.time < state.loopB + 0.02) state.hitNotes.delete(note.id);
      });
    }
    if (state.mode === 'wait') {
      state.waitingIndex = state.parsedNotes.findIndex(note => note.time >= target - 0.01);
      if (state.waitingIndex < 0) state.waitingIndex = state.parsedNotes.length;
    }
    if (state.playing && state.mode !== 'wait') {
      cancelFutureScheduledAudio();
      state.playbackStartedAt = performance.now() - (target / state.speed) * 1000;
    }
    state.lastScheduledIndex = state.parsedNotes.findIndex(note => note.time >= target - 0.02) - 1;
    state.lastVisualFlashIndex = state.lastScheduledIndex;
    state.lastMetronomeBeat = Math.floor(target / state.secondsPerBeat) - 1;
    updatePracticeUI();
    renderFrame();
  }

  function setLoopPoint(which) {
    if (!sectionLoopAvailable() || !state.duration) {
      showToast('A-B looping is available in Listen and Practice modes.', 'warning');
      return;
    }
    const minimumGap = Math.max(0.4, (state.secondsPerBeat || 0.5) * 0.5);
    if (which === 'A') {
      state.loopA = Math.max(0, Math.min(state.currentTime, state.duration - minimumGap));
      if (Number.isFinite(state.loopB) && state.loopB <= state.loopA + minimumGap) state.loopB = null;
      showToast(`A set at ${formatTime(state.loopA)}.`, 'success');
    } else {
      if (!Number.isFinite(state.loopA)) state.loopA = Math.max(0, Math.min(state.currentTime - minimumGap, state.duration - minimumGap));
      state.loopB = Math.max(state.loopA + minimumGap, Math.min(state.duration, state.currentTime));
      state.loopB = Math.min(state.duration, state.loopB);
      if (state.loopB <= state.loopA + 0.05) {
        state.loopB = Math.min(state.duration, state.loopA + Math.max(minimumGap, state.secondsPerBeat || 0.5));
      }
      showToast(`B set at ${formatTime(state.loopB)}.`, 'success');
    }
    if (!(Number.isFinite(state.loopA) && Number.isFinite(state.loopB) && state.loopB > state.loopA + 0.05)) state.sectionLoop = false;
    updateTransportUI();
    updateABLoopUI();
  }

  function clearABLoop(showMessage = true) {
    state.sectionLoop = false;
    state.loopA = null;
    state.loopB = null;
    updateTransportUI();
    updateABLoopUI();
    if (showMessage) showToast('A-B section cleared.', 'success');
  }

  function toggleSectionLoop() {
    if (!sectionLoopAvailable()) {
      showToast('Switch to Listen or Practice to use A-B looping.', 'warning');
      return;
    }
    const ready = Number.isFinite(state.loopA) && Number.isFinite(state.loopB) && state.loopB > state.loopA + 0.05;
    if (!ready) {
      showToast('Set A and B first.', 'warning');
      return;
    }
    state.sectionLoop = !state.sectionLoop;
    if (state.sectionLoop) {
      state.loop = false;
      clearLoopTimer();
      if (state.currentTime < state.loopA || state.currentTime >= state.loopB) seekToTime(state.loopA, { clearSectionHits: true });
      showToast(`Looping ${formatTime(state.loopA)} to ${formatTime(state.loopB)}.`, 'success');
    } else {
      showToast('A-B loop paused. Your A and B points are saved.', 'success');
    }
    updateTransportUI();
    updateABLoopUI();
  }

  function restartSectionLoopCycle(now = performance.now()) {
    if (!state.sectionLoop || !Number.isFinite(state.loopA) || !Number.isFinite(state.loopB)) return;
    state.currentTime = state.loopA;
    state.streak = 0;
    state.parsedNotes.forEach(note => {
      if (note.time >= state.loopA - 0.02 && note.time < state.loopB + 0.02) state.hitNotes.delete(note.id);
    });
    state.playbackStartedAt = now - (state.currentTime / state.speed) * 1000;
    cancelFutureScheduledAudio();
    state.lastScheduledIndex = state.parsedNotes.findIndex(note => note.time >= state.currentTime - 0.02) - 1;
    state.lastVisualFlashIndex = state.lastScheduledIndex;
    state.lastMetronomeBeat = Math.floor(state.currentTime / state.secondsPerBeat) - 1;
    updatePracticeUI();
    renderFrame();
  }

  function setFocusMode(enabled) {
    if (!enabled) leaveFocusFullscreen();
    state.focusMode = Boolean(enabled) && window.innerWidth <= 1100;
    document.body.classList.toggle('focus-mode', state.focusMode);
    try {
      if (state.focusMode && !history.state?.tdtFocus) history.pushState({ tdtFocus: true }, '');
      else if (!state.focusMode && history.state?.tdtFocus) { state.focusModeIgnorePop = true; history.back(); }
    } catch { /* file:// may refuse; not important */ }
    fitTabletStage();
    if (els.focusModeBtn) {
      els.focusModeBtn.classList.toggle('active', state.focusMode);
      els.focusModeBtn.setAttribute('aria-pressed', String(state.focusMode));
      els.focusModeBtn.setAttribute('aria-label', state.focusMode ? 'Exit focus mode' : 'Enter focus mode');
      els.focusModeBtn.title = state.focusMode ? 'Exit focus mode' : 'Focus mode';
      els.focusModeBtn.innerHTML = `<span aria-hidden="true">${state.focusMode ? '×' : '⛶'}</span><b>${state.focusMode ? 'Exit Focus' : 'Focus Mode'}</b>`;
    }
    requestAnimationFrame(() => {
      resizeCanvas();
      renderFrame();
    });
  }

  function toggleFocusMode() {
    setFocusMode(!state.focusMode);
  }

  function collectMissedNotes() {
    const ids = new Set(state.missedNoteIds);
    if (state.mode === 'practice') {
      state.parsedNotes.forEach(note => {
        if (!state.hitNotes.has(note.id)) ids.add(note.id);
      });
    }
    return state.parsedNotes.filter(note => ids.has(note.id));
  }

  function songNoteIndexSet(song) {
    return new Set(parseSequence(song?.sequence || '', song?.bpm || 72).notes.map(note => note.noteIndex));
  }

  function recommendNextSong(currentSong) {
    if (!currentSong) return null;
    const currentDifficulty = songDifficulty(currentSong), currentNotes = songNoteIndexSet(currentSong);
    const order = { easy:0, medium:1, hard:2, expert:3 };
    return state.songs.filter(song => song && song.id !== currentSong.id).map(song => {
      const difficulty = songDifficulty(song), notes = songNoteIndexSet(song);
      const intersection = [...currentNotes].filter(note => notes.has(note)).length;
      const union = new Set([...currentNotes,...notes]).size || 1;
      const overlap = intersection/union, coverage = currentNotes.size ? intersection/currentNotes.size : 0;
      const distance = Math.abs((order[difficulty.level]??0)-(order[currentDifficulty.level]??0));
      const difficultyScore = distance===0 ? 10 : distance===1 ? 4 : 0;
      const bpmDistance = Math.abs((Number(song.bpm)||72)-(Number(currentSong.bpm)||72));
      const tempoScore = Math.max(0,2.5-bpmDistance/35);
      const scaleScore = String(song.scaleType||'')===String(currentSong.scaleType||'') ? 1.5 : 0;
      return { song, difficulty, intersection, score:difficultyScore+overlap*9+coverage*4+tempoScore+scaleScore };
    }).sort((a,b) => b.score-a.score || b.intersection-a.intersection || String(a.song.title).localeCompare(String(b.song.title)))[0] || null;
  }

  function renderRecommendedNext(song) {
    if (!els.resultRecommendation || !els.resultRecommendedBtn) return;
    const rec = recommendNextSong(song);
    state.recommendedSongId = rec?.song?.id || null;
    els.resultRecommendation.hidden = !rec;
    if (!rec) { els.resultRecommendedBtn.innerHTML=''; return; }
    const next = rec.song, title = songTitleParts(next.title), difficulty = rec.difficulty;
    const shared = rec.intersection===1 ? '1 shared pitch' : `${rec.intersection} shared pitches`;
    els.resultRecommendedBtn.innerHTML = `${songCoverMarkup(next)}<span class="result-recommended-copy"><span><strong>${escapeHtml(title.displayTitle)}</strong><em class="difficulty-badge" data-level="${difficulty.level}">${difficulty.label}</em></span><small>${shared} · ${next.bpm} BPM</small></span><b class="result-recommended-arrow" aria-hidden="true">→</b>`;
  }

  function playRecommendedFromResults() {
    const id = state.recommendedSongId;
    if (!id || !state.songs.some(song => song.id===id)) return;
    if (els.resultDialog?.open) els.resultDialog.close();
    selectSong(id);
    togglePlayback().catch(reportPlaybackStartError);
  }

  // "Again, a bit slower": the next lower step of the speed list.
  function slowerSpeedStep() {
    const steps = [...(els.speedSelect?.options || [])].map(option => Number(option.value)).filter(Number.isFinite).sort((a, b) => b - a);
    return steps.find(step => step < state.speed - 1e-6) || null;
  }

  function setSlowerButton(speed) {
    if (!els.resultSlowerBtn) return;
    els.resultSlowerBtn.hidden = !speed;
    els.resultSlowerBtn.dataset.speed = speed ? String(speed) : '';
  }

  function showSessionResults() {
    if (!els.resultDialog) return;
    if (walkthroughKind === 'main' && walkthroughPreviewState && !els.tourOverlay?.hidden) return;
    const song = selectedSong();
    const title = songTitleParts(song?.title || 'Song').displayTitle;
    const training = state.mode === 'practice' || state.mode === 'wait';
    const missed = training ? collectMissedNotes() : [];
    state.lastResultMissed = missed.map(note => note.id);
    const total = state.parsedNotes.length;
    const hitCount = state.mode === 'wait' ? total : state.hitNotes.size;
    const inputAccuracy = state.attempts ? Math.max(0, Math.min(100, Math.round((state.score / state.attempts) * 100))) : 0;

    els.resultTitle.textContent = `${title} complete`;
    if (training) {
      els.resultSummary.textContent = missed.length
        ? `${missed.length} ${missed.length === 1 ? 'note needs' : 'notes need'} another look.`
        : 'Great run. No missed notes to practise.';
      els.resultStats.hidden = false;
      els.resultHitValue.textContent = `${Math.min(hitCount, total)}/${total}`;
      els.resultAccuracyValue.textContent = `${inputAccuracy}%`;
      els.resultStreakValue.textContent = String(state.bestStreak);
      els.resultMistakes.textContent = missed.length
        ? `Practice mistakes will loop a short phrase around your first missed section.`
        : 'You can replay the song or continue with the recommended next song.';
      els.practiceMistakesBtn.hidden = !missed.length;
      const outcome = BEST.record(song?.id, { accuracy: inputAccuracy, speed: state.speed });
      els.resultBest.innerHTML = outcome ? COMMON.resultBestHtml(outcome, inputAccuracy, state.speed) : COMMON.bestHtml(BEST.get(song?.id));
      els.resultBest.hidden = !els.resultBest.innerHTML;
      const faster = COMMON.suggestSpeedUp(state.speed, inputAccuracy);
      els.resultFasterBtn.hidden = !faster;
      els.resultFasterBtn.dataset.speed = faster ? String(faster) : '';
      if (faster) {
        els.resultFasterBtn.textContent = `Try ${COMMON.speedLabel(faster)} →`;
        els.practiceMistakesBtn.hidden = true;
      }
      setSlowerButton(!faster && inputAccuracy < 90 ? slowerSpeedStep() : null);
      renderSongList();
    } else {
      els.resultBest.innerHTML = COMMON.bestHtml(BEST.get(song?.id));
      els.resultBest.hidden = !els.resultBest.innerHTML;
      els.resultFasterBtn.hidden = true;
      setSlowerButton(slowerSpeedStep());
      els.resultSummary.textContent = `You reached the end of ${title}.`;
      els.resultStats.hidden = true;
      els.resultMistakes.textContent = 'Replay it, choose the recommendation below, or continue to the next song in the list.';
      els.practiceMistakesBtn.hidden = true;
    }
    renderRecommendedNext(song);
    if (!els.resultDialog.open) els.resultDialog.showModal();
    requestAnimationFrame(() => celebrateResults(tapeEls.resultSparkles, training ? inputAccuracy / 100 : 0.8));
  }

  function replayFromResults() {
    if (els.resultDialog?.open) els.resultDialog.close();
    restartSong();
    togglePlayback().catch(reportPlaybackStartError);
  }

  function selectNextSongFromResults() {
    if (els.resultDialog?.open) els.resultDialog.close();
    if (!state.songs.length) return;
    const currentIndex = Math.max(0, state.songs.findIndex(song => song.id === state.selectedId));
    selectSong(state.songs[(currentIndex + 1) % state.songs.length].id);
  }

  function practiceMistakesFromResults() {
    const missedIds = [...state.lastResultMissed];
    const missed = state.parsedNotes.filter(note => missedIds.includes(note.id)).sort((a, b) => a.time - b.time);
    if (!missed.length) {
      showToast('No missed notes to practise.', 'success');
      return;
    }
    const first = missed[0];
    const clusterWindow = Math.max(8, (state.secondsPerBeat || 0.5) * 12);
    const cluster = missed.filter(note => note.time <= first.time + clusterWindow);
    const last = cluster[cluster.length - 1] || first;
    const padBefore = Math.max(1, (state.secondsPerBeat || 0.5) * 2);
    const padAfter = Math.max(1.5, (state.secondsPerBeat || 0.5) * 3);
    const start = Math.max(0, first.time - padBefore);
    const end = Math.min(state.duration, Math.max(last.time + padAfter, start + Math.max(5, (state.secondsPerBeat || 0.5) * 8)));

    if (els.resultDialog?.open) els.resultDialog.close();
    setMode('practice');
    state.loop = false;
    state.loopA = start;
    state.loopB = end;
    state.sectionLoop = true;
    seekToTime(start, { clearSectionHits: true });
    updateTransportUI();
    updateABLoopUI();
    showToast(`Practising missed section ${formatTime(start)} to ${formatTime(end)}.`, 'success');
    togglePlayback().catch(reportPlaybackStartError);
  }

  function reportPlaybackStartError(error) {
    console.warn('Playback could not start:', error);
    showToast('Sound was blocked. Tap Play again to enable it.', 'warning');
  }

  async function togglePlayback() {
    if (state.mode === 'tuner') {
      if (!state.micEnabled) await startMicrophone();
      return;
    }
    if (state.playing) {
      pausePlayback();
      return;
    }
    primeAudioFromGesture();
    await ensureAudio();
    if (state.sectionLoop && Number.isFinite(state.loopA) && Number.isFinite(state.loopB) && state.currentTime >= state.loopB - .02) {
      seekToTime(state.loopA, { clearSectionHits: true });
    } else if (state.currentTime >= state.duration - .02) {
      restartSong();
    }
    if (state.mode === 'wait') {
      state.playing = true;
      state.waitingIndex = state.parsedNotes.findIndex(n => n.time >= state.currentTime - .01);
      if (state.waitingIndex < 0) state.waitingIndex = 0;
      scheduleWaitHint(null);
      updateTransportUI();
      updatePracticeUI();
      renderFrame();
      return;
    }
    if (els.countInToggle.checked && state.currentTime < .02) {
      runCountIn();
    } else {
      startPlaybackClock();
    }
  }

  function runCountIn() {
    state.countInActive = true;
    state.countInRemaining = 3;
    els.countIn.hidden = false;
    els.countIn.textContent = '3';
    updateTransportUI();
    playClick(true).catch(() => {});
    const timer = window.setInterval(() => {
      // Paused (or the mode changed) during the count-in: stop counting.
      if (!state.countInActive) { clearInterval(timer); return; }
      state.countInRemaining -= 1;
      if (state.countInRemaining <= 0) {
        clearInterval(timer);
        state.countInActive = false;
        els.countIn.hidden = true;
        startPlaybackClock();
      } else {
        els.countIn.textContent = String(state.countInRemaining);
        playClick(state.countInRemaining === 1).catch(() => {});
      }
    }, COUNT_IN_INTERVAL_MS);
  }

  function startPlaybackClock() {
    state.playing = true;
    const playbackNow = performance.now();
    state.playbackStartedAt = playbackNow - (state.currentTime / state.speed) * 1000;
    state.lastScheduledIndex = state.parsedNotes.findIndex(n => n.time >= state.currentTime - .02) - 1;
    state.lastVisualFlashIndex = state.lastScheduledIndex;
    state.lastMetronomeBeat = Math.floor(state.currentTime / state.secondsPerBeat) - 1;
    state.lastVisualAt = 0;
    state.lastUiAt = 0;
    state.lastBackdropAt = 0;
    state.lastCompanionUiAt = 0;
    resetVisualPerformanceMonitor(playbackNow);
    updateTransportUI();
    startAudioScheduler();
    cancelAnimationFrame(state.animationId);
    state.animationId = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!state.playing || state.mode === 'wait' || document.hidden) return;
    state.currentTime = Math.min(state.duration, ((now - state.playbackStartedAt) / 1000) * state.speed);
    flashDueVisualNotes();
    markPassiveMisses();
    updateTape();
    // Sound is scheduled by a separate look-ahead clock. DOM labels, foreground notes,
    // and the animated backdrop keep independent budgets here.
    const profile = visualPerformanceProfile();
    if (!state.lastUiAt || now - state.lastUiAt >= profile.uiInterval) {
      state.lastUiAt = now;
      updatePracticeUI();
    }
    if (!profile.visualInterval || !state.lastVisualAt || now - state.lastVisualAt >= profile.visualInterval) {
      state.lastVisualAt = now;
      const renderStartedAt = performance.now();
      renderFrame();
      const renderFinishedAt = performance.now();
      monitorVisualPerformance(renderStartedAt, renderFinishedAt, profile);
      recordPerformanceDiagnostics(renderStartedAt, renderFinishedAt, profile);
    }
    if (state.sectionLoop && Number.isFinite(state.loopB) && state.currentTime >= state.loopB - .002) {
      restartSectionLoopCycle(now);
      state.animationId = requestAnimationFrame(tick);
      return;
    }
    if (state.currentTime >= state.duration) {
      finishPlayback();
      return;
    }
    state.animationId = requestAnimationFrame(tick);
  }

  function scheduleDueAudio(playbackTime = state.currentTime) {
    if (!state.playing || state.mode === 'wait' || state.mode === 'tuner' || document.hidden) return;
    const songHorizon = AUDIO_LOOKAHEAD_SECONDS * state.speed;
    const sectionEnd = state.sectionLoop && Number.isFinite(state.loopB) ? state.loopB - .002 : Infinity;
    const horizon = Math.min(playbackTime + songHorizon, sectionEnd);
    if (state.mode === 'practice' && !state.guide) return;
    const guideGain = state.mode === 'practice' ? 0.5 : 1;
    for (let i = state.lastScheduledIndex + 1; i < state.parsedNotes.length; i++) {
      const note = state.parsedNotes[i];
      if (note.time < playbackTime - .05) { state.lastScheduledIndex = i; continue; }
      if (note.time <= horizon) {
        const delaySeconds = Math.max(0, (note.time - playbackTime) / state.speed);
        playMidi(note.midi, state.instrument.referencePitch || 440, false, delaySeconds, guideGain).catch(() => {});
        state.lastScheduledIndex = i;
      } else break;
    }
  }

  function scheduleMetronome(playbackTime = state.currentTime) {
    if (!state.metronome || !state.playing || !state.secondsPerBeat || document.hidden) return;
    const songHorizon = AUDIO_LOOKAHEAD_SECONDS * state.speed;
    const sectionEnd = state.sectionLoop && Number.isFinite(state.loopB) ? state.loopB - .002 : Infinity;
    const horizon = Math.min(playbackTime + songHorizon, sectionEnd);
    const lastBeat = Math.floor(horizon / state.secondsPerBeat);
    for (let beat = state.lastMetronomeBeat + 1; beat <= lastBeat; beat += 1) {
      const beatTime = beat * state.secondsPerBeat;
      if (beatTime < playbackTime - .02) {
        state.lastMetronomeBeat = beat;
        continue;
      }
      const delaySeconds = Math.max(0, (beatTime - playbackTime) / state.speed);
      playClick(beat % 4 === 0, delaySeconds).catch(() => {});
      state.lastMetronomeBeat = beat;
    }
  }

  function flashDueVisualNotes() {
    if (state.mode === 'practice' || state.mode === 'wait' || state.mode === 'tuner') return;
    for (let index = state.lastVisualFlashIndex + 1; index < state.parsedNotes.length; index += 1) {
      const note = state.parsedNotes[index];
      if (note.time > state.currentTime + .018) break;
      const flashDuration = Math.max(170, Math.min(420, note.duration * 450));
      flashPad(note.noteIndex, 'active', flashDuration, note.label);
      state.lastVisualFlashIndex = index;
    }
  }

  function runAudioScheduler() {
    if (!state.playing || document.hidden) return;
    const playbackTime = Math.min(state.duration, ((performance.now() - state.playbackStartedAt) / 1000) * state.speed);
    scheduleDueAudio(playbackTime);
    scheduleMetronome(playbackTime);
  }

  function startAudioScheduler() {
    clearInterval(state.audioSchedulerId);
    state.audioSchedulerId = 0;
    if (state.mode === 'wait' || state.mode === 'tuner') return;
    runAudioScheduler();
    state.audioSchedulerId = window.setInterval(runAudioScheduler, AUDIO_SCHEDULER_INTERVAL_MS);
  }

  function stopAudioScheduler() {
    clearInterval(state.audioSchedulerId);
    state.audioSchedulerId = 0;
    cancelFutureScheduledAudio();
  }

  function clearLoopTimer() {
    clearTimeout(state.loopTimer);
    state.loopTimer = 0;
  }

  function toggleLoop() {
    state.loop = !state.loop;
    if (state.loop) state.sectionLoop = false;
    if (!state.loop) clearLoopTimer();
    updateTransportUI();
    updateABLoopUI();
    showToast(state.loop ? 'Whole-song loop enabled.' : 'Whole-song loop disabled.', 'success');
  }

  function startNextLoop() {
    state.loopTimer = 0;
    if (!state.loop || state.mode === 'tuner' || state.playing) return;
    restartSong();
    if (state.mode === 'wait') {
      state.playing = true;
      state.waitingIndex = 0;
      updateTransportUI();
      updatePracticeUI();
      renderFrame();
      return;
    }
    startPlaybackClock();
  }

  function pausePlayback() {
    clearLoopTimer();
    stopAudioScheduler();
    state.playing = false;
    state.countInActive = false;
    cancelAnimationFrame(state.animationId);
    els.countIn.hidden = true;
    updateTransportUI();
  }

  function stopPlayback(reset = true) {
    pausePlayback();
    if (reset) restartSong();
  }

  function restartSong() {
    clearLoopTimer();
    stopAudioScheduler();
    state.playing = false;
    state.currentTime = 0;
    state.pausedAt = 0;
    state.lastScheduledIndex = -1;
    state.lastVisualFlashIndex = -1;
    state.lastMetronomeBeat = -1;
    state.score = 0;
    state.attempts = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.waitingIndex = 0;
    state.hitNotes.clear();
    state.missedNoteIds.clear();
    resetTapeRun();
    updateTransportUI();
    updatePracticeUI();
    renderFrame();
  }

  function finishPlayback() {
    stopAudioScheduler();
    state.playing = false;
    state.currentTime = state.duration;
    updateTransportUI();
    updatePracticeUI();
    renderFrame();
    if (walkthroughKind === 'main' && walkthroughPreviewState && !els.tourOverlay?.hidden && walkthroughStepIndex === 0) {
      state.loopTimer = window.setTimeout(() => {
        if (walkthroughKind !== 'main' || !walkthroughPreviewState || els.tourOverlay?.hidden || walkthroughStepIndex !== 0) return;
        restartSong();
        startPlaybackClock();
      }, 650);
      return;
    }
    if (state.loop && state.mode !== 'tuner') {
      state.loopTimer = window.setTimeout(startNextLoop, 700);
      return;
    }
    if (state.mode !== 'tuner') showSessionResults();
  }

  function updateTransportUI() {
    const isPaused = state.playing || state.countInActive;
    els.playBtn.innerHTML = isPaused
      ? '<span class="pause-icon" aria-hidden="true"><span></span><span></span></span>'
      : '<span class="play-icon" aria-hidden="true"></span>';
    els.playBtn.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
    els.loopBtn.classList.toggle('active', state.loop);
    els.loopBtn.setAttribute('aria-pressed', String(state.loop));
    els.loopBtn.setAttribute('aria-label', state.loop ? 'Turn off song loop' : 'Loop song');
    els.loopBtn.title = state.loop ? 'Turn off song loop' : 'Loop song';
    els.metronomeBtn.classList.toggle('active', state.metronome);
    if (els.dockPlayBtn) {
      els.dockPlayBtn.innerHTML = els.playBtn.innerHTML;
      els.dockPlayBtn.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
      els.dockLoopBtn.classList.toggle('active', state.loop);
      els.dockLoopBtn.setAttribute('aria-pressed', String(state.loop));
      els.dockMetronomeBtn.classList.toggle('active', state.metronome);
      els.dockMetronomeBtn.setAttribute('aria-pressed', String(state.metronome));
    }
    if (els.guideBtn) {
      const listen = state.mode === 'demo';
      const guideOn = state.mode === 'wait' ? state.waitStyle === 'hear' : state.guide;
      els.guideBtn.classList.toggle('active', guideOn);
      els.guideBtn.setAttribute('aria-pressed', String(guideOn));
      els.guideBtn.disabled = listen;
      els.guideBtn.title = listen ? 'Listen always plays the song'
        : state.mode === 'wait' ? (guideOn ? 'Play Note: the app plays each note, then waits for you' : 'Tap to hear each note first (Play Note)')
        : state.guide ? 'Song sound on: the app plays the song quietly while you play' : 'Song sound off: only your own notes';
    }
    updateABLoopUI();
  }

  // Wait for note with the song sound on: after a correct note the next one is played
  // softly, at the song's own gap, unless it has already been played.
  function scheduleWaitHint(previous) {
    clearTimeout(state.waitHintTimer);
    if (state.waitStyle !== 'hear' || state.mode !== 'wait') return;
    const next = state.parsedNotes[state.waitingIndex];
    if (!next) return;
    const gap = previous ? Math.max(.3, Math.min(1.4, (next.time - previous.time) / state.speed)) : .45;
    const index = state.waitingIndex;
    state.waitHintTimer = window.setTimeout(() => {
      if (state.mode !== 'wait' || !state.playing || state.waitingIndex !== index) return;
      // The microphone must not take the app's own note for yours.
      state.micEchoUntil = Math.max(state.micEchoUntil || 0, performance.now() + 900);
      playMidi(next.midi, state.instrument.referencePitch || 440, false, 0, .5).catch(() => {});
    }, gap * 1000);
  }

  /* ------------------------------------------------------------------ */
  /* v16: rotation, wait styles, stage chips, drafts, chooser            */
  /* ------------------------------------------------------------------ */

  function drumRotationStep(count = state.instrument.count) {
    const outer = hasCenterTongue(count) ? count - 1 : count;
    return 360 / Math.max(4, outer);
  }

  function rotatePlacement(placement, turn) {
    if (!placement.manual) return { ...placement, angle: (placement.angle || 0) + turn };
    const rad = turn * Math.PI / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const next = { ...placement, rotate: (placement.rotate || 0) + turn };
    if (placement.xp !== undefined) {
      next.xp = placement.xp * c - placement.yp * s;
      next.yp = placement.xp * s + placement.yp * c;
    } else if (placement.x !== undefined) {
      next.x = placement.x * c - placement.y * s;
      next.y = placement.x * s + placement.y * c;
    }
    return next;
  }

  function placeTonguePad(pad, placement) {
    if (placement.manual) {
      const offsetX = placement.xp !== undefined ? `${placement.xp}%` : `${placement.x}px`;
      const offsetY = placement.yp !== undefined ? `${placement.yp}%` : `${placement.y}px`;
      pad.style.left = `calc(50% + ${offsetX})`;
      pad.style.top = `calc(50% + ${offsetY})`;
      pad.style.setProperty('--rotation', `${placement.rotate || 0}deg`);
    } else {
      pad.style.setProperty('--angle', `${placement.angle}deg`);
    }
  }

  // Moves the tongues (and the notes' flight paths) without rebuilding the drum.
  function applyDrumRotation(turn) {
    state.drumRotation = turn;
    drumPlacementCache.clear();
    [els.stageDrumWrap, els.drumWrap, els.myDrumPreview].forEach(container => {
      container?.querySelectorAll('.drum-body > .tongue[data-note-index]').forEach(pad => {
        placeTonguePad(pad, getDrumPlacement(Number(pad.dataset.noteIndex)));
      });
    });
    (state.parsedNotes || []).forEach(note => { note.placement = getDrumPlacement(note.noteIndex); });
    state.staticGuideCanvas = null;
    state.staticGuideKey = '';
    renderFrame();
  }

  const drumSpin = { raf: 0, target: null };

  function rotateTongueDrum(direction) {
    const step = drumRotationStep();
    const from = state.drumRotation || 0;
    const base = drumSpin.target ?? from;
    const to = Math.round((base + direction * step) / step) * step;
    drumSpin.target = to;
    cancelAnimationFrame(drumSpin.raf);
    const startedAt = performance.now();
    const duration = 260;
    const tick = now => {
      const k = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      applyDrumRotation(from + (to - from) * eased);
      if (k < 1) { drumSpin.raf = requestAnimationFrame(tick); return; }
      const settled = ((to % 360) + 360) % 360;
      drumSpin.target = null;
      applyDrumRotation(Math.abs(settled - 360) < 0.01 ? 0 : Math.round(settled * 1000) / 1000);
      try { localStorage.setItem(STORAGE_ROTATION, String(state.drumRotation)); } catch {}
    };
    drumSpin.raf = requestAnimationFrame(tick);
  }


  // Shared with the other Ethereal trainers: app-files/ethereal-common.js.
  const { placeProgressInTape, isDesktopFit, syncProgressFill, syncViewModeBtn, leaveFocusFullscreen } = COMMON;
  function bindViewModeBtn() { COMMON.bindViewModeBtn({ setFocusMode }); }

  function capitalise(text) {
    const value = String(text || '').trim();
    return value ? value.charAt(0).toLocaleUpperCase() + value.slice(1) : '';
  }

  /* Rhythm boxes: the song builder's second view, one box per beat. */
  const STORAGE_RHYTHM_BOXES = 'ethereal-drum-editor-rhythm-boxes-v1';

  function rhythmBoxColor(label) {
    const key = String(label).toLowerCase();
    const notes = playableNotes();
    const index = notes.findIndex(note => String(note.label).toLowerCase() === key);
    return index < 0 ? '' : normaliseColor(notes[index].color, index);
  }

  function queueRhythmBoxes() {
    if (state.rhythmBoxesQueued) return;
    state.rhythmBoxesQueued = true;
    requestAnimationFrame(() => { state.rhythmBoxesQueued = false; renderRhythmBoxes(); });
  }

  function renderRhythmBoxes() {
    const view = els.rhythmBoxes;
    if (!view) return;
    const on = Boolean(state.rhythmBoxesEnabled);
    if (els.rhythmBoxesToggle) els.rhythmBoxesToggle.checked = on;
    view.hidden = !on;
    if (!on) return;
    const cells = [];
    const barStarts = [0];
    let beat = 0;
    (state.editorTimeline || []).forEach((item, index) => {
      const core = String(item.core || '');
      if (core === '|') {
        if (beat > barStarts[barStarts.length - 1] + 1e-6) barStarts.push(beat);
        return;
      }
      const dur = Math.max(0, Number(item.durationBeats) || 0);
      if (!dur) return;
      if (isHoldCore(core)) {
        const last = cells[cells.length - 1];
        if (last && last.kind === 'note' && Math.abs(last.beat + last.dur - beat) < 1e-6) last.dur += dur;
        else cells.push({ kind: 'rest', beat, dur, index });
      } else if (isRestCore(core)) {
        cells.push({ kind: 'rest', beat, dur, index });
      } else {
        cells.push({ kind: 'note', labels: core.split('+').filter(Boolean), beat, dur, index });
      }
      beat += dur;
    });
    const total = beat;
    if (!cells.length) {
      view.innerHTML = '<p class="rv-empty">Add notes and they appear here, one box per beat.</p>';
      return;
    }
    const sub = [1, 2, 3, 4, 6, 8].find(n => cells.every(cell =>
      Math.abs(cell.beat * n - Math.round(cell.beat * n)) < 0.02 && Math.abs(cell.dur * n - Math.round(cell.dur * n)) < 0.02)) || 8;
    const rows = [];
    barStarts.forEach((start, i) => {
      const end = i + 1 < barStarts.length ? barStarts[i + 1] : total;
      for (let at = start; at < end - 1e-6; at += 4) rows.push({ start: at, end: Math.min(end, at + 4) });
    });
    const maxBeats = Math.max(1, ...rows.map(row => Math.ceil(row.end - row.start - 1e-6)));
    const room = (view.clientWidth || 640) - 50;
    const beatW = Math.max(46, Math.min(110, Math.floor(room / Math.max(maxBeats, 4))));
    const body = rows.map((row, r) => {
      const beats = Math.max(1, Math.ceil(row.end - row.start - 1e-6));
      let inner = '';
      for (let b = 0; b < beats; b += 1) inner += `<i class="rv-beat" style="grid-column:${b * sub + 1} / span ${sub}" data-n="${b + 1}"></i>`;
      cells.forEach(cell => {
        if (cell.beat < row.start - 1e-6 || cell.beat >= row.end - 1e-6) return;
        const col = Math.round((cell.beat - row.start) * sub) + 1;
        const span = Math.max(1, Math.round(Math.min(cell.dur, row.end - cell.beat) * sub));
        const narrow = span / sub < 0.5 ? ' narrow' : '';
        const pos = `style="grid-column:${col} / span ${span}" data-index="${cell.index}"`;
        if (cell.kind === 'rest') {
          inner += `<button type="button" class="rv-cell rest${narrow}" ${pos} aria-label="Rest">–</button>`;
          return;
        }
        const notes = cell.labels.map(label => {
          const color = rhythmBoxColor(label);
          const split = splitOctaveMark(label);
          const cls = octaveMarkClass(split);
          return `<b${cls ? ` class="${cls}"` : ''}${color ? ` style="--note:${color}"` : ''}>${escapeHtml(split.base)}</b>`;
        }).join('');
        const length = cell.dur >= 1.5 ? `<span class="rv-len">${Number(cell.dur.toFixed(2))} beats</span>` : '';
        inner += `<button type="button" class="rv-cell${cell.labels.length > 1 ? ' chord' : ''}${narrow}" ${pos}><span class="rv-notes">${notes}</span>${length}</button>`;
      });
      return `<div class="rv-row"><span class="rv-bar-num">${r + 1}</span><div class="rv-grid" style="grid-template-columns:repeat(${beats * sub}, minmax(0,1fr)); width:${beats * beatW}px">${inner}</div></div>`;
    }).join('');
    view.innerHTML = `<div class="rv-head"><b>Rhythm boxes</b><small>Each box is one beat: a wide note is long, a thin one is quick. Tap a note to find it in the text.</small></div><div class="rv-inner" style="--rv-width:${maxBeats * beatW + 22}px">${body}</div>`;
  }

  function selectSequenceToken(index) {
    const input = els.sequenceInput;
    if (!input) return;
    const matches = [...input.value.matchAll(/\S+/g)];
    const match = matches.length === (state.editorTimeline || []).length ? matches[index] : null;
    if (!match) return;
    input.focus();
    input.setSelectionRange(match.index, match.index + match[0].length);
    if (typeof rememberSequenceSelection === 'function') rememberSequenceSelection();
  }

  function bindRound17() {
    try { state.rhythmBoxesEnabled = localStorage.getItem(STORAGE_RHYTHM_BOXES) === '1'; } catch { state.rhythmBoxesEnabled = false; }
    els.rhythmBoxesToggle?.addEventListener('change', () => {
      state.rhythmBoxesEnabled = els.rhythmBoxesToggle.checked;
      try { localStorage.setItem(STORAGE_RHYTHM_BOXES, state.rhythmBoxesEnabled ? '1' : '0'); } catch {}
      renderRhythmBoxes();
    });
    els.rhythmBoxes?.addEventListener('click', event => {
      const cell = event.target.closest('.rv-cell');
      if (cell) selectSequenceToken(Number(cell.dataset.index));
    });
    // Focus mode: tap the song name to choose another song, as in the handpan app.
    tapeEls.stageSongName?.addEventListener('click', () => {
      if (!state.focusMode || !els.songSwitchDialog || els.songSwitchDialog.open) return;
      els.songSwitchDialog.showModal();
    });
    els.switchKeepBtn?.addEventListener('click', () => els.songSwitchDialog.close());
    els.switchChooseBtn?.addEventListener('click', () => {
      els.songSwitchDialog.close();
      pausePlayback();
      setFocusMode(false);
      els.sidebar.classList.add('open');
    });
    els.progress?.addEventListener('input', syncProgressFill);
  }


  // A short, bright "correct!" for Wait for note · Game Mode; the microphone ignores it.
  function playChime() {
    COMMON.playChime(state.audioContext, state.masterGain);
    state.micEchoUntil = Math.max(state.micEchoUntil || 0, performance.now() + 700);
  }

  /* Start here: three first steps at the top of the song list. */
  function startHereCard() {
    return COMMON.startHereCard({
      storageKey: 'ethereal-drum-start-here-v1',
      steps: [
        { title: 'Listen first', text: 'Hear “Note Scale Practice” and watch where each note lands.' },
        { title: 'Play along: the song waits for you', text: 'The same scale with Wait · Game Mode.' },
        { title: 'Your first tune', text: 'Twinkle Twinkle Little Star at 0.75× speed.' }
      ],
      onStep: index => {
        els.sidebar.classList.remove('open');
        const scale = '01-note-scale-practice';
        const tune = '06-twinkle-twinkle-little-star';
        const has = id => state.songs.some(song => song.id === id);
        const setWait = on => {
          state.waitPref = on;
          try { localStorage.setItem(STORAGE_WAIT, on ? '1' : '0'); } catch {}
        };
        if (index === 0 && has(scale)) { selectSong(scale); setMode('demo'); togglePlayback().catch(() => {}); }
        else if (index === 1 && has(scale)) {
          selectSong(scale);
          setWait(true);
          setWaitStyle('game');
          setMode('wait');
          togglePlayback().catch(() => {});
        } else if (index === 2 && has(tune)) {
          selectSong(tune);
          setWait(false);
          els.speedSelect.value = '0.75';
          els.speedSelect.dispatchEvent(new Event('change'));
          setMode('practice');
          togglePlayback().catch(() => {});
        }
        renderSongList();
      }
    });
  }

  /* Microphone check: ten seconds to set how loud a strike must be. */
  function openMicCheckDialog() {
    pausePlayback();
    COMMON.openMicCheck({
      storageKey: MIC_CHECK_KEY,
      fallback: 0.018,
      drumName: 'drum',
      getAnalyser: async () => { if (!state.micEnabled) await startMicrophone(); return state.micAnalyser; },
      onDone: threshold => { state.micMinThreshold = threshold; }
    });
  }

  const WAIT_STYLE_LABELS = { game: 'game', hear: 'play note', quiet: 'silent' };

  function syncWaitControls() {
    if (els.waitStyleSelect) els.waitStyleSelect.value = state.mode === 'wait' ? state.waitStyle : 'off';
    if (!els.stageWaitBtn) return;
    const waiting = state.mode === 'wait';
    els.stageWaitBtn.textContent = waiting ? `Wait: ${WAIT_STYLE_LABELS[state.waitStyle]}` : 'Wait: off';
    els.stageWaitBtn.classList.toggle('active', waiting);
    els.stageWaitBtn.setAttribute('aria-pressed', String(waiting));
  }

  function setWaitStyle(style) {
    if (!WAIT_STYLE_LABELS[style]) return;
    state.waitStyle = style;
    try { localStorage.setItem(STORAGE_WAIT_STYLE, style); } catch {}
    if (style !== 'hear') clearTimeout(state.waitHintTimer);
    syncWaitControls();
    updateTransportUI();
  }

  function setWaitOn(on) {
    if (!els.waitToggle) return;
    els.waitToggle.checked = on;
    els.waitToggle.dispatchEvent(new Event('change'));
  }

  // The stage chip steps through: off → Game Mode → Play Note → Silent Mode → off.
  function cycleStageWait() {
    const order = ['game', 'hear', 'quiet'];
    if (state.mode !== 'wait') {
      state.waitStyle = 'game';
      try { localStorage.setItem(STORAGE_WAIT_STYLE, 'game'); } catch {}
      setWaitOn(true);
    } else {
      const next = order.indexOf(state.waitStyle) + 1;
      if (next >= order.length) setWaitOn(false);
      else setWaitStyle(order[next]);
    }
    syncWaitControls();
    showToast(state.mode === 'wait' ? `${els.waitStyleSelect.querySelector(`option[value="${state.waitStyle}"]`)?.text || 'Wait for note'}.` : 'Wait for note is off.', 'success');
  }


  /* Drafts: every song you work on in the builder keeps its own unsaved draft. */
  function readAllDrafts() {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(STORAGE_EDITOR_DRAFTS) || '[]'); } catch { list = []; }
    if (!Array.isArray(list)) list = [];
    // The single draft kept by older versions joins the list once.
    try {
      const old = JSON.parse(localStorage.getItem(STORAGE_EDITOR_DRAFT) || 'null');
      if (old && draftHasContent(old)) {
        if (!old.draftKey || old.draftKey === 'new') old.draftKey = old.songId ? `song:${old.songId}` : `new:${old.savedAt || Date.now()}`;
        if (!list.some(item => item.draftKey === old.draftKey)) list.push(old);
        localStorage.setItem(STORAGE_EDITOR_DRAFTS, JSON.stringify(list));
      }
      localStorage.removeItem(STORAGE_EDITOR_DRAFT);
    } catch {}
    return list.filter(item => item && item.draftKey && draftHasContent(item)).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  }

  function writeAllDrafts(list) {
    try { localStorage.setItem(STORAGE_EDITOR_DRAFTS, JSON.stringify(list.slice(0, 30))); } catch {}
  }

  function updateDraftNotice(restored) {
    if (!els.draftNotice) return;
    const all = readAllDrafts();
    const others = all.filter(item => item.draftKey !== state.editorDraftKey).length;
    if (!restored && !others) { els.draftNotice.hidden = true; return; }
    els.draftNotice.hidden = false;
    if (restored) {
      const when = new Date(restored.savedAt || Date.now());
      const stamp = Number.isNaN(when.getTime()) ? '' : ` from ${when.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
      els.draftNoticeText.textContent = `Unsaved draft restored${stamp}.`;
    } else {
      els.draftNoticeText.textContent = others === 1 ? 'You have 1 unsaved draft.' : `You have ${others} unsaved drafts.`;
    }
    els.discardDraftBtn.hidden = !restored;
    els.allDraftsBtn.hidden = !others;
    els.allDraftsBtn.textContent = restored ? `All drafts (${all.length})` : 'Open drafts';
  }

  function flushDraftSave() {
    if (state.draftSaveTimer) { clearTimeout(state.draftSaveTimer); state.draftSaveTimer = 0; writeDraft(); }
  }

  function draftSourceKey(draft) {
    return String(draft.draftKey || '').startsWith('copy:') ? draft.draftKey.slice(5) : null;
  }

  function draftLabel(draft) {
    if (draft.songId) {
      const song = state.songs.find(item => item.id === draft.songId);
      return song ? `Changes to “${song.title}”` : 'Changes to a deleted song';
    }
    const sourceId = draftSourceKey(draft);
    if (sourceId) {
      const song = state.songs.find(item => item.id === sourceId);
      return song ? `Copy of “${song.title}”` : 'Copy of a song';
    }
    return 'New song';
  }

  function renderDrafts() {
    const drafts = readAllDrafts();
    els.draftsList.replaceChildren();
    els.draftsEmpty.hidden = drafts.length > 0;
    drafts.forEach(draft => {
      const li = document.createElement('li');
      li.className = `draft-item${els.editorDialog.open && draft.draftKey === state.editorDraftKey ? ' current' : ''}`;
      const notes = Array.isArray(draft.timeline) && draft.timeline.length
        ? draft.timeline.filter(item => item.core && !['|', '-', '0'].includes(String(item.core))).length
        : String(draft.sequence || '').split(/\s+/).filter(token => token && !['|', '-', '0'].includes(token)).length;
      const when = new Date(draft.savedAt || Date.now()).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      li.innerHTML = `<div class="draft-info"><b>${escapeHtml(String(draft.title || '').trim() || 'Untitled')}</b><small>${escapeHtml(draftLabel(draft))} · ${notes} notes · ${escapeHtml(when)}</small></div>
        <button type="button" class="draft-open">Open</button>
        <button type="button" class="draft-delete" aria-label="Delete this draft" title="Delete this draft"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="M6 7l1 13h10l1-13"></path></svg></button>`;
      li.querySelector('.draft-open').addEventListener('click', () => openDraft(draft));
      li.querySelector('.draft-delete').addEventListener('click', () => {
        if (!window.confirm(`Delete the draft “${String(draft.title || '').trim() || 'Untitled'}”?`)) return;
        clearDraft(draft.draftKey);
        if (els.editorDialog.open) updateDraftNotice(readAllDrafts().find(item => item.draftKey === state.editorDraftKey) || null);
        renderDrafts();
      });
      els.draftsList.appendChild(li);
    });
  }

  function openDrafts() {
    flushDraftSave();
    renderDrafts();
    if (!els.draftsDialog.open) els.draftsDialog.showModal();
  }

  function openDraft(draft) {
    flushDraftSave();
    if (els.draftsDialog.open) els.draftsDialog.close();
    const song = draft.songId ? state.songs.find(item => item.id === draft.songId) : null;
    const sourceId = draftSourceKey(draft);
    const source = !song && sourceId ? state.songs.find(item => item.id === sourceId) : null;
    if (song) openEditor(song, { draftKey: draft.draftKey });
    else if (source) openEditor({ ...source, id: null, sourceSongId: source.id, title: `${source.title} copy`, builtIn: false }, { draftKey: draft.draftKey });
    else openEditor(null, { draftKey: draft.draftKey });
  }

  function editSelectedSong() {
    const song = selectedSong();
    if (song?.builtIn) openEditor({ ...song, id: null, sourceSongId: song.id, title: `${song.title} copy`, builtIn: false });
    else openEditor(song);
  }

  function narrowPhone() {
    return window.matchMedia?.('(max-width: 360px)').matches;
  }

  function openEditChoice() {
    const song = selectedSong();
    els.choiceEditBtn.hidden = !song;
    els.choiceEditNote.textContent = song?.builtIn ? 'Make your own copy of this song' : 'Change its notes, tempo or title';
    const count = readAllDrafts().length;
    els.choiceDraftsBtn.hidden = !count;
    els.choiceDraftsBtn.querySelector('b').textContent = `Drafts (${count})`;
    if (!els.editChoiceDialog.open) els.editChoiceDialog.showModal();
  }

  function bindRound16() {
    els.rotateLeftBtn?.addEventListener('click', () => rotateTongueDrum(-1));
    els.rotateRightBtn?.addEventListener('click', () => rotateTongueDrum(1));
    els.allDraftsBtn?.addEventListener('click', openDrafts);
    els.editorDialog?.addEventListener('close', flushDraftSave);
    els.choiceEditBtn?.addEventListener('click', () => { els.editChoiceDialog.close(); editSelectedSong(); });
    els.choiceNewBtn?.addEventListener('click', () => { els.editChoiceDialog.close(); openEditor(); });
    els.choiceDraftsBtn?.addEventListener('click', () => { els.editChoiceDialog.close(); openDrafts(); });
    els.waitStyleSelect?.addEventListener('change', () => {
      // One dropdown: "Don't wait for note" or one of the three ways of waiting.
      const choice = els.waitStyleSelect.value;
      if (choice === 'off') {
        setWaitOn(false);
        showToast("Don't wait for note: the song plays on while you play along.", 'success');
        return;
      }
      setWaitStyle(choice);
      setWaitOn(true);
      showToast(`${els.waitStyleSelect.selectedOptions[0].text}.`, 'success');
    });
    els.stageWaitBtn?.addEventListener('click', cycleStageWait);
    els.stageMicBtn?.addEventListener('click', () => els.micBtn.click());
    window.addEventListener('popstate', () => {
      if (state.focusModeIgnorePop) { state.focusModeIgnorePop = false; return; }
      if (state.focusMode) { pausePlayback(); setFocusMode(false); }
    });
    syncWaitControls();
  }

  function appIsInstalled() {
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  // Install button: the browser's own install prompt where there is one, and short
  // instructions everywhere else.
  function setupInstallButton() {
    if (!els.installBtn) return;
    let deferredPrompt = null;
    els.installBtn.hidden = appIsInstalled();
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      deferredPrompt = event;
      els.installBtn.hidden = appIsInstalled();
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      els.installBtn.hidden = true;
      showToast('Installed. Find Ethereal Drum on your home screen.', 'success');
    });
    els.installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch {}
        deferredPrompt = null;
        return;
      }
      const ua = navigator.userAgent;
      let text;
      if (location.protocol === 'file:') text = 'Open the trainer from its website (for example your GitHub Pages link) to install it. A file opened from the computer cannot be installed.';
      else if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) text = 'On iPhone and iPad: tap the Share button in Safari, then Add to Home Screen.';
      else if (/Firefox/.test(ua)) text = 'In Firefox: open the ⋮ menu and choose Install (or Add to Home screen).';
      else if (/SamsungBrowser/.test(ua)) text = 'In Samsung Internet: open the ☰ menu and choose Add page to → Home screen.';
      else if (/Android/.test(ua)) text = 'Open the ⋮ browser menu and choose Install app or Add to Home screen.';
      else text = 'Click the install icon at the right end of the address bar, or open the browser menu and choose Install Ethereal Drum. Safari on Mac: File → Add to Dock.';
      els.installHelpText.textContent = text;
      if (!els.installDialog.open) els.installDialog.showModal();
    });
  }

  // Swipe the note tape to move back or forward through the song.
  function bindTapeScrub() {
    const strip = tapeEls.noteTape?.querySelector('.tape-window');
    if (!strip) return;
    let drag = null;
    strip.addEventListener('pointerdown', event => {
      if (!tape.visible || !state.parsedNotes.length || state.mode === 'tuner') return;
      drag = { id: event.pointerId, x0: event.clientX, t0: state.currentTime, wasPlaying: state.playing && state.mode !== 'wait', moved: false };
      strip.setPointerCapture?.(event.pointerId);
    });
    strip.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        if (drag.wasPlaying) pausePlayback();
        strip.classList.add('scrubbing');
      }
      const time = drag.t0 - (dx / tape.pxPerBeat) * state.secondsPerBeat;
      seekToTime(Math.max(0, Math.min(state.duration - 0.01, time)));
    });
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const resume = drag.moved && drag.wasPlaying;
      strip.classList.remove('scrubbing');
      drag = null;
      if (resume) startPlaybackClock();
    };
    strip.addEventListener('pointerup', end);
    strip.addEventListener('pointercancel', end);
  }

  function setMode(mode, { keepPlace = false } = {}) {
    const resumeAt = keepPlace ? state.currentTime : 0;
    const resume = keepPlace && (state.playing || state.countInActive);
    pausePlayback();
    restartSong();
    state.mode = mode;
    document.body.dataset.mode = mode;
    if (!sectionLoopAvailable()) state.sectionLoop = false;
    document.querySelectorAll('.segment').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode || (btn.dataset.mode === 'practice' && mode === 'wait')));
    if (els.waitToggle) els.waitToggle.checked = mode === 'wait' || (mode !== 'practice' && state.waitPref);
    syncWaitControls();
    // A microphone the tuner switched on goes off again afterwards; Listen never listens.
    if (mode !== 'tuner' && state.micEnabled && (state.micByTuner || mode === 'demo')) stopMicrophone();
    if (mode !== 'tuner') state.micByTuner = false;
    const tunerMode = mode === 'tuner';
    els.trainerGrid?.classList.toggle('tuner-mode', tunerMode);
    if (els.tunerPanel) els.tunerPanel.hidden = !tunerMode;
    const hints = {
      demo: 'Listen and watch the notes, nothing is scored.',
      practice: 'Play along on screen, keyboard, or with the microphone.',
      wait: 'The song waits for each note. Play it to move on.',
      tuner: 'Strike one note at a time. The note lights up and the pitch meter will respond.'
    };
    els.modeHint.textContent = hints[mode];
    if (tunerMode) {
      if (state.visualMode !== 'radial') {
        state.visualMode = 'radial';
        applyVisualMode();
      }
      resetTunerDisplay(state.micEnabled ? 'Listening for a clear pitch' : 'Turn on the microphone to begin');
      if (!state.micEnabled) { state.micByTuner = true; startMicrophone(); }
    }
    updateTransportUI();
    updatePracticeUI();
    syncTapeVisibility();
    fitTabletStage();
    renderFrame();
    if (keepPlace && resumeAt > 0) seekToTime(resumeAt);
    if (resume) togglePlayback().catch(() => {});
  }

  function applyVisualMode() {
    const radial = state.visualMode === 'radial';
    els.noteStage.classList.toggle('radial-view', radial);
    if (ambientWanted()) startAmbientLoop(); else stopAmbientLoop();
    els.trainerGrid?.classList.toggle('radial-layout', radial);
    document.querySelectorAll('.view-segment').forEach(button => {
      button.classList.toggle('active', button.dataset.view === state.visualMode);
      button.setAttribute('aria-pressed', String(button.dataset.view === state.visualMode));
    });
    if (els.mobileViewToggleBtn) {
      const nextView = radial ? 'Falling lanes' : 'Drum centre';
      els.mobileViewToggleBtn.dataset.view = state.visualMode;
      els.mobileViewToggleBtn.setAttribute('aria-label', `Switch display to ${nextView}`);
      els.mobileViewToggleBtn.title = `Switch to ${nextView}`;
    }
    fitTabletStage();
    window.requestAnimationFrame(resizeCanvas);
  }

  function setVisualMode(view) {
    if (!['lanes', 'radial'].includes(view) || view === state.visualMode) return;
    state.visualMode = view;
    localStorage.setItem(STORAGE_VIEW, view);
    applyVisualMode();
    showToast(view === 'radial' ? 'Centre-drum display enabled.' : 'Falling-lane display enabled.', 'success');
  }

  function formatSequenceIntoLines(sequence, barsPerLine = 4) {
    const tokens = String(sequence || '').trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return '';
    if (!tokens.includes('|')) {
      const lines = [];
      for (let index = 0; index < tokens.length; index += 16) {
        lines.push(tokens.slice(index, index + 16).join(' '));
      }
      return lines.join('\n');
    }
    const lines = [];
    let line = [];
    let bars = 0;
    tokens.forEach(token => {
      line.push(token);
      if (token !== '|') return;
      bars += 1;
      if (bars >= barsPerLine) {
        lines.push(line.join(' '));
        line = [];
        bars = 0;
      }
    });
    if (line.length) lines.push(line.join(' '));
    return lines.join('\n');
  }

  function sequenceOffsetAfterLogicalCharacters(text, characterCount, afterWhitespace = false) {
    let offset = 0;
    let seen = 0;
    while (offset < text.length && seen < characterCount) {
      if (!/\s/u.test(text[offset])) seen += 1;
      offset += 1;
    }
    if (afterWhitespace) {
      while (offset < text.length && /\s/u.test(text[offset])) offset += 1;
    }
    return offset;
  }

  // Line formatting changes whitespace only, so map the selection by musical
  // characters and keep the caret attached to the same note.
  function autoFormatSequenceInput() {
    const input = els.sequenceInput;
    const value = input.value;
    const formatted = formatSequenceIntoLines(value);
    if (formatted === value) return false;
    const oldStart = input.selectionStart ?? value.length;
    const oldEnd = input.selectionEnd ?? oldStart;
    const startText = value.slice(0, oldStart);
    const endText = value.slice(0, oldEnd);
    const startCount = [...startText].filter(character => !/\s/u.test(character)).length;
    const endCount = [...endText].filter(character => !/\s/u.test(character)).length;
    input.value = formatted;
    const start = sequenceOffsetAfterLogicalCharacters(formatted, startCount, /\s$/u.test(startText));
    const end = sequenceOffsetAfterLogicalCharacters(formatted, endCount, /\s$/u.test(endText));
    input.setSelectionRange(start, end);
    rememberSequenceSelection();
    return true;
  }

  function formatSequenceEditor() {
    syncEditorTimelineFromCleanInput();
    autoFormatSequenceInput();
    renderSequenceBackdrop();
    els.sequenceInput.focus();
  }

  function openEditor(song = null, options = {}) {
    flushDraftSave();
    state.editorLoading = true;
    state.editorSongId = song?.id || null;
    state.editorDraftKey = options.draftKey || (state.editorSongId
      ? `song:${state.editorSongId}`
      : song?.sourceSongId
        ? `copy:${song.sourceSongId}`
        : `new:${Date.now()}`);
    els.editorHeading.textContent = song ? 'Edit song' : 'Create a song';
    const savedCustomSong = state.editorSongId
      ? state.songs.find(item => item.id === state.editorSongId && !item.builtIn)
      : null;
    els.deleteEditorBtn.hidden = !savedCustomSong;
    els.songTitleInput.value = song?.title || '';
    setSongBpmValue(song?.bpm || 120);
    const currentScale = state.instrument.scaleType === 'custom' ? 'any' : state.instrument.scaleType;
    els.songScaleSelect.value = song?.scaleType || currentScale || 'any';
    state.editorTimeline = timelineFromStoredSequence(song?.sequence || '');
    if (Array.isArray(song?.lyrics)) {
      song.lyrics.forEach((lyric, index) => {
        if (state.editorTimeline[index]) state.editorTimeline[index].lyric = String(lyric || '');
      });
    }
    clearTimingSelection();
    els.sequenceInput.value = formatSequenceIntoLines(cleanSequenceFromTimeline());
    renderSequenceBackdrop();
    const draft = readDraft();
    if (draft) applyDraft(draft);
    else updateDraftNotice(null);
    state.editorLoading = false;
    if (els.expressiveTimingToggle) els.expressiveTimingToggle.checked = state.expressiveTimingEnabled;
    state.editorSelectionStart = els.sequenceInput.value.length;
    state.editorSelectionEnd = els.sequenceInput.value.length;
    renderMiniPads();
    renderTimingEditor();
    // Never skip the open. A <dialog> that is left marked open but is not actually on
    // screen would otherwise make this button do nothing at all, so close first and then
    // reopen; showModal on an already-open dialog throws.
    try { if (els.editorDialog.open) els.editorDialog.close(); } catch { /* not open */ }
    els.editorDialog.showModal();
    window.setTimeout(() => els.songTitleInput.focus(), 30);
  }


  // ---------------------------------------------------------------- copy / print / drafts

  function plainTextColumnWidth(value) {
    return [...String(value || '').normalize('NFD')]
      .filter(character => !/\p{M}/u.test(character)).length;
  }

  // Plain text cannot draw Jianpu beams, so Copy text uses '-' for a Quick run and
  // '=' for a Very quick run on a second aligned row. Spaces between consecutive
  // notes in the same run are filled to make one continuous line, matching the sheet.
  // The mirror of jianpuCopyText. A song copied out of the app - or written in a notepad
  // the same way - keeps its rhythm as a line of dashes under the numbers. Pasted back in
  // raw, every one of those dashes reads as a rest, which is why a pasted song arrived as
  // rows of zeroes. Read the dashes by column instead, and they become the note lengths.
  function isJianpuTimingLine(line) {
    return /[-=_]/u.test(line) && !/[0-9]/u.test(line) && /^[\s\-=_]*$/u.test(line);
  }

  // Combining octave dots take up no width on screen, so they must not shift the columns
  // the dashes are lined up against.
  function plainTextCells(line) {
    const cells = [];
    [...String(line || '').normalize('NFD')].forEach(character => {
      if (/\p{M}/u.test(character)) {
        if (cells.length) cells[cells.length - 1].marks += character;
        return;
      }
      cells.push({ character, marks: '' });
    });
    return cells;
  }

  function looksLikeTextJianpu(text) {
    const lines = String(text || '').replace(/\r\n?/gu, '\n').split('\n');
    return lines.some((line, index) => index > 0 && isJianpuTimingLine(line) && /[0-9]/u.test(lines[index - 1]));
  }

  function importJianpuText(text) {
    const lines = String(text || '').replace(/\r\n?/gu, '\n').split('\n');
    const tokens = [];
    const dotted = [];
    lines.forEach((line, index) => {
      // This line is the rhythm for the line above it, not notes of its own.
      if (index > 0 && isJianpuTimingLine(line) && /[0-9]/u.test(lines[index - 1])) return;
      const under = lines[index + 1];
      const timing = (/[0-9]/u.test(line) && under !== undefined && isJianpuTimingLine(under))
        ? plainTextCells(under).map(cell => cell.character) : [];
      const cells = plainTextCells(line);
      let i = 0;
      while (i < cells.length) {
        const character = cells[i].character;
        if (/\s/u.test(character)) { i += 1; continue; }
        // A repeat sign is several characters that all amount to one bar line here.
        if (character === '|' || character === ':') {
          while (i < cells.length && (cells[i].character === '|' || cells[i].character === ':')) i += 1;
          if (tokens.length && tokens[tokens.length - 1] !== '|') tokens.push('|');
          continue;
        }
        if (/[0-9]/u.test(character)) {
          const start = i;
          const base = character + cells[i].marks;
          i += 1;
          // A dot to the right makes the note half as long again.
          let hasDot = false;
          while (i < cells.length && cells[i].character === '.') { hasDot = true; i += 1; }
          let mark = '';
          for (let column = start; column < i; column += 1) {
            if (timing[column] === '=') mark = '=';
            else if ((timing[column] === '-' || timing[column] === '_') && mark !== '=') mark = '_';
          }
          if (hasDot) dotted.push(tokens.length);
          tokens.push(base + mark);
          continue;
        }
        // A dash on a line that also holds numbers is a rest, the same as typing one.
        if (character === '-') { tokens.push('-'); i += 1; continue; }
        i += 1;
      }
    });
    while (tokens.length && tokens[tokens.length - 1] === '|') tokens.pop();
    return { sequence: tokens.join(' '), dotted };
  }

  // Notes arriving from the scanner or from pasted text are written in the _ and = typing
  // shorthand. The box does not keep that shorthand: it reads the rhythm out and shows
  // clean numbers, exactly as typing does.
  function loadSequenceIntoEditor(sequence, dottedIndices = []) {
    if (!els.sequenceInput) return;
    els.sequenceInput.value = sequence;
    syncEditorTimelineFromCleanInput();
    dottedIndices.forEach(index => {
      const item = state.editorTimeline[index];
      if (item && item.core !== '|') {
        item.durationBeats = Math.min(16, (Number(item.durationBeats) || 1) * 1.5);
      }
    });
    stripTimingShortcutsFromInput();
    els.sequenceInput.value = formatSequenceIntoLines(cleanSequenceFromTimeline());
    state.editorSelectionStart = els.sequenceInput.value.length;
    state.editorSelectionEnd = els.sequenceInput.value.length;
    renderSequenceBackdrop();
    renderTimingEditor();
  }

  function jianpuCopyText() {
    const sourceLines = String(els.sequenceInput?.value || '').trim().split(/\n/u);
    const output = [];
    let timelineIndex = 0;
    sourceLines.forEach(sourceLine => {
      const tokens = sourceLine.trim().split(/\s+/u).filter(Boolean);
      if (!tokens.length) return;
      const timingColumns = [];
      const printed = [];
      let column = 0;
      let previousMark = '';
      let previousWasBar = true;
      tokens.forEach((token, tokenIndex) => {
        if (tokenIndex) column += 1;
        const item = state.editorTimeline[timelineIndex++];
        // A dotted note is written with the dot to its right, the way it is printed, so
        // that its length is still there when the song is pasted back in.
        // Whole beats are written as dashes below; the dot is only for the half beat a
        // dotted note adds. A note is never given both.
        const shown = (item && item.core !== '|' && !Number.isInteger(Number(item.durationBeats))
          && isDottedDuration(item.durationBeats)) ? `${token}.` : token;
        printed.push(shown);
        const width = Math.max(1, plainTextColumnWidth(shown));
        const beams = item?.core === '|' ? 0 : jianpuBeamCount(item?.durationBeats);
        const mark = beams >= 2 ? '=' : beams === 1 ? '-' : '';
        if (mark) {
          if (tokenIndex && previousMark === mark && !previousWasBar) timingColumns[column - 1] = mark;
          for (let offset = 0; offset < width; offset += 1) timingColumns[column + offset] = mark;
        }
        previousMark = mark;
        previousWasBar = item?.core === '|';
        column += width;
        // A note held for whole extra beats is written with a dash for each of them, the
        // way it is printed, so its length is still there when the song is pasted back in.
        const beatsHeld = Number(item?.durationBeats);
        const held = item && item.core !== '|' && !isSilentCore(item.core) && Number.isInteger(beatsHeld)
          ? beatsHeld - 1 : 0;
        for (let extra = 0; extra < held; extra += 1) {
          printed.push('-');
          column += 2;
        }
      });
      const timingLine = Array.from({ length: column }, (_, index) => timingColumns[index] || ' ')
        .join('').trimEnd();
      output.push(printed.join(' '));
      if (timingLine.trim()) output.push(timingLine);
    });
    return output.join('\n');
  }

  async function copySequenceText() {
    syncEditorTimelineFromCleanInput();
    stripTimingShortcutsFromInput();
    autoFormatSequenceInput();
    renderSequenceBackdrop();
    const text = jianpuCopyText();
    if (!text) {
      showToast('There is nothing to copy yet.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Note sequence copied.', 'success');
      return;
    } catch {
      // Clipboard API needs a secure context, which file:// is not. Fall back to a
      // throwaway textarea and the legacy copy command.
    }
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.setAttribute('readonly', '');
    scratch.style.position = 'fixed';
    scratch.style.top = '-1000px';
    document.body.appendChild(scratch);
    scratch.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    document.body.removeChild(scratch);
    showToast(copied ? 'Note sequence copied.' : 'Copy failed. Select the text and press Ctrl+C.', copied ? 'success' : 'warning');
  }

  // The print sheet is a plain snapshot of the on-screen music, so what prints is exactly
  // what the editor shows. Print CSS hides the rest of the page.
  function buildPrintSheet() {
    if (!els.printSheet) return false;
    // Read the sequence box straight into the timeline so the PDF matches what is on
    // screen whether or not the expressive sheet is currently showing.
    syncEditorTimelineFromCleanInput();
    if (!state.editorTimeline.some(item => item.core && item.core !== '|')) return false;

    const music = document.createElement('div');
    music.className = 'timing-token-strip';
    if (!buildSheetInto(music, { interactive: false })) return false;
    music.querySelectorAll('.timing-token').forEach(token => {
      token.classList.remove('selected', 'is-anchor');
      token.removeAttribute('aria-pressed');
    });
    // If the song has any lyrics at all, every note gets a lyric line even when the word
    // is blank. Otherwise the tokens end up different heights and the numbers stop
    // lining up across the bar. A song with no lyrics gets no lines at all.
    const tokens = [...music.querySelectorAll('.timing-token[data-timeline-index]')];
    const lyricFor = token => String(state.editorTimeline[Number(token.dataset.timelineIndex)]?.lyric || '').trim();
    const hasLyrics = tokens.some(token => lyricFor(token));
    if (hasLyrics) {
      tokens.forEach(token => {
        const printed = document.createElement('span');
        printed.className = 'timing-lyric-print';
        printed.textContent = lyricFor(token);
        token.appendChild(printed);
      });
    }
    music.classList.toggle('has-lyrics', hasLyrics);

    const title = els.songTitleInput?.value.trim() || 'Untitled song';
    const bpm = Number(els.songBpmInput?.value) || 72;
    const scaleName = SCALE_NAMES[els.songScaleSelect?.value] || '';
    const drum = state.instrument ? `${state.instrument.count}-note drum` : '';
    const key = state.instrument ? `${state.instrument.key} ${scaleName}`.trim() : scaleName;
    // Counted off the sheet itself, and chord members count individually, so this matches
    // the note count shown beside the song in the sidebar.
    const noteCount = state.editorTimeline.reduce((total, item) => {
      const core = String(item.core || '');
      if (!core || core === '|' || isSilentCore(core)) return total;
      return total + core.split('+').filter(Boolean).length;
    }, 0);
    els.printSheet.innerHTML = '';
    const heading = document.createElement('h1');
    heading.textContent = title;
    const meta = document.createElement('p');
    meta.className = 'print-meta';
    meta.textContent = [`${bpm} BPM`, drum, key, `${noteCount} note${noteCount === 1 ? '' : 's'} in the song`]
      .filter(Boolean).join('  \u00b7  ');
    els.printSheet.append(heading, meta, music);
    return true;
  }

  function exportSheetPdf() {
    if (!buildPrintSheet()) {
      showToast('Add some notes before exporting.', 'warning');
      return;
    }
    document.body.classList.add('printing');
    const cleanUp = () => {
      document.body.classList.remove('printing');
      window.removeEventListener('afterprint', cleanUp);
    };
    window.addEventListener('afterprint', cleanUp);
    // Give the clone a frame to lay out before the dialog freezes rendering.
    requestAnimationFrame(() => {
      window.print();
      setTimeout(cleanUp, 800);
    });
  }

  function currentDraft() {
    return {
      songId: state.editorSongId || null,
      draftKey: state.editorDraftKey,
      title: els.songTitleInput?.value || '',
      bpm: els.songBpmInput?.value || '',
      scaleType: els.songScaleSelect?.value || '',
      sequence: els.sequenceInput?.value || '',
      timeline: (state.editorTimeline || []).map(item => ({
        core: item.core,
        durationBeats: item.durationBeats,
        lyric: item.lyric || ''
      })),
      savedAt: Date.now()
    };
  }

  function draftHasContent(draft) {
    return Boolean(draft && (draft.title.trim() || draft.sequence.trim()));
  }

  function writeDraft() {
    clearTimeout(state.draftSaveTimer);
    state.draftSaveTimer = 0;
    if (!state.editorDraftKey) return;
    const draft = currentDraft();
    const rest = readAllDrafts().filter(item => item.draftKey !== draft.draftKey);
    writeAllDrafts(draftHasContent(draft) ? [draft, ...rest] : rest);
  }

  function queueDraftSave() {
    if (!els.editorDialog?.open || state.editorLoading) return;
    clearTimeout(state.draftSaveTimer);
    state.draftSaveTimer = setTimeout(writeDraft, 400);
  }

  function readDraft() {
    return readAllDrafts().find(item => item.draftKey === state.editorDraftKey) || null;
  }

  function clearDraft(key = state.editorDraftKey) {
    if (key === state.editorDraftKey) { clearTimeout(state.draftSaveTimer); state.draftSaveTimer = 0; }
    writeAllDrafts(readAllDrafts().filter(item => item.draftKey !== key));
    if (els.draftNotice && key === state.editorDraftKey) els.draftNotice.hidden = true;
  }

  function setSongBpmValue(bpm) {
    const select = els.songBpmInput;
    if (!select) return;
    select.querySelectorAll('option[data-song-tempo]').forEach(option => option.remove());
    const value = String(Math.round(Number(bpm) || 120));
    const existing = Array.from(select.options).some(option => option.value === value);
    if (!existing) {
      const option = new Option(`${value} BPM (Song tempo)`, value);
      option.dataset.songTempo = 'true';
      const nextOption = Array.from(select.options).find(item => Number(item.value) > Number(value));
      select.insertBefore(option, nextOption || null);
    }
    select.value = value;
  }

  function applyDraft(draft) {
    els.songTitleInput.value = draft.title || '';
    if (draft.bpm) setSongBpmValue(draft.bpm);
    if (draft.scaleType) els.songScaleSelect.value = draft.scaleType;
    els.sequenceInput.value = draft.sequence || '';
    state.editorTimeline = Array.isArray(draft.timeline) && draft.timeline.length
      ? draft.timeline.map(item => {
        const rawCore = String(item.core);
        const parsedCore = sequenceInputItems(rawCore)[0] || { core: rawCore, durationOverride: null };
        return {
          core: parsedCore.core,
          durationBeats: parsedCore.durationOverride
            ?? (Number(item.durationBeats) || (parsedCore.core === '|' ? 0 : 1)),
          lyric: String(item.lyric || '')
        };
      })
      : timelineFromStoredSequence(draft.sequence || '');
    syncEditorTimelineFromCleanInput();
    stripTimingShortcutsFromInput();
    els.sequenceInput.value = formatSequenceIntoLines(cleanSequenceFromTimeline());
    renderSequenceBackdrop();
    clearTimingSelection();
    updateDraftNotice(draft);
  }

  function saveEditorSong(event) {
    event.preventDefault();
    clearInvalidFields(els.editorForm);
    const title = els.songTitleInput.value.trim();
    const bpm = Number(els.songBpmInput.value);
    const cleanSequence = els.sequenceInput.value.trim();
    const sequence = editorSequenceWithDurations();
    const scaleType = els.songScaleSelect.value;
    const folder = 'library';
    const invalid = [];
    if (!title) invalid.push(els.songTitleInput);
    if (!Number.isFinite(bpm) || bpm < 30 || bpm > 240) invalid.push(els.songBpmInput);
    if (!cleanSequence) invalid.push(els.sequenceInput);
    if (invalid.length) {
      invalid.forEach(field => field.classList.add('invalid-field'));
      focusInvalidField(invalid[0]);
      showToast('Please add a title, a tempo from 30 to 240 BPM, and a note sequence.', 'warning');
      return;
    }
    if (cleanSequence.includes(':')) {
      els.sequenceInput.classList.add('invalid-field');
      focusInvalidField(els.sequenceInput);
      showToast('Keep this box to note numbers only. Use Music sheet (Jianpu) to change the timing.', 'warning');
      return;
    }
    const stats = sequenceStats(sequence);
    if (stats.invalidTokens.length) {
      els.sequenceInput.classList.add('invalid-field');
      focusInvalidField(els.sequenceInput);
      showToast(`These notes could not be read: ${stats.invalidTokens.slice(0, 3).join(', ')}.`, 'warning');
      return;
    }
    const parsed = parseSequence(sequence, bpm);
    if (!parsed.notes.length) {
      els.sequenceInput.classList.add('invalid-field');
      focusInvalidField(els.sequenceInput);
      showToast('No valid notes were found. Check that the song numbers match your tongue labels.', 'warning');
      return;
    }

    const existing = state.songs.find(s => s.id === state.editorSongId);
    if (existing && !existing.builtIn) {
      existing.title = title;
      existing.bpm = bpm;
      existing.sequence = sequence;
      existing.scaleType = scaleType;
      existing.folder = folder;
      existing.lyrics = state.editorTimeline.map(item => item.lyric || '');
      state.selectedId = existing.id;
    } else {
      const song = {
        id: `song-${Date.now().toString(36)}`,
        title,
        bpm,
        sequence,
        scaleType,
        folder,
        lyrics: state.editorTimeline.map(item => item.lyric || ''),
        builtIn: false
      };
      state.songs.push(song);
      state.selectedId = song.id;
    }
    clearDraft();
    saveCustomSongs();
    els.editorDialog.close();
    selectSong(state.selectedId);
    showToast('Song saved privately in this browser. Export a backup for another device.', 'success');
  }

  function rememberSequenceSelection() {
    if (document.activeElement !== els.sequenceInput) return;
    state.editorSelectionStart = els.sequenceInput.selectionStart ?? els.sequenceInput.value.length;
    state.editorSelectionEnd = els.sequenceInput.selectionEnd ?? state.editorSelectionStart;
  }

  // Which notes a stretch of the text covers. Whitespace-separated tokens line up 1:1 with
  // state.editorTimeline, which is the same mapping the _ and = shortcuts use.
  function timelineIndicesInTextRange(start, end) {
    const value = String(els.sequenceInput?.value || '');
    const indices = [];
    const pattern = /\S+/gu;
    let match;
    let index = 0;
    while ((match = pattern.exec(value)) !== null) {
      const tokenStart = match.index;
      const tokenEnd = tokenStart + match[0].length;
      const touched = start === end
        ? start >= tokenStart && start <= tokenEnd
        : tokenStart < end && tokenEnd > start;
      if (touched) indices.push(index);
      index += 1;
    }
    return indices;
  }

  // Selecting numbers in the text box now selects the same notes on the sheet, so the
  // timing buttons work from either view.
  function syncTimingSelectionFromText() {
    if (!state.expressiveTimingEnabled || !els.sequenceInput) return;
    const start = state.editorSelectionStart;
    const end = state.editorSelectionEnd;
    const indices = timelineIndicesInTextRange(Math.min(start, end), Math.max(start, end));
    const current = timingSelectionIndices();
    if (indices.length === current.length && indices.every((value, i) => value === current[i])) return;
    setTimingSelection(indices, indices.length ? indices[0] : null);
    renderTimingEditor();
  }


  // ---- typing in the sequence box -------------------------------------------------
  // Notes separate themselves, so a song can be typed as "1212" rather than "1 2 1 2".
  // A digit only keeps the caret inside the current token while a longer label could
  // still be completed, which is what lets multi-character labels like "10" be typed.
  function sequenceLabelBases() {
    const bases = new Set();
    playableNotes().forEach(note => bases.add(splitOctaveMark(note.label).base));
    return bases;
  }

  // Split compact input such as 123 into playable labels. The fallback search also
  // supports custom multi-digit tongue labels when the current instrument uses them.
  function splitCompactDigitRun(run) {
    const value = String(run || '');
    const bases = [...sequenceLabelBases()].filter(base => /^\d+$/u.test(base));
    if (!value || bases.includes(value)) return [value];
    const byLength = bases.sort((a, b) => b.length - a.length);
    const memo = new Map();
    const visit = offset => {
      if (offset === value.length) return [];
      if (memo.has(offset)) return memo.get(offset);
      let best = null;
      byLength.forEach(base => {
        if (!value.startsWith(base, offset)) return;
        const rest = visit(offset + base.length);
        if (!rest) return;
        const candidate = [base, ...rest];
        if (!best || candidate.length < best.length) best = candidate;
      });
      memo.set(offset, best);
      return best;
    };
    return visit(0) || [...value];
  }

  function normalizeSequenceTextInput(text) {
    let value = String(text || '');
    // Pasted bars become their own token, while "5 =" is accepted as the same timing
    // shortcut as "5=".
    value = value.replace(/([^\s])\|/gu, '$1 |').replace(/\|([^\s])/gu, '| $1');
    value = value.replace(/(\S)-(?=\S)/gu, '$1 - ');
    value = value.replace(/([^\s|])[\t ]+([_=])(?=\s|$)/gu, '$1$2');
    return value.split(/(\s+)/u).map(part => {
      if (!part || /^\s+$/u.test(part)) return part;
      const compact = part.match(/^(\d{2,})([_=])?$/u);
      if (!compact) return part;
      const notes = splitCompactDigitRun(compact[1]);
      if (notes.length <= 1) return part;
      if (compact[2]) notes[notes.length - 1] += compact[2];
      return notes.join(' ');
    }).join('');
  }

  function normalizeSequenceInputValue() {
    const input = els.sequenceInput;
    const value = input.value;
    const normalized = normalizeSequenceTextInput(value);
    if (normalized === value) return false;
    const start = normalizeSequenceTextInput(value.slice(0, input.selectionStart ?? value.length)).length;
    const end = normalizeSequenceTextInput(value.slice(0, input.selectionEnd ?? value.length)).length;
    input.value = normalized;
    input.setSelectionRange(Math.min(start, normalized.length), Math.min(end, normalized.length));
    rememberSequenceSelection();
    return true;
  }

  // _ and = are keyboard commands, not visible notation. Pasted legacy shorthand is
  // absorbed into editorTimeline and then removed without moving the caret unexpectedly.
  function stripTimingShortcutsFromInput() {
    const input = els.sequenceInput;
    const value = input.value;
    const strip = text => text.replace(/([_=])(?=\s|$)/gu, '');
    const cleaned = strip(value);
    if (cleaned === value) return false;
    const start = strip(value.slice(0, input.selectionStart ?? value.length)).length;
    const end = strip(value.slice(0, input.selectionEnd ?? value.length)).length;
    input.value = cleaned;
    input.setSelectionRange(Math.min(start, cleaned.length), Math.min(end, cleaned.length));
    rememberSequenceSelection();
    return true;
  }

  function timingShortcutIndexBeforeCaret() {
    const input = els.sequenceInput;
    const before = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\s+$/u, '');
    if (!/[_=]$/u.test(before)) return -1;
    return Math.max(-1, (before.match(/\S+/gu) || []).length - 1);
  }

  function syncInputTimingMarkers() {
    stripTimingShortcutsFromInput();
  }

  function tokenBeforeCaret(value, caret) {
    const start = value.lastIndexOf(' ', caret - 1) + 1;
    const newline = value.lastIndexOf('\n', caret - 1) + 1;
    return value.slice(Math.max(start, newline), caret);
  }

  // Deciding where one note ends and the next begins, given only the characters typed so
  // far. Returns whether to open a gap before the new character, after it, or neither.
  //   "1" with labels 1-7            -> close now:  "1 "
  //   "1" with a label "10" defined  -> wait, "10" is still reachable
  //   then "2"                       -> "10" is dead, so the 1 was complete: split to "1 2"
  function resolveDigitSpacing(value, caret, typed) {
    const bases = sequenceLabelBases();
    const segment = tokenBeforeCaret(value, caret).split('+').pop();
    if (segment === '-' || segment === '0') return { before: ' ', after: ' ' };
    const candidate = segment + typed;
    for (const base of bases) {
      if (base.length > candidate.length && base.startsWith(candidate)) return { before: '', after: '' };
    }
    if (bases.has(candidate)) return { before: '', after: ' ' };
    if (segment && bases.has(segment)) return { before: ' ', after: ' ' };
    return { before: '', after: ' ' };
  }

  // Replace a stretch of the box and keep the browser's own undo history intact.
  function replaceSequenceRange(start, end, text, caretOffset = text.length) {
    const input = els.sequenceInput;
    input.setSelectionRange(start, end);
    let inserted = false;
    try { inserted = document.execCommand('insertText', false, text); } catch { inserted = false; }
    if (!inserted) {
      const value = input.value;
      input.value = `${value.slice(0, start)}${text}${value.slice(end)}`;
    }
    const caret = start + caretOffset;
    input.setSelectionRange(caret, caret);
    rememberSequenceSelection();
    syncEditorTimelineFromCleanInput();
    renderSequenceBackdrop();
    renderTimingEditor();
    queueDraftSave();
  }

  function handleSequenceTyping(event) {
    if (event.inputType !== 'insertText' || !event.data) return;
    const input = els.sequenceInput;
    const typed = event.data;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;
    const before = value.slice(0, start);

    // Some keyboards deliver a compact run in one event. It receives the same spacing
    // as ordinary one-key-at-a-time input.
    if (typed.length > 1) {
      if (!/^\d+$/u.test(typed)) return;
      event.preventDefault();
      const separated = splitCompactDigitRun(typed).join(' ');
      const after = value.slice(end);
      const lead = before && !/\s$/u.test(before) ? ' ' : '';
      const trail = after && !/^\s/u.test(after) ? ' ' : '';
      replaceSequenceRange(start, end, `${lead}${separated}${trail}`);
      return;
    }

    // ' and . retro-fit an octave dot onto the number just typed.
    if (typed === "'" || typed === '.') {
      const mark = typed === "'" ? DOT_ABOVE : DOT_BELOW;
      const trimmed = before.replace(/\s+$/, '');
      if (!trimmed || /[|+]$/.test(trimmed)) return;
      event.preventDefault();
      replaceSequenceRange(trimmed.length, end, mark + before.slice(trimmed.length));
      return;
    }
    // + joins the previous note into a chord, so the auto-space is taken back out.
    if (typed === '+') {
      const trimmed = before.replace(/\s+$/, '');
      if (!trimmed || /[|+]$/.test(trimmed)) return;
      event.preventDefault();
      replaceSequenceRange(trimmed.length, end, '+');
      return;
    }
    // _ and = modify the previous note instead of becoming sheet tokens. Selecting that
    // note immediately makes Quick or Very quick light up in the timing controls.
    if (typed === '_' || typed === '=') {
      const trimmed = before.replace(/\s+$/u, '');
      const match = trimmed.match(/([^\s|]+)$/u);
      if (!match) return;
      const token = match[1];
      const core = token.replace(/[_=]+$/u, '');
      if (!core || /[+]$/u.test(core)) return;
      event.preventDefault();
      const tokenStart = trimmed.length - token.length;
      const targetIndex = (value.slice(0, tokenStart).match(/\S+/gu) || []).length;
      syncEditorTimelineFromCleanInput();
      const item = state.editorTimeline[targetIndex];
      if (item && item.core !== '|') item.durationBeats = typed === '=' ? 0.25 : 0.5;
      setTimingSelection([targetIndex], targetIndex);
      renderSequenceBackdrop();
      renderTimingEditor();
      queueDraftSave();
      return;
    }
    if (typed === '|') {
      event.preventDefault();
      const spacer = before && !/\s$/.test(before) ? ' ' : '';
      replaceSequenceRange(start, end, `${spacer}| `);
      return;
    }
    if (!/[0-9-]/.test(typed)) return;
    event.preventDefault();
    const after = value.slice(end);
    const spacing = typed === '-' ? { before: ' ', after: ' ' } : resolveDigitSpacing(value, start, typed);
    const lead = spacing.before && !/\s$/.test(before) ? spacing.before : '';
    const trail = spacing.after && !/^\s/.test(after) ? spacing.after : '';
    const insertion = `${lead}${typed}${trail}`;
    replaceSequenceRange(start, end, insertion, insertion.length);
  }

  function prepareChordAtCursor() {
    const input = els.sequenceInput;
    const value = input.value;
    const caret = Math.max(0, Math.min(value.length, state.editorSelectionStart));
    const before = value.slice(0, caret);
    const trimmed = before.replace(/\s+$/u, '');
    const match = trimmed.match(/([^\s|]+)$/u);
    if (!match || /\+$/u.test(match[1])) {
      showToast('Add a note first, then choose Add chord.', 'warning');
      return;
    }
    replaceSequenceRange(trimmed.length, caret, '+');
  }


  // ================= jianpu sheet scanner (beta) =================================
  // Ported from a pipeline measured against a real sheet: row banding, then glyph
  // segmentation, then shape clustering. Clustering rather than font templates is what
  // makes it font independent - every glyph in one image is the same font, so identical
  // shapes group together and you name each group once.

  const SCAN = { maxWidth: 1400, inkCutoff: 0.62, minGlyphWidth: 1, cell: 12 };

  function scanInkMask(image) {
    const scale = Math.min(1, SCAN.maxWidth / image.width);
    const w = Math.max(1, Math.round(image.width * scale));
    const h = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const grey = new Float32Array(w * h);
    let total = 0;
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      const v = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      grey[p] = v; total += v;
    }
    // Threshold relative to the page, so grey scans and photos both work.
    const mean = total / grey.length;
    const cutoff = Math.min(0.72, mean * SCAN.inkCutoff + 0.06);
    const ink = new Uint8Array(w * h);
    for (let p = 0; p < grey.length; p += 1) ink[p] = grey[p] < cutoff ? 1 : 0;
    return { ink, w, h };
  }

  function scanBands(mask, minHeight, fraction) {
    const { ink, w, h } = mask;
    const profile = new Float64Array(h);
    let peak = 0;
    for (let y = 0; y < h; y += 1) {
      let sum = 0;
      for (let x = 0; x < w; x += 1) sum += ink[y * w + x];
      profile[y] = sum;
      if (sum > peak) peak = sum;
    }
    const threshold = Math.max(1, peak * fraction);
    const bands = [];
    let start = null;
    for (let y = 0; y < h; y += 1) {
      if (profile[y] > threshold && start === null) start = y;
      else if (profile[y] <= threshold && start !== null) {
        if (y - start >= minHeight) bands.push([start, y]);
        start = null;
      }
    }
    if (start !== null && h - start >= minHeight) bands.push([start, h]);
    return bands;
  }

  function scanColumns(mask, y0, y1, skipColumns = null) {
    const { ink, w } = mask;
    const runs = [];
    let start = null;
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      if (!(skipColumns && skipColumns.has(x))) {
        for (let y = y0; y < y1; y += 1) sum += ink[y * mask.w + x];
      }
      if (sum > 0 && start === null) start = x;
      else if (sum === 0 && start !== null) {
        if (x - start >= SCAN.minGlyphWidth) runs.push([start, x]);
        start = null;
      }
    }
    if (start !== null) runs.push([start, w]);
    return runs;
  }

  // Normalised, contrast-free shape vector, so size and stroke weight do not matter.
  function scanGlyphVector(mask, box) {
    const { ink, w } = mask;
    let minX = box.x1, maxX = box.x0, minY = box.y1, maxY = box.y0;
    for (let y = box.y0; y < box.y1; y += 1) {
      for (let x = box.x0; x < box.x1; x += 1) {
        if (!ink[y * w + x]) continue;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (maxX < minX || maxY < minY) return null;
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const n = SCAN.cell;
    const v = new Float64Array(n * n);
    for (let cy = 0; cy < n; cy += 1) {
      for (let cx = 0; cx < n; cx += 1) {
        const sx0 = minX + Math.floor(cx * bw / n), sx1 = Math.max(sx0 + 1, minX + Math.floor((cx + 1) * bw / n));
        const sy0 = minY + Math.floor(cy * bh / n), sy1 = Math.max(sy0 + 1, minY + Math.floor((cy + 1) * bh / n));
        let hit = 0, count = 0;
        for (let y = sy0; y < sy1; y += 1) for (let x = sx0; x < sx1; x += 1) { hit += ink[y * w + x]; count += 1; }
        v[cy * n + cx] = count ? hit / count : 0;
      }
    }
    let mean = 0;
    for (let i = 0; i < v.length; i += 1) mean += v[i];
    mean /= v.length;
    let norm = 0;
    for (let i = 0; i < v.length; i += 1) { v[i] -= mean; norm += v[i] * v[i]; }
    norm = Math.sqrt(norm);
    if (!norm) return null;
    for (let i = 0; i < v.length; i += 1) v[i] /= norm;
    return { vector: v, box: { x0: minX, x1: maxX + 1, y0: minY, y1: maxY + 1 }, width: bw, height: bh };
  }

  function scanCosine(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) sum += a[i] * b[i];
    return sum;
  }

  // Agglomerate by similarity: anything close to an existing group joins it, otherwise it
  // starts a new one. No fixed cluster count, so unusual sheets still work.
  function scanCluster(glyphs, threshold = 0.62) {
    const groups = [];
    glyphs.forEach(glyph => {
      let best = -1, bestScore = threshold;
      groups.forEach((group, i) => {
        const score = scanCosine(glyph.vector, group.centre);
        if (score > bestScore) { bestScore = score; best = i; }
      });
      if (best < 0) {
        groups.push({ centre: Float64Array.from(glyph.vector), members: [glyph] });
      } else {
        const group = groups[best];
        group.members.push(glyph);
        for (let i = 0; i < group.centre.length; i += 1) {
          group.centre[i] += (glyph.vector[i] - group.centre[i]) / group.members.length;
        }
      }
    });
    // A single greedy pass fragments: the same digit can seed several groups depending on
    // the order it was met. Merge groups whose centres agree, until nothing else merges.
    let merged = true;
    while (merged && groups.length > 1) {
      merged = false;
      outer:
      for (let i = 0; i < groups.length; i += 1) {
        for (let j = i + 1; j < groups.length; j += 1) {
          if (scanCosine(groups[i].centre, groups[j].centre) < 0.74) continue;
          const a = groups[i], b = groups[j];
          const total = a.members.length + b.members.length;
          for (let k = 0; k < a.centre.length; k += 1) {
            a.centre[k] = (a.centre[k] * a.members.length + b.centre[k] * b.members.length) / total;
          }
          a.members = a.members.concat(b.members);
          groups.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
    // Strays land in whichever surviving group they are closest to, so the list you have
    // to name stays short.
    const strong = groups.filter(g => g.members.length >= 3).sort((a, b) => b.members.length - a.members.length);
    const weak = groups.filter(g => g.members.length < 3);
    const leftovers = [];
    if (strong.length) {
      weak.forEach(group => {
        // Match each stray on its own shape rather than on its little group's average,
        // which for a group of one or two is barely an average at all.
        group.members.forEach(member => {
          let best = null, bestScore = 0.42;
          strong.forEach(candidate => {
            const score = scanCosine(member.vector, candidate.centre);
            if (score > bestScore) { bestScore = score; best = candidate; }
          });
          if (best) best.members.push(member);
          else leftovers.push(member);
        });
      });
    }
    // Whatever still resembles nothing is kept together and shown, not quietly discarded.
    // A number missing from the song is worse than a group you tell me to skip.
    const final = (strong.length ? strong : groups).sort((a, b) => b.members.length - a.members.length);
    if (strong.length && leftovers.length) {
      final.push({ members: leftovers, centre: leftovers[0].vector, unsorted: true });
    }
    final.forEach(group => {
      group.label = '';
      // The sample shown for naming should be the member closest to the group's average,
      // not whichever one happened to arrive first.
      let best = group.members[0], bestScore = -Infinity;
      group.members.forEach(member => {
        const score = scanCosine(member.vector, group.centre);
        if (score > bestScore) { bestScore = score; best = member; }
      });
      group.sample = best;
    });
    return final;
  }


  // A bar line is a near-full-height stroke. Finding it from the column profile catches
  // the ones that touch a neighbouring number, which glyph segmentation merges away.
  function scanBarColumns(mask, y0, y1) {
    const height = y1 - y0;
    // Measure a little above and below the numbers: a bar line runs taller than they do,
    // which is what separates it from the upright stroke inside a 1, 4 or 7.
    const top = Math.max(0, y0 - Math.round(height * 0.2));
    const bottom = Math.min(mask.h, y1 + Math.round(height * 0.2));
    const span = bottom - top;
    const coverage = new Float32Array(mask.w);
    for (let x = 0; x < mask.w; x += 1) {
      let ink = 0;
      for (let y = top; y < bottom; y += 1) ink += mask.ink[y * mask.w + x];
      coverage[x] = ink / span;
    }
    const solid = [];
    for (let x = 0; x < mask.w; x += 1) if (coverage[x] >= 0.85) solid.push(x);
    const runs = [];
    solid.forEach(x => {
      const last = runs[runs.length - 1];
      if (last && x === last[1] + 1) last[1] = x;
      else runs.push([x, x]);
    });
    return runs.filter(([a, b]) => {
      if (b - a + 1 > 3) return false;                       // thin
      const left = coverage[a - 2] ?? 0;
      const right = coverage[b + 2] ?? 0;
      return left < 0.35 && right < 0.35;                    // and standing alone
    });
  }

  // Horizontal runs under a row are the beams. Two stacked runs over the same numbers
  // mean very quick, one means quick.
  function scanBeamRuns(mask, y0, y1) {
    const height = y1 - y0;
    // Start below the numbers themselves: the flat bottom of a 2 or a 5 is nearly as wide
    // as a beam, and counting those turned plain notes into quick ones.
    const from = y1 + 2;
    const to = Math.min(mask.h, y1 + Math.round(height * 0.75));
    const found = [];
    for (let y = from; y < to; y += 1) {
      let start = null;
      for (let x = 0; x <= mask.w; x += 1) {
        const on = x < mask.w && mask.ink[y * mask.w + x];
        if (on && start === null) start = x;
        else if (!on && start !== null) {
          if (x - start >= height) found.push({ y, x0: start, x1: x });
          start = null;
        }
      }
    }
    return found;
  }

  // Small marks directly above or below a number are its octave dots.
  function scanOctaveMarks(mask, glyph) {
    const height = glyph.box.y1 - glyph.box.y0;
    const width = glyph.box.x1 - glyph.box.x0;
    const reach = Math.max(3, Math.round(height * 0.7));
    const cx = Math.round((glyph.box.x0 + glyph.box.x1) / 2);
    const half = Math.max(1, Math.round(width * 0.32));
    const wide = Math.max(3, Math.round(width * 1.4));
    const scan = (from, to) => {
      let ink = 0;
      for (let y = Math.max(0, from); y < Math.min(mask.h, to); y += 1) {
        // Skip beam lines: ink that keeps going well past this number is an underline,
        // not a dot, and counting it made almost every note look low.
        let spread = 0;
        for (let x = cx - wide; x <= cx + wide; x += 1) {
          if (x >= 0 && x < mask.w) spread += mask.ink[y * mask.w + x];
        }
        if (spread > width * 1.3) continue;
        for (let x = cx - half; x <= cx + half; x += 1) {
          if (x >= 0 && x < mask.w) ink += mask.ink[y * mask.w + x];
        }
      }
      return ink;
    };
    // The row band is trimmed, so a number's ink can continue past the box we measured.
    // Follow it to its real top and bottom, or the dot search reads the number itself.
    const rowHasInk = y => {
      if (y < 0 || y >= mask.h) return false;
      for (let x = glyph.box.x0; x < glyph.box.x1; x += 1) if (mask.ink[y * mask.w + x]) return true;
      return false;
    };
    let top = glyph.box.y0;
    while (rowHasInk(top - 1)) top -= 1;
    let bottom = glyph.box.y1 - 1;
    while (rowHasInk(bottom + 1)) bottom += 1;
    const above = scan(top - reach, top - 1);
    const below = scan(bottom + 2, bottom + 1 + reach);
    // A dot is a small compact blob. Too much ink means a neighbouring number.
    const floor = 2;
    const ceiling = Math.max(8, half * 5);
    const upOk = above >= floor && above <= ceiling;
    const downOk = below >= floor && below <= ceiling;
    if (upOk && above >= below) return 'up';
    if (downOk) return 'down';
    return '';
  }

  // A jianpu row spells everything with the same seven shapes, so nearly every number on
  // it has a twin. A row of lyrics almost never repeats a character. That difference is
  // what separates the two, and unlike width or bar lines it does not care what language
  // the words are in.
  function scanRowRepeats(shapes) {
    if (shapes.length < 4) return true;
    let twins = 0;
    shapes.forEach(shape => {
      if (shapes.some(other => other !== shape && scanCosine(shape.vector, other.vector) > 0.75)) twins += 1;
    });
    return twins / shapes.length >= 0.55;
  }

  function scanImage(image) {
    const mask = scanInkMask(image);
    const rows = scanBands(mask, 8, 0.10);
    if (!rows.length) return null;
    // Note rows and lyric rows alternate. Lyric glyphs are usually as wide as they are
    // tall; digits are narrower. That trims the obvious ones before the shape test.
    const measured = rows.map(band => {
      const [y0, y1] = band;
      const inner = Math.max(1, Math.round((y1 - y0) * 0.12));
      const widths = scanColumns(mask, y0 + inner, y1 - inner).map(([a, b]) => b - a);
      widths.sort((a, b) => a - b);
      const midWidth = widths.length ? widths[Math.floor(widths.length / 2)] : 0;
      return { band, count: widths.length, ratio: midWidth / Math.max(1, y1 - y0) };
    }).filter(row => row.count >= 3);
    const candidates = measured.filter(row => row.ratio < 0.95).map(row => row.band);

    const readRow = (band, keep) => {
      const [y0, y1] = band;
      const inner = Math.max(1, Math.round((y1 - y0) * 0.12));
      const digitBottom = y1 - inner;
      const bars = scanBarColumns(mask, y0 + inner, digitBottom);
      const barCols = new Set();
      bars.forEach(([bx0, bx1]) => { for (let x = bx0 - 1; x <= bx1 + 1; x += 1) barCols.add(x); });
      const shapes = scanColumns(mask, y0 + inner, digitBottom, barCols)
        .map(([x0, x1]) => scanGlyphVector(mask, { x0, x1, y0: y0 + inner, y1: digitBottom }))
        .filter(Boolean);
      if (!shapes.length) return null;
      // Octave and augmentation dots are the same shape as a digit but a fraction of the
      // size, so judge each glyph against the typical glyph height on its own row.
      const tall = shapes.map(shape => shape.height).sort((a, b) => a - b);
      const midHeight = tall[Math.floor(tall.length / 2)];
      const wide = shapes.map(shape => shape.width).sort((a, b) => a - b);
      const midWidth = wide[Math.floor(wide.length / 2)] || 1;
      const marked = shapes.map(shaped => {
        const ratio = shaped.width / Math.max(1, shaped.height);
        // A bar line is a thin full-height stroke; a dot is small in both directions; a
        // beam is wide and flat. Everything else is treated as a number.
        const kind = (shaped.height < midHeight * 0.55 && shaped.width < midWidth * 0.7) ? 'dot'
          : ratio > 2.6 ? 'beam'
          : shaped.width < Math.max(2, midWidth * 0.35) ? 'speck'
          : 'digit';
        return { ...shaped, kind };
      });
      const numbers = marked.filter(shape => shape.kind === 'digit');
      if (keep && !scanRowRepeats(numbers)) return null;
      return { band, bars, marked, y0, y1, inner, digitBottom };
    };

    const build = keep => {
      const glyphs = [];
      const noteRows = [];
      candidates.forEach(band => {
        const read = readRow(band, keep);
        if (!read) return;
        const rowIndex = noteRows.length;
        noteRows.push(read.band);
        read.bars.forEach(([bx0, bx1]) => glyphs.push({
          box: { x0: bx0, x1: bx1 + 1, y0: read.y0 + read.inner, y1: read.digitBottom },
          width: bx1 - bx0 + 1, height: read.digitBottom - (read.y0 + read.inner), vector: null,
          row: rowIndex, kind: 'bar', x: bx0, band: read.band, octave: '', beams: 0
        }));
        read.marked.forEach(shape => glyphs.push({
          ...shape, row: rowIndex, x: shape.box.x0, band: read.band, octave: '', beams: 0
        }));
        // Read the beams under this row and the octave dots around each number.
        const runs = scanBeamRuns(mask, read.y0 + read.inner, read.digitBottom);
        const levels = [];
        runs.forEach(run => {
          let level = levels.find(l => Math.abs(l.y - run.y) <= 1);
          if (!level) { level = { y: run.y, runs: [] }; levels.push(level); }
          level.runs.push(run);
        });
        levels.sort((a, b) => a.y - b.y);
        glyphs.filter(g => g.row === rowIndex && g.kind === 'digit').forEach(glyph => {
          const mid = (glyph.box.x0 + glyph.box.x1) / 2;
          // Two beams is the shortest note this app writes, so a third line found under
          // a number is noise rather than a reason to give up on it.
          glyph.beams = Math.min(2, levels.filter(level => level.runs.some(run => run.x0 <= mid && run.x1 >= mid)).length);
          glyph.octave = scanOctaveMarks(mask, glyph);
        });
      });
      return { glyphs, noteRows };
    };

    // If the shape test rejects everything, the page is unusual rather than wrong, so
    // fall back to reading every candidate row.
    let built = build(true);
    if (!built.noteRows.length) built = build(false);
    const digits = built.glyphs.filter(g => g.kind === 'digit');
    return { mask, noteRows: built.noteRows, glyphs: built.glyphs, digits, groups: scanCluster(digits) };
  }

  function scanSequenceFromGroups(result) {
    if (!result) return '';
    const labelFor = new Map();
    result.groups.forEach(group => group.members.forEach(m => labelFor.set(m, group.label)));
    const parts = [];
    result.glyphs
      .slice()
      .sort((a, b) => (a.row - b.row) || (a.x - b.x))
      .forEach(glyph => {
        if (glyph.kind === 'beam') return;
        if (glyph.kind === 'bar') { parts.push('|'); return; }
        const label = labelFor.get(glyph);
        if (!label || label === 'skip') return;
        // A rest has no pitch, so an octave dot or a beam beside it was read from
        // something else on the page. Keep it plain.
        if (label === '0' || label === '-') { parts.push(label); return; }
        // Octave dots and beams found beside the glyph become the mark and the length.
        const marked = applyOctaveMark(label, glyph.octave || '');
        parts.push(glyph.beams === 2 ? `${marked}=` : glyph.beams === 1 ? `${marked}_` : marked);
      });
    // Repeat signs and the bar at the end of one line meeting the bar at the start of
    // the next both read as several bars in a row. One bar line is what was meant.
    const tidy = [];
    parts.forEach(token => {
      if (token === '|' && (tidy.length === 0 || tidy[tidy.length - 1] === '|')) return;
      tidy.push(token);
    });
    while (tidy.length && tidy[tidy.length - 1] === '|') tidy.pop();
    return tidy.join(' ').trim();
  }


  // ---- scanner UI ----
  function renderScanGroups() {
    const result = state.scanResult;
    if (!els.scanGroups) return;
    els.scanGroups.innerHTML = '';
    if (!result) return;
    result.groups.forEach((group, groupIndex) => {
      const row = document.createElement('div');
      row.className = 'scan-group';
      const sample = document.createElement('canvas');
      sample.className = 'scan-sample';
      const member = group.sample || group.members[0];
      const size = 34;
      sample.width = size; sample.height = size;
      const ctx = sample.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#111827';
      const { mask } = result;
      const bw = member.box.x1 - member.box.x0, bh = member.box.y1 - member.box.y0;
      const scale = Math.min((size - 6) / bw, (size - 6) / bh);
      for (let y = member.box.y0; y < member.box.y1; y += 1) {
        for (let x = member.box.x0; x < member.box.x1; x += 1) {
          if (!mask.ink[y * mask.w + x]) continue;
          ctx.fillRect(3 + (x - member.box.x0) * scale, 3 + (y - member.box.y0) * scale,
            Math.max(1, scale), Math.max(1, scale));
        }
      }
      const count = document.createElement('small');
      count.textContent = `${group.members.length}×`;
      const picker = document.createElement('div');
      picker.className = 'scan-picker';
      ['1', '2', '3', '4', '5', '6', '7', '0'].forEach(digit => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = digit;
        button.className = group.label === digit ? 'active' : '';
        button.addEventListener('click', () => {
          group.label = group.label === digit ? '' : digit;
          renderScanGroups();
          updateScanApply();
        });
        picker.appendChild(button);
      });
      const skip = document.createElement('button');
      skip.type = 'button';
      skip.className = `scan-skip${group.label === 'skip' ? ' active' : ''}`;
      skip.textContent = 'Not a note';
      skip.addEventListener('click', () => {
        group.label = group.label === 'skip' ? '' : 'skip';
        renderScanGroups();
        updateScanApply();
      });
      picker.appendChild(skip);
      row.append(sample, count, picker);
      els.scanGroups.appendChild(row);
    });
  }

  function updateScanApply() {
    const result = state.scanResult;
    const named = result ? result.groups.filter(g => g.label && g.label !== 'skip').length : 0;
    const total = result ? result.groups.length : 0;
    if (els.scanApplyBtn) els.scanApplyBtn.disabled = named === 0;
    if (els.scanStatus && result) {
      els.scanStatus.textContent = `${result.digits.length} numbers found in ${result.noteRows.length} rows, `
        + `grouped into ${total} shapes. ${named} named.`;
    }
  }

  function drawScanPreview(result) {
    const canvas = els.scanCanvas;
    if (!canvas || !result) return;
    const { mask } = result;
    canvas.width = mask.w; canvas.height = mask.h;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(mask.w, mask.h);
    for (let p = 0; p < mask.ink.length; p += 1) {
      const v = mask.ink[p] ? 20 : 250;
      img.data[p * 4] = v; img.data[p * 4 + 1] = v; img.data[p * 4 + 2] = v; img.data[p * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.lineWidth = 1;
    result.glyphs.forEach(g => {
      ctx.strokeStyle = g.kind === 'digit' ? 'rgba(13,148,136,.85)'
        : g.kind === 'bar' ? 'rgba(167,139,250,.9)' : 'rgba(251,191,36,.9)';
      ctx.strokeRect(g.box.x0 - 0.5, g.box.y0 - 0.5, g.box.x1 - g.box.x0 + 1, g.box.y1 - g.box.y0 + 1);
    });
  }

  async function handleScanFile(file) {
    if (!file) return;
    if (els.scanStatus) els.scanStatus.textContent = 'Reading image...';
    if (els.scanStage) els.scanStage.hidden = false;
    try {
      const url = URL.createObjectURL(file);
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('could not read image'));
        img.src = url;
      });
      const result = scanImage(image);
      URL.revokeObjectURL(url);
      if (!result || !result.digits.length) {
        state.scanResult = null;
        if (els.scanStatus) els.scanStatus.textContent = 'No numbers found. Try a straighter or higher contrast image.';
        updateScanApply();
        return;
      }
      state.scanResult = result;
      if (typeof globalThis !== 'undefined') globalThis.__lastScan__ = result;
      drawScanPreview(result);
      renderScanGroups();
      updateScanApply();
    } catch (error) {
      if (els.scanStatus) els.scanStatus.textContent = `Could not scan that image: ${error.message}`;
    }
  }

  function insertTokenAtCursor(token) {
    const value = els.sequenceInput.value;
    const start = Math.max(0, Math.min(value.length, state.editorSelectionStart));
    const end = Math.max(start, Math.min(value.length, state.editorSelectionEnd));
    const savedScrollTop = els.sequenceInput.scrollTop;
    const savedScrollLeft = els.sequenceInput.scrollLeft;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix = before && !/[\s+]$/.test(before) ? ' ' : '';
    const suffix = after && !/^\s/.test(after) ? ' ' : '';
    const insertion = `${prefix}${token}${suffix}`;
    els.sequenceInput.value = `${before}${insertion}${after}`;
    renderSequenceBackdrop();
    const nextPosition = start + insertion.length;
    els.sequenceInput.setSelectionRange(nextPosition, nextPosition);
    try {
      els.sequenceInput.focus({ preventScroll: true });
    } catch {
      els.sequenceInput.focus();
    }
    const restoreEditorViewport = () => {
      els.sequenceInput.setSelectionRange(nextPosition, nextPosition);
      els.sequenceInput.scrollTop = savedScrollTop;
      els.sequenceInput.scrollLeft = savedScrollLeft;
    };
    restoreEditorViewport();
    requestAnimationFrame(restoreEditorViewport);
    state.editorSelectionStart = nextPosition;
    state.editorSelectionEnd = nextPosition;
    els.sequenceInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function songFileDocument(song, { folder = null } = {}) {
    if (!song) return null;
    return {
      format: SONG_FORMAT,
      song: {
        title: song.title,
        bpm: song.bpm,
        sequence: song.sequence,
        scaleType: song.scaleType || 'any',
        folder: folder || song.folder || (song.builtIn ? 'demo' : 'library')
      }
    };
  }

  function communitySongFingerprint(song) {
    if (!song) return '';
    const source = [
      COMMUNITY_REVIEW_FINGERPRINT_VERSION,
      String(song.title || '').trim(),
      String(Number(song.bpm) || ''),
      String(song.sequence || '').trim(),
      String(song.scaleType || 'any')
    ].join('\u001f');
    let hash = 2166136261;
    for (let i = 0; i < source.length; i += 1) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `${COMMUNITY_REVIEW_FINGERPRINT_VERSION}-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  function songIsUnderCommunityReview(song) {
    return Boolean(song && !song.builtIn
      && song.communitySubmittedFingerprint
      && song.communitySubmittedFingerprint === communitySongFingerprint(song));
  }

  function downloadSongFile(song, { folder = null, suffix = '' } = {}) {
    const payload = songFileDocument(song, { folder });
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(song.title)}${suffix}.drumsong`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSong() {
    downloadSongFile(selectedSong());
  }

  function setCommunityUploadProgress(percent, status, tone = '') {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    if (!els.communityUploadProgress) return;
    els.communityUploadProgress.hidden = false;
    els.communityUploadProgress.classList.toggle('success', tone === 'success');
    els.communityUploadProgress.classList.toggle('error', tone === 'error');
    els.communityUploadStatus.textContent = status;
    els.communityUploadPercent.textContent = tone === 'error' ? 'Failed' : `${Math.round(value)}%`;
    els.communityProgressFill.style.width = `${value}%`;
    els.communityProgressTrack.setAttribute('aria-valuenow', String(Math.round(value)));
  }

  function resetCommunityUploadProgress() {
    if (!els.communityUploadProgress || communityUploadRequest) return;
    els.communityUploadProgress.hidden = true;
    els.communityUploadProgress.classList.remove('success', 'error');
    els.communityUploadStatus.textContent = 'Preparing submission...';
    els.communityUploadPercent.textContent = '0%';
    els.communityProgressFill.style.width = '0%';
    els.communityProgressTrack.setAttribute('aria-valuenow', '0');
  }

  function validCommunityMessageOrigin(origin) {
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' && (
        url.hostname === 'script.google.com'
        || url.hostname === 'script.googleusercontent.com'
        || url.hostname.endsWith('.googleusercontent.com')
      );
    } catch {
      return false;
    }
  }

  function pollCommunityUploadStatus(nonce) {
    const request = communityUploadRequest;
    if (!request || request.nonce !== nonce) return;
    const statusScript = document.createElement('script');
    const statusUrl = new URL(COMMUNITY_UPLOAD_URL);
    statusUrl.searchParams.set('nonce', nonce);
    statusUrl.searchParams.set('callback', COMMUNITY_STATUS_CALLBACK);
    statusUrl.searchParams.set('status-check', String(Date.now()));
    statusScript.src = statusUrl.href;
    statusScript.async = true;
    statusScript.onload = statusScript.onerror = () => statusScript.remove();
    document.head.appendChild(statusScript);
  }

  window[COMMUNITY_STATUS_CALLBACK] = response => {
    const request = communityUploadRequest;
    if (!request || !response || response.pending || response.nonce !== request.nonce) return;
    finishCommunityUpload(request.nonce, Boolean(response.ok), String(response.message || ''));
  };

  function finishCommunityUpload(nonce, ok, message) {
    const request = communityUploadRequest;
    if (!request || request.nonce !== nonce) return;
    window.clearInterval(request.progressTimer);
    window.clearInterval(request.pollTimer);
    window.clearTimeout(request.timeoutTimer);
    window.removeEventListener('message', request.onMessage);
    request.form.remove();
    window.setTimeout(() => request.frame.remove(), 80);
    communityUploadRequest = null;

    if (ok) {
      const song = selectedSong();
      if (song && !song.builtIn) {
        song.communitySubmittedFingerprint = communitySongFingerprint(song);
        song.communitySubmittedAt = new Date().toISOString();
        saveCustomSongs();
      }
      setCommunityUploadProgress(100, message || 'Song submitted for review.', 'success');
      els.submitCommunityBtn.textContent = 'Song under review';
      els.submitCommunityBtn.disabled = true;
      setCommunitySelectionMessage(song, 'This version has been submitted and is waiting for owner review. Edit the song to submit a revised version.');
      showToast(message || 'Song submitted for Community review.', 'success');
      return;
    }

    setCommunityUploadProgress(request.progress, message || 'Upload failed. Please try again.', 'error');
    els.submitCommunityBtn.textContent = 'Try again';
    els.submitCommunityBtn.disabled = false;
    showToast(message || 'Community submission failed.', 'warning');
  }

  function setCommunitySelectionMessage(song, message) {
    if (!els.communitySelection) return;
    els.communitySelection.replaceChildren();
    if (song?.title) {
      const selected = document.createElement('strong');
      selected.className = 'community-selected-song';
      selected.textContent = `Selected song: ${song.title}`;
      els.communitySelection.appendChild(selected);
    }
    if (message) {
      const detail = document.createElement('span');
      detail.className = 'community-selection-detail';
      detail.textContent = message;
      els.communitySelection.appendChild(detail);
    }
  }

  function openCommunityDialog() {
    if (!els.communityDialog) return;
    const song = selectedSong();
    const ownSong = Boolean(song && !song.builtIn);
    const configured = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/u.test(COMMUNITY_UPLOAD_URL);
    const underReview = ownSong && songIsUnderCommunityReview(song);
    const canSubmit = ownSong && configured && !communityUploadRequest && !underReview;
    els.submitCommunityBtn.disabled = !canSubmit;
    els.submitCommunityBtn.textContent = underReview ? 'Song under review' : 'Submit selected song';
    if (underReview) {
      setCommunitySelectionMessage(song, 'This version has already been submitted and is waiting for owner review. Edit the song to submit a revised version.');
    } else if (ownSong) {
      setCommunitySelectionMessage(song, 'Ready to submit this song for Community review.');
    } else {
      els.communitySelection.textContent = 'Select one of your own Song library songs before submitting.';
    }
    if (!configured) els.communitySelection.textContent = 'Community submissions are temporarily unavailable.';
    resetCommunityUploadProgress();
    els.communityDialog.showModal();
  }

  function submitCommunitySong() {
    const song = selectedSong();
    if (!song || song.builtIn) {
      showToast('Select one of your own Song library songs first.', 'warning');
      return;
    }
    if (!COMMUNITY_UPLOAD_URL || communityUploadRequest) return;
    if (songIsUnderCommunityReview(song)) {
      els.submitCommunityBtn.textContent = 'Song under review';
      els.submitCommunityBtn.disabled = true;
      setCommunitySelectionMessage(song, 'This version has already been submitted and is waiting for owner review. Edit the song to submit a revised version.');
      showToast('This song version is already under review.', 'warning');
      return;
    }

    const payload = songFileDocument(song, { folder: 'community' });
    const nonce = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `community-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement('iframe');
    frame.name = `community-upload-${nonce.replace(/[^a-z0-9]/gi, '')}`;
    frame.title = 'Community submission response';
    frame.hidden = true;
    const form = document.createElement('form');
    form.method = 'post';
    form.action = COMMUNITY_UPLOAD_URL;
    form.target = frame.name;
    form.acceptCharset = 'UTF-8';
    form.hidden = true;
    const addField = (name, value) => {
      const field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      field.value = value;
      form.appendChild(field);
    };
    addField('payload', JSON.stringify(payload));
    addField('nonce', nonce);
    addField('website', '');

    const onMessage = event => {
      if (!validCommunityMessageOrigin(event.origin)) return;
      const response = event.data;
      if (!response || response.type !== 'ethereal-community-upload' || response.nonce !== nonce) return;
      finishCommunityUpload(nonce, Boolean(response.ok), String(response.message || ''));
    };
    communityUploadRequest = { nonce, frame, form, onMessage, progress: 6, progressTimer: 0, pollTimer: 0, timeoutTimer: 0 };
    window.addEventListener('message', onMessage);
    document.body.append(frame, form);
    els.submitCommunityBtn.disabled = true;
    els.submitCommunityBtn.textContent = 'Submitting...';
    setCommunityUploadProgress(6, 'Uploading song...');
    communityUploadRequest.progressTimer = window.setInterval(() => {
      if (!communityUploadRequest || communityUploadRequest.nonce !== nonce) return;
      communityUploadRequest.progress = Math.min(92, communityUploadRequest.progress + Math.max(1, (92 - communityUploadRequest.progress) * .08));
      setCommunityUploadProgress(communityUploadRequest.progress, 'Uploading song...');
    }, 220);
    communityUploadRequest.timeoutTimer = window.setTimeout(() => {
      finishCommunityUpload(nonce, false, 'The upload timed out. Please try again.');
    }, 45000);
    form.submit();
    pollCommunityUploadStatus(nonce);
    communityUploadRequest.pollTimer = window.setInterval(() => pollCommunityUploadStatus(nonce), 800);
  }

  async function importSong(file) {
    try {
      if (!file.name.toLowerCase().endsWith('.drumsong')) throw new Error('Unsupported file extension');
      const data = JSON.parse(await file.text());
      if (![SONG_FORMAT, LEGACY_SONG_FORMAT].includes(data.format)) throw new Error('Unsupported song format');
      const source = data.song;
      if (!source?.title || !source.sequence || !source.bpm) throw new Error('Invalid song file');
      const stats = sequenceStats(source.sequence);
      if (stats.invalidTokens.length || !stats.noteCount) throw new Error('Invalid song timing');
      const song = {
        id: `song-${Date.now().toString(36)}`,
        title: String(source.title),
        bpm: Number(source.bpm),
        sequence: String(source.sequence),
        scaleType: ['major', 'major-pentatonic', 'minor-pentatonic', 'any'].includes(source.scaleType) ? source.scaleType : 'any',
        folder: 'library',
        builtIn: false
      };
      state.songs.push(song);
      saveCustomSongs();
      if (els.editorDialog?.open) els.editorDialog.close();
      selectSong(song.id);
      showToast('Song imported.', 'success');
    } catch (error) {
      console.error(error);
      showToast('That file is not a valid .drumsong file.', 'warning');
    } finally {
      els.importFile.value = '';
    }
  }

  function deleteSong(song, closeEditor = false) {
    if (!song) return;
    const catalogue = song.builtIn;
    const collectionName = isCommunitySong(song) ? 'Community gallery' : 'Demo songs';
    const question = catalogue
      ? `Remove "${song.title}" from ${collectionName}?\n\nThis removes it from this browser only.`
      : `Delete "${song.title}"?\n\nThis cannot be undone.`;
    if (!window.confirm(question)) return;
    const deletedIndex = state.songs.findIndex(item => item.id === song.id);
    if (song.builtIn) {
      state.hiddenDemoIds.add(String(song.id));
      saveHiddenDemos();
    }
    state.songs = state.songs.filter(s => s.id !== song.id);
    saveCustomSongs();
    if (closeEditor) {
      state.editorSongId = null;
      els.editorDialog.close();
    }
    const nextIndex = Math.min(Math.max(0, deletedIndex), state.songs.length - 1);
    selectSong(state.songs[nextIndex]?.id || state.songs[0]?.id);
    showToast(catalogue ? 'Catalogue song removed.' : 'Song deleted.', 'success');
  }

  function deleteSelectedSong() {
    deleteSong(selectedSong());
  }

  function restoreDemoSongs() {
    const missing = curatedSongs.filter(song => state.hiddenDemoIds.has(song.id));
    if (!missing.length) return;
    state.hiddenDemoIds.clear();
    saveHiddenDemos();
    const customSongs = state.songs.filter(song => !song.builtIn);
    state.songs = [...curatedSongs.map(song => normaliseSong(song, 'major')), ...customSongs];
    if (!state.songs.some(song => song.id === state.selectedId)) state.selectedId = state.songs[0]?.id || null;
    renderSongList();
    if (state.selectedId) selectSong(state.selectedId);
    showToast('Catalogue songs restored.', 'success');
  }

  function deleteEditorSong() {
    const song = state.songs.find(item => item.id === state.editorSongId);
    if (!song) {
      els.deleteEditorBtn.hidden = true;
      showToast('This song has not been saved yet.', 'warning');
      return;
    }
    deleteSong(song, true);
  }

  function openSettings() {
    els.instrumentKeySelect.value = ['C', 'D'].includes(state.instrument.key) ? state.instrument.key : 'C';
    els.scaleTypeSelect.value = state.instrument.scaleType || 'custom';
    els.noteCountSelect.value = String(state.instrument.count);
    els.rootOctaveSelect.value = String(state.instrument.rootOctave ?? 4);
    els.highDrumToggle.checked = Boolean(state.instrument.highDrumEnabled);
    els.highDrumAlwaysToggle.checked = Boolean(state.instrument.highDrumAlwaysVisible);
    syncHighDrumOption();
    renderTuningGrid(state.instrument.count, state.instrument.notes);
    renderCompanionTuningGrid(state.instrument.companionNotes);
    renderNoteGuide();
    els.settingsDialog.showModal();
  }

  function syncHighDrumOption() {
    const available = Number(els.noteCountSelect.value) === 15;
    els.highDrumOption.hidden = false;
    els.highDrumOption.classList.toggle('unavailable', !available);
    els.highDrumToggle.disabled = !available;
    els.highDrumAlwaysToggle.disabled = !available || !els.highDrumToggle.checked;
    els.companionTuningSection.hidden = !available || !els.highDrumToggle.checked;
    if (els.highDrumAvailability) {
      els.highDrumAvailability.textContent = available
        ? (els.highDrumToggle.checked ? 'Enabled for this 15-note drum' : 'Available for this 15-note drum')
        : 'Choose 15 notes above to use the companion drum';
    }
    if (!els.highDrumToggle.checked) els.highDrumAlwaysToggle.checked = false;
  }

  function noteOptions(selectedMidi) {
    let html = '';
    for (let midi = 36; midi <= 96; midi++) {
      html += `<option value="${midi}"${midi === Number(selectedMidi) ? ' selected' : ''}>${midiToName(midi)}</option>`;
    }
    return html;
  }

  function getPresetFromSettings() {
    const key = els.instrumentKeySelect.value;
    const scaleType = els.scaleTypeSelect.value;
    const count = Number(els.noteCountSelect.value);
    const rootOctave = Number(els.rootOctaveSelect.value);
    return scaleType === 'custom' ? null : makePresetInstrument(count, key, rootOctave, REFERENCE_PITCH, scaleType);
  }

  function readTuningGridValues() {
    const labelInputs = [...els.tuningGrid.querySelectorAll('.tuning-label')];
    const pitchSelects = [...els.tuningGrid.querySelectorAll('.tuning-pitch')];
    const noteInputs = [...els.tuningGrid.querySelectorAll('.tuning-note')];
    const colorInputs = [...els.tuningGrid.querySelectorAll('.tuning-color')];
    return noteInputs.map((input, i) => ({
      label: composeTuningLabel(labelInputs[i], pitchSelects[i], i),
      midi: Number(input.value),
      color: normaliseColor(colorInputs[i]?.value, i)
    }));
  }

  // The editor stores the bare number in the text box and the dot in a checkbox, then
  // glues them back together here. Songs and note matching still use the full label.
  function composeTuningLabel(labelInput, pitchSelect, index = 0) {
    const base = splitOctaveMark(labelInput?.value ?? '').base.trim() || String(index + 1);
    const mark = pitchSelect?.value || '';
    if (mark === 'up2') return `${base}${DOT_ABOVE}${DOT_ABOVE}`;
    return applyOctaveMark(base, mark);
  }

  // Line-art microphone. The 🎙 emoji rendered as a flat blob on most Windows fonts.
  const MIC_ICON = '<svg class="mic-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3"></rect><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0"></path><path d="M12 17v4"></path><path d="M8.6 21h6.8"></path></svg>';

  const PITCH_OPTIONS = [['up', 'high'], ['', 'middle'], ['down', 'low']];

  function pitchSelectMarkup(index, mark) {
    const options = PITCH_OPTIONS
      .map(([value, text]) => `<option value="${value}"${value === mark ? ' selected' : ''}>${text}</option>`)
      .join('');
    return `<select class="tuning-pitch" data-index="${index}" aria-label="Octave for tongue ${index + 1}">${options}</select>`;
  }

  function companionPitchSelectMarkup(index, octave) {
    const selected = octave.mark === 'up' && octave.count > 1 ? 'up2' : octave.mark;
    const options = [['up2', 'very high'], ['up', 'high'], ['', 'middle'], ['down', 'low']]
      .map(([value, text]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${text}</option>`)
      .join('');
    return `<select class="tuning-pitch companion-tuning-pitch" data-index="${index}" aria-label="Octave for companion tongue ${index + 1}">${options}</select>`;
  }

  // Rainbow order (sorted by hue) so the popup reads like a colour wheel rather than
  // the arbitrary order the defaults happen to be stored in.
  function hueOf(hex) {
    const { r, g, b } = hexToRgb(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 0;
    const d = max - min;
    const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return h * 60;
  }

  const RAINBOW_PALETTE = [...NOTE_COLORS].sort((a, b) => hueOf(a) - hueOf(b));

  function renderTuningGrid(count, existing = []) {
    els.tuningGrid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const fallbackScale = SCALE_INTERVALS[els.scaleTypeSelect?.value] ? els.scaleTypeSelect.value : 'major';
      const fallback = makePresetInstrument(count, els.instrumentKeySelect?.value || 'C', Number(els.rootOctaveSelect?.value || 4), REFERENCE_PITCH, fallbackScale).notes[i];
      const note = { ...fallback, ...(existing[i] || {}) };
      const color = normaliseColor(note.color, i);
      const parsed = splitOctaveMark(note.label);
      const row = document.createElement('div');
      row.className = 'tuning-row';
      row.dataset.index = String(i);
      setNoteColorVars(row, color);
      row.innerHTML = `
        <span class="tongue-number"><i aria-hidden="true"></i>Tongue ${i + 1}</span>
        <label>Label<input class="tuning-label" data-index="${i}" maxlength="4" inputmode="numeric" value="${escapeAttr(parsed.base)}" required></label>
        <label>Pitch${pitchSelectMarkup(i, parsed.mark)}</label>
        <label>Note<select class="tuning-note" data-index="${i}">${noteOptions(note.midi)}</select></label>
        <span class="tuning-color-label">Color
          <button type="button" class="colour-chip" data-index="${i}" style="--sw:${color}" aria-label="Color for tongue ${i + 1}, currently ${color}" aria-haspopup="dialog"></button>
          <input class="tuning-color" type="hidden" data-index="${i}" value="${color}">
        </span>
      `;
      els.tuningGrid.appendChild(row);
    }
  }

  function renderCompanionTuningGrid(existing = []) {
    if (!els.companionTuningGrid) return;
    const notes = normaliseCompanionNotes(
      existing,
      els.instrumentKeySelect?.value || state.instrument?.key || 'D',
      Number(els.rootOctaveSelect?.value ?? state.instrument?.rootOctave ?? 4)
    );
    els.companionTuningGrid.innerHTML = '';
    notes.forEach((note, i) => {
      const color = normaliseColor(note.color, 15 + i);
      const parsed = splitOctaveMark(note.label);
      const row = document.createElement('div');
      row.className = 'tuning-row companion-tuning-row';
      row.dataset.index = String(i);
      row.dataset.colorIndex = String(15 + i);
      setNoteColorVars(row, color);
      row.innerHTML = `
        <span class="tongue-number"><i aria-hidden="true"></i>Companion ${i + 1}</span>
        <label>Label<input class="tuning-label" data-index="${i}" maxlength="4" inputmode="numeric" value="${escapeAttr(parsed.base)}" required></label>
        <label>Pitch${companionPitchSelectMarkup(i, parsed)}</label>
        <label>Note<select class="tuning-note" data-index="${i}">${noteOptions(note.midi)}</select></label>
        <span class="tuning-color-label">Color
          <button type="button" class="colour-chip" data-index="${i}" style="--sw:${color}" aria-label="Color for companion tongue ${i + 1}, currently ${color}" aria-haspopup="dialog"></button>
          <input class="tuning-color" type="hidden" data-index="${i}" value="${color}">
        </span>
      `;
      els.companionTuningGrid.appendChild(row);
    });
  }

  function readCompanionTuningValues() {
    if (!els.companionTuningGrid) {
      return normaliseCompanionNotes(
        [],
        els.instrumentKeySelect?.value || 'D',
        Number(els.rootOctaveSelect?.value ?? 4)
      );
    }
    const labelInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-label')];
    const pitchSelects = [...els.companionTuningGrid.querySelectorAll('.tuning-pitch')];
    const noteInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-note')];
    const colorInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-color')];
    return noteInputs.map((input, i) => ({
      label: composeTuningLabel(labelInputs[i], pitchSelects[i], i),
      midi: Number(input.value),
      color: normaliseColor(colorInputs[i]?.value, 15 + i)
    }));
  }

  function guideNumberMarkup(label) {
    const octave = splitOctaveMark(label);
    const markClass = octaveMarkClass(octave);
    return `<span class="note-guide-number${markClass ? ` ${markClass}` : ''}">${escapeHtml(octave.base)}</span>`;
  }

  function renderNoteGuide() {
    if (!els.noteGuideBody) return;
    const rootOctave = Number(els.rootOctaveSelect?.value ?? 4);
    const cRootMidi = 12 * (rootOctave + 1) + ROOT_PITCH_CLASS.C;
    const dRootMidi = 12 * (rootOctave + 1) + ROOT_PITCH_CLASS.D;
    if (els.noteGuideOctave) els.noteGuideOctave.textContent = String(rootOctave);
    els.noteGuideBody.innerHTML = NOTE_GUIDE_SPEC.map(item => `
      <tr${item.companionOnly ? ' class="companion-only-note"' : ''}>
        <th scope="row">
          ${guideNumberMarkup(item.label)}
          ${item.companionOnly ? '<small>companion</small>' : ''}
        </th>
        <td>${escapeHtml(midiToName(dRootMidi + item.offset))}</td>
        <td>${escapeHtml(midiToName(cRootMidi + item.offset))}</td>
      </tr>
    `).join('');
  }

  function openSongGuide(sourceArea = 'editor') {
    if (!els.songGuideDialog || !els.songGuideContent || !els.pitchInfo) return;
    if (sourceArea !== 'instrument' && els.rootOctaveSelect) {
      els.rootOctaveSelect.value = String(state.instrument?.rootOctave ?? 4);
    }
    renderNoteGuide();
    const source = els.pitchInfo.cloneNode(true);
    source.hidden = false;
    source.removeAttribute('id');
    source.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    els.songGuideContent.innerHTML = source.innerHTML;
    els.songGuideDialog.showModal();
  }

  function renderCompanionPresetFromSettings() {
    if (Number(els.noteCountSelect.value) !== 15) return;
    const current = readCompanionTuningValues();
    const preset = buildCompanionTunedNotes(
      els.instrumentKeySelect.value,
      Number(els.rootOctaveSelect.value)
    ).map((note, i) => ({
      ...note,
      color: current[i]?.color || note.color
    }));
    renderCompanionTuningGrid(preset);
  }

  function setRowColor(row, value) {
    if (!row) return;
    const index = Number(row.dataset.index) || 0;
    const colorIndex = Number(row.dataset.colorIndex ?? index);
    const color = normaliseColor(value, colorIndex);
    const hidden = row.querySelector('.tuning-color');
    if (hidden) hidden.value = color;
    const chip = row.querySelector('.colour-chip');
    if (chip) {
      chip.style.setProperty('--sw', color);
      const companion = row.classList.contains('companion-tuning-row') ? 'companion ' : '';
      chip.setAttribute('aria-label', `Color for ${companion}tongue ${index + 1}, currently ${color}`);
    }
    setNoteColorVars(row, color);
  }

  // Changing a tongue's note moves it between octaves, so the Pitch field follows along.
  // It stays editable, so an unusual tuning can still be labelled by hand.
  function syncRowOctave(row) {
    if (!row) return;
    const noteSelect = row.querySelector('.tuning-note');
    const pitchSelect = row.querySelector('.tuning-pitch');
    if (!noteSelect || !pitchSelect) return;
    pitchSelect.value = octaveMarkForMidi(Number(noteSelect.value));
  }

  function syncAllRowOctaves() {
    els.tuningGrid.querySelectorAll('.tuning-row').forEach(syncRowOctave);
  }

  // One shared colour popup for the whole grid: presets in rainbow order, then a single
  // custom square that hands off to the OS picker.
  function buildColourPopover() {
    const chips = RAINBOW_PALETTE
      .map(preset => `<button type="button" class="swatch" data-color="${preset}" style="--sw:${preset}" title="${preset}" aria-label="Use ${preset}"></button>`)
      .join('');
    els.colourPopover.innerHTML = `
      <div class="swatch-row">${chips}</div>
      <label class="swatch-custom-row">
        <span class="swatch swatch-custom" aria-hidden="true"></span>
        <span>Custom color…</span>
        <input id="colourPopoverCustom" type="color" value="#a78bfa" aria-label="Pick a custom color">
      </label>`;
  }

  function isPopoverOpen(element) {
    if (!element) return false;
    try {
      return element.matches(':popover-open') || element.classList.contains('show');
    } catch {
      return element.classList.contains('show');
    }
  }

  function openColourPopover(chip) {
    const row = chip.closest('.tuning-row');
    if (!row) return;
    const current = row.querySelector('.tuning-color')?.value || defaultNoteColor(0);
    state.colourTargetRow = row;
    els.colourPopover.querySelectorAll('.swatch[data-color]').forEach(swatch => {
      swatch.classList.toggle('selected', swatch.dataset.color === current);
    });
    const custom = els.colourPopover.querySelector('#colourPopoverCustom');
    if (custom) custom.value = current;
    const customChip = els.colourPopover.querySelector('.swatch-custom');
    if (customChip) customChip.classList.toggle('selected', !RAINBOW_PALETTE.includes(current));
    if (!isPopoverOpen(els.colourPopover)) {
      if (typeof els.colourPopover.showPopover === 'function') els.colourPopover.showPopover();
      else els.colourPopover.classList.add('show');
    }
    const box = chip.getBoundingClientRect();
    const size = els.colourPopover.getBoundingClientRect();
    const left = Math.max(10, Math.min(window.innerWidth - size.width - 10, box.left + box.width / 2 - size.width / 2));
    const below = box.bottom + 8;
    const top = below + size.height > window.innerHeight - 10 ? Math.max(10, box.top - size.height - 8) : below;
    els.colourPopover.style.left = `${Math.round(left)}px`;
    els.colourPopover.style.top = `${Math.round(top)}px`;
  }

  function closeColourPopover() {
    state.colourTargetRow = null;
    if (!isPopoverOpen(els.colourPopover)) return;
    if (typeof els.colourPopover.hidePopover === 'function') els.colourPopover.hidePopover();
    else els.colourPopover.classList.remove('show');
  }

  function refreshPresetTuning(refreshCompanion = false) {
    const current = readTuningGridValues();
    const preset = getPresetFromSettings();
    const count = Number(els.noteCountSelect.value);
    if (preset) {
      const notes = preset.notes.map((note, i) => ({ ...note, color: current[i]?.color || defaultNoteColor(i) }));
      renderTuningGrid(count, notes);
    } else {
      renderTuningGrid(count, current);
    }
    if (refreshCompanion && els.scaleTypeSelect.value !== 'custom') renderCompanionPresetFromSettings();
    renderNoteGuide();
  }

  function saveSettings(event) {
    event.preventDefault();
    clearInvalidFields(els.settingsForm);
    const count = Number(els.noteCountSelect.value);
    const labelInputs = [...els.tuningGrid.querySelectorAll('.tuning-label')];
    const pitchSelects = [...els.tuningGrid.querySelectorAll('.tuning-pitch')];
    const bases = labelInputs.map(input => splitOctaveMark(input.value).base.trim());
    const labels = labelInputs.map((input, i) => (bases[i] ? composeTuningLabel(input, pitchSelects[i], i) : ''));
    const midis = [...els.tuningGrid.querySelectorAll('.tuning-note')].map(input => Number(input.value));
    const colors = [...els.tuningGrid.querySelectorAll('.tuning-color')].map((input, i) => normaliseColor(input.value, i));
    const companionNotes = readCompanionTuningValues();
    const companionLabels = companionNotes.map(note => note.label.toLowerCase());
    const frequencies = new Map();
    labels.forEach(label => {
      const normalised = label.toLowerCase();
      if (normalised) frequencies.set(normalised, (frequencies.get(normalised) || 0) + 1);
    });
    const invalidLabels = labelInputs.filter((input, i) => !labels[i] || frequencies.get(labels[i].toLowerCase()) > 1);
    if (invalidLabels.length) {
      invalidLabels.forEach(input => input.classList.add('invalid-field'));
      focusInvalidField(invalidLabels[0]);
      showToast('Every tongue needs a label, and each label must be unique.', 'warning');
      return;
    }
    if (els.highDrumToggle.checked && new Set(companionLabels).size !== companionLabels.length) {
      const companionInputs = [...els.companionTuningGrid.querySelectorAll('.tuning-label')];
      companionInputs.forEach((input, i) => {
        if (companionLabels.indexOf(companionLabels[i]) !== companionLabels.lastIndexOf(companionLabels[i])) {
          input.classList.add('invalid-field');
        }
      });
      focusInvalidField(companionInputs.find(input => input.classList.contains('invalid-field')));
      showToast('Every companion tongue needs a unique label.', 'warning');
      return;
    }
    const selectedKey = els.instrumentKeySelect.value;
    const selectedScale = els.scaleTypeSelect.value;
    const rootOctave = Number(els.rootOctaveSelect.value);
    const expected = selectedScale === 'custom'
      ? null
      : makePresetInstrument(count, selectedKey, rootOctave, REFERENCE_PITCH, selectedScale);
    const matchesPreset = expected && expected.notes.every((note, i) => note.midi === midis[i]);
    const scaleType = matchesPreset ? selectedScale : 'custom';
    const displayName = scaleType === 'custom' ? 'custom tuning' : `${selectedKey} ${SCALE_NAMES[scaleType]}`;
    state.instrument = {
      count,
      key: selectedKey,
      scaleType,
      rootOctave,
      referencePitch: REFERENCE_PITCH,
      highDrumEnabled: count === 15 && els.highDrumToggle.checked,
      highDrumAlwaysVisible: count === 15 && els.highDrumToggle.checked && els.highDrumAlwaysToggle.checked,
      companionNotes: count === 15 ? companionNotes : [],
      name: `${count}-note ${displayName} drum`,
      notes: labels.map((label, i) => ({ label, midi: midis[i], color: colors[i] }))
    };
    invalidateInstrumentRuntimeCaches();
    saveInstrument();
    preCacheInstrumentSounds().catch(error => console.warn('Could not refresh the sound cache:', error));
    els.settingsDialog.close();
    renderInstrument();
    selectSong(state.selectedId);
    showToast(`Instrument updated: ${displayName}.`, 'success');
  }

  function keyboardHandler(event) {
    if (document.querySelector('dialog[open]')) return;
    if (event.target.matches('input, textarea, select, button') || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.code === 'Space') {
      event.preventDefault();
      togglePlayback().catch(reportPlaybackStartError);
      return;
    }
    const mappedIndex = KEY_NOTE_MAP[event.key.toLowerCase()];
    if (mappedIndex !== undefined && mappedIndex < playableNotes().length) handleUserNote(mappedIndex);
  }

  function clearInvalidFields(form) {
    form?.querySelectorAll('.invalid-field').forEach(field => field.classList.remove('invalid-field'));
  }

  function focusInvalidField(field) {
    field?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    window.setTimeout(() => field?.focus({ preventScroll: true }), 180);
  }

  function hideToast() {
    clearTimeout(showToast.timer);
    try {
      if (typeof els.toast.hidePopover === 'function' && isPopoverOpen(els.toast)) els.toast.hidePopover();
      else els.toast.classList.remove('show');
    } catch {
      els.toast.classList.remove('show');
    }
  }

  function showToast(message, type = 'info') {
    els.toast.textContent = message;
    els.toast.classList.remove('warning', 'success');
    if (type === 'warning' || type === 'success') els.toast.classList.add(type);
    clearTimeout(showToast.timer);
    try {
      if (typeof els.toast.showPopover === 'function') {
        if (isPopoverOpen(els.toast)) els.toast.hidePopover();
        els.toast.showPopover();
      } else {
        els.toast.classList.add('show');
      }
    } catch {
      els.toast.classList.add('show');
    }
    showToast.timer = window.setTimeout(hideToast, type === 'warning' ? 3600 : 2400);
  }

  function checkDemoCatalogUpdate(force = false) {
    if (demoCatalogPollBusy || (!force && document.hidden)) return;
    demoCatalogPollBusy = true;
    const script = document.createElement('script');
    const catalogUrl = new URL('app-files/demo-catalog.js', document.baseURI);
    catalogUrl.searchParams.set('catalog-check', String(Date.now()));
    script.src = catalogUrl.href;
    script.async = true;
    script.onload = () => {
      const nextVersion = String(window.ETHEREAL_DEMO_CATALOG_VERSION || '');
      if (nextVersion && nextVersion !== activeDemoCatalogVersion) {
        activeDemoCatalogVersion = nextVersion;
        applyCatalogGlobals({ announce: true });
        if (els.catalogUpdateBanner) els.catalogUpdateBanner.hidden = true;
      }
      demoCatalogPollBusy = false;
      script.remove();
    };
    script.onerror = () => {
      demoCatalogPollBusy = false;
      script.remove();
    };
    document.head.appendChild(script);
  }

  function startDemoCatalogPolling() {
    if (state.catalogPollTimer) return;
    state.catalogPollTimer = window.setInterval(checkDemoCatalogUpdate, 45000);
    window.addEventListener('focus', () => checkDemoCatalogUpdate());
  }

  function modeWalkthroughsSeen() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_MODE_WALKTHROUGHS) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function setModeWalkthroughSuppressed(mode, suppressed) {
    const seen = modeWalkthroughsSeen();
    const next = suppressed
      ? [...new Set([...seen, mode])]
      : seen.filter(item => item !== mode);
    try { localStorage.setItem(STORAGE_MODE_WALKTHROUGHS, JSON.stringify(next)); } catch {}
  }

  function walkthroughIsSuppressed(kind) {
    if (kind === 'main') {
      try { return localStorage.getItem(STORAGE_WALKTHROUGH_COMPLETE) === 'true'; } catch { return false; }
    }
    return modeWalkthroughsSeen().includes(kind);
  }

  function setWalkthroughSuppressed(kind, suppressed) {
    if (kind === 'main') {
      try {
        if (suppressed) localStorage.setItem(STORAGE_WALKTHROUGH_COMPLETE, 'true');
        else localStorage.removeItem(STORAGE_WALKTHROUGH_COMPLETE);
      } catch {}
      return;
    }
    setModeWalkthroughSuppressed(kind, suppressed);
  }

  function maybeStartModeWalkthrough(mode) {
    if (!MODE_WALKTHROUGH_STEPS[mode] || modeWalkthroughsSeen().includes(mode)) return;
    window.setTimeout(() => startWalkthrough(mode), 80);
  }

  function syncWalkthroughSidebar() {
    if (!els.sidebar || walkthroughKind !== 'main' || !walkthroughPreviewState) return;
    const showSongs = walkthroughStepIndex === 1 || walkthroughStepIndex === 2;
    if (showSongs) els.sidebar.classList.add('open');
    else if (!walkthroughPreviewState.sidebarWasOpen) els.sidebar.classList.remove('open');
  }

  function positionWalkthrough() {
    if (!els.tourOverlay || els.tourOverlay.hidden) return;
    const step = activeWalkthroughSteps[walkthroughStepIndex];
    if (!step) return;
    const target = document.querySelector(step.target);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const padding = 7;
    const focusLeft = Math.max(4, rect.left - padding);
    const focusTop = Math.max(4, rect.top - padding);
    const focusRight = Math.min(window.innerWidth - 4, rect.right + padding);
    const focusBottom = Math.min(window.innerHeight - 4, rect.bottom + padding);
    const focusWidth = Math.max(28, focusRight - focusLeft);
    const focusHeight = Math.max(28, focusBottom - focusTop);
    els.tourFocusRing.style.left = `${focusLeft}px`;
    els.tourFocusRing.style.top = `${focusTop}px`;
    els.tourFocusRing.style.width = `${focusWidth}px`;
    els.tourFocusRing.style.height = `${focusHeight}px`;

    const setShade = (element, left, top, width, height) => {
      if (!element) return;
      element.style.left = `${Math.max(0, left)}px`;
      element.style.top = `${Math.max(0, top)}px`;
      element.style.width = `${Math.max(0, width)}px`;
      element.style.height = `${Math.max(0, height)}px`;
    };
    setShade(els.tourShadeTop, 0, 0, window.innerWidth, focusTop);
    setShade(els.tourShadeRight, focusRight, focusTop, window.innerWidth - focusRight, focusHeight);
    setShade(els.tourShadeBottom, 0, focusBottom, window.innerWidth, window.innerHeight - focusBottom);
    setShade(els.tourShadeLeft, 0, focusTop, focusLeft, focusHeight);

    window.requestAnimationFrame(() => {
      const cardWidth = els.tourCard.offsetWidth || 350;
      const cardHeight = els.tourCard.offsetHeight || 190;
      const edge = 14;
      const left = Math.min(
        Math.max(edge, rect.left),
        Math.max(edge, window.innerWidth - cardWidth - edge)
      );
      let top = rect.bottom + 16;
      if (top + cardHeight > window.innerHeight - edge) top = rect.top - cardHeight - 16;
      top = Math.max(edge, Math.min(top, window.innerHeight - cardHeight - edge));
      els.tourCard.style.left = `${left}px`;
      els.tourCard.style.top = `${top}px`;
    });
  }

  function renderWalkthroughStep() {
    const step = activeWalkthroughSteps[walkthroughStepIndex];
    if (!step || !els.tourOverlay) return;
    syncWalkthroughSidebar();
    els.tourProgress.textContent = `${walkthroughStepIndex + 1} of ${activeWalkthroughSteps.length}`;
    els.tourTitle.textContent = step.title;
    els.tourText.textContent = step.text;
    els.tourBackBtn.hidden = walkthroughStepIndex === 0;
    els.tourNextBtn.textContent = walkthroughStepIndex === activeWalkthroughSteps.length - 1 ? 'Finish' : 'Next';
    positionWalkthrough();
    window.setTimeout(positionWalkthrough, 280);
  }

  function restoreWalkthroughPreview() {
    const previous = walkthroughPreviewState;
    walkthroughPreviewState = null;
    if (!previous) return;
    pausePlayback();
    setMode(previous.mode);
    selectSong(previous.selectedId);
    state.currentTime = Math.min(previous.currentTime, state.duration);
    updatePracticeUI();
    renderFrame();
    if (previous.sidebarWasOpen) els.sidebar?.classList.add('open');
    else els.sidebar?.classList.remove('open');
    if (previous.wasPlaying && previous.mode !== 'tuner') {
      if (previous.mode === 'wait') {
        state.playing = true;
        state.waitingIndex = state.parsedNotes.findIndex(note => note.time >= state.currentTime - .01);
        updateTransportUI();
      } else {
        startPlaybackClock();
      }
    }
  }

  function finishWalkthrough({ suppress = false } = {}) {
    if (els.tourOverlay) els.tourOverlay.hidden = true;
    if (suppress || els.tourDontShowAgain?.checked) setWalkthroughSuppressed(walkthroughKind, true);
    if (walkthroughKind === 'main') {
      restoreWalkthroughPreview();
    }
  }

  function startWalkthrough(kind = 'main') {
    if (!els.tourOverlay || !els.tourOverlay.hidden) return;
    if (els.resultDialog?.open) els.resultDialog.close();
    walkthroughKind = MODE_WALKTHROUGH_STEPS[kind] ? kind : 'main';
    activeWalkthroughSteps = walkthroughKind === 'main' ? WALKTHROUGH_STEPS : MODE_WALKTHROUGH_STEPS[walkthroughKind];
    walkthroughPreviewState = null;
    if (walkthroughKind === 'main') {
      walkthroughPreviewState = {
        selectedId: state.selectedId,
        mode: state.mode,
        currentTime: state.currentTime,
        wasPlaying: state.playing,
        sidebarWasOpen: els.sidebar?.classList.contains('open') || false
      };
      const previewSong = state.songs.find(song => String(song.title).toLocaleLowerCase().startsWith('the wind rises'));
      setMode('demo');
      if (previewSong) selectSong(previewSong.id);
      startPlaybackClock();
    } else pausePlayback();
    walkthroughStepIndex = 0;
    if (els.tourDontShowAgain) els.tourDontShowAgain.checked = false;
    els.tourOverlay.hidden = false;
    renderWalkthroughStep();
    window.setTimeout(() => els.tourNextBtn?.focus(), 40);
  }

  function maybeStartWalkthrough() {
    if (!walkthroughIsSuppressed('main')) window.setTimeout(() => {
      if (state.mode === 'demo' && els.tourOverlay?.hidden) startWalkthrough('main');
    }, 650);
  }

  function nextWalkthroughStep() {
    if (walkthroughStepIndex >= activeWalkthroughSteps.length - 1) {
      finishWalkthrough();
      return;
    }
    if (walkthroughKind === 'main' && walkthroughStepIndex === 0) pausePlayback();
    walkthroughStepIndex += 1;
    renderWalkthroughStep();
  }

  function previousWalkthroughStep() {
    if (walkthroughStepIndex === 0) return;
    walkthroughStepIndex -= 1;
    if (walkthroughKind === 'main' && walkthroughStepIndex === 0) {
      if (state.currentTime >= state.duration - .02) restartSong();
      startPlaybackClock();
    }
    renderWalkthroughStep();
  }

  /* ------------------------------------------------------------------ */
  /* Song tape and Perfect / Good / Miss words (shared with Ethereal      */
  /* Handpan): the notes scroll along the bottom of the stage.            */
  /* ------------------------------------------------------------------ */

  const tape = {
    notes: null, key: '', events: [], pxPerBeat: 60, width: 0, playheadX: 0, top: 0, lastX: null,
    visible: false, judgeTimer: 0, quality: new Map(), passiveIdx: 0, passiveAt: 0, armedAt: Infinity, levelFilter: 'all'
  };
  const tapeEls = {};

  function initTape() {
    ['noteTape', 'noteTapeTrack', 'noteTapeJudge', 'stageJudge', 'stageSongName', 'difficultyFilter', 'resultSparkles']
      .forEach(id => { tapeEls[id] = $(id); });
    tapeEls.difficultyFilter?.addEventListener('click', event => {
      const chip = event.target.closest('[data-level]');
      if (!chip) return;
      tape.levelFilter = chip.dataset.level;
      tapeEls.difficultyFilter.querySelectorAll('[data-level]').forEach(button => button.classList.toggle('active', button === chip));
      renderSongList();
    });
  }

  function songMatchesLevel(song) {
    if (tape.levelFilter === 'all') return true;
    const level = songDifficulty(song).level;
    return tape.levelFilter === 'hard' ? level === 'hard' || level === 'expert' : level === tape.levelFilter;
  }

  function resetTapeRun() {
    tape.quality.clear();
    tape.passiveIdx = 0;
    tape.passiveAt = 0;
    tape.armedAt = Infinity;
  }

  function tapeWanted() {
    return state.visualMode === 'radial' && state.mode !== 'tuner' && state.parsedNotes.length > 0;
  }

  function syncTapeVisibility() {
    if (tapeWanted() !== tape.visible) resizeCanvas();
  }

  function buildTape() {
    const notes = state.parsedNotes;
    tape.notes = notes;
    tape.key = state.instrumentVersion || '';
    tape.events = [];
    tape.lastX = null;
    const track = tapeEls.noteTapeTrack;
    if (!track) return;
    track.replaceChildren();
    if (!notes.length) return;
    const groups = [];
    notes.forEach(note => {
      const last = groups[groups.length - 1];
      if (last && Math.abs(last.beat - note.beat) < 1e-6) last.notes.push(note);
      else groups.push({ beat: note.beat, durBeats: note.durationBeats || 1, bar: note.bar, notes: [note] });
    });
    let minGap = Infinity;
    for (let i = 1; i < groups.length; i += 1) {
      const gap = groups[i].beat - groups[i - 1].beat;
      if (gap > 1e-3) minGap = Math.min(minGap, gap);
    }
    if (!Number.isFinite(minGap)) minGap = 1;
    const ppb = Math.max(34, Math.min(96, 25 / minGap));
    tape.pxPerBeat = ppb;
    const frag = document.createDocumentFragment();
    const totalBeats = Math.ceil(state.totalBeats || groups[groups.length - 1].beat + 1);
    for (let beat = 0; beat <= totalBeats; beat += 1) {
      const tick = document.createElement('i');
      tick.className = 'tape-beat';
      tick.style.left = `${(beat * ppb).toFixed(1)}px`;
      frag.appendChild(tick);
    }
    let lastBar = 0;
    groups.forEach(group => {
      if (group.bar !== lastBar) {
        const bar = document.createElement('i');
        bar.className = 'tape-bar';
        bar.style.left = `${(group.beat * ppb).toFixed(1)}px`;
        bar.dataset.bar = String(group.bar);
        frag.appendChild(bar);
        lastBar = group.bar;
      }
      const sorted = group.notes.slice().sort((a, b) => (b.midi || 0) - (a.midi || 0));
      const col = document.createElement('span');
      const chordClass = sorted.length > 1 ? ` chord chord-${Math.min(3, sorted.length)}` : '';
      col.className = `tape-ev${chordClass}`;
      col.style.left = `${(group.beat * ppb).toFixed(1)}px`;
      const chips = sorted.map(note => {
        const octave = splitOctaveMark(note.label);
        const chip = document.createElement('b');
        const base = octaveMarkClass(octave);
        chip.className = base;
        chip.textContent = octave.base;
        chip.style.setProperty('--c', note.color || '#e2e8f0');
        col.appendChild(chip);
        return { note, chip, base, cls: base };
      });
      frag.appendChild(col);
      tape.events.push({ beat: group.beat, durBeats: group.durBeats, col, chips, chordClass, cls: col.className });
    });
    track.appendChild(frag);
  }

  function placeTape(width, height) {
    const show = tapeWanted();
    tape.visible = show;
    if (!tapeEls.noteTape) return;
    placeProgressInTape(show && document.body.classList.contains('wide-fit'));
    tapeEls.noteTape.hidden = !show;
    if (!show) { tape.top = 0; return; }
    const tapeH = width <= 760 ? 46 : 52;
    const stage = els.noteStage.getBoundingClientRect();
    let controlsTop = height;
    [els.noteStage.querySelector('.rotate-drum-pair'), els.focusModeBtn, tapeEls.stageSongName, els.stageDock, els.speedCycleBtn].forEach(el => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const top = r.top - stage.top;
      if (top > height * 0.55) controlsTop = Math.min(controlsTop, top);
    });
    const bottomGap = controlsTop < height ? height - controlsTop + 8 : 12;
    const top = Math.round(height - bottomGap - tapeH);
    tapeEls.noteTape.style.top = `${top}px`;
    tapeEls.noteTape.style.height = `${tapeH}px`;
    tape.top = top;
    tape.width = Math.max(120, width - 24);
    tape.playheadX = Math.round(tape.width * (window.innerWidth > 760 ? 0.5 : 0.3));
    tapeEls.noteTape.style.setProperty('--playhead', `${tape.playheadX}px`);
    tape.lastX = null;
  }

  // The drum moves up (and only shrinks if it must) so the tape fits underneath.
  function fitDrumAboveTape(geometry, width) {
    if (!tape.visible || !tape.top) return geometry;
    const ext = 0.53;
    const maxBottom = tape.top - 6;
    if (width <= 760) {
      // Phones: the drum keeps its normal size (so notes flying in from the sides stay
      // visible) and sits centred between the score row and the tape.
      const chips = state.focusMode && (state.mode === 'practice' || state.mode === 'wait');
      const top = chips ? 106 : 64;
      const room = maxBottom - top;
      const drumSize = Math.max(170, Math.min(geometry.drumSize, (room - 8) / (ext * 2)));
      return { drumSize, scale: drumSize / STAGE_DRUM_BASE, cx: geometry.cx, cy: top + drumSize * ext + Math.max(0, room - drumSize * ext * 2) * 0.55 };
    }
    // Tablets and computers: the drum sits in the middle of the space above the tape, with
    // the same room above and below it for the notes flying in.
    const top = 14;
    const room = maxBottom - top;
    const grown = document.body.classList.contains('tablet-fit') ? Math.max(geometry.drumSize, Math.min(width * 0.62, 600)) : geometry.drumSize;
    const margin = Math.max(20, room * 0.08);
    const drumSize = Math.max(170, Math.min(grown, (room - 2 * margin) / (ext * 2)));
    return { drumSize, scale: drumSize / STAGE_DRUM_BASE, cx: geometry.cx, cy: top + room / 2 };
  }

  function tapeIndexAt(beat) {
    let lo = 0;
    let hi = tape.events.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tape.events[mid].beat < beat) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  function tapeResult(note) {
    if (state.mode === 'wait') {
      if (state.hitNotes.has(note.id)) return state.missedNoteIds.has(note.id) ? 'good' : 'hit';
      return state.missedNoteIds.has(note.id) ? 'miss' : '';
    }
    if (state.mode === 'practice') return tape.quality.get(note.id) || (state.missedNoteIds.has(note.id) && !state.hitNotes.has(note.id) ? 'miss' : '');
    return '';
  }

  function updateTape() {
    if (!tape.visible || !state.parsedNotes.length) return;
    if (tape.notes !== state.parsedNotes) buildTape();
    if (!tape.events.length || !state.secondsPerBeat) return;
    const ppb = tape.pxPerBeat;
    const beat = state.currentTime / state.secondsPerBeat;
    const x = tape.playheadX - beat * ppb;
    if (tape.lastX === null || Math.abs(x - tape.lastX) > 0.05) {
      tapeEls.noteTapeTrack.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      tape.lastX = x;
    }
    const waitingNote = state.mode === 'wait' ? state.parsedNotes[state.waitingIndex] : null;
    const from = Math.max(0, tapeIndexAt(beat - tape.playheadX / ppb - 2));
    const to = Math.min(tape.events.length, tapeIndexAt(beat + (tape.width - tape.playheadX) / ppb + 2));
    for (let i = from; i < to; i += 1) {
      const entry = tape.events[i];
      const hold = Math.min(Math.max(0.3, Math.min(0.9, entry.durBeats * 0.85)), 17 / ppb);
      const waiting = waitingNote && Math.abs(waitingNote.beat - entry.beat) < 1e-6;
      let cls = 'tape-ev';
      if (waiting || (beat >= entry.beat - 0.06 && beat < entry.beat + hold)) cls += ' now';
      else if (beat >= entry.beat) cls += ' past';
      cls += entry.chordClass;
      if (cls !== entry.cls) {
        entry.col.className = cls;
        entry.cls = cls;
      }
      entry.chips.forEach(chip => {
        const result = tapeResult(chip.note);
        const c = result ? `${chip.base} r-${result}`.trim() : chip.base;
        if (c !== chip.cls) {
          chip.chip.className = c;
          chip.cls = c;
        }
      });
    }
  }

  // Practice: notes that slip past without being played count as a Miss, from the first note.
  function markPassiveMisses() {
    if (state.mode !== 'practice') return;
    const notes = state.parsedNotes;
    const windowSize = .42 / state.speed;
    if (state.currentTime < tape.passiveAt - 0.05) tape.passiveIdx = 0;
    tape.passiveAt = state.currentTime;
    let missed = false;
    while (tape.passiveIdx < notes.length && notes[tape.passiveIdx].time < state.currentTime - windowSize) {
      const note = notes[tape.passiveIdx];
      if (!state.hitNotes.has(note.id) && !tape.quality.has(note.id)) {
        tape.quality.set(note.id, 'miss');
        missed = true;
      }
      tape.passiveIdx += 1;
    }
    if (missed) {
      state.streak = 0;
      tapeJudge('miss');
      updatePracticeUI();
    }
  }

  const JUDGE_TEXT = { perfect: 'Perfect', good: 'Good', hit: 'Nice', miss: 'Miss', wrong: 'Wrong note' };

  function tapeJudge(kind) {
    if (!JUDGE_TEXT[kind] || state.mode === 'tuner' || state.mode === 'demo') return;
    const good = kind === 'perfect' || kind === 'good' || kind === 'hit';
    const html = `${JUDGE_TEXT[kind]}${good && state.streak >= 3 ? ` <em>×${state.streak}</em>` : ''}`;
    [tapeEls.noteTapeJudge, tapeEls.stageJudge].forEach(el => {
      if (!el) return;
      el.innerHTML = html;
      el.dataset.kind = kind;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    });
  }

  // Session complete: a soft burst of glowing particles around the tick, then a few
  // sparkles that keep twinkling while the card is open.
  function celebrateResults(canvas, strength = 1) {
    if (!canvas || !canvas.getContext) return;
    const dialog = canvas.closest('dialog');
    const card = canvas.parentElement;
    const icon = card.querySelector('.result-icon');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || card.clientWidth;
    const h = canvas.clientHeight || 160;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = w / 2;
    const cy = icon ? icon.offsetTop + icon.offsetHeight / 2 - canvas.offsetTop : 55;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors = ['#5eead4', '#99f6e4', '#c4b5fd', '#a78bfa', '#fbbf24', '#38bdf8', '#f9a8d4'];
    const level = Math.max(0.25, Math.min(1, strength));
    const particles = [];
    const burst = reduced ? 0 : Math.round(34 + 46 * level);
    for (let i = 0; i < burst; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 55 + Math.random() * 150;
      particles.push({
        x: cx + Math.cos(angle) * 22, y: cy + Math.sin(angle) * 22,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.8 - 18,
        life: 1.1 + Math.random() * 1.2, age: 0, size: 1 + Math.random() * 2.4,
        color: colors[(Math.random() * colors.length) | 0], spin: Math.random() * 6
      });
    }
    const sparkles = Array.from({ length: reduced ? 6 : 14 }, (_, i) => ({
      angle: (i / (reduced ? 6 : 14)) * Math.PI * 2 + Math.random() * 0.4,
      radius: 40 + Math.random() * 34, size: 0.8 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2, speed: 1.4 + Math.random() * 1.8,
      color: colors[(Math.random() * colors.length) | 0]
    }));
    cancelAnimationFrame(canvas._celebrateRaf || 0);
    let last = performance.now();
    const started = last;
    const tick = now => {
      if (!canvas.isConnected || (dialog && !dialog.open)) { ctx.clearRect(0, 0, w, h); return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - started) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const drag = Math.pow(0.18, dt);
      particles.forEach(p => {
        p.age += dt;
        if (p.age >= p.life) return;
        p.vx *= drag; p.vy = p.vy * drag - 10 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        const k = 1 - p.age / p.life;
        const r = p.size * (0.6 + 0.4 * k);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = k * 0.55;
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = k;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.55, 0, Math.PI * 2); ctx.fill();
      });
      const fadeIn = Math.min(1, t / 0.6);
      sparkles.forEach(s => {
        const a = s.angle + t * 0.12;
        const x = cx + Math.cos(a) * s.radius * 1.35;
        const y = cy + Math.sin(a) * s.radius * 0.62;
        const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const size = s.size * (0.6 + tw);
        ctx.globalAlpha = fadeIn * (0.25 + 0.65 * tw);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - size * 2.2, y); ctx.lineTo(x + size * 2.2, y);
        ctx.moveTo(x, y - size * 2.2); ctx.lineTo(x, y + size * 2.2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, y, size * 0.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      canvas._celebrateRaf = requestAnimationFrame(tick);
    };
    canvas._celebrateRaf = requestAnimationFrame(tick);
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function midiToName(midi) {
    const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const n = Number(midi);
    return `${names[((n % 12) + 12) % 12]}${Math.floor(n / 12) - 1}`;
  }

  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'drum-song';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
  }

  function escapeAttr(value) { return escapeHtml(value); }

  function bindEvents() {
    els.menuBtn.addEventListener('click', () => els.sidebar.classList.add('open'));
    els.sidebarClose.addEventListener('click', () => els.sidebar.classList.remove('open'));
    els.sidebarScrim?.addEventListener('click', () => els.sidebar.classList.remove('open'));
    els.songSearch.addEventListener('input', renderSongList);
    els.newSongBtn?.addEventListener('click', () => openEditor());
    els.topNewSongBtn?.addEventListener('click', () => openEditor());
    els.learnBtn?.addEventListener('click', () => openSongGuide('editor'));
    els.editBtn.addEventListener('click', openEditChoice);
    els.importBtn.addEventListener('click', () => els.importFile.click());
    els.importFile.addEventListener('change', () => els.importFile.files[0] && importSong(els.importFile.files[0]));
    els.libraryBtn?.addEventListener('click', () => { checkDemoCatalogUpdate(true); openSongLibrary('all'); });
    els.libraryTabAll?.addEventListener('click', () => setLibraryTab('all'));
    els.libraryTabEasy?.addEventListener('click', () => setLibraryTab('easy'));
    els.libraryTabMedium?.addEventListener('click', () => setLibraryTab('medium'));
    els.libraryTabHard?.addEventListener('click', () => setLibraryTab('hard'));
    els.libraryTabExpert?.addEventListener('click', () => setLibraryTab('expert'));
    els.librarySearch?.addEventListener('input', renderSongLibrary);
    els.libraryCommunityInfoBtn?.addEventListener('click', () => { els.songLibraryDialog?.close(); openCommunityDialog(); });
    els.exportBtn.addEventListener('click', exportSong);
    els.deleteBtn.addEventListener('click', deleteSelectedSong);
    els.restoreDemosBtn?.addEventListener('click', restoreDemoSongs);
    els.deleteEditorBtn.addEventListener('click', deleteEditorSong);
    els.editorGuideBtn?.addEventListener('click', () => openSongGuide('editor'));
    els.helpTourBtn?.addEventListener('click', () => startWalkthrough(state.mode === 'demo' ? 'main' : state.mode));
    els.tourNextBtn?.addEventListener('click', nextWalkthroughStep);
    els.tourBackBtn?.addEventListener('click', previousWalkthroughStep);
    els.tourSkipBtn?.addEventListener('click', () => finishWalkthrough({ suppress: true }));
    els.tourDontShowAgain?.addEventListener('change', () => {
      setWalkthroughSuppressed(walkthroughKind, els.tourDontShowAgain.checked);
    });
    els.submitCommunityBtn?.addEventListener('click', submitCommunitySong);
    els.catalogUpdateRefreshBtn?.addEventListener('click', () => window.location.reload());
    els.catalogUpdateLaterBtn?.addEventListener('click', () => {
      if (els.catalogUpdateBanner) els.catalogUpdateBanner.hidden = true;
    });
    buildColourPopover();
    els.pitchInfoBtn?.addEventListener('click', () => openSongGuide('instrument'));
    els.settingsBtn.addEventListener('click', openMyDrum);
    els.editInstrumentBtn?.addEventListener('click', () => { els.myDrumDialog?.close(); openSettings(); });
    els.exportInstrumentBtn?.addEventListener('click', exportInstrumentSettings);
    els.exportInstrumentFromSettingsBtn?.addEventListener('click', exportInstrumentSettings);
    els.importInstrumentBtn?.addEventListener('click', () => els.importInstrumentFile?.click());
    els.importInstrumentFile?.addEventListener('change', () => els.importInstrumentFile.files[0] && importInstrumentSettings(els.importInstrumentFile.files[0]));
    els.playBtn.addEventListener('click', () => togglePlayback().catch(reportPlaybackStartError));
    els.loopBtn.addEventListener('click', toggleLoop);
    els.setABtn?.addEventListener('click', () => setLoopPoint('A'));
    els.setBBtn?.addEventListener('click', () => setLoopPoint('B'));
    els.abLoopBtn?.addEventListener('click', toggleSectionLoop);
    els.clearABBtn?.addEventListener('click', () => clearABLoop());
    els.focusModeBtn?.addEventListener('click', toggleFocusMode);
    els.resultReplayBtn?.addEventListener('click', replayFromResults);
    els.practiceMistakesBtn?.addEventListener('click', practiceMistakesFromResults);
    els.resultRecommendedBtn?.addEventListener('click', playRecommendedFromResults);
    els.resultNextBtn?.addEventListener('click', selectNextSongFromResults);
    els.metronomeBtn.addEventListener('click', () => { state.metronome = !state.metronome; updateTransportUI(); });
    els.micBtn?.addEventListener('click', () => toggleMicrophone().then(() => {
      if (state.micEnabled && state.mode !== 'tuner' && !COMMON.micCheckSeen(MIC_CHECK_KEY)) openMicCheckDialog();
    }));
    els.speedSelect.addEventListener('change', () => {
      const wasPlaying = state.playing;
      if (wasPlaying) pausePlayback();
      state.speed = Number(els.speedSelect.value);
      renderFrame();
      if (wasPlaying) startPlaybackClock();
    });
    els.progress.addEventListener('input', () => {
      if (state.mode === 'wait') return;
      seekToTime((Number(els.progress.value) / 1000) * state.duration);
    });
    document.querySelectorAll('.segment').forEach(btn => btn.addEventListener('click', () => {
      const mode = btn.dataset.mode === 'practice' && state.waitPref ? 'wait' : btn.dataset.mode;
      setMode(mode);
      maybeStartModeWalkthrough(mode);
    }));
    els.waitToggle?.addEventListener('change', () => {
      state.waitPref = els.waitToggle.checked;
      try { localStorage.setItem(STORAGE_WAIT, state.waitPref ? '1' : '0'); } catch {}
      if (state.mode === 'practice' || state.mode === 'wait') {
        const mode = state.waitPref ? 'wait' : 'practice';
        const wasPlaying = state.playing;
        setMode(mode, { keepPlace: true });
        if (!wasPlaying) maybeStartModeWalkthrough(mode);
      }
    });
    els.stopBtn?.addEventListener('click', () => {
      stopPlayback(true);
      if (state.focusMode && window.innerWidth <= 760) setFocusMode(false);
    });
    els.guideBtn?.addEventListener('click', () => {
      if (state.mode === 'wait') {
        // In Wait for note the speaker switches Play Note on (and back to Game Mode).
        setWaitStyle(state.waitStyle === 'hear' ? 'game' : 'hear');
        if (state.waitStyle === 'hear' && state.playing) scheduleWaitHint(null);
        showToast(state.waitStyle === 'hear' ? 'Play Note: the app plays each note, then waits for you.' : 'Game Mode: a happy chime for every right note.', 'success');
        return;
      }
      state.guide = !state.guide;
      try { localStorage.setItem(STORAGE_GUIDE, state.guide ? '1' : '0'); } catch {}
      if (!state.guide) clearTimeout(state.waitHintTimer);
      if (state.playing && state.mode === 'practice') {
        cancelFutureScheduledAudio();
        state.lastScheduledIndex = state.parsedNotes.findIndex(n => n.time >= state.currentTime - .02) - 1;
      }
      updateTransportUI();
      showToast(state.guide ? 'Song sound on: the app plays the song quietly while you practise.' : 'Song sound off: you hear only your own notes.', 'success');
    });
    setupInstallButton();
    bindTapeScrub();
    document.querySelectorAll('.view-segment').forEach(btn => btn.addEventListener('click', () => setVisualMode(btn.dataset.view)));
    els.mobileViewToggleBtn?.addEventListener('click', () => {
      setVisualMode(state.visualMode === 'radial' ? 'lanes' : 'radial');
    });
    els.editorForm.addEventListener('submit', saveEditorSong);
    ['focus', 'click', 'select', 'keyup', 'input'].forEach(eventName => {
      els.sequenceInput.addEventListener(eventName, rememberSequenceSelection);
    });
    els.sequenceInput.addEventListener('click', placeSequenceCaretFromBackdropPoint);
    ['click', 'select', 'keyup', 'mouseup'].forEach(eventName => {
      els.sequenceInput.addEventListener(eventName, syncTimingSelectionFromText);
    });
    els.sequenceInput.addEventListener('input', () => {
      normalizeSequenceInputValue();
      const shortcutIndex = timingShortcutIndexBeforeCaret();
      clearTimingSelection();
      syncEditorTimelineFromCleanInput();
      stripTimingShortcutsFromInput();
      autoFormatSequenceInput();
      if (isTimingSelectable(shortcutIndex)) setTimingSelection([shortcutIndex], shortcutIndex);
      renderSequenceBackdrop();
      renderTimingEditor();
    });
    els.sequenceInput.addEventListener('beforeinput', handleSequenceTyping);
    els.sequenceInput.addEventListener('scroll', () => {
      if (!els.sequenceBackdrop) return;
      els.sequenceBackdrop.scrollTop = els.sequenceInput.scrollTop;
      els.sequenceBackdrop.scrollLeft = els.sequenceInput.scrollLeft;
    }, { passive: true });
    els.appendChordBtn?.addEventListener('click', prepareChordAtCursor);
    // A rest is a 0. The dash next to it in the guide is a hold, which is a different
    // thing, and this button used to insert one of those.
    els.appendRestBtn?.addEventListener('click', () => insertTokenAtCursor('0'));
    els.appendBarBtn.addEventListener('click', () => insertTokenAtCursor('|'));
    els.copySequenceBtn?.addEventListener('click', copySequenceText);
    // Paste a song back in the same shape Copy text writes it out, dashes and all.
    els.sequenceInput?.addEventListener('paste', event => {
      const pasted = event.clipboardData?.getData('text/plain') || '';
      if (!looksLikeTextJianpu(pasted)) return;
      event.preventDefault();
      const { sequence, dotted } = importJianpuText(pasted);
      if (!sequence) return;
      loadSequenceIntoEditor(sequence, dotted);
      queueDraftSave();
      const count = state.editorTimeline.filter(item => item.core !== '|').length;
      showToast(`Read ${count} notes, with their lengths, from the pasted song.`, 'success');
    });
    els.exportSheetBtn?.addEventListener('click', exportSheetPdf);
    els.discardDraftBtn?.addEventListener('click', () => {
      const key = state.editorDraftKey;
      clearDraft(key);
      openEditor(state.songs.find(item => item.id === state.editorSongId) || null, { draftKey: key });
      showToast('Draft discarded.', 'success');
    });
    [els.songTitleInput, els.songBpmInput, els.songScaleSelect, els.sequenceInput].forEach(field => {
      field?.addEventListener('input', queueDraftSave);
      field?.addEventListener('change', queueDraftSave);
    });
    els.expressiveTimingToggle?.addEventListener('change', () => {
      setExpressiveTimingEnabled(els.expressiveTimingToggle.checked);
    });
    els.timingTokenStrip?.addEventListener('input', event => {
      const field = event.target.closest('.timing-lyric[data-timeline-index]');
      if (!field) return;
      const item = state.editorTimeline[Number(field.dataset.timelineIndex)];
      if (item) item.lyric = field.value;
      queueDraftSave();
    });
    els.timingTokenStrip?.addEventListener('keydown', event => {
      if (event.target.closest('.timing-lyric') && event.key === 'Enter') event.preventDefault();
    });
    els.timingTokenStrip?.addEventListener('mousedown', event => {
      // Stops shift-click from dragging a text selection across the sheet.
      if (event.shiftKey) event.preventDefault();
    });
    els.scanSheetBtn?.addEventListener('click', () => {
      state.scanResult = null;
      if (els.scanGroups) els.scanGroups.innerHTML = '';
      if (els.scanStage) els.scanStage.hidden = true;
      if (els.scanStatus) els.scanStatus.textContent = '';
      updateScanApply();
      els.scanDialog?.showModal();
    });
    els.scanFile?.addEventListener('change', () => handleScanFile(els.scanFile.files?.[0]));
    ['dragenter', 'dragover'].forEach(name => els.scanDrop?.addEventListener(name, event => {
      event.preventDefault();
      els.scanDrop.classList.add('is-over');
    }));
    ['dragleave', 'drop'].forEach(name => els.scanDrop?.addEventListener(name, event => {
      event.preventDefault();
      els.scanDrop.classList.remove('is-over');
    }));
    els.scanDrop?.addEventListener('drop', event => {
      handleScanFile(event.dataTransfer?.files?.[0]);
    });
    els.scanApplyBtn?.addEventListener('click', () => {
      const sequence = scanSequenceFromGroups(state.scanResult);
      if (!sequence) { showToast('Name at least one shape first.', 'warning'); return; }
      // Drop any half-finished draft first, otherwise openEditor restores it over the top
      // of the scan.
      clearDraft();
      els.scanDialog?.close();
      openEditor(null);
      loadSequenceIntoEditor(sequence);
      queueDraftSave();
      showToast(`Loaded ${state.editorTimeline.filter(i => i.core !== '|').length} notes. Check them against the image before saving.`, 'success');
    });
    els.timingRangeBtn?.addEventListener('click', () => {
      if (state.editorTimingSelectionIndex < 0) return;
      state.editorRangeSelectArmed = !state.editorRangeSelectArmed;
      renderTimingEditor();
    });
    els.timingTokenStrip?.addEventListener('click', event => {
      if (event.target.closest('.timing-lyric')) return;
      const token = event.target.closest('.timing-token[data-timeline-index]');
      if (!token) return;
      const index = Number(token.dataset.timelineIndex);
      const anchor = state.editorTimingSelectionIndex;
      if ((event.shiftKey || state.editorRangeSelectArmed) && anchor >= 0) {
        const existing = timingSelectionIndices();
        if (state.editorRangeSelectArmed && existing.length > 1) {
          // The range is already made. Further taps add or remove single notes, which is
          // how you pick note 1 and note 3 on a touch screen without a modifier key.
          const next = new Set(existing);
          if (next.has(index)) next.delete(index); else next.add(index);
          setTimingSelection([...next], index);
        } else {
          const from = Math.min(anchor, index);
          const to = Math.max(anchor, index);
          const range = [];
          for (let i = from; i <= to; i += 1) range.push(i);
          setTimingSelection(range, anchor);
        }
        // stays armed so you can keep adding; press the button again to finish
      } else if (event.ctrlKey || event.metaKey) {
        state.editorRangeSelectArmed = false;
        const next = new Set(timingSelectionIndices());
        if (next.has(index)) next.delete(index); else next.add(index);
        setTimingSelection([...next], index);
      } else {
        state.editorRangeSelectArmed = false;
        setTimingSelection([index], index);
      }
      renderTimingEditor();
    });
    els.timingDotBtn?.addEventListener('click', () => {
      const indices = timingSelectionIndices();
      const items = indices.map(i => state.editorTimeline[i]).filter(item => item && item.core !== '|');
      if (!items.length) return;
      const removing = items.every(item => isDottedDuration(item.durationBeats));
      items.forEach(item => {
        const value = Number(item.durationBeats) || 1;
        item.durationBeats = removing ? value / 1.5 : value * 1.5;
      });
      renderTimingEditor();
      renderSequenceBackdrop();
      queueDraftSave();
      showToast(removing ? 'Dot removed.' : 'Dotted: half as long again.', 'success');
    });
    els.timingTieBtn?.addEventListener('click', () => {
      const chosen = timingSelectionIndices();
      if (!chosen.length) return;
      // An arc spans from the first selected note to the last, so a run gets one curve
      // rather than a separate arc hanging off every note in it. Each note except the
      // last carries the link to its neighbour, and those links join into one line.
      const first = Math.min(...chosen);
      const last = Math.max(...chosen);
      const span = [];
      for (let i = first; i < last; i += 1) {
        if (tieTargetIndex(i) >= 0) span.push(i);
      }
      const usable = span.length ? span : timingSelectionIndices().filter(index => tieTargetIndex(index) >= 0);
      if (!usable.length) return;
      const turningOn = !usable.every(index => state.editorTimeline[index]?.tie);
      usable.forEach(index => { state.editorTimeline[index].tie = turningOn; });
      if (turningOn && state.editorTimeline[last]) state.editorTimeline[last].tie = false;
      renderTimingEditor();
      renderSequenceBackdrop();
      queueDraftSave();
      showToast(turningOn ? 'Tied: held into the next note.' : 'Tie removed.', 'success');
    });
    els.timingChoiceGroup?.addEventListener('click', event => {
      const choice = event.target.closest('[data-duration]');
      if (!choice) return;
      const indices = timingSelectionIndices();
      if (!indices.length) return;
      const picked = Number(choice.dataset.duration);
      const chosenItems = indices.map(index => state.editorTimeline[index]).filter(item => item && item.core !== '|');
      // Tapping the rhythm a note already has clears it back to Regular, which is why
      // there is no separate Regular button.
      const allAlready = chosenItems.length > 0
        && chosenItems.every(item => Math.abs(Number(item.durationBeats) - picked) < 0.0001);
      const duration = allAlready ? 1 : picked;
      chosenItems.forEach(item => { item.durationBeats = duration; });
      syncInputTimingMarkers(indices, duration);
      renderTimingEditor();
      renderSequenceBackdrop();
      queueDraftSave();
    });
    els.showPitchNamesToggle.addEventListener('change', () => {
      state.showPitchNames = els.showPitchNamesToggle.checked;
      localStorage.setItem(STORAGE_EDITOR_PITCH_NAMES, String(state.showPitchNames));
      renderMiniPads();
    });
    els.clearSequenceBtn.addEventListener('click', () => {
      els.sequenceInput.value = '';
      renderSequenceBackdrop();
      state.editorTimeline = [];
      clearTimingSelection();
      state.editorSelectionStart = 0;
      state.editorSelectionEnd = 0;
      els.sequenceInput.focus();
      renderTimingEditor();
    });
    els.instrumentKeySelect.addEventListener('change', () => refreshPresetTuning(true));
    els.scaleTypeSelect.addEventListener('change', () => refreshPresetTuning(false));
    els.noteCountSelect.addEventListener('change', () => {
      // Each drum size has a factory tuning; jump to it rather than leaving a stale key/scale.
      const count = Number(els.noteCountSelect.value);
      const factory = COUNT_DEFAULTS[count];
      if (factory && (!state.instrument || state.instrument.count !== count)) {
        els.instrumentKeySelect.value = factory.key;
        els.scaleTypeSelect.value = factory.scale;
        els.rootOctaveSelect.value = String(factory.octave);
      }
      refreshPresetTuning();
      syncAllRowOctaves();
      syncHighDrumOption();
      renderCompanionPresetFromSettings();
    });
    els.highDrumToggle.addEventListener('change', syncHighDrumOption);
    els.rootOctaveSelect.addEventListener('change', () => { refreshPresetTuning(true); syncAllRowOctaves(); });
    els.tuningGrid.addEventListener('click', event => {
      const chip = event.target.closest('.colour-chip');
      if (!chip) return;
      if (state.colourTargetRow === chip.closest('.tuning-row')) closeColourPopover();
      else openColourPopover(chip);
    });
    els.tuningGrid.addEventListener('change', event => {
      if (event.target.matches('.tuning-note')) {
        els.scaleTypeSelect.value = 'custom';
        syncRowOctave(event.target.closest('.tuning-row'));
      }
    });
    els.tuningGrid.addEventListener('scroll', closeColourPopover, { passive: true });
    els.companionTuningGrid.addEventListener('click', event => {
      const chip = event.target.closest('.colour-chip');
      if (!chip) return;
      if (state.colourTargetRow === chip.closest('.tuning-row')) closeColourPopover();
      else openColourPopover(chip);
    });
    els.companionTuningGrid.addEventListener('change', event => {
      if (event.target.matches('.tuning-note')) syncRowOctave(event.target.closest('.tuning-row'));
    });
    els.companionTuningGrid.addEventListener('scroll', closeColourPopover, { passive: true });
    els.colourPopover.addEventListener('click', event => {
      const swatch = event.target.closest('.swatch[data-color]');
      if (!swatch) return;
      setRowColor(state.colourTargetRow, swatch.dataset.color);
      closeColourPopover();
    });
    els.colourPopover.addEventListener('input', event => {
      if (event.target.id === 'colourPopoverCustom') setRowColor(state.colourTargetRow, event.target.value);
    });
    els.colourPopover.addEventListener('change', event => {
      if (event.target.id === 'colourPopoverCustom') closeColourPopover();
    });
    document.addEventListener('pointerdown', event => {
      if (!state.colourTargetRow) return;
      if (event.target.closest('.colour-popover') || event.target.closest('.colour-chip')) return;
      closeColourPopover();
    }, true);
    els.settingsDialog.addEventListener('close', closeColourPopover);
    els.settingsForm.addEventListener('submit', saveSettings);
    [els.editorForm, els.settingsForm].forEach(form => {
      form.addEventListener('input', event => event.target.classList?.remove('invalid-field'));
      form.addEventListener('change', event => event.target.classList?.remove('invalid-field'));
    });
    document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.closeDialog);
      if (dialog?.open) dialog.close();
    }));
    window.addEventListener('keydown', keyboardHandler);
    bindHints();
    bindFullscreen();
    bindRound16();
    bindRound17();
    bindViewModeBtn();
    els.resultSlowerBtn?.addEventListener('click', () => {
      const next = Number(els.resultSlowerBtn.dataset.speed);
      if (next) {
        els.speedSelect.value = String(next);
        els.speedSelect.dispatchEvent(new Event('change'));
      }
      replayFromResults();
    });
    els.resultFasterBtn?.addEventListener('click', () => {
      const next = Number(els.resultFasterBtn.dataset.speed);
      if (next) {
        els.speedSelect.value = String(next);
        els.speedSelect.dispatchEvent(new Event('change'));
      }
      replayFromResults();
    });
    els.micCheckBtn?.addEventListener('click', () => { els.myDrumDialog?.close(); openMicCheckDialog(); });
    // Phone dock on the stage: Play opens the full-screen focus view, like the handpan app.
    els.dockPlayBtn?.addEventListener('click', () => {
      if (window.innerWidth <= 760 && !state.focusMode && !state.playing) setFocusMode(true);
      els.playBtn.click();
    });
    els.dockLoopBtn?.addEventListener('click', () => els.loopBtn.click());
    els.dockMetronomeBtn?.addEventListener('click', () => els.metronomeBtn.click());
    els.speedCycleBtn?.addEventListener('click', () => {
      const steps = [1, 0.75, 0.5, 0.25];
      const index = steps.findIndex(step => Math.abs(step - state.speed) < 0.001);
      els.speedSelect.value = String(index < 0 ? 1 : steps[(index + 1) % steps.length]);
      els.speedSelect.dispatchEvent(new Event('change'));
    });
    els.speedSelect.addEventListener('change', () => {
      if (els.speedCycleValue) els.speedCycleValue.textContent = `${Number(els.speedSelect.value)}×`;
    });
    els.soundWakeBtn?.addEventListener('click', wakeSound);
    const firstGesture = () => {
      if (els.soundWakeBtn && !els.soundWakeBtn.hidden) wakeSound();
      window.removeEventListener('pointerdown', firstGesture, true);
      window.removeEventListener('keydown', firstGesture, true);
    };
    window.addEventListener('pointerdown', firstGesture, true);
    window.addEventListener('keydown', firstGesture, true);
    window.addEventListener('resize', () => {
      if (state.focusMode && window.innerWidth > 1100) setFocusMode(false);
      fitTabletStage();
      resizeCanvas();
      positionWalkthrough();
    });
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.focusMode && !document.querySelector('dialog[open]')) {
        event.preventDefault();
        setFocusMode(false);
      }
    });
    window.addEventListener('keydown', event => {
      if (!els.tourOverlay || els.tourOverlay.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        finishWalkthrough();
      } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        event.stopImmediatePropagation();
        nextWalkthroughStep();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopImmediatePropagation();
        previousWalkthroughStep();
      }
    }, true);
    window.addEventListener('pagehide', stopMicrophone);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAmbientLoop();
        stopAudioScheduler();
        setAudioMuted(true);
        if (state.animationId) {
          cancelAnimationFrame(state.animationId);
          state.animationId = 0;
        }
        return;
      }

      // Background tabs stop receiving normal animation frames. Resynchronise the visual
      // clock, mark every elapsed note as already scheduled, then unmute. This prevents
      // the frightening burst where all notes missed in another tab played at once.
      if (state.playing && state.mode !== 'wait') {
        const now = performance.now();
        state.currentTime = Math.min(state.duration, ((now - state.playbackStartedAt) / 1000) * state.speed);
        state.lastScheduledIndex = noteIndexAtOrAfter(state.currentTime + 0.001) - 1;
        state.lastVisualFlashIndex = state.lastScheduledIndex;
        state.lastMetronomeBeat = Math.floor(state.currentTime / state.secondsPerBeat);
        state.lastVisualAt = 0;
        updatePracticeUI();
        renderFrame();
        if (state.currentTime >= state.duration - 0.002) {
          setAudioMuted(false);
          finishPlayback();
        } else {
          setAudioMuted(false);
          startAudioScheduler();
          state.animationId = requestAnimationFrame(tick);
        }
      } else {
        setAudioMuted(false);
      }
      startAmbientLoop();
    });
    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(resizeCanvas);
      state.resizeObserver.observe(els.noteStage);
    }
  }

  function updateStartupProgress(cached, total, plan) {
    if (!els.startupLoader) return;
    const complete = total ? Math.min(76, Math.max(3, Math.round((cached / total) * 76))) : 76;
    els.startupLoaderFill.style.width = `${complete}%`;
    if (plan?.featuredTitle && cached < plan.featuredCount) {
      els.startupLoaderStatus.textContent = `Preparing ${plan.featuredTitle}`;
    } else if (cached < total) {
      els.startupLoaderStatus.textContent = 'Preparing remaining drum sounds';
    }
    els.startupLoaderCount.textContent = total ? `${cached} of ${total} sounds ready` : 'Sound cache ready';
  }

  function updateStartupVisualProgress(prepared, total) {
    if (!els.startupLoader) return;
    const ratio = total ? prepared / total : 1;
    // Sound preparation owns the first 76%; note sprites take us to 92%.
    const complete = Math.round(76 + Math.max(0, Math.min(1, ratio)) * 16);
    els.startupLoaderFill.style.width = `${complete}%`;
    els.startupLoaderStatus.textContent = 'Preparing every note color';
    els.startupLoaderCount.textContent = total ? `${prepared} of ${total} note visuals ready` : 'Note visuals ready';
  }

  function updateStartupRuntimeProgress(step, total, message = 'Warming animation engine') {
    if (!els.startupLoader) return;
    const ratio = total ? Math.max(0, Math.min(1, step / total)) : 1;
    const complete = Math.round(92 + ratio * 8);
    els.startupLoaderFill.style.width = `${complete}%`;
    els.startupLoaderStatus.textContent = message;
    els.startupLoaderCount.textContent = total ? `${step} of ${total} animation passes ready` : 'Animation engine ready';
  }

  function nextStartupFrame() {
    return new Promise(resolve => window.requestAnimationFrame(() => resolve()));
  }

  async function preWarmRuntimeVisualPipeline(onProgress = null) {
    const width = els.noteCanvas?.clientWidth || 0;
    const height = els.noteCanvas?.clientHeight || 0;
    if (!width || !height) return { frames: 0, profile: 'unknown', averageMs: 0 };

    // Establish the correct phone/tablet/desktop canvas profile *before* any benchmark.
    // resizeCanvas also allocates both backing buffers, builds stars and creates guide layers.
    resizeCanvas();
    const profile = visualPerformanceProfile(width);
    configureParticleQuality(profile, true);

    const snapshot = {
      parsedNotes: state.parsedNotes,
      duration: state.duration,
      secondsPerBeat: state.secondsPerBeat,
      totalBeats: state.totalBeats,
      currentTime: state.currentTime,
      playing: state.playing,
      countInActive: state.countInActive,
      mode: state.mode,
      lastFrameAt: state.lastFrameAt,
      lastVisualAt: state.lastVisualAt,
      lastUiAt: state.lastUiAt,
      lastBackdropAt: state.lastBackdropAt,
      lastCompanionUiAt: state.lastCompanionUiAt,
      backdropMode: state.backdropMode,
      expectedPadSignature: state.expectedPadSignature,
      expectedPadAnchor: state.expectedPadAnchor
    };

    const featured = featuredStartupSong() || selectedSong();
    if (featured) {
      const parsed = parseSequence(featured.sequence, featured.bpm);
      state.parsedNotes = preparePlaybackNotes(parsed.notes);
      state.duration = parsed.duration;
      state.secondsPerBeat = parsed.secondsPerBeat;
      state.totalBeats = parsed.totalBeats;
    }
    state.mode = 'demo';
    state.playing = true;
    state.countInActive = false;
    state.lastBackdropAt = 0;
    state.lastCompanionUiAt = 0;
    state.backdropMode = '';
    state.lastFrameAt = 0;

    // Sample moments with approaching notes rather than an empty stage. This warms the same
    // sprite compositing, guide glow, particle path, companion layout and canvas code the
    // first walkthrough step actually uses.
    const duration = Math.max(.1, state.duration || 8);
    const candidates = state.parsedNotes.length
      ? state.parsedNotes.slice(0, 24).map(note => Math.max(0, Math.min(duration, note.time - 1.6)))
      : [0, .4, .8, 1.2, 1.6, 2, 2.4, 2.8];
    const sampleTimes = [...new Set(candidates.map(value => Math.round(value * 20) / 20))];
    while (sampleTimes.length < 12) sampleTimes.push(Math.min(duration, sampleTimes.length * .35));
    const warmTimes = sampleTimes.slice(0, 14);
    const totalPasses = warmTimes.length + 4;
    const costs = [];
    onProgress?.(0, totalPasses, `Warming ${profile.name} animation engine`);

    for (let index = 0; index < warmTimes.length; index += 1) {
      state.currentTime = warmTimes[index];
      // Force a few complete backdrop paints up front, then let the chosen cadence behave
      // normally so the timing sample resembles real playback.
      if (index < 3) state.lastBackdropAt = 0;
      const started = performance.now();
      renderFrame();
      const cost = performance.now() - started;
      if (index >= 4) costs.push(cost);
      onProgress?.(index + 1, totalPasses, `Warming ${profile.name} animation engine`);
      await nextStartupFrame();
    }

    // Choose the settled quality *before* the user sees a falling note. The normal adaptive
    // monitor remains active later and may reduce one more step if the device heats up.
    const sorted = [...costs].sort((a, b) => a - b);
    const averageMs = costs.length ? costs.reduce((sum, value) => sum + value, 0) / costs.length : 0;
    const p90 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .9))] : 0;
    const target = profile.visualInterval || 16.7;
    const looksHeavy = averageMs > target * .48 || p90 > target * .82;
    if (looksHeavy) {
      downgradeParticleQuality();
      state.backgroundRateScale = Math.max(2, state.backgroundRateScale);
    }

    // Paint several final-profile frames so shader/gradient/canvas caches are hot after any
    // quality adjustment made by the benchmark.
    for (let index = 0; index < 4; index += 1) {
      state.currentTime = warmTimes[index % warmTimes.length] || 0;
      if (index === 0) state.lastBackdropAt = 0;
      renderFrame();
      onProgress?.(warmTimes.length + index + 1, totalPasses, 'Finalizing smooth playback');
      await nextStartupFrame();
    }

    Object.assign(state, snapshot);
    // Keep the selected performance profile / particle quality / background cadence from the
    // warm-up, but restore all song/session data exactly as it was before the hidden test.
    state.lastBackdropAt = 0;
    state.lastCompanionUiAt = 0;
    state.backdropMode = '';
    renderFrame();
    resetVisualPerformanceMonitor();
    return { frames: totalPasses, profile: profile.name, averageMs };
  }

  function revealLoadedApp() {
    document.body.classList.remove('app-loading');
    els.startupLoader?.classList.add('done');
    window.setTimeout(() => els.startupLoader?.remove(), 300);
    fitTabletStage();
    maybeShowSoundWake();
  }

  // Tablets (touch screens wider than a phone): the song list slides in from the left like
  // on a phone, and the stage takes exactly the height that is left, so nothing scrolls.
  function isTabletLayout() {
    return window.innerWidth > 760 && window.innerHeight >= 520 && Boolean(window.matchMedia?.('(pointer: coarse)').matches);
  }

  function fitTabletStage() {
    const stage = els.noteStage;
    if (!stage) return;
    const tablet = isTabletLayout() && !state.focusMode;
    const phone = window.innerWidth <= 760 && !state.focusMode;
    const desktop = !tablet && !phone && isDesktopFit() && !state.focusMode;
    document.body.classList.toggle('tablet-fit', tablet);
    document.body.classList.toggle('desktop-fit', desktop);
    document.body.classList.toggle('wide-fit', tablet || desktop);
    placeProgressInTape((tablet || desktop) && tapeWanted());
    const before = stage.style.height;
    if (phone) {
      stage.dataset.tabletFit = '1';
      stage.style.height = '';
      stage.style.minHeight = '';
      const viewport = window.visualViewport?.height || window.innerHeight;
      const top = stage.getBoundingClientRect().top + window.scrollY;
      const height = Math.max(400, Math.floor(viewport - top - 14));
      stage.style.height = `${height}px`;
      stage.style.minHeight = `${height}px`;
      if (before !== stage.style.height) window.requestAnimationFrame(resizeCanvas);
      return;
    }
    if (!tablet && !desktop) {
      if (stage.dataset.tabletFit) {
        stage.style.height = '';
        stage.style.minHeight = '';
        delete stage.dataset.tabletFit;
        window.requestAnimationFrame(resizeCanvas);
      }
      return;
    }
    stage.dataset.tabletFit = '1';
    stage.style.height = '';
    stage.style.minHeight = '';
    const card = stage.closest('.trainer-card');
    const panel = document.querySelector('.main-panel');
    const viewport = window.visualViewport?.height || window.innerHeight;
    const rect = stage.getBoundingClientRect();
    const below = card.getBoundingClientRect().bottom - rect.bottom;
    const padBottom = parseFloat(getComputedStyle(panel).paddingBottom) || 10;
    const height = Math.max(300, Math.floor(viewport - (rect.top + window.scrollY) - below - padBottom - 2));
    stage.style.height = `${height}px`;
    stage.style.minHeight = `${height}px`;
    if (before !== stage.style.height) window.requestAnimationFrame(resizeCanvas);
  }

  // Browsers keep sound off until the first touch, so a fresh page plays silently. A
  // friendly button invites that first touch.
  function maybeShowSoundWake() {
    if (!els.soundWakeBtn) return;
    const activated = navigator.userActivation ? navigator.userActivation.hasBeenActive : false;
    // Only on phones and tablets; on a computer the first click wakes the sound anyway.
    const touch = Boolean(window.matchMedia?.('(pointer: coarse)').matches);
    els.soundWakeBtn.hidden = !touch || activated || state.audioContext?.state === 'running';
  }

  function wakeSound() {
    if (els.soundWakeBtn) els.soundWakeBtn.hidden = true;
    try { primeAudioFromGesture(); } catch {}
  }

  function bindHints() {
    const pop = els.hintPop;
    if (!pop) return;
    let owner = null;
    const hide = () => { pop.hidden = true; owner?.classList.remove('open'); owner = null; };
    const show = button => {
      if (owner === button) { hide(); return; }
      hide();
      owner = button;
      button.classList.add('open');
      pop.textContent = button.dataset.hint || '';
      pop.hidden = false;
      const r = button.getBoundingClientRect();
      const w = Math.min(300, window.innerWidth - 24);
      pop.style.width = `${w}px`;
      pop.style.left = `${Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2))}px`;
      const above = r.top - pop.offsetHeight - 10;
      pop.style.top = `${above > 8 ? above : r.bottom + 10}px`;
    };
    const hover = () => window.matchMedia?.('(hover: hover)').matches;
    document.querySelectorAll('.hint-btn').forEach(button => {
      button.addEventListener('click', event => { event.stopPropagation(); show(button); });
      button.addEventListener('mouseenter', () => { if (hover() && owner !== button) show(button); });
      button.addEventListener('mouseleave', () => { if (hover() && owner === button) hide(); });
    });
    document.addEventListener('pointerdown', event => { if (owner && !event.target.closest('.hint-btn')) hide(); });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
  }

  function bindFullscreen() {
    if (!els.fullscreenBtn) return;
    const root = document.documentElement;
    const supported = Boolean(root.requestFullscreen && document.fullscreenEnabled);
    els.fullscreenBtn.hidden = !supported;
    if (!supported) return;
    els.fullscreenBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      else root.requestFullscreen({ navigationUI: 'hide' }).catch(() => showToast('Full screen is not available here.', 'warning'));
    });
    document.addEventListener('fullscreenchange', () => {
      const on = Boolean(document.fullscreenElement);
      els.fullscreenBtn.classList.toggle('active', on);
      els.fullscreenBtn.setAttribute('aria-label', on ? 'Leave full screen' : 'Full screen');
      els.fullscreenBtn.title = on ? 'Leave full screen' : 'Full screen: hide the system bars';
      const fsLabel = els.fullscreenBtn.querySelector('.fs-label');
      if (fsLabel) fsLabel.textContent = on ? 'Exit full screen' : 'Full screen';
      window.setTimeout(fitTabletStage, 120);
    });
  }

  async function init() {
    try {
      state.guide = localStorage.getItem(STORAGE_GUIDE) === '1';
      state.waitPref = localStorage.getItem(STORAGE_WAIT) === '1';
      const style = localStorage.getItem(STORAGE_WAIT_STYLE);
      state.waitStyle = ['quiet', 'hear', 'game'].includes(style) ? style : 'game';
      const turn = Number(localStorage.getItem(STORAGE_ROTATION));
      state.drumRotation = Number.isFinite(turn) ? turn : 0;
    } catch { state.guide = false; state.waitPref = false; }
    document.body.dataset.mode = state.mode;
    initTape();
    loadData();
    bindEvents();
    initialisePerformanceDiagnostics();
    renderInstrument();
    updateMicUI();
    renderSongList();
    selectSong(state.selectedId);
    // Allocate the final device-specific canvas buffers before caching sprites. Otherwise a
    // late ResizeObserver pass can invalidate the just-created visual cache as the tour opens.
    resizeCanvas();
    const startedAt = performance.now();
    let soundResult = null;
    try {
      // Do not reveal the walkthrough until the full current instrument has been rendered
      // into the offline sound cache. This avoids first-touch synthesis spikes during tour.
      soundResult = await preCacheInstrumentSounds(updateStartupProgress);
    } catch (error) {
      console.warn('Could not prepare the sound cache:', error);
    }
    await preWarmAllNoteVisuals(updateStartupVisualProgress)
      .catch(error => console.warn('Could not prepare the complete visual cache:', error));
    await preWarmRuntimeVisualPipeline(updateStartupRuntimeProgress)
      .catch(error => console.warn('Could not warm the runtime visual pipeline:', error));
    const remainingDelay = Math.max(0, 320 - (performance.now() - startedAt));
    if (remainingDelay) await new Promise(resolve => window.setTimeout(resolve, remainingDelay));
    if (els.startupLoaderStatus) els.startupLoaderStatus.textContent = 'Ready to play';
    if (els.startupLoaderFill) els.startupLoaderFill.style.width = '100%';
    if (els.startupLoaderCount) {
      const complete = soundResult && soundResult.supported && !soundResult.cancelled && soundResult.cached === soundResult.total;
      els.startupLoaderCount.textContent = complete ? 'All notes and sounds ready' : 'Notes ready · sound fallback available';
    }
    revealLoadedApp();
    startDemoCatalogPolling();
    // Walkthrough starts only after sounds, note sprites and hidden runtime warm-up have completed.
    maybeStartWalkthrough();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      const hadController = Boolean(navigator.serviceWorker.controller);
      let reloadingForUpdate = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || reloadingForUpdate) return;
        reloadingForUpdate = true;
        window.location.reload();
      });
      navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' })
        .then(registration => {
          registration.update().catch(() => {});
          window.addEventListener('focus', () => registration.update().catch(() => {}));
        })
        .catch(() => {});
    }
  }

  init().catch(error => {
    console.error('The app could not finish starting:', error);
    revealLoadedApp();
    showToast('The app started with limited sound preparation.', 'warning');
  });
})();
