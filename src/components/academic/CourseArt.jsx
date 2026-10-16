import './course-art.css';

// Cover illustrations for the course cards: hand-drawn vector art, one per
// course. Every colour comes from the site's tokens (plus one muted accent
// per course in course-art.css), so the art follows the light and dark
// themes. The view box matches the 16:7 card cover.

const Window = ({ x, y, w, h, title, titleX }) => (
  <g>
    <rect className="ca-panel" x={x} y={y} width={w} height={h} rx="10" />
    <path className="ca-bar" d={`M${x + 10} ${y}h${w - 20}a10 10 0 0 1 10 10v18H${x}V${y + 10}a10 10 0 0 1 10-10z`} />
    <line className="ca-rule" x1={x} y1={y + 28} x2={x + w} y2={y + 28} />
    {[0, 1, 2].map((i) => (
      <circle key={i} className="ca-dot" cx={x + 16 + i * 13} cy={y + 14} r="4" />
    ))}
    {title && (
      <text className="ca-mono ca-muted" x={titleX ?? x + w / 2} y={y + 18.5} fontSize="11" textAnchor="middle">
        {title}
      </text>
    )}
  </g>
);

const Arrow = ({ id }) => (
  <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0L10 5L0 10z" className="ca-accent-fill" />
  </marker>
);

/* Beginner C: an editor with hello.c and the terminal that compiles and runs it. */
function CArt() {
  const code = [
    [['ca-pp', '#include'], ['ca-str', ' <stdio.h>']],
    [],
    [['ca-kw', 'int'], ['ca-fn', ' main'], ['ca-code', '('], ['ca-kw', 'void'], ['ca-code', ') {']],
    [['ca-fn', '    printf'], ['ca-code', '('], ['ca-str', '"Hello, C!\\n"'], ['ca-code', ');']],
    [['ca-kw', '    return'], ['ca-num', ' 0'], ['ca-code', ';']],
    [['ca-code', '}']],
  ];
  return (
    <>
      <Window x={40} y={34} w={360} h={212} title="hello.c" />
      {code.map((parts, i) => (
        <g key={i}>
          <text className="ca-mono ca-muted" x="60" y={90 + i * 24} fontSize="12" textAnchor="end" opacity="0.7">
            {i + 1}
          </text>
          <text className="ca-mono" x="76" y={90 + i * 24} fontSize="14" xmlSpace="preserve">
            {parts.map(([cls, t], j) => (
              <tspan key={j} className={cls}>
                {t}
              </tspan>
            ))}
          </text>
        </g>
      ))}
      <g filter="url(#ca-shadow-c)">
        <rect className="ca-term" x="356" y="118" width="246" height="126" rx="10" />
      </g>
      {[0, 1, 2].map((i) => (
        <circle key={i} className="ca-term-dot" cx={372 + i * 13} cy="132" r="4" />
      ))}
      <text className="ca-mono" x="372" y="166" fontSize="12.5" xmlSpace="preserve">
        <tspan className="ca-term-prompt">$</tspan>
        <tspan className="ca-term-text"> gcc hello.c -o hello</tspan>
      </text>
      <text className="ca-mono" x="372" y="189" fontSize="12.5" xmlSpace="preserve">
        <tspan className="ca-term-prompt">$</tspan>
        <tspan className="ca-term-text"> ./hello</tspan>
      </text>
      <text className="ca-mono ca-term-out" x="372" y="212" fontSize="12.5">
        Hello, C!
      </text>
      <text className="ca-mono ca-term-prompt" x="372" y="234" fontSize="12.5">
        $
      </text>
      <rect className="ca-term-cursor" x="384" y="224" width="7" height="13" />
      <defs>
        <filter id="ca-shadow-c" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.18" />
        </filter>
      </defs>
    </>
  );
}

/* Object Oriented Programming: a UML class diagram with inheritance, an interface and polymorphic use. */
function OopArt() {
  const ClassBox = ({ x, y, w, stereo, name, fields, methods, main }) => {
    const head = stereo ? 38 : 28;
    const h = head + 22 * fields.length + 22 * methods.length + 10;
    return (
      <g>
        <rect className="ca-panel" x={x} y={y} width={w} height={h} rx="8" />
        <path
          className={main ? 'ca-head-accent' : 'ca-bar'}
          d={`M${x + 8} ${y}h${w - 16}a8 8 0 0 1 8 8v${head - 8}H${x}V${y + 8}a8 8 0 0 1 8-8z`}
        />
        {stereo && (
          <text className="ca-mono ca-muted" x={x + w / 2} y={y + 15} fontSize="10" textAnchor="middle">
            {stereo}
          </text>
        )}
        <text className="ca-sans ca-text" x={x + w / 2} y={y + head - 9} fontSize="14" fontWeight="600" textAnchor="middle">
          {name}
        </text>
        <line className="ca-rule" x1={x} y1={y + head} x2={x + w} y2={y + head} />
        {fields.map((f, i) => (
          <text key={f} className="ca-mono ca-text-2" x={x + 12} y={y + head + 17 + i * 22} fontSize="12">
            {f}
          </text>
        ))}
        {fields.length > 0 && (
          <line className="ca-rule" x1={x} y1={y + head + 22 * fields.length + 4} x2={x + w} y2={y + head + 22 * fields.length + 4} />
        )}
        {methods.map((m, i) => (
          <text key={m} className="ca-mono ca-text-2" x={x + 12} y={y + head + 22 * fields.length + 21 + i * 22} fontSize="12">
            {m}
          </text>
        ))}
      </g>
    );
  };
  return (
    <>
      <defs>
        <marker id="ca-inherit" viewBox="0 0 12 12" refX="6" refY="1" markerWidth="12" markerHeight="12" orient="auto">
          <path d="M6 1L11 11H1z" className="ca-hollow" />
        </marker>
      </defs>
      {/* polymorphic use */}
      <rect className="ca-panel" x="34" y="34" width="186" height="62" rx="8" />
      <text className="ca-mono" x="46" y="60" fontSize="11.5" xmlSpace="preserve">
        <tspan className="ca-type">Shape</tspan>
        <tspan className="ca-code"> s = </tspan>
        <tspan className="ca-kw">new</tspan>
        <tspan className="ca-type"> Circle</tspan>
        <tspan className="ca-code">(2);</tspan>
      </text>
      <text className="ca-mono" x="46" y="82" fontSize="11.5" xmlSpace="preserve">
        <tspan className="ca-code">s.area();  </tspan>
        <tspan className="ca-muted">// 12.57</tspan>
      </text>

      <ClassBox x={240} y={22} w={170} stereo="«abstract»" name="Shape" fields={['- name: String']} methods={['+ area(): double']} main />
      <ClassBox x={462} y={34} w={146} stereo="«interface»" name="Drawable" fields={[]} methods={['+ draw(): void']} />
      <line className="ca-line ca-dashed" x1="410" y1="70" x2="462" y2="70" markerEnd="url(#ca-inherit-r)" />
      <defs>
        <marker id="ca-inherit-r" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto">
          <path d="M11 6L1 1V11z" className="ca-hollow" />
        </marker>
      </defs>

      <ClassBox x={100} y={178} w={170} name="Circle" fields={['- r: double']} methods={['+ area(): double']} />
      <ClassBox x={370} y={178} w={170} name="Rectangle" fields={['- w, h: double']} methods={['+ area(): double']} />
      <path className="ca-line" d="M185 178V154H455V178" />
      <line className="ca-line" x1="325" y1="154" x2="325" y2="114" markerEnd="url(#ca-inherit)" />
    </>
  );
}

/* Computer Security: an encrypted channel between Alice and Bob, guarded against an eavesdropper. */
function SecArt() {
  const Node = ({ cx, label, letter }) => (
    <g>
      <circle className="ca-panel" cx={cx} cy="140" r="30" />
      <text className="ca-sans ca-text" x={cx} y="146" fontSize="18" fontWeight="600" textAnchor="middle">
        {letter}
      </text>
      <text className="ca-sans ca-muted" x={cx} y="192" fontSize="12" textAnchor="middle">
        {label}
      </text>
    </g>
  );
  const Chip = ({ x, text }) => (
    <g>
      <rect className="ca-chip" x={x} y="101" width="82" height="22" rx="6" />
      <text className="ca-mono ca-accent-text" x={x + 41} y="116" fontSize="11.5" textAnchor="middle">
        {text}
      </text>
    </g>
  );
  return (
    <>
      {['AES', 'RSA', 'TLS'].map((t, i) => (
        <g key={t}>
          <rect className="ca-chip-quiet" x={34 + i * 54} y="30" width="46" height="20" rx="10" />
          <text className="ca-mono ca-muted" x={57 + i * 54} y="44" fontSize="10.5" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <line className="ca-channel" x1="130" y1="140" x2="510" y2="140" />
      <Chip x={160} text="3f a9 0c" />
      <Chip x={398} text="d2 5e 88" />
      <Node cx={100} letter="A" label="Alice" />
      <Node cx={540} letter="B" label="Bob" />

      {/* eavesdropper, blocked */}
      <line className="ca-danger-line" x1="206" y1="226" x2="248" y2="156" />
      <path className="ca-danger-stroke" d="M242 150l12 12M254 150l-12 12" />
      <circle className="ca-panel ca-danger-ring" cx="196" cy="240" r="18" />
      <text className="ca-sans ca-danger-text" x="196" y="245" fontSize="14" fontWeight="600" textAnchor="middle">
        E
      </text>
      <text className="ca-sans ca-muted" x="222" y="245" fontSize="12">
        Eve
      </text>

      {/* shield with padlock */}
      <path
        className="ca-shield"
        d="M320 84c16 9 30 13 44 14v40c0 30-19 48-44 58c-25-10-44-28-44-58V98c14-1 28-5 44-14z"
      />
      <path className="ca-lock-shackle" d="M309 136v-9a11 11 0 0 1 22 0v9" />
      <rect className="ca-accent-fill" x="301" y="135" width="38" height="30" rx="5" />
      <circle className="ca-keyhole" cx="320" cy="147" r="4" />
      <rect className="ca-keyhole" x="318.5" y="149" width="3" height="8" rx="1.5" />

      <text className="ca-mono ca-muted" x="606" y="248" fontSize="12" textAnchor="end">
        E(k, m) → c
      </text>
    </>
  );
}

/* Web Programming: a browser form posting to PHP, which queries MySQL and returns HTML. */
function WebArt() {
  return (
    <>
      <defs>
        <Arrow id="ca-arrow-web" />
      </defs>
      <Window x={30} y={34} w={306} h={212} />
      <rect className="ca-address" x="84" y="40" width="240" height="16" rx="8" />
      <text className="ca-mono ca-muted" x="96" y="52" fontSize="10">
        localhost/final/index.php
      </text>
      <text className="ca-sans ca-text-2" x="52" y="86" fontSize="11.5">
        Name
      </text>
      <rect className="ca-input" x="52" y="92" width="262" height="28" rx="6" />
      <text className="ca-sans ca-muted" x="62" y="111" fontSize="12">
        Karim Uddin
      </text>
      <text className="ca-sans ca-text-2" x="52" y="142" fontSize="11.5">
        Credits
      </text>
      <rect className="ca-input" x="52" y="148" width="262" height="28" rx="6" />
      <text className="ca-sans ca-muted" x="62" y="167" fontSize="12">
        120
      </text>
      <rect className="ca-accent-fill" x="52" y="192" width="92" height="32" rx="7" />
      <text className="ca-sans ca-on-accent" x="98" y="212.5" fontSize="12.5" fontWeight="600" textAnchor="middle">
        Submit
      </text>

      {/* request and response */}
      <line className="ca-flow" x1="340" y1="118" x2="394" y2="118" markerEnd="url(#ca-arrow-web)" />
      <text className="ca-mono ca-accent-text" x="367" y="108" fontSize="10.5" fontWeight="600" textAnchor="middle">
        POST
      </text>
      <line className="ca-flow ca-dashed" x1="394" y1="168" x2="340" y2="168" markerEnd="url(#ca-arrow-web)" />
      <text className="ca-mono ca-muted" x="367" y="186" fontSize="10.5" textAnchor="middle">
        HTML
      </text>

      {/* PHP server */}
      <rect className="ca-panel" x="398" y="78" width="98" height="126" rx="10" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect className="ca-rack" x="410" y={92 + i * 26} width="74" height="18" rx="4" />
          <circle className={i === 0 ? 'ca-accent-fill' : 'ca-dot'} cx="420" cy={101 + i * 26} r="3" />
          <line className="ca-rule" x1="430" y1={101 + i * 26} x2="472" y2={101 + i * 26} />
        </g>
      ))}
      <text className="ca-mono ca-text" x="447" y="190" fontSize="13" fontWeight="600" textAnchor="middle">
        PHP
      </text>

      <line className="ca-flow" x1="498" y1="140" x2="540" y2="140" markerEnd="url(#ca-arrow-web)" />
      <text className="ca-mono ca-accent-text" x="519" y="130" fontSize="10.5" fontWeight="600" textAnchor="middle">
        SQL
      </text>

      {/* MySQL database */}
      <path className="ca-panel" d="M544 96v86c0 6 14 11 32 11s32-5 32-11V96" />
      <ellipse className="ca-db-top" cx="576" cy="96" rx="32" ry="10" />
      <path className="ca-line" d="M544 124c0 6 14 11 32 11s32-5 32-11M544 152c0 6 14 11 32 11s32-5 32-11" />
      <text className="ca-mono ca-text" x="576" y="218" fontSize="12.5" fontWeight="600" textAnchor="middle">
        MySQL
      </text>
    </>
  );
}

const ART = {
  'beginner-c-programming': { Art: CArt, tone: 'c' },
  'beginner-java-programming': { Art: OopArt, tone: 'oop' },
  'computer-security': { Art: SecArt, tone: 'sec' },
  'web-programming': { Art: WebArt, tone: 'web' },
};

/** The cover art for a course, or null when the course has none (the card then shows its mark). */
export default function CourseArt({ slug }) {
  const entry = ART[slug];
  if (!entry) return null;
  const { Art, tone } = entry;
  return (
    <svg className={`course-art course-art--${tone}`} viewBox="0 0 640 280" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}

export const hasCourseArt = (slug) => Boolean(ART[slug]);
