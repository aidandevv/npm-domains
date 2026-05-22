#!/usr/bin/env node
'use strict';

const { execFileSync, spawnSync } = require('child_process');
const { name: packageName, version } = require('./package.json');

// ── ANSI ─────────────────────────────────────────────────────────────────────
const rst = '\x1b[0m';
const bld = '\x1b[1m';
const DIM = '\x1b[90m';
const YLW = '\x1b[93m';
const tc  = (r, g, b) => `\x1b[38;2;${r};${g};${b}m`;

function grad(text, from, to) {
  const chars = [...text];
  const n = chars.length;
  return chars.map((ch, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    return tc(
      Math.round(from[0] + (to[0] - from[0]) * t),
      Math.round(from[1] + (to[1] - from[1]) * t),
      Math.round(from[2] + (to[2] - from[2]) * t)
    ) + ch;
  }).join('') + rst;
}

function gradInk(text, from, to) {
  const chars = [...text];
  const ink = chars.filter(ch => ch !== ' ').length;
  let seen = 0;

  return chars.map(ch => {
    if (ch === ' ') return ch;
    const t = ink > 1 ? seen / (ink - 1) : 0;
    seen++;
    return tc(
      Math.round(from[0] + (to[0] - from[0]) * t),
      Math.round(from[1] + (to[1] - from[1]) * t),
      Math.round(from[2] + (to[2] - from[2]) * t)
    ) + ch;
  }).join('') + rst;
}

const EMAIL = 'aidan@aidandevaney.com';

// -- FETCH CARD ----------------------------------------------------------------
const FETCH_ART = [
  '        /AAAAA\\       DDDDDDD\\    ',
  '       /AA/ \\AA\\      DD    \\DD\\  ',
  '      /AA/   \\AA\\     DD     \\DD\\ ',
  '     /AA/     \\AA\\    DD      |DD|',
  '    /AA/       \\AA\\   DD      |DD|',
  '   /AAAAAAAAAAAAAAA\\  DD      |DD|',
  '  /AA/-----------\\AA\\ DD      |DD|',
  ' /AA/             \\AA\\DD     /DD/ ',
  '/AA/               \\AADD    /DD/  ',
  'AA/                 \\AADDDDDDD/   ',
  '                         -----    ',
];

function chevronMark() {
  const colors = [
    tc(0, 95, 184),
    tc(0, 135, 210),
    tc(0, 170, 230),
    tc(245, 245, 245),
    tc(245, 120, 55),
    tc(238, 75, 45),
    tc(229, 39, 45),
  ];
  return [...'Chevron'].map((ch, index) => colors[index] + ch).join('') + rst;
}

const FETCH_INFO = [
  { type: 'title', text: 'my digital business card' },
  { type: 'rule', text: '-------------' },
  { key: 'Name', value: 'Aidan DeVaney' },
  { key: 'Role', value: 'Looking for FDE, SWE, Product Roles' },
  { key: 'Edu', value: `${tc(255,191,0)}UC${rst} ${tc(0,136,255)}Davis${rst} CS, Minor in Tech Management. 2026 Grad` },
  { key: 'Kernel', value: 'product sense, systems thinking, scalable implementation' },
  { key: 'History', value: `${tc(255,69,0)}Reddit${rst}, Deloitte${tc(134,188,37)}.${rst} ${chevronMark()}, ${tc(111,66,193)}Solidigm${rst}` },
  { key: 'Packages', value: 'React, Node, Python, Agentic Pipelines' },
  { key: 'Shell', value: 'Claude Code, Figma, Cursor, Codex' },
  { key: 'Links', value: 'aidandevaney.com | github.com/aidandevv' },
  { type: 'blank' },
  { type: 'swatches' },
];

function paint(text, color) {
  return color + text + rst;
}

function fetchInfoRow(row) {
  if (!row) return '';
  if (row.type === 'title') return bld + paint(row.text, tc(0, 229, 255));
  if (row.type === 'rule') return DIM + row.text + rst;
  if (row.type === 'blank') return '';
  if (row.type === 'swatches') {
    const colors = [
      tc(46, 52, 64), tc(235, 86, 86), tc(64, 210, 132), tc(245, 189, 65),
      tc(66, 153, 225), tc(170, 95, 255), tc(54, 201, 219), tc(236, 239, 244),
    ];
    return colors.map(color => paint('███', color)).join('');
  }
  return `${bld}${tc(0, 229, 255)}${row.key}:${rst} ${row.value}`;
}

function fetchLines() {
  const artWidth = Math.max(...FETCH_ART.map(line => line.length));
  const rows = Math.max(FETCH_ART.length, FETCH_INFO.length);

  const lines = [];
  for (let i = 0; i < rows; i++) {
    const left = FETCH_ART[i] || '';
    const color = i < 5 ? [[255, 210, 64], [255, 132, 38]]
      : i < 10 ? [[46, 255, 153], [0, 210, 220]]
      : [[0, 190, 255], [170, 80, 255]];
    const gap = ' '.repeat(4 + artWidth - left.length);
    lines.push(`${gradInk(left, color[0], color[1])}${gap}${fetchInfoRow(FETCH_INFO[i])}`);
  }

  return lines;
}

function renderFetch() {
  process.stdout.write('\n' + fetchLines().join('\n') + '\n');
}

function renderHelp() {
  process.stdout.write([
    packageName,
    '',
    'Usage:',
    `  npx ${packageName}            Open the slash-command profile prompt`,
    `  npx ${packageName} --fetch    Print the neofetch-inspired profile`,
    '',
    'Role commands:',
    '  /recruiter  /engineer  /hiring-manager  /product',
    '',
    'Other commands:',
    '  /links  /email  /fetch  /help  /quit',
    '',
    'Flags:',
    '  --fetch, --neofetch, --ascii   Print the ASCII profile',
    '  --version, -v                  Print package version',
    '  --help, -h                     Show this help',
  ].join('\n') + '\n');
}

// ── PERSONA DATA ─────────────────────────────────────────────────────────────
const SHARED_LINKS = {
  linkedin: { key: 'linkedin', label: 'linkedin', value: 'linkedin.com/in/aidan-devaney', url: 'https://linkedin.com/in/aidan-devaney' },
  web:      { key: 'web',      label: 'web',      value: 'aidandevaney.com',              url: 'https://aidandevaney.com' },
  github:   { key: 'github',   label: 'github',   value: 'github.com/aidandevv',           url: 'https://github.com/aidandevv' },
};

const ROLES = [
  {
    key: 'recruiter',
    command: '/recruiter',
    label: 'Recruiter',
    subtitle: 'UC Davis CS · Tech Management minor · 2026 grad',
    summary: 'Product-minded technical builder seeking FDE, SWE, and Product roles where ambiguity, users, and implementation all matter.',
    section: 'Related experience',
    bullets: [
      'Deloitte Solutions Engineering Intern: owned an internal AI product from ideation toward firm-wide deployment.',
      'CodeLab President: led 70+ developers, designers, and PMs delivering enterprise-grade client software.',
      'Certified CAPM, CSM, Security+, and AWS Cloud Practitioner; comfortable across PM, engineering, and stakeholder work.',
    ],
    cta: 'Looking for teams building useful systems with real users',
    links: [
      { ...SHARED_LINKS.linkedin, label: 'profile' },
      { ...SHARED_LINKS.web, label: 'portfolio' },
      { ...SHARED_LINKS.github, label: 'github' },
    ],
  },
  {
    key: 'engineer',
    command: '/engineer',
    label: 'Engineer',
    subtitle: 'Full-stack systems · agentic pipelines · product velocity',
    summary: 'I like building the connective tissue: data flows, APIs, scraping workers, RAG pipelines, and interfaces that turn messy problems into usable tools.',
    section: 'Related experience',
    bullets: [
      'Chevron: shipped distributed geospatial scraping across 40k+ ZIP codes with Next.js, FastAPI, RabbitMQ, PostgreSQL, Docker, and Azure Kubernetes.',
      'Solidigm: led an AI extraction/RAG pipeline using LlamaIndex, PDF tooling, Dataiku, Pandas, and Azure infrastructure.',
      'Deloitte: designed agentic pipeline architecture and scalable data flows for an internal AI product.',
    ],
    cta: 'Strongest when implementation details and product context both matter',
    links: [
      { ...SHARED_LINKS.github, label: 'github' },
      { ...SHARED_LINKS.web, label: 'projects' },
      { ...SHARED_LINKS.linkedin, label: 'profile' },
    ],
  },
  {
    key: 'hiring-manager',
    command: '/hiring-manager',
    aliases: ['/hiring', '/manager'],
    label: 'Hiring Manager',
    subtitle: 'Owns ambiguity · aligns teams · ships measurable outcomes',
    summary: 'I have led cross-functional student and client teams from requirements through delivery, balancing roadmap clarity with engineering reality.',
    section: 'Related experience',
    bullets: [
      'CodeLab: owned product strategy, client acquisition, and operations while supporting 70+ builders across cohorts.',
      'Chevron TPM: led an 11-person team delivering a distributed data product and translating enterprise needs into technical scope.',
      'Brand Networks PM Intern: guided a 10-person development team from spreadsheet workflows to a dynamic campaign optimization app.',
    ],
    cta: 'I help teams reduce ambiguity, move fast, and keep the user in frame',
    links: [
      { ...SHARED_LINKS.web, label: 'portfolio' },
      { ...SHARED_LINKS.linkedin, label: 'profile' },
      { ...SHARED_LINKS.github, label: 'github' },
    ],
  },
  {
    key: 'product',
    command: '/product',
    label: 'Product',
    subtitle: 'Technical PM instincts · builder bias · enterprise context',
    summary: 'I translate between business goals, user needs, and engineering constraints, then prototype enough to make decisions concrete.',
    section: 'Related experience',
    bullets: [
      'Deloitte: shaped an internal AI product and requirements for a $675M state infrastructure project serving 12M+ users.',
      'Chevron: defined product vision and aligned stakeholders around geospatial data accuracy, search speed, and usability.',
      'Solidigm: set accuracy evaluation metrics and product requirements for enterprise RAG ingestion workflows.',
    ],
    cta: 'Product-minded engineer, engineer-minded PM',
    links: [
      { ...SHARED_LINKS.web, label: 'case studies' },
      { ...SHARED_LINKS.linkedin, label: 'profile' },
      { ...SHARED_LINKS.github, label: 'github' },
    ],
  },
];

const ROLE_BY_COMMAND = new Map(
  ROLES.flatMap(role => [role.command, ...(role.aliases || [])].map(command => [command, role]))
);
const COMMANDS = [
  ...ROLES.map(role => role.command),
  '/links',
  '/email',
  '/fetch',
  '/help',
  '/quit',
];

const COMMAND_ITEMS = [
  ...ROLES.map(role => ({
    command: role.command,
    description: `Open the ${role.label.toLowerCase()} view`,
    role,
  })),
  { command: '/links', description: 'Show links for the active role' },
  { command: '/email', description: 'Copy email to clipboard' },
  { command: '/fetch', description: 'Redraw the fetch header' },
  { command: '/help', description: 'Show command and navigation help' },
  { command: '/quit', description: 'Exit the profile prompt' },
];

const state = {
  mode: 'home',
  input: '',
  suggestionIndex: 0,
  role: ROLES[0],
  linkIndex: 0,
  status: '',
};
let lastFrameLines = 0;

// ── ACTIONS ──────────────────────────────────────────────────────────────────
function openUrl(url) {
  try {
    if (process.platform === 'win32')       execFileSync('cmd', ['/c', 'start', '', url], { stdio: 'ignore' });
    else if (process.platform === 'darwin') execFileSync('open', [url], { stdio: 'ignore' });
    else                                    execFileSync('xdg-open', [url], { stdio: 'ignore' });
  } catch {}
}

function copyEmail() {
  const input = Buffer.from(EMAIL);
  try {
    if (process.platform === 'win32')
      return spawnSync('clip', [], { input, stdio: ['pipe','ignore','ignore'] }).status === 0;
    if (process.platform === 'darwin')
      return spawnSync('pbcopy', [], { input, stdio: ['pipe','ignore','ignore'] }).status === 0;
    if (spawnSync('xclip', ['-selection','clipboard'], { input, stdio: ['pipe','ignore','ignore'] }).status === 0) return true;
    return spawnSync('xsel', ['--clipboard','--input'], { input, stdio: ['pipe','ignore','ignore'] }).status === 0;
  } catch { return false; }
}

function cyan(text) {
  return tc(0, 229, 255) + text + rst;
}

function writeFrame(lines) {
  if (lastFrameLines > 0) {
    process.stdout.write(`\x1b[${lastFrameLines}A\r\x1b[J`);
  }
  process.stdout.write(lines.join('\n') + '\n');
  lastFrameLines = lines.length;
}

function frameWidth() {
  return Math.max(48, Math.min(process.stdout.columns || 80, 100)) - 2;
}

function divider() {
  return DIM + '─'.repeat(frameWidth()) + rst;
}

function wrapWords(text, width) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    if (!line) {
      line = word;
    } else if (line.length + 1 + word.length <= width) {
      line += ` ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function indentedWrap(text, indent = '  ', width = frameWidth()) {
  return wrapWords(text, Math.max(20, width - indent.length)).map(line => indent + line);
}

function bulletWrap(text) {
  const width = frameWidth();
  const lines = wrapWords(text, Math.max(20, width - 4));
  return lines.map((line, index) => (
    index === 0
      ? `  ${tc(80,255,150)}›${rst} ${line}`
      : `    ${line}`
  ));
}

function footerLine() {
  const help = state.mode === 'role'
    ? `${DIM}Esc back · ↑↓ links · Enter open · c email${rst}`
    : `${DIM}/ role commands · ↑↓ suggestions · Tab complete · Enter open${rst}`;
  return help;
}

function footerLines() {
  return ['', divider(), footerLine()];
}

function status(text, color = DIM) {
  state.status = color + text + rst;
}

function homeSuggestions() {
  if (!state.input.startsWith('/')) return [];
  return COMMAND_ITEMS.filter(item => item.command.startsWith(state.input.toLowerCase()));
}

function renderHome() {
  const suggestions = homeSuggestions();
  const cursor = process.stdin.isTTY ? cyan('▌') : '';
  const promptText = state.input || '';
  const lines = [
    state.status || `${DIM}Start with /recruiter, /engineer, /hiring-manager, or /product.${rst}`,
    '',
    divider(),
    `${bld}›${rst} ${promptText}${cursor}`,
    divider(),
  ];

  if (suggestions.length) {
    suggestions.slice(0, 8).forEach((item, index) => {
      const selected = index === state.suggestionIndex;
      const marker = selected ? cyan('›') : DIM + ' ' + rst;
      const cmd = selected ? bld + cyan(item.command) + rst : DIM + item.command + rst;
      lines.push(`${marker} ${cmd.padEnd(item.command.length + 2)} ${DIM}${item.description}${rst}`);
    });
  }

  writeFrame([...lines, ...footerLines()]);
}

function renderRolePage() {
  const role = state.role;
  const lines = [
    bld + grad(`${role.label} view`, [0,229,255], [170,0,255]) + rst,
    DIM + role.subtitle + rst,
    '',
    divider(),
    `${bld}${YLW}Summary:${rst}`,
    ...indentedWrap(role.summary),
    '',
    `${bld}${YLW}${role.section}:${rst}`,
    ...role.bullets.flatMap(bulletWrap),
    '',
    ...indentedWrap(role.cta, '').map(line => grad(`✦ ${line}`, [80,255,150], [0,220,255])),
    '',
    bld + cyan('Links') + rst,
    ...role.links.map((link, index) => {
      const selected = index === state.linkIndex;
      const marker = selected ? cyan('›') : DIM + ' ' + rst;
      const label = selected ? bld + link.label.padEnd(12) + rst : DIM + link.label.padEnd(12) + rst;
      return `${marker} ${label} ${link.value}`;
    }),
    state.status || '',
  ];

  writeFrame([...lines, ...footerLines()]);
}

function renderPromptHelp() {
  state.status = `${DIM}Commands: /recruiter /engineer /hiring-manager /product /links /email /fetch /help /quit${rst}`;
}

function renderApp() {
  if (state.mode === 'role') renderRolePage();
  else renderHome();
}

function enterRole(role) {
  state.mode = 'role';
  state.role = role;
  state.linkIndex = 0;
  state.status = '';
  renderApp();
}

function executeHomeCommand() {
  const input = state.input.trim().toLowerCase();
  const suggestions = homeSuggestions();
  const picked = suggestions[state.suggestionIndex];
  const command = input.startsWith('/') && picked ? picked.command : input;
  const role = ROLE_BY_COMMAND.get(command);

  if (role) {
    state.input = '';
    enterRole(role);
    return;
  }

  if (command === '/links') {
    state.status = state.role.links.map(link => `${link.label}: ${link.value}`).join('  ');
  } else if (command === '/email') {
    const copied = copyEmail();
    status(copied ? `Copied ${EMAIL} to clipboard.` : `Could not copy. Email: ${EMAIL}`, copied ? tc(80,255,150) : YLW);
  } else if (command === '/fetch') {
    state.status = 'Fetch header redrawn.';
  } else if (command === '/help') {
    renderPromptHelp();
  } else if (command === '/quit' || command === '/exit') {
    quit();
    return;
  } else if (command.startsWith('/')) {
    status(`Unknown command: ${command}`, YLW);
  } else if (input) {
    state.status = `${DIM}Free typing is open; use / to jump into a role view.${rst}`;
  }

  state.input = '';
  state.suggestionIndex = 0;
  renderApp();
}

function handleHomeKey(key) {
  const suggestions = homeSuggestions();

  if (key === '\t' && suggestions.length) {
    state.input = suggestions[state.suggestionIndex].command;
    state.suggestionIndex = 0;
    renderApp();
    return;
  }
  if (key === '\r') {
    executeHomeCommand();
    return;
  }
  if (key === '\x1b') {
    state.input = '';
    state.suggestionIndex = 0;
    state.status = '';
    renderApp();
    return;
  }
  if (key === '\x7f' || key === '\b') {
    state.input = state.input.slice(0, -1);
    state.suggestionIndex = 0;
    renderApp();
    return;
  }
  if (key === '\x1b[A' && suggestions.length) {
    state.suggestionIndex = (state.suggestionIndex - 1 + suggestions.length) % suggestions.length;
    renderApp();
    return;
  }
  if (key === '\x1b[B' && suggestions.length) {
    state.suggestionIndex = (state.suggestionIndex + 1) % suggestions.length;
    renderApp();
    return;
  }
  if (key.length === 1 && key >= ' ' && key <= '~') {
    state.input += key;
    state.suggestionIndex = 0;
    state.status = '';
    renderApp();
  }
}

function handleRoleKey(key) {
  if (key === '\x1b') {
    state.mode = 'home';
    state.input = '';
    state.status = '';
    renderApp();
    return;
  }
  if (key === '\x1b[A') {
    state.linkIndex = (state.linkIndex - 1 + state.role.links.length) % state.role.links.length;
    renderApp();
    return;
  }
  if (key === '\x1b[B') {
    state.linkIndex = (state.linkIndex + 1) % state.role.links.length;
    renderApp();
    return;
  }
  if (key === '\r') {
    const link = state.role.links[state.linkIndex];
    openUrl(link.url);
    state.status = `${tc(80,255,150)}Opened ${link.url}${rst}`;
    renderApp();
    return;
  }
  if (key === 'c' || key === 'C') {
    state.status = copyEmail()
      ? `${tc(80,255,150)}Copied ${EMAIL} to clipboard.${rst}`
      : `${YLW}Could not copy. Email: ${EMAIL}${rst}`;
    renderApp();
  }
}

function inputKeys(data) {
  return data.match(/\x1b\[[AB]|\x1b|[\s\S]/g) || [];
}

function handleKey(key) {
  if (key === '\u0003') quit();
  if (state.mode === 'role') handleRoleKey(key);
  else handleHomeKey(key);
}

function quit() {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdin.pause();
  process.stdout.write(`\n${DIM}thank you for poking around, hope to connect soon!${rst}\n`);
  process.exit(0);
}

function renderIntro() {
  process.stdout.write([
    '',
    ...fetchLines(),
    '',
    `${bld}Aidan DeVaney${rst}`,
    `${DIM}Type ${cyan('/')} for role commands. ${cyan('↑↓')} selects suggestions, ${cyan('Enter')} opens, ${cyan('Esc')} clears, ${cyan('Ctrl-C')} quits.${rst}`,
    `${DIM}Enter a role to switch into arrow-key navigation.${rst}`,
    '',
  ].join('\n') + '\n');
}

function startPrompt() {
  renderIntro();
  renderApp();
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', data => {
    for (const key of inputKeys(data)) handleKey(key);
  });
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
const args = new Set(process.argv.slice(2));
const hasFlag = (...names) => names.some(name => args.has(name));

if (hasFlag('--help', '-h')) { renderHelp(); process.exit(0); }
if (hasFlag('--version', '-v')) { process.stdout.write(`${version}\n`); process.exit(0); }
if (hasFlag('--fetch', '--neofetch', '--ascii')) { renderFetch(); process.exit(0); }

if (!process.stdin.isTTY) { renderIntro(); process.exit(0); }

startPrompt();
