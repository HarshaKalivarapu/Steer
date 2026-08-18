/**
 * Sign artwork for image questions.
 *
 * These are drawn as inline SVG rather than cropped out of the booklet, for two reasons:
 * the booklet is a page scan so any crop would be blurry, and drawing them means the
 * shape and colour are exactly right, which is the whole point of a sign question.
 *
 * The model does NOT invent images. It picks an `id` from this list, and the app renders
 * the matching artwork. That way a question can never reference a sign that doesn't exist
 * or describe one that looks different from what she sees.
 *
 * Each sign carries an `art` rating. 'clean' means text or plain geometry that renders
 * unambiguously; 'rough' means a pictogram — a deer, a cyclist — where the drawing is only
 * an approximation. A photo dropped into public/signs/ always wins over either, and the
 * catalogue sent to the model says which signs have one so it can prefer them.
 *
 * MUTCD sign designs are US federal government work and not copyrighted.
 */

export interface Sign {
  id: string
  /** What the sign is, for the answer key and for the model's own reference. */
  name: string
  /** Shown to screen readers and used as the alt text. Never names the sign outright. */
  description: string
  /**
   * How much the built-in drawing can be trusted when no photo has been supplied.
   * 'clean' means text or plain geometry that renders unambiguously. 'rough' means a
   * pictogram — a deer, a cyclist — where my drawing is only an approximation and a
   * real photo matters more.
   */
  art: 'clean' | 'rough'
  svg: string
}

const YELLOW = '#f5c518'
const ORANGE = '#e8730c'
const RED = '#c8102e'
const GREEN_YELLOW = '#c8e600'
const BLUE = '#0b4ea2'

/** Yellow warning diamond, the frame most warning signs share. */
const diamond = (inner: string, fill = YELLOW) =>
  `<polygon points="50,4 96,50 50,96 4,50" fill="${fill}" stroke="#111" stroke-width="3"/>${inner}`

/** White regulatory rectangle. */
const regulatory = (inner: string) =>
  `<rect x="12" y="6" width="76" height="88" rx="4" fill="#fff" stroke="#111" stroke-width="3"/>${inner}`

export const SIGNS: Sign[] = [
  {
    id: 'stop',
    name: 'Stop sign',
    description: 'A red eight-sided sign with white lettering',
    art: 'clean',
    svg: `<polygon points="30,6 70,6 94,30 94,70 70,94 30,94 6,70 6,30" fill="${RED}" stroke="#fff" stroke-width="4"/>
      <text x="50" y="60" font-size="24" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">STOP</text>`,
  },
  {
    id: 'yield',
    name: 'Yield sign',
    description: 'A downward-pointing triangle with a red border',
    art: 'clean',
    svg: `<polygon points="6,14 94,14 50,92" fill="#fff" stroke="${RED}" stroke-width="11"/>
      <text x="50" y="48" font-size="16" font-weight="700" fill="${RED}" text-anchor="middle" font-family="sans-serif">YIELD</text>`,
  },
  {
    id: 'do-not-enter',
    name: 'Do Not Enter',
    description: 'A red circle crossed by a single horizontal white bar',
    art: 'clean',
    svg: `<rect x="4" y="4" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
      <circle cx="50" cy="50" r="38" fill="${RED}"/>
      <rect x="20" y="43" width="60" height="14" fill="#fff"/>`,
  },
  {
    id: 'wrong-way',
    name: 'Wrong Way',
    description: 'A red rectangular sign with white lettering',
    art: 'clean',
    svg: `<rect x="4" y="26" width="92" height="48" rx="4" fill="${RED}" stroke="#fff" stroke-width="3"/>
      <text x="50" y="46" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">WRONG</text>
      <text x="50" y="64" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">WAY</text>`,
  },
  {
    id: 'one-way',
    name: 'One Way',
    description: 'A black horizontal sign with a white arrow and lettering',
    art: 'clean',
    svg: `<rect x="4" y="30" width="92" height="40" rx="3" fill="#111"/>
      <path d="M18 50 h44 M54 42 l10 8 -10 8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="76" y="55" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">ONE WAY</text>`,
  },
  {
    id: 'speed-limit-35',
    name: 'Speed Limit 35',
    description: 'A white rectangular sign with black lettering and a number',
    art: 'clean',
    svg: regulatory(`<text x="50" y="28" font-size="11" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">SPEED</text>
      <text x="50" y="42" font-size="11" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">LIMIT</text>
      <text x="50" y="80" font-size="34" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">35</text>`),
  },
  {
    id: 'no-u-turn',
    name: 'No U-Turn',
    description: 'A white sign showing a curved arrow reversing direction, with a red slash',
    art: 'clean',
    svg: regulatory(`<path d="M34 74 V52 a16 16 0 0 1 32 0 V74" stroke="#111" stroke-width="6" fill="none"/>
      <path d="M58 66 l8 10 8 -10" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="34" stroke="${RED}" stroke-width="7" fill="none"/>
      <line x1="26" y1="26" x2="74" y2="74" stroke="${RED}" stroke-width="7"/>`),
  },
  {
    id: 'no-right-turn',
    name: 'No Right Turn',
    description: 'A white sign showing a turning arrow with a red circle and slash over it',
    art: 'clean',
    svg: regulatory(`<path d="M40 76 V56 a10 10 0 0 1 10 -10 H64" stroke="#111" stroke-width="6" fill="none"/>
      <path d="M58 38 l10 8 -10 8" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="34" stroke="${RED}" stroke-width="7" fill="none"/>
      <line x1="26" y1="26" x2="74" y2="74" stroke="${RED}" stroke-width="7"/>`),
  },
  {
    id: 'no-passing-pennant',
    name: 'No Passing Zone',
    description: 'A yellow sign shaped like a long horizontal triangle, posted on the left of the road',
    art: 'clean',
    svg: `<polygon points="4,10 96,50 4,90" fill="${YELLOW}" stroke="#111" stroke-width="3"/>
      <text x="34" y="46" font-size="10" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">NO</text>
      <text x="34" y="58" font-size="10" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">PASSING</text>`,
  },
  {
    id: 'school-zone',
    name: 'School zone / School crossing',
    description: 'A five-sided yellow-green sign with two walking figures',
    art: 'rough',
    svg: `<polygon points="50,4 94,36 78,92 22,92 6,36" fill="${GREEN_YELLOW}" stroke="#111" stroke-width="3"/>
      <circle cx="40" cy="40" r="6" fill="#111"/>
      <path d="M40 47 v16 M33 74 l7 -11 7 11 M32 54 h16" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="60" cy="44" r="5" fill="#111"/>
      <path d="M60 50 v13 M55 74 l5 -11 5 11 M53 56 h14" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'railroad-crossbuck',
    name: 'Railroad crossing (crossbuck)',
    description: 'A white X-shaped sign with black lettering, posted at the tracks themselves',
    art: 'clean',
    svg: `<g stroke="#111" stroke-width="3">
      <rect x="-6" y="42" width="112" height="17" fill="#fff" transform="rotate(45 50 50)"/>
      <rect x="-6" y="42" width="112" height="17" fill="#fff" transform="rotate(-45 50 50)"/>
      </g>
      <text x="50" y="30" font-size="9" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">RAIL</text>
      <text x="50" y="76" font-size="9" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">ROAD</text>`,
  },
  {
    id: 'railroad-advance',
    name: 'Railroad crossing ahead',
    description: 'A round yellow sign with a large black X and two letters',
    art: 'clean',
    svg: `<circle cx="50" cy="50" r="46" fill="${YELLOW}" stroke="#111" stroke-width="3"/>
      <path d="M16 16 L84 84 M84 16 L16 84" stroke="#111" stroke-width="7"/>
      <text x="30" y="57" font-size="20" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">R</text>
      <text x="70" y="57" font-size="20" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">R</text>`,
  },
  {
    id: 'curve-right',
    name: 'Curve to the right ahead',
    description: 'A yellow diamond showing an arrow that bends gradually to the right',
    art: 'clean',
    svg: diamond(`<path d="M40 76 V58 C40 40 54 34 62 32" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M54 24 l12 8 -10 10" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: 'turn-right',
    name: 'Sharp right turn ahead',
    description: 'A yellow diamond showing an arrow that bends at a sharp right angle',
    art: 'clean',
    svg: diamond(`<path d="M38 78 V44 H60" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M54 34 l12 10 -12 10" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: 'merge',
    name: 'Merging traffic ahead',
    description: 'A yellow diamond showing one lane joining another',
    art: 'clean',
    svg: diamond(`<path d="M42 82 V34" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M34 42 l8 -10 8 10" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M66 80 V60 C66 46 54 44 46 42" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round"/>`),
  },
  {
    id: 'lane-ends',
    name: 'Right lane ends',
    description: 'A yellow diamond showing two lanes narrowing into one',
    art: 'clean',
    svg: diamond(`<path d="M38 82 V26" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M64 82 V54 C64 38 50 32 40 30" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round"/>`),
  },
  {
    id: 'two-way-traffic',
    name: 'Two-way traffic ahead',
    description: 'A yellow diamond with two vertical arrows pointing in opposite directions',
    art: 'clean',
    svg: diamond(`<path d="M38 78 V30 M30 38 l8 -9 8 9" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M62 26 V74 M54 66 l8 9 8 -9" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: 'signal-ahead',
    name: 'Traffic signal ahead',
    description: 'A yellow diamond showing a traffic light with three lamps',
    art: 'clean',
    svg: diamond(`<rect x="40" y="24" width="20" height="52" rx="4" fill="#111"/>
      <circle cx="50" cy="35" r="6" fill="${RED}"/>
      <circle cx="50" cy="50" r="6" fill="${YELLOW}"/>
      <circle cx="50" cy="65" r="6" fill="#1a8a3a"/>`),
  },
  {
    id: 'stop-ahead',
    name: 'Stop sign ahead',
    description: 'A yellow diamond containing the outline of an eight-sided sign',
    art: 'clean',
    svg: diamond(`<polygon points="42,26 58,26 68,36 68,52 58,62 42,62 32,52 32,36" fill="#111"/>
      <path d="M50 66 v14" stroke="#111" stroke-width="6" stroke-linecap="round"/>`),
  },
  {
    id: 'divided-highway-ends',
    name: 'Divided highway ends',
    description: 'A yellow diamond showing two separated lanes coming together into one road',
    art: 'clean',
    svg: diamond(`<path d="M36 84 V52 C36 38 44 30 50 24 C56 30 64 38 64 52 V84" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M50 30 v54" stroke="#111" stroke-width="5" stroke-dasharray="7 6"/>`),
  },
  {
    id: 'slippery-when-wet',
    name: 'Slippery when wet',
    description: 'A yellow diamond showing a car with curved skid lines behind its wheels',
    art: 'rough',
    svg: diamond(`<rect x="34" y="36" width="32" height="16" rx="4" fill="#111"/>
      <path d="M40 34 h20 l5 4 H36 z" fill="#111"/>
      <circle cx="41" cy="55" r="4" fill="#111"/><circle cx="59" cy="55" r="4" fill="#111"/>
      <path d="M30 68 c6 -6 12 2 18 -4 M52 72 c6 -6 12 2 18 -4" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  },
  {
    id: 'work-zone',
    name: 'Road work ahead',
    description: 'An orange diamond used for temporary conditions, with lettering',
    art: 'clean',
    svg: diamond(
      `<text x="50" y="46" font-size="13" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">ROAD</text>
       <text x="50" y="62" font-size="13" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">WORK</text>`,
      ORANGE,
    ),
  },
  {
    id: 'hospital',
    name: 'Hospital',
    description: 'A blue square sign with a single white letter',
    art: 'clean',
    svg: `<rect x="8" y="8" width="84" height="84" rx="5" fill="${BLUE}"/>
      <text x="50" y="70" font-size="52" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">H</text>`,
  },
  {
    id: 'curve-left',
    name: 'Curve to the left ahead',
    description: 'A yellow diamond showing an arrow that bends gradually to the left',
    art: 'clean',
    svg: diamond(`<path d="M60 76 V58 C60 40 46 34 38 32" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M46 24 l-12 8 10 10" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: 'turn-left',
    name: 'Sharp left turn ahead',
    description: 'A yellow diamond showing an arrow that bends at a sharp left angle',
    art: 'clean',
    svg: diamond(`<path d="M62 78 V44 H40" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M46 34 l-12 10 12 10" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: 'reverse-curve',
    name: 'Reverse curve',
    description: 'A yellow diamond showing an arrow that bends one way then back the other',
    art: 'clean',
    svg: diamond(`<path d="M40 82 V68 C40 56 62 56 62 44 V32" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M54 38 l8 -8 8 8" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: 'winding-road',
    name: 'Winding road',
    description: 'A yellow diamond showing an arrow weaving through several bends',
    art: 'clean',
    svg: diamond(`<path d="M42 84 V74 C42 64 60 64 60 54 C60 44 40 44 40 34 V28" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M32 34 l8 -8 8 8" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: 'crossroad',
    name: 'Crossroad ahead',
    description: 'A yellow diamond containing a plus-shaped symbol',
    art: 'clean',
    svg: diamond(`<path d="M50 20 V80 M20 50 H80" stroke="#111" stroke-width="10"/>`),
  },
  {
    id: 'side-road-right',
    name: 'Side road on the right',
    description: 'A yellow diamond showing a road joining from one side',
    art: 'clean',
    svg: diamond(`<path d="M50 18 V82" stroke="#111" stroke-width="10"/>
      <path d="M50 52 H80" stroke="#111" stroke-width="10"/>`),
  },
  {
    id: 'side-road-left',
    name: 'Side road on the left',
    description: 'A yellow diamond showing a road joining from one side',
    art: 'clean',
    svg: diamond(`<path d="M50 18 V82" stroke="#111" stroke-width="10"/>
      <path d="M50 52 H20" stroke="#111" stroke-width="10"/>`),
  },
  {
    id: 't-intersection',
    name: 'T-intersection ahead',
    description: 'A yellow diamond containing a T-shaped symbol',
    art: 'clean',
    svg: diamond(`<path d="M50 82 V44" stroke="#111" stroke-width="10"/>
      <path d="M20 44 H80" stroke="#111" stroke-width="10"/>`),
  },
  {
    id: 'y-intersection',
    name: 'Y-intersection ahead',
    description: 'A yellow diamond containing a Y-shaped symbol',
    art: 'clean',
    svg: diamond(`<path d="M50 84 V56" stroke="#111" stroke-width="10"/>
      <path d="M50 56 L28 26 M50 56 L72 26" stroke="#111" stroke-width="10" stroke-linecap="round"/>`),
  },
  {
    id: 'divided-highway-begins',
    name: 'Divided highway begins',
    description: 'A yellow diamond showing one road separating into two around a median',
    art: 'clean',
    svg: diamond(`<path d="M36 84 V52 C36 40 44 32 50 26 C56 32 64 40 64 52 V84" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="58" rx="5" ry="15" fill="#111"/>`),
  },
  {
    id: 'no-left-turn',
    name: 'No Left Turn',
    description: 'A white sign showing a turning arrow with a red circle and slash over it',
    art: 'clean',
    svg: regulatory(`<path d="M60 76 V56 a10 10 0 0 0 -10 -10 H36" stroke="#111" stroke-width="6" fill="none"/>
      <path d="M42 38 l-10 8 10 8" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="34" stroke="${RED}" stroke-width="7" fill="none"/>
      <line x1="26" y1="26" x2="74" y2="74" stroke="${RED}" stroke-width="7"/>`),
  },
  {
    id: 'left-turn-only',
    name: 'Left turn only',
    description: 'A white sign showing a curving arrow above a single word',
    art: 'clean',
    svg: regulatory(`<path d="M58 68 V52 a10 10 0 0 0 -10 -10 H36" stroke="#111" stroke-width="7" fill="none"/>
      <path d="M42 34 l-10 8 10 8" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="50" y="86" font-size="14" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">ONLY</text>`),
  },
  {
    id: 'one-lane-bridge',
    name: 'One lane bridge',
    description: 'A yellow diamond with black lettering',
    art: 'clean',
    svg: diamond(`<text x="50" y="44" font-size="11" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">ONE LANE</text>
      <text x="50" y="60" font-size="11" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">BRIDGE</text>`),
  },
  {
    id: 'low-clearance',
    name: 'Low clearance',
    description: 'A yellow diamond showing a height measurement between two arrows',
    art: 'clean',
    svg: diamond(`<path d="M32 34 V66 M26 40 l6 -6 6 6 M26 60 l6 6 6 -6" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="62" y="56" font-size="15" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">12 FT 6</text>`),
  },
  {
    id: 'reduce-speed-ahead',
    name: 'Reduce speed ahead',
    description: 'A white rectangular sign with black lettering',
    art: 'clean',
    svg: regulatory(`<text x="50" y="38" font-size="12" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">REDUCE</text>
      <text x="50" y="55" font-size="12" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">SPEED</text>
      <text x="50" y="72" font-size="12" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">AHEAD</text>`),
  },
  {
    id: 'speed-zone-ahead',
    name: 'Speed zone ahead',
    description: 'A white rectangular sign with black lettering',
    art: 'clean',
    svg: regulatory(`<text x="50" y="40" font-size="13" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">SPEED</text>
      <text x="50" y="58" font-size="13" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">ZONE</text>
      <text x="50" y="76" font-size="13" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">AHEAD</text>`),
  },
  {
    id: 'fasten-safety-belts',
    name: 'Fasten safety belts',
    description: 'A white rectangular sign with black lettering and a state law notice',
    art: 'clean',
    svg: regulatory(`<text x="50" y="34" font-size="11" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">FASTEN</text>
      <text x="50" y="49" font-size="11" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">SAFETY</text>
      <text x="50" y="64" font-size="11" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">BELTS</text>
      <rect x="12" y="72" width="76" height="22" fill="#111"/>
      <text x="50" y="88" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">STATE LAW</text>`),
  },
  {
    id: 'school-speed-limit-20',
    name: 'School speed limit 20',
    description: 'A white sign with a coloured panel on top, a speed number, and a lower notice',
    art: 'clean',
    svg: `<rect x="10" y="4" width="80" height="92" rx="4" fill="#fff" stroke="#111" stroke-width="3"/>
      <rect x="10" y="4" width="80" height="20" fill="${GREEN_YELLOW}"/>
      <text x="50" y="19" font-size="12" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">SCHOOL</text>
      <text x="50" y="37" font-size="9" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">SPEED LIMIT</text>
      <text x="50" y="66" font-size="26" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">20</text>
      <text x="50" y="82" font-size="7" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">DURING</text>
      <text x="50" y="91" font-size="7" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">RESTRICTED HOURS</text>`,
  },
  {
    id: 'road-construction-ahead',
    name: 'Road construction ahead',
    description: 'An orange diamond with black lettering',
    art: 'clean',
    svg: diamond(`<text x="50" y="42" font-size="10" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">ROAD</text>
      <text x="50" y="55" font-size="9" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">CONSTRUCTION</text>
      <text x="50" y="68" font-size="10" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">AHEAD</text>`, ORANGE),
  },
  {
    id: 'detour',
    name: 'Detour',
    description: 'An orange horizontal sign with black lettering and an arrow',
    art: 'clean',
    svg: `<rect x="4" y="30" width="92" height="40" rx="3" fill="${ORANGE}" stroke="#111" stroke-width="3"/>
      <text x="42" y="56" font-size="15" font-weight="700" fill="#111" text-anchor="middle" font-family="sans-serif">DETOUR</text>
      <path d="M70 50 h16 M80 44 l7 6 -7 6" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'slow-moving-vehicle',
    name: 'Slow-moving vehicle emblem',
    description: 'An upward-pointing triangle with an orange centre and a red border',
    art: 'clean',
    svg: `<polygon points="50,8 92,86 8,86" fill="${RED}" stroke="#111" stroke-width="2"/>
      <polygon points="50,26 78,78 22,78" fill="${ORANGE}"/>`,
  },
  {
    id: 'bike-route',
    name: 'Bike route',
    description: 'A green sign with white lettering',
    art: 'clean',
    svg: `<rect x="14" y="18" width="72" height="64" rx="4" fill="#1a7a3a" stroke="#111" stroke-width="2"/>
      <text x="50" y="46" font-size="14" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">BIKE</text>
      <text x="50" y="66" font-size="14" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">ROUTE</text>`,
  },
  {
    id: 'bicycle-crossing',
    name: 'Bicycle crossing',
    description: 'A yellow diamond showing a bicycle',
    art: 'rough',
    svg: diamond(`<circle cx="34" cy="64" r="11" fill="none" stroke="#111" stroke-width="4"/>
      <circle cx="66" cy="64" r="11" fill="none" stroke="#111" stroke-width="4"/>
      <path d="M34 64 L46 44 H58 M46 44 L66 64 M40 44 h12" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  },
  {
    id: 'no-bicycles',
    name: 'No bicycles',
    description: 'A white sign showing a bicycle with a red circle and slash over it',
    art: 'rough',
    svg: regulatory(`<circle cx="36" cy="62" r="9" fill="none" stroke="#111" stroke-width="4"/>
      <circle cx="64" cy="62" r="9" fill="none" stroke="#111" stroke-width="4"/>
      <path d="M36 62 L46 46 H58 M46 46 L64 62" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="34" stroke="${RED}" stroke-width="7" fill="none"/>
      <line x1="26" y1="26" x2="74" y2="74" stroke="${RED}" stroke-width="7"/>`),
  },
  {
    id: 'pedestrian-crossing',
    name: 'Pedestrian crossing',
    description: 'A yellow-green sign showing a walking figure',
    art: 'rough',
    svg: `<polygon points="50,4 96,50 50,96 4,50" fill="${GREEN_YELLOW}" stroke="#111" stroke-width="3"/>
      <circle cx="50" cy="28" r="7" fill="#111"/>
      <path d="M50 36 v20 M40 78 l10 -22 10 22 M38 46 h24" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'deer-crossing',
    name: 'Deer crossing',
    description: 'A yellow diamond showing a leaping animal',
    art: 'rough',
    svg: diamond(`<ellipse cx="48" cy="54" rx="17" ry="9" fill="#111"/>
      <path d="M36 60 l-5 16 M45 62 l-3 14 M56 62 l3 14 M62 58 l7 16" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M62 48 l9 -11" stroke="#111" stroke-width="6" stroke-linecap="round"/>
      <circle cx="74" cy="33" r="6" fill="#111"/>
      <path d="M71 27 l-4 -10 M78 27 l4 -10" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  },
  {
    id: 'handicap-parking',
    name: 'Accessible parking',
    description: 'A sign showing a seated figure in a wheelchair',
    art: 'rough',
    svg: `<rect x="12" y="6" width="76" height="88" rx="4" fill="#fff" stroke="#111" stroke-width="3"/>
      <rect x="18" y="12" width="64" height="76" rx="3" fill="${BLUE}"/>
      <circle cx="44" cy="30" r="6" fill="#fff"/>
      <circle cx="50" cy="58" r="17" fill="none" stroke="#fff" stroke-width="5"/>
      <path d="M44 38 v14 h16 M44 52 l-6 12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'safety-belt-symbol',
    name: 'Fasten safety belts (symbol)',
    description: 'A white sign showing a seated figure wearing a diagonal belt, above a dark band',
    art: 'rough',
    svg: `<rect x="14" y="4" width="72" height="92" rx="4" fill="#fff" stroke="#111" stroke-width="3"/>
      <circle cx="46" cy="26" r="7" fill="#111"/>
      <path d="M46 34 v22 h20" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 56 v10 h26" stroke="#111" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M36 24 L62 58" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <rect x="14" y="74" width="72" height="22" fill="#111"/>
      <text x="50" y="90" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">STATE LAW</text>`,
  },
]

export const SIGN_IDS = SIGNS.map((s) => s.id)

export function getSign(id: string): Sign | undefined {
  return SIGNS.find((s) => s.id === id)
}

/**
 * Compact catalogue for the prompt. Signs backed by a real photo are listed first and
 * marked, because those are the ones worth building a "what does this sign mean?"
 * question around — an approximate drawing tests whether she can read my SVG rather
 * than whether she knows the sign.
 */
export function signCatalogue(images: Record<string, string> = {}): string {
  const rank = (s: Sign) => (images[s.id] ? 0 : s.art === 'clean' ? 1 : 2)
  const label = (s: Sign) =>
    images[s.id] ? 'photo' : s.art === 'clean' ? 'drawn, clear' : 'drawn, approximate'

  return SIGNS.slice()
    .sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id))
    .map((s) => `- ${s.id} [${label(s)}]: ${s.name} (${s.description})`)
    .join('\n')
}
