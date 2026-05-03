'use strict';

/**
 * 由 GitHub Actions（repository_dispatch）呼叫：合併一筆成績並寫回 leaderboard.json
 * 環境變數 CLIENT_PAYLOAD：JSON 字串 { userId, displayName, game, value, extra? }
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'leaderboard.json');

const VALID_GAMES = new Set([
  'memory_easy', 'memory_medium', 'memory_hard',
  'fruit', 'd2048',
  'sudoku_0', 'sudoku_1', 'sudoku_2', 'sudoku_3', 'sudoku_4',
  'wordchain', 'mole',
]);

const LOWER_IS_BETTER = new Set([
  'memory_easy', 'memory_medium', 'memory_hard',
  'sudoku_0', 'sudoku_1', 'sudoku_2', 'sudoku_3', 'sudoku_4',
]);

function isBetter(game, newVal, oldVal) {
  if (oldVal === undefined || oldVal === null) return true;
  if (LOWER_IS_BETTER.has(game)) return newVal < oldVal;
  return newVal > oldVal;
}

function top3ForGame(entries, game) {
  const gameMap = entries[game];
  if (!gameMap) return [];
  const lower = LOWER_IS_BETTER.has(game);
  const arr = Object.entries(gameMap).map(([userId, row]) => ({
    userId,
    displayName: row.displayName || '',
    value: row.value,
    extra: row.extra || {},
    at: row.at,
  }));
  arr.sort((a, b) => (lower ? a.value - b.value : b.value - a.value));
  return arr.slice(0, 3);
}

function rebuildGames(entries) {
  const games = {};
  for (const g of VALID_GAMES) {
    games[g] = top3ForGame(entries, g);
  }
  return games;
}

function loadData() {
  let data = { ok: true, entries: {}, games: {} };
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[merge-leaderboard] read failed', e.message);
    process.exit(1);
  }
  if (!data.entries || typeof data.entries !== 'object') data.entries = {};
  return data;
}

function saveData(data) {
  data.games = rebuildGames(data.entries);
  data.ok = true;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const raw = process.env.CLIENT_PAYLOAD;
if (!raw || !String(raw).trim()) {
  console.error('[merge-leaderboard] missing CLIENT_PAYLOAD');
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(raw);
} catch (e) {
  console.error('[merge-leaderboard] invalid JSON', e.message);
  process.exit(1);
}

const { userId, displayName, game, value, extra } = payload;
const num = Number(value);
if (!userId || !game || Number.isNaN(num)) {
  console.error('[merge-leaderboard] bad payload fields');
  process.exit(1);
}
if (!VALID_GAMES.has(game)) {
  console.error('[merge-leaderboard] invalid game:', game);
  process.exit(1);
}

const data = loadData();
if (!data.entries[game]) data.entries[game] = {};
const gameMap = data.entries[game];
const prev = gameMap[userId];

if (!isBetter(game, num, prev?.value)) {
  console.log('[merge-leaderboard] not improved, skip write');
  process.exit(0);
}

gameMap[userId] = {
  value: num,
  extra: extra && typeof extra === 'object' ? extra : {},
  at: Date.now(),
  displayName: typeof displayName === 'string' ? displayName : '',
};

saveData(data);
console.log('[merge-leaderboard] updated', game, userId, num);
