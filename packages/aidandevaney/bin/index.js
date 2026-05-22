#!/usr/bin/env node
'use strict';

const { execFileSync, spawnSync } = require('child_process');

const rst = '\x1b[0m';
const bld = '\x1b[1m';
const G   = '\x1b[90m';  // gray
const Y   = '\x1b[93m';  // yellow
const B   = '\x1b[94m';  // blue

const tc = (r, g, b) => `\x1b[38;2;${r};${g};${b}m`;

// Per-character gradient — from/to are [r,g,b]
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

const EMAIL = 'aidan@aidandevaney.com';

const links = [
  { label: 'web   aidandevaney.com',             url: 'https://aidandevaney.com' },
  { label: 'gh    github.com/aidandevv',          url: 'https://github.com/aidandevv' },
  { label: 'in    linkedin.com/in/aidan-devaney', url: 'https://linkedin.com/in/aidan-devaney' },
];

const w = 49;
const div = () => `  ├${'─'.repeat(w + 2)}┤`;
const top = () => `  ╭${'─'.repeat(w + 2)}╮`;
const bot = () => `  ╰${'─'.repeat(w + 2)}╯`;

// Solid-color row: visual length == text.length
function solidRow(text = '', color = '') {
  const pad = ' '.repeat(Math.max(0, w - text.length));
  return `  │ ${color}${text}${rst}${pad} │`;
}

// Gradient row: visual must be provided separately (color codes have zero visual width)
function gradRow(indent, text, from, to, bold = false) {
  const visual = indent + text;
  const colored = (bold ? bld : '') + indent + grad(text, from, to);
  const pad = ' '.repeat(Math.max(0, w - visual.length));
  return `  │ ${colored}${pad} │`;
}

// Static card
process.stdout.write([
  '',
  top(),
  solidRow(),
  gradRow('    ', 'Aidan Devaney',                           [0, 229, 255], [170, 0, 255], true),
  gradRow('    ', 'Forward Deployed · Product-Minded Eng.',  [0, 200, 255], [120, 80, 255]),
  solidRow('    UC Davis · Class of 2025',                   G),
  solidRow(),
  div(),
  solidRow(),
  solidRow('    Open to:', bld + Y),
  gradRow('    ', '›  Product Management',                   [80,  255, 120], [0,   220, 180]),
  gradRow('    ', '›  Forward Deployed Engineering',          [0,   220, 180], [0,   180, 255]),
  gradRow('    ', '›  Software Engineering',                 [0,   180, 255], [120, 100, 255]),
  solidRow(),
  div(),
  solidRow(), // blank — interactive links follow
].join('\n') + '\n');

// Interactive menu
let sel = 0;
const MENU_LINES = 7; // 3 links + empty + bot + blank + hint

function irow(label, isSelected) {
  const padding = ' '.repeat(Math.max(0, w - 4 - label.length));
  if (isSelected) {
    const cursor  = tc(0, 229, 255) + '❯' + rst + '   '; // 4 visual chars
    const colored = bld + grad(label, [0, 229, 255], [170, 0, 255]) + rst;
    return `  │ ` + cursor + colored + padding + ` │`;
  }
  return `  │ ` + '    ' + B + label + rst + padding + ` │`;
}

function renderMenu(hint) {
  const dim  = tc(80, 80, 100);
  const key  = tc(160, 160, 220);
  const hintLine = hint || (
    `  ${dim}${key}↑↓${dim} navigate  ${key}↵${dim} open in browser  ${key}c${dim} copy email  ${key}q${dim} quit${rst}`
  );
  process.stdout.write([
    ...links.map((l, i) => irow(l.label, i === sel)),
    solidRow(),
    bot(),
    '',
    hintLine,
  ].join('\n') + '\n');
}

function eraseMenu() {
  process.stdout.write(`\x1b[${MENU_LINES}A`);
  for (let i = 0; i < MENU_LINES; i++) process.stdout.write('\x1b[2K\r\n');
  process.stdout.write(`\x1b[${MENU_LINES}A`);
}

function openUrl(url) {
  try {
    if (process.platform === 'win32') execFileSync('cmd', ['/c', 'start', '', url], { stdio: 'ignore' });
    else if (process.platform === 'darwin') execFileSync('open', [url], { stdio: 'ignore' });
    else execFileSync('xdg-open', [url], { stdio: 'ignore' });
  } catch {}
}

function copyEmail() {
  const input = Buffer.from(EMAIL);
  try {
    if (process.platform === 'win32')
      return spawnSync('clip', [], { input, stdio: ['pipe', 'ignore', 'ignore'] }).status === 0;
    if (process.platform === 'darwin')
      return spawnSync('pbcopy', [], { input, stdio: ['pipe', 'ignore', 'ignore'] }).status === 0;
    if (spawnSync('xclip', ['-selection', 'clipboard'], { input, stdio: ['pipe', 'ignore', 'ignore'] }).status === 0) return true;
    return spawnSync('xsel', ['--clipboard', '--input'], { input, stdio: ['pipe', 'ignore', 'ignore'] }).status === 0;
  } catch { return false; }
}

function cleanup() {
  if (process.stdin.isTTY) { process.stdin.setRawMode(false); process.stdin.pause(); }
}

renderMenu();

if (!process.stdin.isTTY) process.exit(0);

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', key => {
  if (key === '' || key === 'q' || key === 'Q') {
    cleanup(); process.stdout.write('\n'); process.exit(0);
  }
  if (key === '\x1b[A') { // up
    sel = (sel - 1 + links.length) % links.length;
    eraseMenu(); renderMenu(); return;
  }
  if (key === '\x1b[B') { // down
    sel = (sel + 1) % links.length;
    eraseMenu(); renderMenu(); return;
  }
  if (key === '\r') { // enter — open in browser, stay open
    openUrl(links[sel].url);
    eraseMenu();
    renderMenu(`  ${tc(80, 255, 150)}✓ Opened ${links[sel].url}${rst}`);
    setTimeout(() => { eraseMenu(); renderMenu(); }, 1500);
    return;
  }
  if (key === 'c' || key === 'C') {
    const ok = copyEmail();
    eraseMenu();
    renderMenu(ok
      ? `  ${tc(80, 255, 150)}✓ Copied ${EMAIL} to clipboard${rst}`
      : `  ${Y}✗ Could not copy — ${EMAIL}${rst}`
    );
    setTimeout(() => { eraseMenu(); renderMenu(); }, 1500);
  }
});
